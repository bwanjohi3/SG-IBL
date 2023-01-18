var path = require('path');
var fs = require('fs');
var split = require('split');
var through = require('through2');
var { handleExportResponse } = require('ut-report/assets/script/common');
var emvTagsConfig = require('ut-emv/tags');

var batchDownloadDir = ['ut-card', 'batch.download'];

var batchStatusUpdateSendToProduction = require('./batch.statusUpdateSendToProduction.js');
var generatePin = require('./generatePin');

const customerAccountSearch = 'card.account.search';

function mergeAccounts(ownAccounts, remoteAccounts) {
    var linkedAccounts = [];
    ownAccounts.map((ownAccount) => {
        if (!ownAccount.accountNumber) {
            throw new Error('linked account should have property "accountNumber"');
        }
        remoteAccounts = remoteAccounts.reduce((prev, remoteAccount) => {
            if (!remoteAccount.accountNumber) {
                throw new Error('linkable account should have property "accountNumber"');
            }
            if (ownAccount.accountNumber !== remoteAccount.accountNumber) {
                prev.push(remoteAccount);
            } else {
                linkedAccounts.push(Object.assign(remoteAccount, ownAccount));
            }
            return prev;
        }, []);
    });
    return linkedAccounts.concat(remoteAccounts);
}


function processIssuanceCharges(msg, $meta, execParams) {

    var response = msg;

    return this.bus.importMethod('rule.decision.lookup')({
        channelId: $meta.auth.actorId,
        operation: execParams.operation,
        operationDate: new Date(),
        sourceAccount: msg.debitAccount || null,
        destinationAccount: msg.creditAccount || null,
        amount: 0,
        currency: 'LRD',
        isSourceAmount: 0
    }).then((result) => {
        return this.bus.importMethod('transfer.push.execute')({
            transferType: execParams.transferType,
            channelId: $meta.auth.actorId,
            sourceAccount: msg.debitAccount || null,
            destinationAccount: msg.creditAccount || null,
            destinationId: 'cbs',
            transferCurrency: 'LRD',
            transferAmount: msg.amount,
            amount: {
                transfer: {
                    amount: msg.amount,
                    currency: 'LRD'
                }
            },
            channelType: 'agent',
            description: msg.description, // narrative,
            operationTag: msg.tag,
            isSourceAccount: false,
            udfTransfer: Object.assign({
                sourceAccount: {
                    branch:1000
                },
                destinationAccount: {
                    branch: 1000
                }
            }, {})
        })
    })
};


function storeAttachments(msg, $meta) {
    if (msg.attachment) {
        return this.bus.importMethod('document.storeAttachments')(msg.attachment).then((result) => {
            return msg;
        });
    }
    return msg;
}

function updateAttachments(msg, $meta) {
    if (msg.newAttachments && msg.newAttachments.length) {
        return this.bus.importMethod('document.storeAttachments')(msg.newAttachments).then((result) => {
            msg.attachment = msg.attachment.concat(result);
            return msg;
        });
    }
    return msg;
}

function updateValidate(msg, $meta, page) {
    let validationMethod = `card.${page}.validateUpdate`;
    let method = this.config[validationMethod] || this.super[validationMethod];
    if (method) {
        return method.call(this, msg, $meta)
            .then((result) => {
                $meta.method = `card.${page}.statusUpdate`;
                return updateAttachments.bind(this)(msg, $meta);
            })
            .catch((err) => {
                throw err;
            });
    } else {
        return updateAttachments.bind(this)(msg, $meta);
    }
};
function genBatchDownloadFile(msg, $meta, method, batchDownloadDir, endOfRecord) {
    var self = this;
    var newFileName = path.join(batchDownloadDir, `${Date.now().toString()}.txt`);
    return method({ batch: msg }, $meta)
        .then((data) => {
            if (data.batchFileName && data.batchFileName[0] && data.batchFileName[0].name) {
                newFileName = path.join(batchDownloadDir, data.batchFileName[0].name);
            }
            var fws = fs.createWriteStream(newFileName);
            if (data.batchDownload.length === 0) {
                fws.end();
                return newFileName;
            }
            return data.batchDownload.reduce((p, r) => {
                return p.then(() => (new Promise((resolve, reject) => (fws.write(`${r['']}\n`, resolve)))));
            }, Promise.resolve())
                //.then(() => (fws.end(() => (fws.close()))))
                .then(function () {
                    return fws.end(function () {
                        fws.close();
                        return;
                    })
                })
                //.then(() => (this.bus.importMethod('pan.production.map')({file: newFileName})))
                .then(function () {
                    return self.bus.importMethod('pan.production.map')({ file: newFileName });
                })
                .then((r) => {
                    // this code is only for end of line placement
                    var frs = fs.createReadStream(r);
                    var fws = fs.createWriteStream(newFileName);
                    frs
                        .pipe(split())
                        .pipe(through((chk, enc, n) => (n(null, `${chk.toString()}${endOfRecord}`))))
                        .pipe(fws);
                    return newFileName;
                });
        });
}

function prepareFetchParamsWhenCardNumberFilter(msg, $meta) {
    if (msg.filterBy && msg.filterBy.cardNumber) {
        return this.bus.importMethod('pan.number.encrypt')({ card: msg.filterBy.cardNumber })
            .then((item) => {
                msg.filterBy.cardNumber = item.pan;
                return msg;
            });
    }
    return msg;
}

function genKeys(method, encMethod, msg) {
    // used by create card type
    var type = msg.type[0];
    return Promise.all([
        Promise.resolve(
            type.cvk
                ? encMethod({ key: type.cvk, cipher: type.cipher })
                : method({ mode: '0', keyType: '402', keyScheme: 'U', cipher: type.cipher })
        ).then((r) => (msg.type[0].cvk = r.key)),
        Promise.resolve(
            type.pvk
                ? encMethod({ key: type.pvk, cipher: type.cipher })
                : method({ mode: '0', keyType: '002', keyScheme: 'U', cipher: type.cipher })
        ).then((r) => (msg.type[0].pvk = r.key)),
        Promise.resolve(
            type.mkac
                ? encMethod({ key: type.mkac, cipher: type.cipher })
                : method({ mode: '0', keyType: '109', keyScheme: 'U', cipher: type.cipher })
        ).then((r) => (msg.type[0].mkac = r.key))
    ])
        .then(() => (msg));
}

function cardNumberUnPad(cardNumber) {
    if (cardNumber.endsWith('F')) {
        return cardNumber.slice(0, cardNumber.length - 1);
    }
    return cardNumber;
}

module.exports = function (params) {
    return {
        schema: [{
            path: path.join(__dirname, './schema'),
            linkSP: true
        }],
        'start': function () {
            if (batchDownloadDir instanceof Array) {
                batchDownloadDir = batchDownloadDir.reduce((prev, cur) => {
                    var dir = path.join(prev, cur);
                    fs.mkdir(dir, () => { });
                    return dir;
                }, this.bus.config.workDir);
            }
        },
        'report.listOfCards.response.receive': function (msg, $meta) {
            if ($meta.fileConfig) {
                return handleExportResponse(msg, $meta);
            }

            return msg;
        },
        'application.fetch.request.send': function (msg, $meta) {
            return prepareFetchParamsWhenCardNumberFilter.bind(this)(msg, $meta);
        },
        'application.get.response.receive': function (msg, $meta) {
            if (msg.application[0].canBeEdited) {
                $meta.method = customerAccountSearch;
                // msg.customerNumber - id
                return this.bus
                    .importMethod(customerAccountSearch)({ customerNumber: msg.application[0].customerNumber, personNumber: msg.application[0].personNumber, productId: msg.application[0].productId }, $meta)
                    .then((result) => {
                        if (result.account && result.account.length) {
                            msg.accounts = mergeAccounts(msg.accounts, result.account);
                        }
                        return msg;
                    });
            }
            return msg;
        },
        'application.add.request.send': function (msg, $meta) {
            let validationMethod = 'card.application.validateAdd';
            let method = this.config[validationMethod] || this.super[validationMethod];
            if (method) {
                return method.call(this, msg, $meta)
                    .then((result) => {
                        $meta.method = 'card.application.add';
                        return storeAttachments.bind(this)(msg, $meta);
                    })
                    .catch((err) => {
                        throw err;
                    });
            } else {
                return storeAttachments.bind(this)(msg, $meta);
            }
        },
        'noNameApplication.add.request.send': function (msg, $meta) {
            return storeAttachments.bind(this)(msg, $meta);
        },
        'customer.search': function (msg, $meta) {
            let customMethod = `${$meta.method}Custom`;
            let method = this.config[customMethod] || this.super[customMethod];
            if (method) {
                return method.call(this, msg, $meta);
            }
            return this.super[$meta.method](msg, $meta);
        },
        'issueType.fetch': function (msg, $meta) {
            return {
                allIssueTypes: [{
                    issueTypeId: 0,
                    issueName: 'New'
                },
                {
                    issueTypeId: 1,
                    issueName: 'Replacement'
                },
                {
                    issueTypeId: 2,
                    issueName: 'Renewal'
                }]
            }
        },
        'customer.searchTSS': function (msg, $meta) {
            var uri = `/api.aspx?action=SEARCH_CUSTOMER&customer_id=${msg.customerNumber}`;

            return this.bus.importMethod('tssrest/customers.cms')({ uri: uri }).then((response) => {
                var rawresponse = JSON.parse(response);
                var res = rawresponse.response.customers;
                if (!Array.isArray(res)) res = [res];
                var result = res.map((customer) => {
                    return {
                        customerName: customer.first_name.concat(' ', customer.middle_name).concat(' ', customer.last_name),
                        customerNumber: customer.customer_number,
                        telMobile: customer.mobile_number ? customer.mobile_number : '+231555607080',//customer.mobile_number,//Return this to fetch correct mobile number
                        customerType: "customer type 1"
                    }
                })
                return { customer: result };
            });
        }
        ,
        'person.searchTSS': function (msg, $meta) {
            var uri = `/api.aspx?action=SEARCH_CUSTOMER&customer_id=${msg.customerNumber}`;

            return this.bus.importMethod('tssrest/customers.cms')({ uri: uri }).then((response) => {
                var rawresponse = JSON.parse(response);
                var res = rawresponse.response.customers;
                if (!Array.isArray(res)) res = [res];
                var result = res.map((customer) => {
                    return {
                        personName: customer.first_name.concat(' ', customer.middle_name).concat(' ', customer.last_name),
                        personNumber: customer.customer_number,
                        personTelNumber: customer.mobile_number ? customer.mobile_number : '+231555607080' //customer.mobile_number - TO DO, remove hard coding
                    }
                })
                return { person: result };
            });
        }
        ,
        'queueOut.fetch': function (msg, $meta) {
            return this.bus.importMethod("db/card.queueOut.fetch")(msg, $meta);
        },
        'account.search': function (msg, $meta) {
            let methodName = `${$meta.method}Custom`;
            let method = this.config[methodName] || this.super[methodName];
            if (!method) {
                throw new Error(`Missing procedure "${methodName}"`);
            }
            return method.call(this, msg, $meta);
        },
        'account.searchTSS': function (msg, $meta) {
            var uri = `/api.aspx?action=SEARCH_CUSTOMER&customer_id=${msg.customerNumber}`;

            return this.bus.importMethod('tssrest/customers.cms')({ uri: uri }).then((response) => {
                var rawresponse = JSON.parse(response);
                var res = rawresponse.response.customers[0].accounts;
                if (!Array.isArray(res)) res = [res];
                var result = res.map((account) => {
                    return {
                        accountNumber: account.account_number,
                        accountTypeName: account.account_type,
                        availableBalance: 0,
                        currency: account.currency,
                        customerNumber: msg.customernumber,
                        methodOfOperationId: ""
                    }
                })
                var accountlink = [];
				accountlink.push({
                        accountLinkId: 1,
                        name: 'savings',
                        code: 1
                    })
					
				accountlink.push({
                        accountLinkId: 2,
                        name: 'deposit',
                        code: 2
                    })
                accountlink.push({
                        accountLinkId: 3,
                        name: 'deposit',
                        code: 3
                    })
                return { account: result,accountLink:accountlink };

            });
        },
        'batch.download': function (msg, $meta) {
            let method = this.super[`${$meta.method}Custom`];

            if (!method) {
                throw new Error('Missing procedure "card.downloads.get"');
            }

            var eor = new Buffer(this.config.embosser.endOfRecord, 'hex').toString();
            return genBatchDownloadFile
                .bind(this)(msg, $meta, method, batchDownloadDir, eor)
                .then((filename) => {
                    $meta.tmpStaticFileName = filename;
                    return {};
                });
        },
        'application.statusUpdate.request.send': function (msg, $meta) {
            return updateValidate.bind(this)(msg, $meta, 'application');
        },
        'card.search.request.send': function (msg, $meta) {
            return this.bus.importMethod('pan.number.encrypt')({ card: msg.cardNumber })
                .then((item) => {
                    return { cardNumber: item.pan || '' };
                });
        },
        'cardInProduction.fetch.request.send': function (msg, $meta) {
            return prepareFetchParamsWhenCardNumberFilter.bind(this)(msg, $meta);
        },
        'cardInUse.fetch.request.send': function (msg, $meta) {
            return prepareFetchParamsWhenCardNumberFilter.bind(this)(msg, $meta);
        },
        'cardInUse.get.response.receive': function (msg, $meta) {
            if (msg.cardInUse.canBeEdited) {
                // msg.customerNumber - id
                $meta.method = customerAccountSearch;

                return this.bus
                    .importMethod(customerAccountSearch)({ customerNumber: msg.cardInUse.customerNumber, personNumber: msg.cardInUse.personNumber, productId: msg.cardInUse.productId }, $meta)
                    .then((result) => {
                        if (result.account && result.account.length) {
                            msg.accounts = mergeAccounts(msg.accounts, result.account);
                        }
                        return msg;
                    });
            }
            return msg;
        },
        'cardInUse.statusUpdate.request.send': function (msg, $meta) {
            switch (msg.cardActionLabel) {
                case 'GeneratePIN':
                    return generatePin['request.send'].bind(this)(msg, $meta, 'card');
                default:
                    return updateValidate.bind(this)(msg, $meta, 'cardInUse');
            }
        },
        'card.statusUpdate.request.send': function (msg, $meta) {
            switch (msg.cardActionLabel) {
                case 'GeneratePIN':
                    return generatePin['request.send'].bind(this)(msg, $meta, 'card');
                default:
                    return msg;
            }
        },
        'batch.statusUpdate.request.send': function (msg, $meta) {
            switch (msg.batchActionLabel) {
                case 'SentToProduction':
                    return batchStatusUpdateSendToProduction['request.send'].bind(this)(msg, $meta);
                case 'GeneratePIN':
                    return generatePin['request.send'].bind(this)(msg, $meta, 'batch');
                default:
                    return msg;
            }
        },
        'cipher.list': () => ({ ciphers: ['aes128', 'aes192', 'aes256', 'des3', 'blowfish'] }),
        'emvTags.list': () => {
            // emvTagsConfig
            let rawTags = emvTagsConfig.map.decode;
            let tags = [];
            for (var tag in rawTags) {
                tags.push({
                    key: tag,
                    name: tag + ' - ' + rawTags[tag]
                });
            }
            return {
                emvTags: tags
            };
            // ciphers: ['aes128', 'aes192', 'aes256', 'des3', 'blowfish']
        },
        'type.add.request.send': function (msg, $meta) {
            if (msg.type[0].ownershipTypeName === 'own') {
                return genKeys(this.bus.importMethod('pan.genKey'), this.bus.importMethod('pan.key.encrypt'), msg)
                    .then((newMsg) => {
                        return this.bus.importMethod('pan.key.encrypt')({ key: newMsg.type[0].decimalisation, cipher: newMsg.type[0].cipher })
                            .then((decimalisationResult) => {
                                return this.bus.importMethod('pan.key.encrypt')({ key: newMsg.type[0].ivac, cipher: newMsg.type[0].cipher })
                                    .then((ivacResult) => {
                                        newMsg.type[0].decimalisation = decimalisationResult.key;
                                        newMsg.type[0].ivac = ivacResult.key;
                                        return newMsg;
                                    });
                            });
                    });
            }
            return msg;
        },
        'pinMailerFile.add.request.send': function (msg, $meta) {
            //let uploadPath = this.bus.config.workDir + "\\uploads\\";
            let  pinMailerFormat = this.config.externalPinMailer.pinMailerFormat;
            let pinMailerFile = Buffer.from(msg.pinMailerFile[0].pinMailerFile.content, 'base64').toString().split('\n');
            let pinLinkFile = Buffer.from(msg.pinMailerFile[0].pinLinkFile.content, 'base64').toString().split('\n');
            let pinMailerFileHeader = pinMailerFile.shift();
            let pinMailerFileFooter = pinMailerFile.pop();

            let fHeader = {};
            fHeader.sequenceNumber =  pinMailerFileHeader.slice(0,6);
            fHeader.recordType = pinMailerFileHeader.slice(6,8);
            fHeader.fileDate =  pinMailerFileHeader.slice(8,18);
            fHeader.filler = pinMailerFileHeader.slice(18,23);
            fHeader.processingCentreID =  pinMailerFileHeader.slice(23,28);
            fHeader.processingSystem = pinMailerFileHeader.slice(33,38);
            fHeader.fileID = pinMailerFileHeader.slice(38,48);

            let fFooter = {};
            fFooter.sequenceNumber = pinMailerFileFooter.slice(0,6);
            fFooter.recordType = pinMailerFileFooter.slice(6,8);
            fFooter.fileDate =  pinMailerFileFooter.slice(8,18);
            fFooter.TotalPINRecords = pinMailerFileFooter.slice(18,33);

            let pinLink = pinLinkFile.reduce((l,x) => Object.assign({}, l, {[x.slice(0, 12).trim()]: x.slice(12, 38).replace('\r', '')}), {});

            let pinMailer = pinMailerFile.map(data => ({
                sequenceNumber: data.slice(0,6),
                recordType: data.slice(6,8),
                institution: data.slice(8, 28),
                product: data.slice(28, 48),
                productDescription: data.slice(48, 78),
                cardNumber:  data.slice(78, 94),
                cardID: data.slice(94, 106),
                embossingName: data.slice(106, 136),
                title: data.slice(136, 146), // Field 8
                firstName: data.slice(146, 166), //Field 6
                lastName: data.slice(166, 186), // Field 7
                address1: data.slice(186, 236),
                address2: data.slice(236, 286), // Field 2
                address3: data.slice(286, 336), // Field 3
                address4: data.slice(336, 386), // Field 4
                address5: data.slice(386, 436), // Field 5
                city: data.slice(436, 456),
                zip: data.slice(456, 466),
                country: data.slice(466, 496),
                expiryDate:  data.slice(496, 506),
                encryptedPIN:  data.slice(506, 522)
            }));

            let cards = [];
            let maxFieldIndex = 10;
            return this.bus.importMethod('hsm.printFormat')({
                printFields: pinMailerFormat
            })
            .then((printFormatResponse) => {
                if (printFormatResponse.errorCode === '00') {
                    return pinMailer.reduce((acc, pan) => {
                        return acc.then(() => {
                            // debugger;
                            let cardNumber = cardNumberUnPad(pinLink[pan.cardID.trim()]);
                            return this.bus.importMethod('hsm.translateZpkLmk')({
                                sourceZpk: this.config.externalPinMailer.zpk,
                                sourcePinBlock: pan.encryptedPIN,
                                sourcePinBlockFormat: '01',
                                card: cardNumber
                            }).then((pinResult) => {
                                let printFieldsSliced = `${pan.title.trim()} ${pan.firstName.trim()} ${pan.lastName.trim()};${pan.address1.trim()};${pan.address2.trim()};${pan.address3.trim()};${pan.address4.trim()};${pan.address5.trim()}`;
                                printFieldsSliced = printFieldsSliced.split(';').slice(0, parseInt(maxFieldIndex) + 1).join(';');
                                // printFieldsSliced = "";
                                return this.bus.importMethod('hsm.printPin')({
                                    documentType: 'C',
                                    card: cardNumber,
                                    pin: Buffer.from(pinResult.pinLmk.data, 'hex').toString(),
                                    printFields: printFieldsSliced
                                });
                            }).catch((error) => {
                                return error;
                            });
                        })
                        .then((partial) => {
                            cards.push(partial);
                        })
                        .catch((e) => {
                            return msg;
                                return {
                                    cardId: pan.cardId,
                                    pinOffset: null
                                };
                            });
                    }, Promise.resolve())
                    .then(() => {
                        let error =  cards.filter(({errorCode}) => errorCode !== '00').length;
                        let total = cards.filter(({errorCode}) => errorCode === '00').length;
                        return {pinMailerFile: [{
                            name: msg.pinMailerFile[0].name,
                            pinMailerFile: msg.pinMailerFile[0].pinMailerFile.filename,
                            pinLinkFile:  msg.pinMailerFile[0].pinMailerFile.filename,
                            batchId:  fHeader.fileID && fHeader.fileID.replace('\r', ''),
                            count: total,
                            status: error
                        }]};
                    });
                }
                return 0;
            });
        },
        'pinMailerFile.add.response.receive': function (msg, $meta) {
            return msg;
        }
    };
};
