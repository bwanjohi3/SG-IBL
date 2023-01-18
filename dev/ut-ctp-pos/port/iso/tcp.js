'use strict';
const alias = require('./alias');
let errors;
const crypto = require('crypto');
function ecrypt(key, value, clearFormat, cipherName) {
    var cipher = crypto.createCipher(cipherName || 'aes128', key);
    return cipher.update(value, 'hex', clearFormat || 'hex').toUpperCase() + cipher.final(clearFormat || 'hex').toUpperCase();
}

function stripSentinel(track2) {
    if (!track2) {
        return;
    }
    return track2.replace(/^;/, '').replace(/\?$/, '');
}

function transferMonitoringFieldsFilter(filterFields) {
    var a = (new Array(300))
        .fill(0)
        .map((v, k) => k)
        .filter((v, idx) => !(filterFields.indexOf(idx) >= 0))
        .reduce((a, c) => {
            a[c] = '';
            return a;
        }, {});
    return (msg) => Object.assign({}, msg, a);
};

/* function posDeviceInfo(deviceInfo) { // Binnary parse...
    let keyManageType = deviceInfo.substr(0, 1).toString();
    let deviceSerial = deviceInfo.substr(1, 10).toUpperCase();
    let deviceCpuSerial = deviceInfo.substr(11, 32).toUpperCase();
    let posVersion = deviceInfo.substr(43, 8).toUpperCase();
    let ksn = deviceInfo.substr(51, 20).toUpperCase();

    return {keyManageType, deviceSerial, deviceCpuSerial, posVersion, ksn};
} */

function posDeviceInfo(deviceInfo) {
    return JSON.parse(deviceInfo);
}

function handleErrors(e, msg, $meta) {
    msg.abortAcquirer = e;
    if(e.type !== 'PortHTTP.Generic') {
        $meta.destination = 'posScript';
        $meta.method = 'posScript.error';
    } else {
        delete $meta.opcode;
        $meta.destination = 'posctp';
        $meta.mtid = 'response';
        msg.mtid = '0810';
        msg[39] = '96';
        msg[62] = 'Flow not connected.';
    }
    return msg;
}

function panVerify({track2, track2EquivalentData, emvTags, pinBlock, keyType = 'tpk'}, msg, {session: {keyManageType, tpk, bdk, ksn, ksnDescriptor}}, context, $meta) {
    if (msg[3].slice(0, 2) === '99' || msg.mtid ==='0420' || msg.mtid === '0400')  {
        let keyManageType2 = keyManageType;
        return this.bus.importMethod('pan.pvk.get')({track2, track2EquivalentData})
            .then((info) => {
                return this.bus.importMethod('pan.cardNumber.get')({track2, track2EquivalentData})
                .then((card) => {
                    return {info, card};
                })
            })
            .then(({info, card}) => {
                if (msg.mtid ==='0420' || msg.mtid === '0400') {
                    msg.issuerId = info.issuerId;
                    msg.cardId = info.id;
                    msg.flow = info.flow
                    msg.binId = info.binId;
                    msg.pan = info.pan;
                    return msg;
                }
                return this.bus.importMethod('pan.processPinCheck')({info, pinBlock, keyType, keyManageType, card, track2, track2EquivalentData, emvTags,  tpk, bdk, ksn, ksnDescriptor})
                    .then((result) => {
                        msg.issuerId = info.issuerId;
                        msg.cardId = info.id;
                        msg.flow = info.flow
                        msg.binId = info.binId;
                        msg.pan = info.pan;
                        return msg;
                    });
                        
            });          
    } else {

        return this.bus.importMethod('pan.check.get')({
            track2: track2,
            track2EquivalentData: track2EquivalentData,
            pinKey: tpk,
            pinBlock: pinBlock,
            keyType: 'tpk',
            keyManageType: keyManageType,
            tpk,
            bdk,
            ksn,
            ksnDescriptor,
            emvTags
        })
        .then(result => {
            delete msg[0];
            delete msg[1];
            delete msg[2];
            delete msg[35];
            delete msg[52];
            msg.error = result.hsmError;
            msg.cardId = result.cardId;
            msg.pinBlock = result.pinBlock;
            msg.pinOffset = result.offset;
            msg.pinError = result.pinError;
            msg.pan = result.pan;
            msg.track2 = result.track2;
            msg.track2EquivalentData = result.track2EquivalentData;
            msg.cipher = result.cipher;
            msg.emvCryptogramVerifyData = result.emvCryptogramVerifyData;
            //msg.source = $meta.source;
            msg.conId = context.conId;
            msg.channelId = context.session && context.session.channelId;
            msg.channelType = 'pos';
            msg.arpc = result.arpc;
            msg.offset = result.pinOffset;
            msg.issuerId = result.issuerId;
            msg.flow = result.flow;
            msg.binId = result.binId;
            return msg;
        });
    }

    /*return this.bus.importMethod('pan.verify')({
        track2,
        track2EquivalentData,
        emvTags,
        pinKey: tpk,
        pinBlock,
        keyType
    });*/
}

module.exports = {
    id: 'posctp',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    port: '14001',
    listen: true,
    disconnectTimeout: 30,
    timeout: 55000,
    ssl: false,
    format: {
        size: '16/integer',
        codec: require('ut-codec-iso8583'),
        version: 0,
        baseEncoding: 'ascii',
        emvTagsField: 55,
        networkCodes: {
            '901': 'firstInit',
            '902': 'getIpek',
            '903': 'transactionReport'
        },
        fieldFormat: {
            '52': {"size": 16, format: 'numeric'}
        }
    },
    // drainSend: 30000,
    issuerPort: 'pos/transfer',
    idleSend: 60000,
    idleReceive: 130000,
    start: function() {
        errors = errors ;//|| require('../errors')(this.defineError);
        this.isReady = new Promise((resolve, reject) => {
            this.resolveReady = resolve;
            this.rejectReady = reject;
        });
        this.transferMonitoringFieldsFilter = transferMonitoringFieldsFilter(this.config.transferMonitoringFieldsFilter || [5, 11, 18, 39, 41, 100]);
    },
    'drainSend.event.receive': function(msg, $meta) {
        $meta.mtid = 'notification';
        $meta.mtid = 'discard';
        $meta.method = 'posScript.drain';
        return {
            issuerPort: this.config.issuerPort,
            length: msg.length,
            interval: msg.interval
        };
    },
    connRouter: function() {
        return this.conCount;
    },
    'disconnected.event.receive': function(msg, $meta, ctx) {
        ctx && ctx.session && this.bus.importMethod('posMonitoring.publishStatus')({
            session: ctx.session,
            connected: false
        })
        .catch(error => this.error(error));
    },
    'connected.event.receive': function(CONNECTED, $meta, context) {
        context.session = Object.assign({}, context.session, {profileName: 'pos'});
        return CONNECTED;
    },
    '0800.firstInit.request.receive' : function(msg, $meta, context) {
        let deviceInfo = msg[62] && posDeviceInfo(msg[62]);
        delete msg[62];
        let terminalNumber = deviceInfo.terminalNumber = msg[41];
        deviceInfo.merchantNumber = msg[42];
        context.session = msg.session = context.session || {};
        $meta.destination = 'posScript';
        $meta.method = 'posScript.firstInit';
        let message = deviceInfo.deviceCpuSerial.toUpperCase();
        context.session.terminalSerial = deviceInfo.deviceSerial.toUpperCase();;
        //context.session.test = {};
       /* context.session.channelId = '1182';
        context.session.test = {};
        context.session.test.channelId = '1182';
        context.session.test.tmk = 'U8F3B3BE082AE5A7B88E94A01926410B0';
        context.session.test.tmkKvv = '2E2112';
        context.session.test.kekDukptLmk = 'U7A4EEBD100508CFE638E8F15530FB9D8';
        context.session.test.kekDukpt =  'XF1FE0ED196E486085A42729091DA9DEE';//KSN FFFF00000110001
        context.session.test.kekDukptKvv = 'F6C75F';
        context.session.test.keyDukpt = 'XDD32B0A354DD397AD126FBF5A964D3EC';
        context.session.test.keyDukptKvv = 'C27189';

        return this.bus.importMethod('posScript.generateKsn')({ksi:'000001', terminalNumber})
        .then(result => {
            context.session.test.ksn = result;
            return msg;
        }); */
        
        return  this.bus.importMethod('posScript.load')({terminalNumber})
        .then(result => {
            context.session.channelId = result.terminalInfo[0].posId;
            let keyManageType = context.session.keyManageType = result.terminalInfo[0].keyChainTypeID;
            let keyType = 'DEK';
            let dek = result.keyInfo.filter(i => i.itemTtypeName === 'DEK')[0].value; // 'UB190F7FBB802EA14FAC7917D3F6EDB67';
            let zmk = result.keyInfo.filter(i => i.itemTtypeName === 'ZMK')[0].value;
            let bdk;
            let ksi;
            let initialKeyItem = result.keyInfo.filter(i => i.itemTtypeName === 'initialKey');
            let initialKey = initialKeyItem.length > 0 && initialKeyItem[0].value;
            let initialKeyKvv = initialKeyItem.length > 0 && initialKeyItem[0].checkValue;

            if (context.session.keyManageType === 3) {
                bdk = result.keyInfo.filter(i => i.itemTtypeName === 'BDK')[0].value;
                ksi = result.keyInfo.filter(i => i.itemTtypeName === 'KSI')[0].value;
            }

            return Promise.all ([
                deviceInfo.test === '1' && {keyA32: initialKey, keyCheckValue: initialKeyKvv},
                deviceInfo.test !== '1' && this.bus.importMethod('hsm.encryptDataBlock')({
                    modeFlag: '01',
                    keyType,
                    key: dek,
                    iv: '0000000000000000',
                    messageData: message
                })
                .then((encData) => {
                    return this.bus.importMethod('hsm.encryptDataBlock')({
                        modeFlag: '00',
                        keyType,
                        key: dek,
                        messageData: encData.encrypted.toString()
                    })         
                })
                .then((encDataDek) => {
                        let keyA32 = 'X' + encDataDek.encrypted.toString()
                        let keyScheme = 'U';
                        let keyType2 = 'TMK';
                        return this.bus.importMethod('hsm.importKey')({keyType: keyType2, zmk, keyA32, keyScheme});
                })
            ])
            .then((result) => {
                const {keyA32, keyCheckValue} = result[0] || result[1];
                context.session.fTmk = keyA32;
                context.session.fTmkKvv =  keyCheckValue;
                return keyA32;
            })
            .then((key) => {
                let mode = 1; // Under ZMK
                let keyTypeTmk = 'TMK';
                let keyScheme = 'U';
                let zmkTmkFlag = 1; // Under TMK
                let keyZmkTmk = key;
                let keyScheme1 = 'X';
                return this.bus.importMethod('hsm.generateKeyTmk')({mode, keyType: keyTypeTmk, keyScheme, zmkTmkFlag, tmk: keyZmkTmk, keyScheme1});
            })
            .then((keyResponse) => {
                let keyLmk = keyResponse.keyA32;
                let rest = String.fromCharCode.apply(null, keyResponse.rest.data);
                let keyZmk = rest.slice(0, -6);
                let keyKvk = rest.slice(-6);
    
                if (keyManageType === 2 || keyManageType === 1) { // MASTER-SESSION:2 FIX-KEY:1 DUKPT:3
                    let mode = 1; // Under ZMK
                    let keyTypeTmk = 'TMK';
                    let keyScheme = 'U';
                    context.session.tmkKekLmk = keyResponse.keyA32;
                    context.session.tmkKekZmk = keyZmk;
                    context.session.tmkKekKvk = keyKvk;
                    let zmkTmkFlag = 1; // Under TMK
                    let keyScheme1 = 'X';
    
                    return this.bus.importMethod('hsm.generateKeyTmk')({mode, keyType: keyTypeTmk, keyScheme, zmkTmkFlag, tmk: keyLmk, keyScheme1})
                        .then(tmkResponse => {
                            let rest = String.fromCharCode.apply(null, tmkResponse.rest.data);
                            let keyZmk = rest.slice(0, -6);
                            let keyKvk = rest.slice(-6);
                            context.session.tmkLmk = tmkResponse.keyA32;
                            context.session.tmkZmk = keyZmk;
                            context.session.tmkKvk = keyKvk;
    
                            return msg; // INIT MASTER-SESION FLOW END
                        });
                } 
    
                context.session.kekDukptLmk = keyLmk;
                context.session.kekDukpt = keyZmk;
                context.session.kekDukptKvv =keyKvk;
                return this.bus.importMethod('posScript.generateKsn')({ksi, terminalNumber}).then((ksn) => ({key: keyLmk, ksn}))
                .then(({key, ksn}) => {
                    let keyScheme = 'U';
                    let keyZmkTmk = key;
                    let keyScheme1 = 'X';
                    let zmkTmkFlag = 1;
                    // let ksn = 'FFFF' + ksi + '10001';
                    context.session.ksn = ksn;
                    return this.bus.importMethod('hsm.generateIPEK')({keyScheme, dukptMasterKey: bdk, ksn: ksn.slice(0, 15), zmkTmkFlag, keyZmkTmk, keyScheme1});
                })
                .then((keyResponse) => {
                    context.session.keyDukpt = keyResponse.keyZmk;
                    context.session.keyDukptKvv = keyResponse.keyCheckValue;
                    return msg; // INIT DUKPT FLOW END
                });
            })
        })
        .catch((e) => handleErrors(e, msg, $meta));
    },
    '0800.keyChange.request.receive': function(msg, $meta, context) {
        let deviceInfo = msg[62] && posDeviceInfo(msg[62]);
        delete msg[62];
        deviceInfo.terminalNumber = msg[41];
        deviceInfo.merchantNumber = msg[42];
        context.session = msg.session = context.session || {};
        context.session.profileName = 'pos';
        return this.bus.importMethod('posScript.load')({terminalSerial: deviceInfo.deviceSerial})
        .then((result) => {
            if (result.terminalInfo.length === 0) {
                throw new Error('Unregistered terminal.');
            }
            $meta.destination = 'posScript';
            $meta.method = 'posScript.keyChange';
            let keyManageType = result.terminalInfo[0].keyChainTypeID;
            context.session.adminPassword = result.terminalInfo[0].adminPassword;
            context.session.merchantPassword = result.terminalInfo[0].merchantPassword;
            msg.session.keyManageType = keyManageType;
            context.session.keyManageType = keyManageType;
            context.session.terminalName = result.terminalInfo[0].name;
            context.session.organizationName = result.terminalInfo[0].organizationName;
            context.session.merchantName = result.terminalInfo[0].merchantName;
            context.session.location = result.terminalInfo[0].location;
            context.session.countryName = result.terminalInfo[0].countryName;
            context.session.header1 = result.terminalInfo[0].header1;
            context.session.header2 = result.terminalInfo[0].header2;
            context.session.header3 = result.terminalInfo[0].header3;
            context.session.header4 = result.terminalInfo[0].header4;
            context.session.footer1 = result.terminalInfo[0].footer1;
            context.session.footer2 = result.terminalInfo[0].footer2;
            context.session.footer3 = result.terminalInfo[0].footer3;
            context.session.channelId = result.terminalInfo[0].posId;
            context.session.curentVersion = result.terminalInfo[0].currVersion || '';
            context.session.newVersion = result.terminalInfo[0].newVersion || '';
            context.session.posVersion = deviceInfo.posVersion.toUpperCase();
            context.session.binList = result.binList;
            //context.session.binList = this.bus.importMethod('card.binList.fetch')()
            //    .then(result => result);
            if (keyManageType == '3') // DUKPT
            {
                context.session.ksn = deviceInfo.ksn.toUpperCase();;
                context.session.bdk = result.keyInfo.filter(i => i.itemTtypeName === 'BDK')[0].value;
                context.session.ksnDescriptor = result.keyInfo.filter(i => i.itemTtypeName === 'ksnDescriptor')[0].value;
                return msg;
            }
            // MASTER-SESSION
            let tmk = result.terminalInfo[0].tmk;
            context.session.tmk = tmk;
            return this.bus.importMethod('hsm.generateTpk')({tmk})
            .then(result => {
                return ({
                    tpk: result.tpkTmk,
                    tmk: context.session.tmk,
                    tpkLmk: result.tpkLmk
                })
            })
            .then(result => {
                context.session.tpk = result.tpkLmk;
                msg.tpk = result.tpk;
                return msg;
            });
        }) 
        .catch((e) => handleErrors(e, msg, $meta));
    },
    '0800.transactionReport.request.receive': function(msg, $meta, context) {
        
        let deviceInfo = msg[62] && posDeviceInfo(msg[62]);
        delete msg[62];
        deviceInfo.terminalNumber = msg[41];
        deviceInfo.merchantNumber = msg[42];
        context.session = msg.session = context.session || {};
        msg.profileName = context.session.profileName = 'pos';
        return this.bus.importMethod('posScript.load')({terminalSerial: deviceInfo.deviceSerial})
        .then((result) => {
            $meta.destination = 'posScript';
            $meta.method = 'posScript.transactionReport';
            msg.startDate = msg[63];
            msg.endDate = msg[63];
            context.session.channelId = result.terminalInfo[0].posId;
            context.session.terminalName = result.terminalInfo[0].name;
            context.session.organizationName = result.terminalInfo[0].organizationName;
            context.session.merchantName = result.terminalInfo[0].merchantName;
            context.session.location = result.terminalInfo[0].location;
            context.session.county = result.terminalInfo[0].county;
            context.session.header1 = result.terminalInfo[0].header1;
            context.session.header2 = result.terminalInfo[0].header2;
            context.session.header3 = result.terminalInfo[0].header3;
            context.session.header4 = result.terminalInfo[0].header4;
            context.session.footer1 = result.terminalInfo[0].footer1;
            context.session.footer2 = result.terminalInfo[0].footer2;
            context.session.footer3 = result.terminalInfo[0].footer3;

            return msg;
        })
        .catch((e) => handleErrors(e, msg, $meta));    
    },
    send: function(msg, $meta, context) {
        if($meta.method === 'posScript.getAccounts'){
            context.session.accounts = msg.session.accounts;
        }

        if($meta.method === 'posScript.handleQuery'){
            context.session.sourceCardProductId = msg.session.sourceCardProductId
        }

        if($meta.method === 'posScript.transactionReport'){
            context.session.report = msg.session.report;
        }

        return Promise.all([
            msg.emvCryptogramVerifyData && this.bus.importMethod('pan.emvResponse.get')({
                emvCryptogramVerifyData: msg.emvCryptogramVerifyData,
                emvResponseTag: msg[39] || '00'
            }),
            msg.pan && this.bus.importMethod('pan.number.decrypt')({
                cipher: msg.cipher,
                track2: msg.track2,
                track2EquivalentData: msg.track2EquivalentData,
                pan: msg.pan,
                pinBlock: msg.pinBlock,
                emvTags: msg.emvTags
            })
        ])
        .then(([emvIssuer, decrypted]) => {
            if (emvIssuer) {
                let issuerAuthenticationData = {
                    idx: 0,
                    val: emvIssuer.arpc + Buffer.from(msg[39] || '00').toString('hex')
                };
                msg.emvTags = {issuerAuthenticationData};
                msg[55] = '910A' + issuerAuthenticationData.val;
            } else if (decrypted && decrypted.emvTags) {
                msg.emvTags = [
                    'applicationInterchangeProfile',
                    'terminalVerificationResults',
                    'transactionDate',
                    'transactionType',
                    'transactionCurrencyCode',
                    'amountAuthorised',
                    'amountOther',
                    'issuerApplicationData',
                    'terminalCountryCode',
                    'applicationCryptogram',
                    'atc',
                    'unpredictableNumber'
                ].reduce((result, tag) => {
                    if (decrypted.emvTags[tag]) {
                        result[tag] = decrypted.emvTags[tag];
                    }
                    return result;
                }, {});
            }

            this.bus.importMethod('posMonitoring.publishTransfer')({
                connected: true,
                conId: $meta.conId,
                session: context.session,
                transfer: this.transferMonitoringFieldsFilter(msg)
            }).catch(error => this.error(error));

            if (decrypted) {
                msg[2] = decrypted.card;
                msg[35] = stripSentinel(decrypted.track2EquivalentData || decrypted.track2);
            }
            if (!decrypted || !decrypted.pinBlock) {
                return msg;
            }
            return this.bus.importMethod('hsm.translateTpkZpk')({
                sourceTpk: msg.tpk,
                destinationZpk: context.session.zpk,
                maximumPinLength: '12',
                sourcePinBlock: decrypted.pinBlock,
                sourcePinBlockFormat: '01',
                destinationPinBlockFormat: '01',
                card: decrypted.card
            }).then(translated => Object.assign(msg, {
                52: translated.pinBlock
            }));
        })
        .then(result => {
            if ($meta.mtid === 'request') {
                $meta.timeout = this.timing.after(this.config.timeout);
            }
            return result;
        }) 
        .catch((e) => handleErrors(e, msg, $meta));
    },

    receive: function(msg, $meta, context) {
        if (!context.session || !context.session.profileName || !context.session.channelId) {
            $meta.mtid = 'discard'; // todo: consider return response with error rather than discard
            return msg;
        }
        let deviceInfo = msg[62] && posDeviceInfo(msg[62]);
        delete msg[62]; 
        deviceInfo && deviceInfo.ksn && (context.session.ksn = deviceInfo.ksn.toUpperCase());
        context.session && context.session.accounts && msg[102] && context.session.accounts[msg[102]] && (msg[102] = context.session.accounts[msg[102]].accountNumber);
        context.session && context.session.accounts && msg[103] && context.session.accounts[msg[103]] && (msg[103] = context.session.accounts[msg[103]].accountNumber);


        if ($meta.mtid === 'request') {
            const tranCode = msg[3].slice(0, 2);
            $meta.destination = 'posScript';
            $meta.method = `posScript.${alias[msg.mtid + '.' + tranCode] || msg.mtid}`;

            if (msg.emvTags) {
                if (!msg.emvTags.pan) {
                    msg.emvTags.pan = {
                        val: msg[2],
                        tag: '5A'
                    };
                }
                if (!msg.emvTags.panSeqNum && msg[23]) {
                    msg.emvTags.panSeqNum = {
                        val: msg[23].slice(-2),
                        tag: '5F34'
                    };
                }
                if (!msg.emvTags.amountOther) {
                    msg.emvTags.amountOther = {
                        val: '0'.repeat(12),
                        tag: '9F03'
                    };
                }

                if (msg.emvTags.applicationLabel) {
                    context.session && (context.session.applicationLabel = Buffer.from(msg.emvTags.applicationLabel.val, 'hex').toString());
                }
                if (msg.emvTags.applicationIdentifierAIDCard) {
                    context.session && (context.session.applicationIdentifierAIDCard = msg.emvTags.applicationIdentifierAIDCard.val.toUpperCase());
                }
            }
        }
        let error;
        if ($meta.mtid === 'error') {
            error = msg;
            error.details = error.iso;
            msg = error.iso;
        }
        let isEmv = msg && msg.emvTags && (!msg[22] || msg[22].startsWith('05'));
        const fn = (issuerEmv, result) => {
            msg.pan = result.pan;
            msg.cardId = result.cardId;
            msg.track2 = result.track2;
            msg.pinBlock = result.pinBlock;
            msg.track2EquivalentData = result.track2EquivalentData;
            msg.pinError = result.pinError; // todo: set abortAcquirer??
            msg.profileName = context.session.profileName;
            msg.channelId = context.session.channelId;
            msg.session = context.session;
            msg.source = $meta.source;
            msg.conId = $meta.conId;

            msg.pinOffset = result.offset;
            msg.availableCvvList = result.availableCvvList;
            msg.channelType = context.session.profileName;
            msg.emvCryptogramVerifyData = result.emvCryptogramVerifyData;

            msg.bdk = context.session.bdk;
            msg.ksn = context.session.ksn;
            msg.ksnDescriptor = context.session.ksnDescriptor;
            msg.sourceCardProductId = context.session.sourceCardProductId
            if ($meta.mtid === 'error') {
                error.details = msg;
                return error;
            }
            return msg;
        };
        var track2 = !isEmv && msg[35];
        var track2EquivalentData = isEmv && msg[35] && msg[35].replace('=', 'D');

        return Promise.all([
            ($meta.mtid === 'response' || $meta.mtid === 'error') && msg.emvTags && this.bus.importMethod('pan.encrypt')({data: JSON.stringify(msg.emvTags)}).catch((e) => (e)),
            (($meta.mtid === 'request') && msg[35] && msg[52] && msg[2] && panVerify.call(this, {track2, track2EquivalentData, pinBlock: msg[52], emvTags: msg.emvTags}, msg, context, $meta)
                .then((rest) => {
                    var method = rest.method;
                    delete rest.method;
                    return ((method && ($meta.method = method) && rest) || rest)
                })
            )
        ])
        .then(([issuerEmv, result = {}]) => {
            return fn(issuerEmv, result);
        })
        .catch((e) => handleErrors(e, msg, $meta));
    }
};