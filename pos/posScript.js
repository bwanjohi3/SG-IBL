'use strict';
const {currency, errors} = require('ut-transfer')().modules;
const processing = require('./transferType');
const receipt = require('./receipt');
let errorMap;

function getDateTime() {
    let date = new Date();
    let month = date.getUTCMonth() + 1;
    let day = date.getUTCDate();
    let hour = date.getUTCHours();
    let minute = date.getUTCMinutes();
    let second = date.getUTCSeconds();
    let result = `${('00' + month).slice(-2)}${('00' + day).slice(-2)}${('00' + hour).slice(-2)}${('00' + minute).slice(-2)}${('00' + second).slice(-2)}`;
    return result;
}

function getBalance(field, balanceType) {
    if (!field) {
        return;
    }
    var balance = field.match(/.{20}/g).find(value => value.substr(2, 2) === balanceType);
    if (balance) {
        var sign = 0;
        switch (balance.substr(7, 1)) {
            case 'c':
            case 'C':
                sign = 1;
                break;
            case 'd':
            case 'D':
                sign = -1;
        }
        return currency.cents(balance.substr(4, 3), balance.substr(8, 12), sign);
    }
}

function getISOBalance(balance, processingCode = '000000') {
    if (!balance) {
        return;
    }
    const encode = (balance, amountType) => {
        const accountType = processingCode.substr(2, 2);
        const currencyCode = currency.numeric(balance.currency);
        const sign = {'30': 'C'}[accountType] || 'D';
        const amount = `000000000000${Math.abs(balance.cents) || ''}`.slice(-12);
        return `${accountType}${amountType}${currencyCode}${sign}${amount}`;
    };
    const ledgerType = '01';
    const availableType = '02';
    const ledger = encode(balance.ledger, ledgerType);
    const available = encode(balance.available, availableType);
    return `${ledger}${available}`;
}

function getErrorCode(error) {
    if (!error) {
        return '00';
    }
    if (error.type === 'transfer.transferAlreadyReversed') {
        return '00';
    }
    if (error.type === 'portSQL') {
        return (errorMap && errorMap.toISO(error.message)) || '96';
    }
    return (errorMap && errorMap.toISO(error.type)) || '96';
}

function trim(s) {
    return (typeof s === 'string') ? s.trim() : s;
}

function type(s) {
    return (s === '00') ? undefined : s;
}

function issuerDetails(iso) {
    return {
        balance: {
            ledger: getBalance(iso[54], '01'),
            available: getBalance(iso[54], '02')
        },
        transferIdIssuer: iso[38],
        acquirerFee: Number(iso[28].substr(1) || 0) / 100,
        issuerEmv: iso.issuerEmv,
        settlementDate: iso[15] === '0000' ? undefined : iso[15],
        retrievalReferenceNumber: iso[37],
        udfIssuer: {
            localDateTime: iso[7],
            localDate: iso[12],
            localTime: iso[13],
            forwardingInstitutionCode: iso[33],
            rrn: iso[37],
            responseCode: iso[39],
            cardVerificationCode: iso[44],
            ibftDescription: iso[48],
            balance: iso[54],
            receivingInstitution: iso[100],
            fromAccount: iso[102]
        }
    };
}

function getPosEntryMode(params, channelType = 'atm') {
    let posEntryMode;
    if (params.isEmvCard) {
        posEntryMode = '05';
        if (params.isFallback) {
            posEntryMode = '80';
        }
    } else {
        posEntryMode = '90';
    }

    if (channelType.toLowerCase() === 'atm') {
        posEntryMode = `${posEntryMode}1`;
    } else {
        // 5 for manual signature...
        // posEntryMode = `${posEntryMode}5`;
    }

    return posEntryMode;
}

function getCardVerifyResult(udfAcquirer) {
    let _1_44 = ' ';
    let _2_44 = ' ';
    if (udfAcquirer.availableCvvList.length > 0) {
        _1_44 = (!udfAcquirer.cvvVerifyFail ? '2' : '1');
    }
    if (udfAcquirer.arqcFail !== undefined) {
        _2_44 = (!udfAcquirer.arqcFail ? '2' : '1');
    }
    return `${_1_44}${_2_44}`;
}

function replyISO(transfer) {
    const udfAcquirer = transfer.udfAcquirer || {};
    const iso = transfer || '{}';
    const reversal = udfAcquirer.mti === 430;
    const transferType =  processing.types[iso[3].slice(0, 2)];
    if (transfer.originatorInfo && transfer.originatorInfo.udfAcquirer) {
        Object.assign(iso, JSON.parse(transfer.originatorInfo.udfAcquirer.iso || '{}'));
    }
    const result = {
        mtid: `0${udfAcquirer.mti}`,
        /* 2 */pan: transfer.pan,
        emvCryptogramVerifyData: transfer.emvCryptogramVerifyData,
        3: iso[3],
        4: iso[4],
        5: iso[5],
        7: getDateTime(),
        11: iso[11],
        12: iso[12],
        13: iso[13],
        14: iso[14],
        15: iso[15],
        18: iso[18],
        19: iso[19],
        22: iso[22],
        23: iso[23],
        24: iso[24],
        25: iso[25],
        28: iso[28],
        32: iso[32],
        33: iso[33],
        37: iso[37],
        39: getErrorCode(transfer.error),
        41: iso[41],
        42: iso[42],
        43: iso[43],
        47: (!reversal && !transfer.error && receipt[transferType] && receipt[transferType]({}, transfer)) || " ",
        48: iso[48],
        49: iso[49],
        50: iso[50],
        55: iso[55],//'910A' + transfer.arpc + '3030',
       // 54: getISOBalance(transfer.balance, iso[3]),
        84: iso[84],
        100: iso[100],
        103: iso[103]
    };

    if (transfer.error)
    {
        this.log.error && this.log.error(transfer.error);
        if (transfer.error.type === 'transfer.transferAlreadyReversed') {
            result[39] = '00';
        } else  {
            result[39] = (transfer.error.cause && transfer.error.cause.iso39 && transfer.error.cause.iso39.slice(-2)) || '96';
        }
        switch (transfer.error.print) {
            case 'transfer.insufficientFunds':
                result[39] = '16';
                result[62] = 'Insufficient funds';
                break;
            case 'card.invalidTrack2':
            case 'card.invalidNumber':
            case 'card.unknown':
                result[39] = '14'
                break;
            case 'card.incorrectPin':
            case 'card.invalidPinData':
                result[39] = '55';
                break;
            case 'card.hot':
            case 'card.notActivated':
            case 'card.inactive':
            case 'card.invalidStatus':
                result[39] = '62';
                break;
            case 'card.expired':
                result[39] = '54';
                break;
            case 'card.retryLimitExceeded':
            case 'card.retryDailyLimitExceeded':
                result[39] = '75';
                break;
            default:
                result[62] = (transfer.error.cause && transfer.error.cause.print) || transfer.error.print;
        }
    }

    switch (Number(udfAcquirer.mti)) {
        case 210:
        case 110:
            result[38] = transfer.transferId;
            //result[44] = getCardVerifyResult(udfAcquirer);
            //result.emvCryptogramVerifyData = udfAcquirer.emvCryptogramVerifyData; // 55 bh** test
            result[61] = iso[61];
            result[102] = result[39] === '00' ? transfer.sourceAccount : undefined;
            break;
        case 430:
            result[38] = iso[38];
            result[90] = iso[90];
            result[95] = iso[95];
            break;
    }
    return result;
}

function requestISO(transfer) {
    const udfAcquirer = transfer.udfAcquirer || {};
    const acquirerFee = 0; // Added by BancNet
    const convenienceFee = (Number(transfer.transferFee) || 0) * 100;
    const emv = udfAcquirer.emvData || {};
    const amount = emv.amountAuthorised || transfer.transferAmount || 0;
    const networkId = '0000000058';
    const request = {
        mtid: `0${udfAcquirer.mti}`,
        /* 2 */pan: udfAcquirer.pan,

        4: `000000000000${Number(amount) + acquirerFee + convenienceFee}`.slice(-12),
        5: `000000000000${amount}`.slice(-12),
        7: getDateTime(),
        11: undefined, // set in next statement
        12: transfer.localDateTime.slice(-6),
        13: transfer.localDateTime.slice(-10).substring(0, 4),
        14: emv.applicationExpirationDate ? emv.applicationExpirationDate.substr(0, 4) : undefined, // 5F24
        15: '0000',
        18: udfAcquirer.merchantType || '6011', // ATM trx
        // 19: '608',
        22: getPosEntryMode(udfAcquirer, transfer.channelType), // pos entry mode
        23: `000${emv.panSeqNum || ''}`.slice(-3), // 5F24
        24: '000', // NII (Supply value of zeroes if not concerning international transactions.)
        25: '02', // ATM only
        32: networkId,
        /* 35 */track2EquivalentData: udfAcquirer.track2EquivalentData,
        /* 35 */track2: udfAcquirer.track2,
        37: '000000000000',
        41: udfAcquirer.terminalId,
        43: `${udfAcquirer.terminalName}${' '.repeat(25)}`.substr(0, 25) + `${udfAcquirer.city || ''}${' '.repeat(13)}`.substr(0, 13) + 'PH',
        // 47: '****', // BP
        // 48: ' '.repeat(30) + ' '.repeat(40) + ' '.repeat(20) , // BP
        49: currency.numeric(transfer.transferCurrency),
        50: currency.numeric(transfer.transferCurrency),

        cipher: udfAcquirer.cipher,
        tpk: transfer.tpk
    };
    switch (Number(udfAcquirer.mti)) {
        case 200:
        case 100:
            request.emvCryptogramVerifyData = udfAcquirer.emvCryptogramVerifyData;
            request.pinBlock = transfer.pinBlock;
            request.emvTags = udfAcquirer.emvTags;
            request[3] = processing.codes[transfer.transferType] + udfAcquirer.processingCode.substring(2);
            request[11] = `000000${transfer.issuerSerialNumber || ''}`.slice(-6);
            request[28] = 'D' + `00000000${acquirerFee}`.slice(-8);
            request[54] = transfer.balance && getISOBalance(transfer.balance.ledger, transfer.balance.available);
            request[61] = '25002000000';
            request[84] = 'D' + `00000000${convenienceFee}`.slice(-8);
            break;
        case 420:
            request[3] = processing.codes[transfer.itemCode] + udfAcquirer.processingCode.substring(2);
            request[11] = `000000${transfer.issuerSerialNumber}`.slice(-6);
            request[28] = 'C' + `00000000${acquirerFee}`.slice(-8);
            request[39] = reversalReasonCode(transfer);
            request[84] = 'C' + `00000000${convenienceFee}`.slice(-8);
            request[90] = `0200${request[11]}${request[13]}${request[12]}${request[32]}${'0'.repeat(42)}`.substr(0, 42);
            request[95] = '0'.repeat(42);
            break;
    }
    return request;
}

function reversalReasonCode(transfer) {
    if (transfer.issuerError && transfer.issuerError.responseCode) {
        return transfer.issuerError.responseCode;
    }
    if (transfer.acquirerErrorType) {
        return (errorMap && errorMap.toISO(transfer.acquirerErrorType)) || 96;
    }
    return '96';
}

module.exports = {
    id: 'posScriptTransfer',
    createPort: require('ut-port-script'),
    logLevel: 'trace',
    namespace: ['pos/posScript'],
    start: function() {
        //errorMap = require('./errorMap')(this.defineError);
    },
    'posScript.200.fromISO': function(msg, $meta) {
        if (!msg || msg instanceof Error) {
            let error;
            let responseCode;
            if (!msg || !msg.type || !msg.type.startsWith || !msg.type.startsWith('iso8583')) {
                responseCode = '96';
            } else {
                responseCode = msg.type.split('.')[1];
            }
            error = ((errorMap && errorMap.fromISO(responseCode)) || errors.genericDecline)();
            error.transferDetails = issuerDetails(msg.details || {});
            error.responseCode = responseCode;
            throw error;
        }
        if (msg.mtid === '0210') {
            return issuerDetails(msg);
        }
        var transferType  =  {'0200': processing.types[msg[3].substring(0, 2)], '0420': processing.types[msg[3].substring(0, 2)]}[msg.mtid];// For 0100 only processing.types[msg[3].substring(0, 2)];

        return {
            pan: msg.pan,
            amount: {transfer: currency.cents(msg[49], msg[5], 1)},
            transferType:transferType, //On reversal is changed in push.reversal.
            settlementDate: msg[15] === '0000' ? msg.session.settlementDate : msg[15],
            localDateTime: `${new Date().getFullYear()}${trim(msg[13])}${trim(msg[12])}`,
            acquirerCode: trim(msg[32]),
            transferIdAcquirer: trim(msg[11]),
            currency: currency.alphabetic(trim(msg[49])),
            pinBlock: trim(msg[52]) || msg.pinBlock,
            channelAccount: msg.session.tillAccount,
            sourceAccountType: type(msg[3] && msg[3].substr(2, 2)),
            sourceAccount: trim(msg[102]) || '00121840034510102',
            destinationType: msg.flow.startsWith('external') ? 'partnerId' : 'accountNumber',
            destinationTypeId: msg.flow.startsWith('external') ? msg.issuerId : undefined,
            destinationAccountType: type(msg[3] && msg[3].substr(4, 2)),
            destinationAccount: trim(msg[103]),
            retrievalReferenceNumber: msg[37],
            expireSeconds: 55,
            channelId: msg.channelId,
            channelType: msg.channelType,
            cardId: msg.cardId,
            pinOffset: msg.pinOffset,
            credentialId: msg.cardMasked,
            transferId: msg.mtid === '0420' ? undefined : msg[11] ,
            transferCurrency: currency.alphabetic(msg[49]),
           // acquirerFee: msg[28].substr(1) / 100,
           // transferFee: msg[84].substr(1) / 100,
            description: `pos ${processing.types[msg[3].substring(0, 2)]}`,
            sourceCardProductId: msg.session.sourceCardProductId,
            udfAcquirer: {
                institutionCode: msg.session.institutionCode,
                location:  msg.session.location,
                countryName: msg.session.countryName,
                organizationName: msg.session.organizationName,    
                merchantName: msg.session.merchantName,
                mti: msg.mtid.substr(1, 3),
                pan: msg.pan,
                track2EquivalentData: msg.track2EquivalentData,
                track2: msg.track2,
                cipher: msg.cipher,
                dateTimeGMT: msg[7],
                stan: msg[11],
                emvData: msg.emvData,
                emvTagsRaw: msg.emvTagsRaw,
                emvTags: msg.emvTags,
                processingCode: trim(msg[3]),
                originalTransferType: transferType,
                merchantType: trim(msg[18]),
                acquirerCode: msg[32],
                terminalId: trim(msg[41]),
                merchantId: trim(msg[42]),
                identificationCode: trim(msg[42]),
                terminalName: (msg[43] && trim(msg[43])) || msg.session.terminalName || ' ',
                isEmvCard: msg.isEmvCard,
                arqcFail: msg.arqcFail,
                cvvVerifyFail: msg.cvvVerifyFail,
                availableCvvList: msg.availableCvvList,
                isFallBack: msg.isFallBack,
                emvCryptogramVerifyData: msg.emvCryptogramVerifyData,
                bpsInstitutionCode: trim(msg[47]),
                iso: JSON.stringify(Object.assign({}, msg, {session: undefined, emvTags: undefined})),
                cashBackAmount: msg[54] && ((parseFloat(msg[54]) / 100).toFixed(2).toString() +' '+ currency.alphabetic(msg[49])),
                flow: msg.flow
            }
        };
    },
    'posScript.200.toISO': function(msg, $meta) {
        try {
            switch (Number(msg.udfAcquirer.mti)) {
                case 100:
                case 200:
                case 420:
                    return requestISO(msg);
                case 110:
                case 210:
                case 430:
                    return replyISO(msg);
            }
        } catch (e) {
            // debugger;
            throw e;
        }
        
    },
    'posScript.getAccounts.fromISO': function({cardId}) {
        return {cardId};
    },
    'posScript.getAccounts.toISO'(msg, $meta) {
        msg[39] = '00';
        msg[62] = msg.session.accounts.map(account => `${account.accountName}-${account.accountNumber}`).join('\n');
        delete msg[55];
        return msg;
    },
    'posScript.getTransactionReport.toISO'(msg, $meta) {
        msg.session.report = msg.session.report || {};
        let receiptData = msg.session.report.receiptData = msg.session.report.receiptData || receipt.tranReport({}, msg);
        msg.session.report.sentCount = msg.session.report.sentCount ? msg.session.report.sentCount : 0;
        let isContinue = receiptData.length  > (msg.session.report.sentCount + 1) * 900 ? 1 : 0;
        msg[39] = '00';
        msg[47] = receiptData.substr(msg.session.report.sentCount * 900, 900);
        msg[63] = `{"isContinue": ${isContinue} , receiptDataLen: ${receiptData.length}}`;
        msg.session.report.sentCount++;
        delete msg[62];
        return msg;
    }
};
