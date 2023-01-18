const crypto = require('crypto');
const fs = require('fs');
const through = require('through2');
const split = require('split');
const KEYTYPES = { 'zpk': '001', 'tpk': '70D' };
const KCVTYPES = { '16': '0', '6': '1' };
var when = require('when');

function getICC(data) {
    var size = data.readUInt8(0);
    var isCCD = data.readUInt8(1) > 3;
    var cvn;
    var cvr;
    if (!isCCD) {
        var ccdccv = data.readUInt8(2);
        return { size, ccdv: ccdccv >> 4, cvn: (ccdccv << 4) >> 4, cvr: data.slice(3).toString('hex').toUpperCase(), isCCD };
    } else { // @TODO when is ccd
        return { size, cvn, cvr, isCCD };
    }
}

function formatExpirationDate(dateString) {
    // returns 'YYMM' format
    var date = new Date(dateString);
    var month = ('0' + (date.getMonth() + 1).toString()).slice(-2);
    var year = date.getFullYear().toString().slice(-2);
    return year + month;
}

function cardNumberUnPad(cardNumber) {
    if (cardNumber.endsWith('F')) {
        return cardNumber.slice(0, cardNumber.length - 1);
    }
    return cardNumber;
}

function getEmvCryptogramVerifyData(ownData, emvTagsData) {
    var extraTxData = [ownData.emvData.applicationInterchangeProfile];
    if (emvTagsData.atc && emvTagsData.atc.val) {
        extraTxData.push(emvTagsData.atc.val);
    }
    if (emvTagsData.issuerApplicationData && emvTagsData.issuerApplicationData.val) {
        extraTxData.push(getICC(Buffer.from(emvTagsData.issuerApplicationData.val, 'hex')).cvr);
    }
    return {
        modeFlag: 0,
        schemeId: ownData.emvData.schemeId,
        mkac: addKeyScheme(decrypt(this.config.key, ownData.emvData.mkac, 'hex', ownData.emvData.cipher)).toUpperCase(),
        panSeqNo: emvTagsData.pan.val + emvTagsData.panSeqNum.val,
        atc: emvTagsData.atc.val,
        unpredictableNumber: emvTagsData.unpredictableNumber.val,
        transactionData: getTransactionData(emvTagsData, ownData.emvData, extraTxData.join('')),
        arqc: emvTagsData.applicationCryptogram.val
    };
}

function processEmvCheck({info, emvTags}) {
    return Promise
    .resolve()
    .then(() => {
        if (emvTags && info.emvData && info.emvData.cryptogramMethodName) {
            var emvCryptogramVerifyData = getEmvCryptogramVerifyData.call(this, info, emvTags);
            emvCryptogramVerifyData.cryptogramMethodName = info.emvData.cryptogramMethodName;
            info.emvCryptogramVerifyData = encrypt(this.config.key, JSON.stringify(emvCryptogramVerifyData), 'ascii');
            if (info.emvData.cryptogramMethodName === 'KQ') {
                return generateArqc3.call(this, emvCryptogramVerifyData)
                .then(({arpc}) => {
                    info.arpc = arpc;
                    return (info)
                });
            } else if (info.emvData.cryptogramMethodName === 'KW') {
                emvCryptogramVerifyData.modeFlag = 0;
                emvCryptogramVerifyData.csu = '03920000';
                emvCryptogramVerifyData.pad = '';
                emvCryptogramVerifyData.panLength = 4;
                emvCryptogramVerifyData.arc = '3030';

                return generateArqc4.call(this, emvCryptogramVerifyData)
                .then(({arpc}) => {
                    info.arpc = arpc;
                    return (info)
                });
            }
        } else {
            return info;
        }
    });
    
    /*.catch(e => {
        return e;
    });*/
}

function processPinCheck(param)
{
    if (param.info.pinOffset === 'skip') {
        return {};
    }

    let checkPin = (param.keyManageType === 3) ? 'hsm.verifyOffsetIbmDukpt' : 'hsm.verifyOffsetIbm';

    return this.bus.importMethod(checkPin)({
        bdk: param.bdk,
        ksnDescriptor: param.ksnDescriptor,
        ksn: param.ksn,
        tpk: param.tpk,
        pvk: param.info.pvk,
        pinBlock: param.pinBlock,
        card: param.card,
        pinLength:  ('00' + this.config.pinLength).slice(-2) || '04',
        decimalisationTable: param.info.decimalisationTable,
        offset: decrypt(this.config.key, param.info.pinOffset, 'hex', param.info.cipher).toUpperCase()
    }).then(result => {
        return {pinOk:true};
    });
}

function processPinBlock({info, pinBlock, keyType, pinKey, card, pinBlockNew, track2, track2EquivalentData, emvTags}) {
    if (info && info.pvk && (info.pvk !== 'skip') && info.decimalisationTable && pinBlock && pinBlock.length) {
        return this.bus.importMethod('hsm.pinOffset')({
            keyType: KEYTYPES[keyType],
            tpk: pinKey,
            pvk: info.pvk,
            pinBlock: pinBlock,
            card: card,
            decimalisationTable: info.decimalisationTable
        })
            .then(result => {
                if (pinBlockNew && pinBlockNew.length) {
                    return this.bus.importMethod('hsm.pinOffset')({
                        keyType: KEYTYPES[keyType],
                        tpk: pinKey,
                        pvk: info.pvk,
                        pinBlock: pinBlockNew,
                        card: card,
                        decimalisationTable: info.decimalisationTable
                    }).then(pinBlockNewResult => {
                        result.offsetNew = pinBlockNewResult.offset;
                        return result;
                    });
                }
                return result;
            })
            .then(result => {
                result.offset && (result.offset = encrypt(this.config.key, result.offset, 'hex', info.cipher));
                result.offsetNew && (result.offsetNew = encrypt(this.config.key, result.offsetNew, 'hex', info.cipher));
                result.cardId = info.id;
                result.pan = info.pan;
                result.track2 = track2 && encrypt(this.config.key, track2, 'ascii', info.cipher);
                result.track2EquivalentData = track2EquivalentData && encrypt(this.config.key, track2EquivalentData, 'ascii', info.cipher);
                result.emvTags = emvTags && encrypt(this.config.key, JSON.stringify(emvTags), 'ascii', info.cipher);
                result.cipher = info.cipher;
                return result;
            });
    } else if (info && info.id && info.pvk === 'skip') {
        return {
            cardId: info.id,
            pan: info.pan,
            track2: track2 && encrypt(this.config.key, track2, 'ascii', info.cipher),
            track2EquivalentData: track2EquivalentData && encrypt(this.config.key, track2EquivalentData, 'ascii', info.cipher),
            emvTags: emvTags && encrypt(this.config.key, JSON.stringify(emvTags), 'ascii', info.cipher),
            cipher: info.cipher,
            offset: 'skip',
            pinBlock: pinBlock
        };
    } else if (info && info.id) {
        return {
            cardId: info.id,
            pan: info.pan,
            track2: track2 && encrypt(this.config.key, track2, 'ascii', info.cipher),
            track2EquivalentData: track2EquivalentData && encrypt(this.config.key, track2EquivalentData, 'ascii', info.cipher),
            emvTags: emvTags && encrypt(this.config.key, JSON.stringify(emvTags), 'ascii', info.cipher),
            cipher: info.cipher,
            pinBlock: pinBlock
        };
    } else {
        return {};
    }
};

function generateArqc4 ({modeFlag, schemeId, mkac, ivac, panLength, panSeqNo, branchHeightParams, atc, transactionData, arqc, arc, csu, pad}) {
    // modeFlag
    // schemeId
    // mkac - from the DB
    // ivac - from the DB
    // panSeqNo - 5A + 5F34
    // branchHeightParams
    // atc (application transaction counter) - 9F36
    // transactionData - 8c || 8D (tag-length replaced with value for each tag)
    // arqc - 9F26
    // arc (authorisation response code) - 8A
    // csu (card status update) - part of 91; emv 4.3 page 209 (225)
    // pad (proprietary authentication data) - part of 91

    return this.bus.importMethod('hsm.generateArqc4')({
        modeFlag,
        schemeId,
        mkac, // decrypt(mkac, this.config.key),
        ivac,
        panLength,
        panSeqNo,
        branchHeightParams,
        atc,
        transactionData,
        arqc,
        arc,
        csu,
        pad
    });
}

function generateArqc3({modeFlag, schemeId, mkac, panSeqNo, atc, unpredictableNumber, transactionData, arqc, arc}) {
    // modeFlag
    // schemeId
    // mkac - from the DB
    // TODO: mksmi - from the DB
    // panSeqNo - 5A + 5F34
    // atc (application transaction counter) - 9F36
    // unpredictableNumber - 9F37
    // transactionData - 8c || 8D (tag-length replaced with value for each tag)
    // arqc - 9F26
    // arc (authorisation response code) - 8A
    // TODO: discretionary data for MAC verification
    // TODO: add ICC data here, then => transactionData = transactionData + ICC data

    return this.bus.importMethod('hsm.generateArqc3')({
        modeFlag,
        schemeId,
        mkac,
        // TODO: mksmi
        panSeqNo,
        atc,
        unpredictableNumber,
        transactionData,
        arqc,
        arc
    });
}
// KeyScheme:
// None/Z - single length DES key using ANSI X9.17 methods
// U - double length DES key using the variant method
// T - triple length DES key using the variant method
// X - double length key using ANSI X9.17 methods
// Y - triple length key using ANSI X9.17 methods
// V - using Verifone/GISKE methods
// R - using X9 TR-31 KeyBlock methods
// S - DES, RSA & HMAC keys using Thales KeyBlock methods

function addKeyScheme(value) {
    return (value && value.length === 32) ? 'U' + value.toUpperCase() : value.toUpperCase();
}
function removeKeyScheme(value) {
    return (value && value.length === 33) ? value.slice(1, 33) : value;
}
function encrypt(key, value, clearFormat, cipherName) {
    var cipher = crypto.createCipher(cipherName || 'aes128', key);
    return cipher.update(value, clearFormat || 'hex', 'hex') + cipher.final('hex');
}

function decrypt(key, value, clearFormat, cipherName) {
    var decipher = crypto.createDecipher(cipherName || 'aes128', key);
    return decipher.update(value, 'hex', clearFormat || 'hex') + decipher.final(clearFormat || 'hex');
}

function cardNumber(track2, track2EquivalentData) {
    if (track2EquivalentData) {
        return track2EquivalentData.match && track2EquivalentData.match(/^(\d{0,19})D/)[1];
    }
    var result = track2 && track2.match && track2.match(/^;?(\d{0,19})=/);
    return result && result[1];
}

function calcLuhn(num) {
    var wholeLuhn = num.toString().split('').reverse()
        .map(
        (item, idx) => ((
            ((idx % 2) > 0)
                ? item
                : (item * 2).toString().split('').reduce((accum, cur) => (accum + parseInt(cur, 10)), 0)
        ))
        )
        .reduce((accum, cur) => (accum + parseInt(cur, 10)), 0) * 9;
    let luhn = wholeLuhn.toString().split('').slice(-1).pop();
    let newNum = num + luhn;
    return newNum;
}

function panGenerate(
    panLength, // how long card number is
    count, // how many numbers
    checkSum, // checkSum algorithm
    start, // start value of the sequence
    prefix, // prefill card with this value
    key, // encryption key
    cipher // encryption algorithm
) {
    panLength = panLength || 0;
    start = parseInt(start || 0, 10);
    let panLenOdd = (panLength % 2) > 0;
    checkSum = (checkSum === true) ? 'luhn' : checkSum;
    let realNumSize = panLength - (checkSum ? 1 : 0) - (prefix ? prefix.length : 0);

    let pans = (new Array(count));
    for (let i = 0; i < count; i++) {
        let num = [prefix, (Array(realNumSize).join('0') + start).slice(-realNumSize)].join('');
        switch (checkSum) {
            case 'luhn': num = calcLuhn(num);
        }
        // right-pad with single F to get even card number length
        pans[i] = { pan: encrypt(key, (panLenOdd ? `${num}F` : num), 'hex', cipher) };
        start = start + 1;
    }
    // todo random shuffle of the array
    return { list: pans };
};

const productionMapParseDecryptReplace = (decryptKey, line) => {
    // used by download production file
    // used by pin printing
    let elements = line.split(';');
    let cipher = elements.pop();
    line = elements.join(';');
    var match = line.match(/\$\{([^}]+)\}/ig);
    if (!match) {
        return line;
    }
    let existing = [];
    return match
        .filter((v) => { // filter non unique
            if (existing.indexOf(v) >= 0) {
                return false;
            }
            existing.push(v);
            return true;
        })
        .reduce((str, v) => {
            let s = v.replace(/(\$\{|})/ig, '').split(':');
            let key = s.shift();
            let dec;
            if (s.length) {
                dec = JSON.parse(decrypt(decryptKey, s.shift(), 'utf8', cipher).slice(20).toLowerCase())[key];
            } else {
                dec = cardNumberUnPad(decrypt(decryptKey, key, 'hex', cipher));
            }
            return str.replace(new RegExp(v.replace(/([${}])/ig, '\\$1'), 'ig'), dec);
        }, line);
};

function getTransactionData(cardData, ownData, extraTxData) {
    var cardDataTransofmed = Object.keys(cardData).map((k) => ({ tag: cardData[k].tag.toUpperCase(), val: cardData[k].val })).reduce((a, c) => (a[c.tag] = c.val) && a, {}); // convert object into correct structure
    var txData = ownData.CDOL1.slice().map((v, k) => (cardDataTransofmed[v.tag.toUpperCase()])); // map cdol tags to its values
    return txData.join('');
}

function getCardMasked(card) {
    return [
        card.slice(0, 6),
        '****',
        card.slice(-4)
    ].join('');
}

module.exports = {
    start: function () {
        this.getPvk = params => {
            return this.bus.importMethod('db/card.info.get')(params)
                .then(result => {
                    var rp = result && result.pin;
                    if (rp) {
                        var {cryptogramMethodName, schemeId, mkac, ivac, cipher, applicationInterchangeProfile, issuerId, flow, binId} = (result.type || {});
                        return {
                            id: rp.cardId,
                            cipher: rp.cipher,
                            pan: rp.pan,
                            pinOffset: rp.pinOffset,
                            emvData: {
                                schemeId,
                                mkac,
                                ivac,
                                cipher,
                                cryptogramMethodName,
                                applicationInterchangeProfile,
                                CDOL1: result.CDOL1 || []
                            },
                            pvk: rp.pvk && (rp.pvk === 'skip' ? 'skip' : addKeyScheme(decrypt(this.config.key, rp.pvk, 'hex', rp.cipher).toUpperCase())),
                            decimalisationTable: rp.decimalisation && decrypt(this.config.key, rp.decimalisation, 'hex', rp.cipher).toUpperCase(),
                            issuerId,
                            flow,
                            binId
                        };
                    }
                    return undefined;
                });
        };
    },
    'pvk.get': function ({track2, track2EquivalentData}) {
        var card = cardNumber(track2, track2EquivalentData);
        return this.getPvk({
            pan: encrypt(this.config.key, card),
            bin: card.substr(0, 6)
        });
    },
    'cardNumber.get': function ({track2, track2EquivalentData}) {
        return  cardNumber(track2, track2EquivalentData);
    },
    'number.encrypt': function ({card, cipher}) {
        if (card.length % 2 > 0) {
            card = card + 'F';
        }
        return { pan: encrypt(this.config.key, card, 'hex', cipher) };
    },
    'number.decrypt': function ({pan, track2, track2EquivalentData, cipher}) {
        return {
            card: cardNumberUnPad(decrypt(this.config.key, pan, 'hex', cipher)),
            track2: track2 && decrypt(this.config.key, track2, 'ascii', cipher),
            track2EquivalentData: track2EquivalentData && decrypt(this.config.key, track2EquivalentData, 'ascii', cipher)
        };
    },
    'key.encrypt': function ({key, cipher}) {
        return { key: encrypt(this.config.key, removeKeyScheme(key), 'hex', cipher) };
    },
    'production.map': function ({file}) {
        var readStream = fs.createReadStream(file);
        var tmpFileName = `${file}.dec`;
        var writeStream = fs.createWriteStream(tmpFileName);
        var p = new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                writeStream.close();
                fs.unlinkSync(file);
                resolve(tmpFileName);
            });
        });
        readStream
            .pipe(split())
            .pipe(through((chk, enc, n) => {
                let str = chk.toString();
                if (str.trim() === '') {
                    return n();
                }
                var r = productionMapParseDecryptReplace(this.config.key, str);
                n(null, `${r}\n`);
            }))
            .pipe(writeStream);

        return when.all(p).then(()=>{
            return p;
        })
    },
    'number.generate': function ({panLength, count, checkSum, start, prefix, cipher}) {
        start = parseInt(start, 10);
        count = parseInt(count, 10);
        var pans = panGenerate(panLength, count, checkSum, start, prefix, this.config.key, cipher);

        return {
            pans: pans,
            next: start + count
        };
    },
    'generateCvv.list': function (pans, $meta) {
        let response = [];
        let resTemp = {};
        return pans.reduce((acc, panData) => {
            return acc.then(() => {
                let {cvv1, cvv2, icvv, cavv} = panData;

                return this.bus.importMethod('hsm.generateCvv')(

                    addKeyScheme(decrypt(this.config.key, panData.cvk, 'hex', panData.cipher)),
                    cardNumberUnPad(decrypt(this.config.key, panData.pan, 'hex', panData.cipher)),
                    formatExpirationDate(panData.expirationDate),
                    panData.serviceCode,
                    {
                        cvv1, cvv2, icvv, cavv
                    })
                    .then((cvvString) => {
                        if (cvvString instanceof Object) {
                            return {
                                cardId: panData.cardId,
                                data: null,
                                cvv: null,
                                icvv: null,
                                pvv: null
                            };
                        } else {
                            return {
                                cardId: panData.cardId,
                                data: encrypt(this.config.key, cvvString, 'utf8', panData.cipher),
                                cvv: null,
                                icvv: null,
                                pvv: null
                            };
                        }
                    }).then((res) => {
                        resTemp = res;
                        //Now get PVV
                        let cardNumber = cardNumberUnPad(decrypt(this.config.key, panData.pan, 'hex', panData.cipher));
                        let pvkClean = decrypt(this.config.key, panData.pvk, 'hex', panData.cipher);
                        let decimalisationClean = decrypt(this.config.key, panData.decimalisation, 'hex', panData.cipher);
                        return this.bus.importMethod('hsm.derivePin')({
                            pvk: addKeyScheme(pvkClean),
                            pvkLength: addKeyScheme(pvkClean).length,
                            offset: undefined,
                            pinLength: this.config.pinLength || 4,
                            card: cardNumber,
                            decimalisationTable: decimalisationClean.toUpperCase()
                        }).then((pinResult) => {
                            // '00' = OK
                            // '02' = returned as a warning but processing continues, deriving the PIN using 3-DES in place of DES
                            if (['00', '02'].includes(pinResult.errorCode)) {
                                return this.bus.importMethod('hsm.getPVV')({
                                    pvki: 1,
                                    pvk: addKeyScheme(pvkClean),
                                    pvkLength: addKeyScheme(pvkClean).length,
                                    card: cardNumber,
                                    pin: pinResult.pin
                                }).then((pvvResult)=>{
                                    res.pvv=encrypt(this.config.key, pvvResult['pvv'], 'hex', panData.cipher)
                                    response.push(res);
                                    return response;
                                })
                            }
                        })
                        //end of pvv
                    })
                    .catch((error) => {
                        return response.push({
                            cardId: panData.cardId,
                            data: null,
                            cvv: null,
                            icvv: null,
                            pvv: null
                        });
                    });
            });
        }, Promise.resolve())
            .then(() => {
                return response;
            });
    },
    'generateAndPrintPin.list': function({pans, pinLength, pinMailerFormat, maxFieldIndex}) {
        let cards = [];
        return this.bus.importMethod('hsm.printFormat')({
            printFields: pinMailerFormat
        })
        .then((printFormatResponse) => {
            if (printFormatResponse.errorCode === '00') {
                return pans.reduce((acc, pan) => {
                    return acc.then(() => {
                        let cardNumber = cardNumberUnPad(decrypt(this.config.key, pan.pan, 'hex', pan.cipher));
                        let pvkClean = decrypt(this.config.key, pan.pvk, 'hex', pan.cipher);
                        let decimalisationClean = decrypt(this.config.key, pan.decimalisation, 'hex', pan.cipher);
                        return this.bus.importMethod('hsm.derivePin')({
                            pvk: addKeyScheme(pvkClean),
                            pvkLength: addKeyScheme(pvkClean).length,
                            offset: undefined,
                            pinLength: pinLength,
                            card: cardNumber,
                            decimalisationTable: decimalisationClean.toUpperCase()
                        }).then((pinResult) => {
                            // '00' = OK
                            // '02' = returned as a warning but processing continues, deriving the PIN using 3-DES in place of DES
                            if (['00', '02'].includes(pinResult.errorCode)) {
                                // TODO: move documentType to settings
                                // 'A' : for 1st mailer on a 2-up form
                                // 'B' : for 2nd mailer on a 2-up form
                                // 'C' : for a 1-up form
                                let printFieldsSliced = productionMapParseDecryptReplace(this.config.key, pan.printFields);
                                printFieldsSliced = printFieldsSliced.split(';').slice(0, parseInt(maxFieldIndex) + 1).join(';');
                                   return this.bus.importMethod('hsm.printPin')({
                                    documentType: 'C',
                                    card: cardNumber,
                                    pin: pinResult.pin,
                                    printFields: printFieldsSliced
                                })
                                .then((printResult) => {
                                    if (printResult.errorCode === '00') {
                                        return {
                                            cardId: pan.cardId,
                                            pinOffset: encrypt(this.config.key, pinResult.offset, 'hex', pan.cipher)
                                        };
                                    } else {
                                        return {
                                            cardId: pan.cardId,
                                            pinOffset: null
                                        };
                                    }
                                });
                            } else {
                                return {
                                    cardId: pan.cardId,
                                    pinOffset: null
                                };
                            }
                        }).catch((error) => {
                            
                            return {
                                cardId: pan.cardId,
                                pinOffset: null
                            };
                        });
                    })
                    .then((partial) => {
                        if (partial.pinOffset) {
                            cards.push(partial);
                        }
                        return 0;
                    })
                    .catch(() => {
                        return {
                            cardId: pan.cardId,
                            pinOffset: null
                        };
                    });
                }, Promise.resolve())
                .then(() => {
                    return cards;
                });
            }
            return 0;
        });
    },
    'generateThreeComponentZmk': function ({component1, component2, component3}) {
        return this.bus.importMethod('hsm.generateThreeComponentZmk')({
            component1: component1,
            component2: component2,
            component3: component3
        })
            .then((result) => {
                return result;
            });
    },
    'emvResponse.get': function ({emvCryptogramVerifyData, emvResponseTag}) {
        return Promise
        .resolve()
        .then(() => {
            return JSON.parse(decrypt(this.config.key, emvCryptogramVerifyData, 'ascii'))
        })
        //.catch(() => Promise.reject(errors.parserError()))
        .then(({schemeId, mkac, ivac, panLength, panSeqNo, branchHeightParams, atc, unpredictableNumber, transactionData, arqc, csu, pad, paddingMethod, cryptogramMethodName}) => {
            var requestData = {modeFlag: 2, schemeId, mkac, panSeqNo, atc, unpredictableNumber, transactionData, arqc, arc: Buffer.from(emvResponseTag).toString('hex'), paddingMethod};
            switch (cryptogramMethodName) {
                case 'KW':
                    return generateArqc4.call(this, Object.assign(requestData, {
                        modeFlag: 4,
                        ivac: ivac,
                        panLength: panLength,
                        branchHeightParams: branchHeightParams,
                        csu: '03920000',
                        pad: pad || ''
                    }));
                case 'KQ':
                    return generateArqc3.call(this, requestData);
                default:
                    throw  {cryptogramMethodName};
            }
        });
    },
    'check.get': function ({track2, track2EquivalentData, emvTags, pinKey, pinBlock, pinBlockNew, keyType, keyManageType, tpk, bdk, ksn, ksnDescriptor}) {
        var card = cardNumber(track2, track2EquivalentData);
        var isEmvCard = typeof (emvTags) === 'object';
        var info;
        if (!card) {
            return {
                hsmError: {
                    type: 'card.invalidTrack2'
                }
            };
        }
        
        return this.getPvk({
            pan: encrypt(this.config.key, (card.length % 2 === 1) ? (card + 'F') : card),
            bin: card.substr(0, 6) // Commonly bin is 6 lengt for IBL hardcoded 8. BH****
        }).then((i) => {
            if(i === undefined) {
                throw({errorCode: 'card.unknown', message: 'Card not found!', type: 'card.unknown'});
            }
            return (info = i) && { info, emvTags };
        })
        .then(processEmvCheck.bind(this))
        .then((i) => ({ info: i, pinBlock, keyType, keyManageType, card, track2, track2EquivalentData, emvTags,  tpk, bdk, ksn, ksnDescriptor}))
        .then(processPinCheck.bind(this))
        .then(i => {
            return {
                cardId: info.id,
                pan: info.pan,
                track2: track2 && encrypt(this.config.key, track2, 'ascii', info.cipher),
                track2EquivalentData: track2EquivalentData && encrypt(this.config.key, track2EquivalentData, 'ascii', info.cipher),
                emvTags: emvTags && encrypt(this.config.key, JSON.stringify(emvTags), 'ascii', info.cipher),
                cipher: info.cipher,
                pinBlock: pinBlock,
                emvCryptogramVerifyData: info.emvCryptogramVerifyData,
                cardMasked: getCardMasked(card),
                arpc: info.arpc,
                pinOffset: info.pinOffset || i.offset,
                isEmvCard,
                issuerId: info.issuerId,
                flow: info.flow,
                binId: info.binId
            };
        });/*.catch((err) => {
            if (info) {
                return {
                    cardId: info.id,
                    pan: info.pan,
                    emvCryptogramVerifyData: (emvTags ? encrypt(this.config.key, JSON.stringify(getEmvCryptogramVerifyData.call(this, info, emvTags)), 'ascii') : undefined),
                    isEmvCard,
                    hsmError: err
                };
            }
            return {
                isEmvCard,
                hsmError: err
            };
        });*/
    
    },
    'offset.get': function ({track2, track2EquivalentData, emvTags, pinKey, pinBlock, pinBlockNew, keyType}) {
        var card = cardNumber(track2, track2EquivalentData);
        var isEmvCard = typeof (emvTags) === 'object';
        var info;
        if (!card) {
            return {
                hsmError: {
                    type: 'card.invalidTrack2'
                }
            };
        }

        return this.getPvk({
            pan: encrypt(this.config.key, (card.length % 2 === 1) ? (card + 'F') : card),
            bin: card.substr(0, 6) // BH****
        })
            .then((i) => ((info = i) && { info, emvTags }))
            .then(processEmvCheck.bind(this))
            .then((i) => ({ info: i, pinBlock, keyType, pinKey, card, pinBlockNew, track2, track2EquivalentData, emvTags }))
            .then(processPinBlock.bind(this))
            .then((r) => {
                r.emvCryptogramVerifyData = info && info.emvCryptogramVerifyData;
                r.isEmvCard = isEmvCard;
                r.cardMasked = getCardMasked(card);
                return r;
            })
            .catch((err) => {
                if (info) {
                    return {
                        cardId: info.id,
                        pan: info.pan,
                        emvCryptogramVerifyData: (emvTags ? encrypt(this.config.key, JSON.stringify(getEmvCryptogramVerifyData.call(this, info, emvTags)), 'ascii') : undefined),
                        isEmvCard,
                        hsmError: err
                    };
                }
                return {
                    isEmvCard,
                    hsmError: err
                };
            });
    },
    'genKey': function ({mode, keyType, keyScheme, keyZmkTmkFlag, keyZmkTmk, keyScheme1, cipher}) {
        return this.bus.importMethod('hsm.generateKey')({ mode, keyType, keyScheme, keyZmkTmkFlag, keyZmkTmk, keyScheme1 })
            .then((keyResponse) => {
                let keyReturnResponse = {
                    key: encrypt(this.config.key, removeKeyScheme(keyResponse.keyA32), 'hex', cipher),
                    keyCheckValue: keyResponse.keyCheckValue
                };
                if (keyResponse.keyZmk) {
                    keyReturnResponse.keyZmk = encrypt(this.config.key, removeKeyScheme(keyResponse.keyZmk), 'hex', cipher);
                };
                return keyReturnResponse;
            });
    },
    'genKcv': function ({kcvType, key, cipher}) {
        // keyLengthFlag = '0' : for single-length key, '1' : for double-length key, '2' : for triple-length key, ‘3’ : for HMAC key
        // keyTypeCode = '00' : LMK pair 04-05, '01' : LMK pair 06-07, '02' : LMK pair 14-15, '03' : LMK pair 16-17, '04' : LMK pair 18-19, '05' : LMK pair 20-21,
        //               '06' : LMK pair 22-23, '07' : LMK pair 24-25, '08' : LMK pair 26-27, '09' : LMK pair 28-29, '0A' : LMK pair 30-31, '0B' : LMK pair 32-33,
        //               '10' : Variant 1 of LMK pair 04-05, ‘1C’ : Variant 1 of LMK pair 34-35, '42' : Variant 4 of LMK pair 14-15,
        //               'FF' : Use Key Type field
        return this.bus.importMethod('hsm.generateKeyCheckValue')({
            keyTypeCode: '02',
            keyLengthFlag: '1',
            keyA32: addKeyScheme(decrypt(this.config.key, key, 'hex', cipher)),
            kcvType: KCVTYPES[kcvType] || '0'
        }).then((response) => {
            return {
                kcv: response.kcv
            };
        });
    },
    processPinBlock,
    processPinCheck,
    generateArqc3,
    generateArqc4,
    translateBdkZmkLmk: function ({zmk, bdk}) {
        return this.bus.importMethod('hsm.translateBdkZmkLmk')({ zmk, bdk })
            .then((result) => {
                return result;
            });
    },
    translateBdkLmkZmk: function ({zmk, bdk}) {
        return this.bus.importMethod('hsm.translateBdkLmkZmk')({ zmk, bdk })
            .then((result) => {
                return result;
            });
    },
    importKey: function ({keyType, zmk, keyA32, keyScheme}) {
        return this.bus.importMethod('hsm.importKey')({ keyType, zmk, keyA32, keyScheme })
            .then((result) => {
                return result;
            });
    },
    exportKey: function ({keyType, zmk, keyA32, keyScheme}) {
        return this.bus.importMethod('hsm.exportKey')({ keyType, zmk, keyA32, keyScheme })
            .then((result) => {
                return result;
            });
    },
    encrypt: function ({data}) {
        return encrypt(this.config.key, data, 'ascii');
    },
    decrypt: function ({data}) {
        return decrypt(this.config.key, data, 'hex');
    }
};
