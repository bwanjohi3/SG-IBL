const {
    keyByType
} = require('./constants.json');


function pinData(card) {
    return card.substring(0, 10) + 'N' + card.substring(card.length - 1);
}

function account(card) {
    return card.substring(card.length - 13, card.length - 1);
}

function padNumber(number, length) {
    return ('0' + number).slice(-length || -2);
}

function checkLength(pinLength) {
    return ('0' + pinLength.toString()).slice(-2);
}

function zeroOffset(pinLength) {
    return ('0'.repeat(pinLength) + 'F'.repeat(12 - pinLength));
}

function randomInt(maxValue) {
    return Math.floor(Math.random() * (maxValue + 1));
}

function generateRandomString(stringSize) {
    let result = '';
    let symbols = '!@#$%^&*()_+|-=?,.<>~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < stringSize; i++) {
        result = result + symbols.charAt(randomInt(symbols.length - 1));
    }
    return result;
}

const padString = (value, position, padSymbol, targetLength) => {
    let result = '';
    switch (position) {
        case 'l':
            result = result.concat(padSymbol.repeat(targetLength - value.length), value);
            break;
        case 'r':
            result = result.concat(value, padSymbol.repeat(targetLength - value.length));
            break;
        case 'x':
            let padStringlength = (targetLength - value.length) / 2;
            result = result.concat(value, '80', '00'.repeat(padStringlength - 1));
            break;
        default:
            result = value;
            break;
    }
    return result;
};

module.exports = ({hsm}) => {
    const getKeyType = (keyType) => {
        if (keyByType[keyType]) {
            return keyByType[keyType][hsm.pciMode === true ? 'keyTypeCodePci' : 'keyTypeCodeNonPci'];
        }
        return keyType;
    }

    return ({
        ping: function (msg) {
            return this.bus.importMethod('payshield.echo')(msg)
                .then((response) => ({
                    message: response.message
                }));
        },
        generateKey: function ({
            mode,
            keyType,
            keyScheme,
            keyZmkTmkFlag,
            keyZmkTmk,
            keyScheme1,
            deriveKeyMode,
            dukptMasterKeyType,
            dukptMasterKey,
            ksn,
            tr31BlockData
        }) {
            let delimiterLength = 0;
            let delimiter = '';
            let keyZmkTmkFlagLength = 0;
            let keyZmkTmkLength = 0;
            let keyScheme1Length = 0;
            let deriveKeyModeLen = 0;
            let dukptMasterKeyTypeLen = 0;
            let dukptMasterKeyLen = 0;
            let ksnLen = 0;
            let tr31BlockDataLen = 0;

            if (['1', 'B'].includes(mode)) {
                delimiterLength = 1;
                delimiter = ';';
                keyZmkTmkFlagLength = 1;
                keyZmkTmkLength = keyZmkTmk.length;
                keyScheme1Length = 1;
            } else {
                keyZmkTmkFlag = '';
                keyZmkTmk = '';
                keyScheme1 = '';
            };

            if (deriveKeyMode === '0' && ['A', 'B'].includes(mode)) {
                deriveKeyModeLen = 1;
                dukptMasterKeyTypeLen = 1;
                dukptMasterKeyLen = dukptMasterKey.length;
                ksnLen = ksn.length; // MAX 15 without counter.
            } else {
                deriveKeyMode = '';
                dukptMasterKeyType = '';
                dukptMasterKey = '';
                ksn = '';
            };

            if (keyScheme1 === 'R') {
                tr31BlockDataLen = tr31BlockData.length;
            } else {
                tr31BlockData = '';
            }

            return this.bus.importMethod('payshield.generateKey')({
                mode: mode,
                keyType: getKeyType(keyType),
                keyScheme: keyScheme,
                deriveKeyModeLen: deriveKeyModeLen,
                deriveKeyMode: deriveKeyMode,
                dukptMasterKeyTypeLen: dukptMasterKeyTypeLen,
                dukptMasterKeyType: dukptMasterKeyType,
                dukptMasterKeyLen: dukptMasterKeyLen,
                dukptMasterKey: dukptMasterKey,
                ksnLen: ksnLen,
                ksn: ksn,
                delimiterLength: delimiterLength,
                delimiter: delimiter,
                keyZmkTmkFlagLength: keyZmkTmkFlagLength,
                keyZmkTmkFlag: keyZmkTmkFlag,
                keyZmkTmkLength: keyZmkTmkLength,
                keyZmkTmk: keyZmkTmk,
                keyScheme1Length: keyScheme1Length,
                keyScheme1: keyScheme1,
                tr31BlockDataLen: tr31BlockDataLen,
                tr31BlockData: tr31BlockData
            });
        },
        generateTpk: function ({
            tmk
        }) {
            return this.bus.importMethod('payshield.generateTpk')({
                keyScheme: 'X',
                keyScheme1: 'U',
                tmk: tmk
            }).then((response) => {
                return ({
                    tpkTmk: response.tpk,
                    tpkLmk: response.keyA32
                })
            });
        },
        generateTak: function ({
            tmk
        }) {
            return this.bus.importMethod('payshield.generateTak')({
                keyScheme: 'X',
                keyScheme1: 'U',
                tmk: tmk
            }).then((response) => ({
                takTmk: response.tpk,
                takLmk: response.keyA32
            }));
        },
        generateMac: function ({
            message,
            keyType,
            key
        }) {
            return this.bus.importMethod('payshield.generateMac')({
                macMode: '0',
                macInputFormat: '0',
                macAlgorithm: '03',
                macPaddingMethod: '1',
                msgSize: message.length,
                msgSizeHex: ('0000' + message.length.toString(16)).substr(-4).toUpperCase(),
                macKeyType: getKeyType(keyType),
                macKey: key,
                macMessage: message
            }).then((response) => ({
                mac: response.mac
            }));
        },
        generateKeyTmk: function ({
            mode,
            keyType,
            keyScheme,
            zmkTmkFlag,
            tmk,
            keyScheme1
        }) {
            return this.bus.importMethod('payshield.generateKeyTmk')({
                mode: mode,
                keyType: getKeyType(keyType),
                keyScheme: keyScheme,
                zmkTmkFlag: zmkTmkFlag,
                tmk: tmk,
                keyScheme1: keyScheme1
            }).then((response) => {
                return response;
            });
        },
        verifyMac: function ({
            message,
            keyType,
            key,
            mac
        }) {
            return this.bus.importMethod('payshield.verifyMac')({
                macMode: '0',
                macInputFormat: '0',
                macAlgorithm: '03',
                macPaddingMethod: '1',
                msgSize: message.length,
                msgSizeHex: ('0000' + message.length.toString(16)).substr(-4).toUpperCase(),
                macKeyType: getKeyType(keyType),
                macKey: key,
                macMessage: message,
                mac: mac
            });
        },
        importZpk: function ({
            zmk,
            zpk
        }) {
            return this.bus.importMethod('payshield.importKey')({
                keyType: '001',
                keyScheme: 'U',
                zmk: zmk,
                keyA32: zpk
            }).then((response) => ({
                zpk: response.keyA32,
                zpkkvv: response.keyCheckValue
            }));
        },
        translateTpkZpk: function ({
            sourceTpk,
            destinationZpk,
            maximumPinLength,
            sourcePinBlock,
            sourcePinBlockFormat,
            destinationPinBlockFormat,
            card
        }) {
            return this.bus.importMethod('payshield.translateTpkZpk')({
                sourceTpk: sourceTpk,
                destinationZpk: destinationZpk,
                maximumPinLength: maximumPinLength,
                sourcePinBlock: sourcePinBlock,
                sourcePinBlockFormat: sourcePinBlockFormat,
                destinationPinBlockFormat: destinationPinBlockFormat,
                account: account(card)
            }).then((response) => ({
                pinBlock: response.destinationPinBlock
            }));
        },
        translateBdkZpk: function ({
            bdk,
            zpk,
            ksnDescriptor,
            ksn,
            pinBlock,
            card
        }) {
            return this.bus.importMethod('payshield.translateBdkZpk')({
                bdk: bdk,
                zpk: zpk,
                ksnDescriptor: ksnDescriptor,
                ksn: ksn,
                pinBlock: pinBlock,
                pinBlockFormat: '01',
                desPinBlockFormat: '01',
                account: account(card)
            });
        },

        translateZpkLmk: function ({
            sourceZpk,
            sourcePinBlock,
            sourcePinBlockFormat,
            card
        }) {
            return this.bus.importMethod('payshield.translateZpkLmk')({
                sourceZpk: sourceZpk,
                sourcePinBlock: sourcePinBlock,
                sourcePinBlockFormat: sourcePinBlockFormat,
                account: account(card)
            }).then((response) => ({
                pinLmk: response.pin
            }));
        },
        derivePin: function ({
            pvk,
            offset,
            pinLength,
            card,
            decimalisationTable
        }) {
            return this.bus.importMethod('payshield.derivePinIbm')({
                pvk: pvk.toUpperCase(),
                pvkLength: pvk.length,
                offset: offset || zeroOffset(pinLength),
                checkLength: checkLength(pinLength),
                account: account(card),
                decimalisationTable: decimalisationTable,
                pinValidationData: pinData(card)
            }).then((response) => {
                return {
                    errorCode: response.errorCode,
                    pin: String.fromCharCode.apply(null, response.pin.data),
                    offset: offset || zeroOffset(pinLength)
                };
            });
        },
        printFormat: function ({
            printFields
        }) {
            return this.bus.importMethod('payshield.printFormat')({
                printFields: printFields,
                printFieldsLength: printFields.length
            }).then((result) => {
                return result;
            });
        },
        printPin: function ({
            documentType,
            card,
            pin,
            printFields
        }) {
            return this.bus.importMethod('payshield.printPin')({
                documentType: documentType,
                account: account(card),
                pin: pin,
                cryptedPinLength: pin.length,
                printFields: printFields,
                printFieldsLength: printFields.length
            });
        },
        getPVV: function ({
            pvki,
            pvk,
            pvkLength,
            card,
            pin
        }) {
            return this.bus.importMethod('payshield.getPVV')({
                pvki: pvki,
                pvk: pvk,
                account: account(card),
                pin: pin,
                pvkLength: pvkLength,
                cryptedPinLength: pin.length,
                keyType: "002"
            });
        },
        generateCvv: function (cvk, cardNumber, expirationDate, serviceCode, generateCvvs) {
            if (generateCvvs) {
                var generateParams = [];
                let cvvs = {};

                if (generateCvvs.cvv1 && generateCvvs.cvv1 === true) {
                    generateParams.push({
                        type: 'cvv1',
                        cvk: cvk,
                        account: account(cardNumber),
                        expirationDate: expirationDate,
                        serviceCode: serviceCode
                    });
                }
                if (generateCvvs.cvv2 && generateCvvs.cvv2 === true) {
                    generateParams.push({
                        type: 'cvv2',
                        cvk: cvk,
                        account: account(cardNumber),
                        expirationDate: expirationDate,
                        serviceCode: '000'
                    });
                }
                if (generateCvvs.icvv && generateCvvs.icvv === true) {
                    generateParams.push({
                        type: 'icvv',
                        cvk: cvk,
                        account: account(cardNumber),
                        expirationDate: expirationDate,
                        serviceCode: '999'
                    });
                }
                if (generateCvvs.cavv && generateCvvs.cavv === true) {
                    // service code for that ?!?
                }

                return generateParams.reduce((acc, current) => {
                        return acc.then(() => {
                                return this.bus.importMethod('payshield.generateCvv')(current);
                            })
                            .then((partial) => (cvvs[current.type] = partial.cvv));
                    }, Promise.resolve())
                    .then(() => (generateRandomString(20) + JSON.stringify(cvvs)));
            } else {
                // TODO: if no cvvs should be generated, return this or null ???
                return (generateRandomString(20) + '{}');
            }
        },
        pinOffset: function ({
            keyType,
            tpk,
            pvk,
            pinBlock,
            card,
            decimalisationTable
        }) {
            return this.bus.importMethod('payshield.generateOffsetIbm')({
                keyType: getKeyType(keyType),
                keyA32: tpk,
                pvk: pvk,
                pvkLength: pvk.length,
                pinBlock: pinBlock,
                pinBlockFormat: '01',
                maximumPinLength: '12',
                checkLength: '4',
                account: account(card),
                decimalisationTable: decimalisationTable,
                pinValidationData: pinData(card)
            }).then((response) => {
                // debugger;
                return {
                offset: response.offset
            }})
            .then((offset) => {
               // debugger;
               return offset;
            })
            .catch((e) => {
                // debugger;
                return offset;
            });
        },
        generateKeyCheckValue: function ({
            keyTypeCode,
            keyLengthFlag,
            keyA32,
            kcvType
        }) {
            return this.bus.importMethod('payshield.generateKeyCheckValue')({
                keyTypeCode: keyTypeCode,
                keyLengthFlag: keyLengthFlag,
                keyA32: keyA32,
                kcvType: kcvType
            }).then((response) => {
                return {
                    kcv: String.fromCharCode.apply(null, response.keyCheckValue.data)
                };
            });
        },
        generateArqc4: function ({
            modeFlag,
            schemeId,
            mkac,
            ivac,
            panLength,
            panSeqNo,
            delimiter1,
            branchHeightParams,
            atc,
            transactionDataLengthDec,
            transactionDataLengthHex,
            transactionData,
            delimiter2,
            arqc,
            arc,
            csu,
            padLength,
            pad
        }) {
            modeFlag = parseInt(modeFlag);
            schemeId = parseInt(schemeId);

            //BH** test...
            /*modeFlag = 4;
            csu = '03920000';
            pad = '';*/

            let ivacLength = [0, 1].includes(schemeId) ? 16 : 0;
            let panLengthLength = [1, 3].includes(schemeId) ? 2 : 0;
            let panSeqNoLength = [0, 2].includes(schemeId) ? 8 : panSeqNo.length / 2;
            // preformat panSeqNo to desired length
            if (panSeqNo.length < (panSeqNoLength * 2)) {
                panSeqNo = padString(panSeqNo, 'l', '0', panSeqNoLength * 2);
            } else if (panSeqNo.length > (panSeqNoLength * 2)) {
                panSeqNo = panSeqNo.slice(-(panSeqNoLength * 2));
            }
            let delimiter1Length = [1, 3].includes(schemeId) ? 1 : 0;
            let branchHeightParamsLength = [0, 1].includes(schemeId) ? 1 : 0;
            let transactionDataLengthLength = [0, 1, 3, 5].includes(modeFlag) ? 2 : 0;
            // preformat transactionData to desired length
            if (transactionData.length % 16 !== 0) {
                let targetLength = Math.ceil(transactionData.length / 16) * 16;
                transactionData = padString(transactionData, 'x', '0', targetLength).toUpperCase();
            }
            let delimiter2Length = [0, 1, 3, 5].includes(modeFlag) ? 1 : 0;
            let arcLength = [1, 2].includes(modeFlag) ? 2 : 0;
            let csuLength = [3, 4, 5, 6].includes(modeFlag) ? 4 : 0;
            // preformat csu to desired length
            if ([5, 6].includes(modeFlag)) {
                csu = padString(csu, 'r', '0', 8);
            }
            let padLengthLength = [3, 4].includes(modeFlag) ? 1 : 0;
            arqc = arqc.toUpperCase();

            return this.bus.importMethod('payshield.generateArqc4')({
                modeFlag,
                schemeId,
                mkac,
                ivacLength,
                ivac: ivacLength === 0 ? '' : ivac,
                panLengthLength,
                panLength: panLengthLength === 0 ? '' : checkLength(panLength),
                panSeqNoLength,
                panSeqNo,
                delimiter1Length,
                delimiter1: delimiter1Length === 0 ? '' : ';',
                branchHeightParamsLength,
                branchHeightParams: branchHeightParamsLength === 0 ? '' : branchHeightParams,
                atc,
                transactionDataLengthLength: transactionDataLengthLength,
                transactionDataLengthDec: transactionDataLengthLength === 0 ? '' : transactionData.length / 2,
                transactionDataLengthHex: transactionDataLengthLength === 0 ? '' : (transactionData.length / 2).toString(16),
                transactionData: transactionDataLengthLength === 0 ? '' : transactionData,
                delimiter2Length: delimiter2Length,
                delimiter2: delimiter2Length === 0 ? '' : ';',
                arqc,
                arcLength: arcLength,
                arc: arcLength === 0 ? '' : arc,
                csuLength: csuLength,
                csu: csuLength === 0 ? '' : csu,
                padLengthLength: padLengthLength,
                padLength: padLengthLength === 0 ? '' : pad.length,
                pad: padLengthLength === 0 ? '' : pad
            }).then(response => {
                return ({
                    arpc: response.arpc && response.arpc.data && response.arpc.data.length && Buffer.from(response.arpc.data).toString('hex').toUpperCase()
                })
            });
        },
        generateArqc3: function ({
            modeFlag,
            schemeId,
            mkac,
            panSeqNo,
            atc,
            unpredictableNumber,
            transactionData,
            delimiter,
            arqc,
            arc
        }) {
            modeFlag = parseInt(modeFlag);
            schemeId = parseInt(schemeId);
            let transactionDataLengthLength = [0, 1, 3, 4].includes(modeFlag) ? 2 : 0;
            // preformat transactionData to desired length
            if (transactionData.length % 16 !== 0) {
                let targetLength = Math.ceil(transactionData.length / 16) * 16;
                transactionData = padString(transactionData, 'r', '0', targetLength);
            }
            // preformat panSeqNo to desired length
            if (panSeqNo.length < (16)) {
                panSeqNo = padString(panSeqNo, 'l', '0', 16);
            } else if (panSeqNo.length > (16)) {
                panSeqNo = panSeqNo.slice(-16);
            }
            let delimiterLength = [0, 1, 3, 5].includes(modeFlag) ? 1 : 0;
            let arcLength = [1, 2].includes(modeFlag) ? 2 : 0;

            return this.bus.importMethod('payshield.generateArqc3')({
                modeFlag: modeFlag,
                schemeId: schemeId,
                mkac: mkac,
                panSeqNo: panSeqNo,
                atc: atc,
                unpredictableNumber: unpredictableNumber,
                transactionDataLengthLength: transactionDataLengthLength,
                transactionDataLengthDec: transactionDataLengthLength === 0 ? '' : transactionData.length / 2,
                transactionDataLengthHex: transactionDataLengthLength === 0 ? '' : (transactionData.length / 2).toString(16),
                transactionData: transactionDataLengthLength === 0 ? '' : transactionData,
                delimiterLength: delimiterLength,
                delimiter: delimiterLength === 0 ? '' : ';',
                arqc: arqc,
                arcLength: arcLength,
                arc: arcLength === 0 ? '' : arc
            }).then(response => {
                var resp = (
                    (response.arpc && response.arpc.data && response.arpc.data.length && response.arpc.data) ||
                    (response.arpc && response.arpc && response.arpc.length && response.arpc) ||
                    ''
                );
                return {
                    arpc: Buffer.from(resp).toString('hex').toUpperCase()
                };
            });
        },
        translateBdkZmkLmk: function ({
            zmk,
            bdk
        }) {
            return this.bus.importMethod('payshield.translateBdkZmkLmk')({
                    zmk,
                    bdk
                })
                .then((result) => {
                    return result;
                });
        },
        translateBdkLmkZmk: function ({
            zmk,
            bdk
        }) {
            return this.bus.importMethod('payshield.translateBdkLmkZmk')({
                    zmk,
                    bdk
                })
                .then((result) => {
                    return result;
                });
        },
        importKey: function ({
            keyType,
            zmk,
            keyA32,
            keyScheme
        }) {
            return this.bus.importMethod('payshield.importKey')({
                    keyType: getKeyType(keyType),
                    zmk,
                    keyA32,
                    keyScheme
                })
                .then((result) => {
                    return result;
                });
        },
        exportKey: function ({
            keyType,
            zmk,
            keyA32,
            keyScheme
        }) {
            return this.bus.importMethod('payshield.exportKey')({
                    keyType,
                    zmk,
                    keyA32,
                    keyScheme
                })
                .then((result) => {
                    return result;
                });
        },
        encryptDataBlockECB: function ({
            keyType,
            dek,
            message
        }) {
            let messageLen = message.length;
            let messageLenHex = ('000' + messageLen.toString(16)).slice(-4);
            return this.bus.importMethod('payshield.encryptDataBlockECB')({
                keyType,
                dek,
                messageLen,
                messageLenHex,
                message
            });
        },
        encryptDataBlock: function ({
            modeFlag,
            inputFormatFlag = '1',
            outputFormatFlag = '1',
            keyType,
            key,
            ksnDescriptor = '',
            ksn = '',
            iv = '',
            messageData
        }) {
            let messageDataLength = messageData.length;
            let messageDataLengthHex = ('000' + messageDataLength.toString(16)).slice(-4);
            let ksnDescriptorLength = ksnDescriptor.length;
            let ksnLength = ksn.length;
            let ivLength = iv.length;
            const ivLengthByKey = 16;
            return this.bus.importMethod('payshield.encryptDataBlock')({
                    modeFlag,
                    inputFormatFlag,
                    outputFormatFlag,
                    keyType: getKeyType(keyType),
                    key,
                    ksnDescriptorLength,
                    ksnDescriptor,
                    ksnLength,
                    ksn,
                    ivLength,
                    iv,
                    messageDataLengthHex,
                    messageDataLength,
                    messageData
                })
                .then(({
                    rest
                }) => {
                    let returnResponse = {};
                    const restString = Buffer.from(rest, 'hex')
                    if (['01', '02', '03'].includes(modeFlag)) {
                        returnResponse = Object.assign(returnResponse, {
                            iv: restString.slice(0, ivLengthByKey),
                            messageLength: parseInt(restString.slice(
                                ivLengthByKey,
                                ivLengthByKey + 4
                            ), 16),
                            encrypted: restString.slice(ivLengthByKey + 4)
                        });
                    } else {
                        returnResponse = Object.assign(returnResponse, {
                            messageLength: parseInt(restString.slice(0, 4), 16),
                            encrypted: restString.slice(4)
                        });
                    }
                    return returnResponse;
                });
        },
        generateIPEK: function ({
            keyScheme = 'U',
            dukptMasterKey,
            ksn,
            zmkTmkFlag,
            keyZmkTmk,
            keyScheme1 = 'X'
        }) {
            let mode = 'B';
            let keyType = '302';
            let deriveKeyMode = '0'; // BDK Derivation
            // Three types of bidirectional keys may be derived from a BDK-1:
            // PIN encryption keys
            // Data authentication (MAC) keys
            // Data encryption keys
            let dukptMasterKeyType = 1; // BDK-1

            return this.config['hsm.generateKey']({
                    mode: mode,
                    keyType: getKeyType(keyType),
                    keyScheme: keyScheme,
                    deriveKeyMode: deriveKeyMode,
                    dukptMasterKeyType: dukptMasterKeyType,
                    dukptMasterKey: dukptMasterKey,
                    ksn: ksn,
                    keyZmkTmkFlag: zmkTmkFlag,
                    keyZmkTmk: keyZmkTmk,
                    keyScheme1: keyScheme1
                })
                .then((response) => {
                    let returnResponse = {};
                    let rest = String.fromCharCode.apply(null, response.rest.data);
                    returnResponse.keyA32 = response.keyA32;
                    returnResponse.keyCheckValue = rest.slice(-6);
                    if (['1', 'B'].includes(mode)) {
                        returnResponse.keyZmk = rest.slice(0, 33);
                    };
                    return returnResponse;
                });
        },
        generateIPEKTr31: function ({
            keyScheme,
            dukptMasterKey,
            ksn,
            zmkTmkFlag,
            keyZmkTmk
        }) {
            let mode = 'B';
            let keyType = '302';
            let deriveKeyMode = '0'; // BDK Derivation
            // Three types of bidirectional keys may be derived from a BDK-1:
            // PIN encryption keys
            // Data authentication (MAC) keys
            // Data encryption keys
            let dukptMasterKeyType = 1; // BDK-1
            let keyScheme1 = 'R';

            // Deliminator:&
            // Key Usage: B1 Ipek
            // Mode of use: X derivation
            // Key version num: 00
            // Exportability: S //Thales support S and N fro TR31
            // Number Of optional block: 01 //IPEK need ksn.
            // Optional block identifier: KS // Thlaes hsm static value for KSN
            // KSN value for ipek 15 + 5 counter
            // Deliminator:!
            // Key block version : B  Key block protected using the Key Derivation Binding Method
            let tr31BlockData = '&B1X00S01KS18' + ksn.slice(0, 15) + '00000!B';

            return this.config['hsm.generateKey']({
                    mode: mode,
                    keyType: getKeyType(keyType),
                    keyScheme: keyScheme,
                    deriveKeyMode: deriveKeyMode,
                    dukptMasterKeyType: dukptMasterKeyType,
                    dukptMasterKey: dukptMasterKey,
                    ksn: ksn,
                    keyZmkTmkFlag: zmkTmkFlag,
                    keyZmkTmk: keyZmkTmk,
                    keyScheme1: keyScheme1,
                    tr31BlockData: tr31BlockData
                })
                .then((response) => {
                    let returnResponse = {};
                    let rest = String.fromCharCode.apply(null, response.rest);
                    returnResponse.keyA32 = response.keyA32;
                    returnResponse.keyCheckValue = rest.slice(-6);
                    if (['1', 'B'].includes(mode)) {
                        returnResponse.tr31Block = rest.slice(1, -6);
                    };
                    return returnResponse;
                });
        },
        verifyOffsetIbmDukpt: function ({
            mode = '0',
            bdk,
            pvk,
            ksnDescriptor,
            ksn,
            pinBlock,
            card,
            decimalisationTable,
            pinLength = '06',
            offset
        }) {
            return this.bus.importMethod('payshield.verifyOffsetIbmDukpt')({
                mode: mode,
                bdk: bdk,
                pvk: pvk,
                ksnDescriptor: ksnDescriptor,
                ksn: ksn,
                pvkLength: pvk.length,
                pinBlock: pinBlock,
                pinBlockFormat: '01',
                checkLength: padNumber(pinLength),
                account: account(card),
                decimalisationTable: decimalisationTable,
                pinValidationData: pinData(card),
                offset: offset
            });
        },
        verifyOffsetIbm: function ({
            tpk,
            pvk,
            maxPinLen = '12',
            pinBlock,
            card,
            decimalisationTable,
            pinLength = '06',
            offset
        }) {
            return this.bus.importMethod('payshield.verifyOffsetIbm')({
                tpk: tpk,
                pvk: pvk,
                maxPinLen: maxPinLen,
                pvkLength: pvk.length,
                pinBlock: pinBlock,
                pinBlockFormat: '01',
                checkLength: padNumber(pinLength),
                account: account(card),
                decimalisationTable: decimalisationTable,
                pinValidationData: pinData(card),
                offset: offset
            });
        }
    })
};