// const transferError = require('ut-transfer/errors');
// const transferCurrencyScale = require('ut-transfer/currency').scale;
// const getAmount = require('ut-transfer/currency').amount;
// const parseXmlString = require('xml2js').parseString;
// const stripPrefix = require('xml2js').processors.stripPrefix;
// var bcd = require('bcd');
const crypto = require('crypto');
const {currency, errors} = require('ut-transfer')().modules;
const processing = require('../transferTypes');
const respCodeSgToNi = require('../mappings').respCodeSgToNi;

let sequence = 0;
let tracer = [];
let bus;
let tciMsg = {};

function trim(s) {
    return (typeof s === 'string') ? s.trim() : s;
}

function type(s) {
    return (s === '00') ? undefined : s;
}

function encrypt(key, value, clearFormat, cipherName) {
    var cipher = crypto.createCipher(cipherName || 'aes128', key);
    return cipher.update(value, clearFormat || 'hex', 'hex') + cipher.final('hex');
}

function decrypt(key, value, clearFormat, cipherName) {
    var decipher = crypto.createDecipher(cipherName || 'aes128', key);
    return decipher.update(value, 'hex', clearFormat || 'hex').toUpperCase() + decipher.final(clearFormat || 'hex').toUpperCase();
}

function getCardMasked(card) {
    return [
        card.slice(0, 6),
        '****',
        card.slice(-4)
    ].join('');
}

function isoMsgToTrasfer(msg, $meta) {
    // if (!msg || msg instanceof Error) {
    //     let error;
    //     let responseCode;
    //     if (!msg || !msg.type || !msg.type.startsWith || !msg.type.startsWith('iso8583')) {
    //         responseCode = '96';
    //     } else {
    //         responseCode = msg.type.split('.')[1];
    //     }
    //     error = ((errorMap && errorMap.fromISO(responseCode)) || errors.genericDecline)();
    //     error.transferDetails = issuerDetails(msg.details || {});
    //     error.responseCode = responseCode;
    //     throw error;
    // }

    // if (msg.mtid === '0210') {   // This should not be possible Vasko 
    //     return issuerDetails(msg);
    // }
    var transferType  =  {
        '0200': processing.types[msg[3].substring(0, 3)],
        '0220': processing.types[msg[3].substring(0, 3)], 
        '0420': processing.types[msg[3].substring(0, 3)]
    }[msg.mtid];


    return {
        pan: encrypt('a password', msg[2], 'hex', 'aes128'), // pan: msg[2],
        amount: {transfer: currency.cents(msg[49], msg[4], 1),
                 acquirerFee: msg[28] && msg[28].substr(1) / 100},
        transferType:transferType, //On reversal is changed in push.reversal.
        // settlementDate: msg[15] === '0000' ? msg.session.settlementDate : msg[15],
        localDateTime: `${new Date().getFullYear()}${trim(msg[13])}${trim(msg[12])}`,
        acquirerCode: trim(msg[32]),
        transferIdAcquirer: trim(msg[11]),
        currency: currency.alphabetic(trim(msg[49])),
        // pinBlock: trim(msg[52]),
        // channelAccount: msg.session.tillAccount,
        sourceAccountType: type(msg[3] && msg[3].substr(3, 2)),
        sourceAccount: trim(msg[102]), // || '00121840034510102',
        destinationType: 'accountNumber',
        destinationTypeId: undefined,
        destinationAccountType: type(msg[3] && msg[3].substr(5, 2)),
        destinationAccount: trim(msg[103]),
        retrievalReferenceNumber: msg[37],
        expireSeconds: 55,
        channelId: '',
        channelType: 'dhi', // is this OK Vasil
        // cardId: msg.cardId,
        // pinOffset: msg.pinOffset,
        // credentialId: getCardMasked(msg[2]), // is this OK Vasil
        transferId: msg.mtid === '0420' ? undefined : msg[11] ,
        transferCurrency: currency.alphabetic(msg[49]),
        acquirerDeviceFee: msg[28] && msg[28].substr(1) && currency.cents(msg[49], msg[28].substr(1), 1),
        // transferFee: msg[84].substr(1) / 100,
        description: `dhi ${processing.types[msg[3].substring(0, 3)]}`,
        udfAcquirer: {
    //         institutionCode: msg.session.institutionCode,
            mti: msg.mtid.substr(1, 3),
            pan: encrypt('a password', msg[2], 'hex', 'aes128'),// msg[2],
            // track2EquivalentData: msg.track2EquivalentData,
            track2: msg[35],
            cipher: 'aes128',
            dateTimeGMT: msg[7],
            stan: msg[11],
            // emvData: msg.emvData,
            // emvTagsRaw: msg.emvTagsRaw,
            processingCode: trim(msg[3]),
            originalTransferType: transferType,
            merchantType: trim(msg[18]),
            acquirerCode: msg[32],
            terminalId: trim(msg[41]),
            // merchantId: trim(msg[42]), // should we have it Vasil
            // identificationCode: trim(msg[42]), // should we have it Vasil
            terminalName: trim(msg[43]), // is this OK Vasil
            isEmvCard: false, // is this OK Vasil
            // arqcFail: msg.arqcFail,
            // cvvVerifyFail: msg.cvvVerifyFail,
            // availableCvvList: msg.availableCvvList,
            // isFallBack: msg.isFallBack,
            // emvCryptogramVerifyData: msg.emvCryptogramVerifyData,
            // bpsInstitutionCode: trim(msg[47]),
            iso: JSON.stringify(Object.assign({}, msg, {session: undefined, emvTags: undefined})),
            cashBackAmount: msg[54] && ((parseFloat(msg[54]) / 100).toFixed(2).toString() +' '+ currency.alphabetic(msg[49]))
        }
    };
}

function trasferToIsoMsg(transfer, $meta) {
    const udfAcquirer = transfer.udfAcquirer || {};
    let orgIso = {};
    let isoMsg = {};
    // const transferType =  processing.types[iso[3].slice(0, 2)];
    if (transfer.udfAcquirer && transfer.udfAcquirer.iso) {
        Object.assign(orgIso, JSON.parse(transfer.udfAcquirer.iso));
    }
    isoMsg.header = orgIso.header;
    if  (orgIso.mtid == '0200') {
        isoMsg.mtid = '0210';
    } else if (orgIso.mtid == '0220') {
        isoMsg.mtid = '0230';
    } else if (orgIso.mtid == '0420') {
        isoMsg.mtid = '0430';
    }

    if(udfAcquirer.mti == '430' || transfer.mti == '430') {
        isoMsg.mtid = '0430';
    }
    // isoMsg.mtid = orgIso.mtid; //'0210';
    isoMsg[2] = udfAcquirer.pan && decrypt('a password', udfAcquirer.pan, 'hex', udfAcquirer.cipher);		// optional			    PAN				
    isoMsg[3] = udfAcquirer.processingCode		// echo M				Processing code
    isoMsg[4] = transfer.amount.transfer.cents || undefined;		// conditional			Transaction amount
    isoMsg[6] = orgIso[6] || undefined;		// echo M				Cardholder billing Amount
    isoMsg[7] = orgIso[7] || undefined;		// echo M				Transmission Greenwich Time
    isoMsg[10]	= orgIso[10] || undefined;	// echo conditional	    Conversion Rate, Cardholder Billing
    isoMsg[11]	= udfAcquirer.stan || orgIso[11] || undefined;	// echo M				System Trace Audit Number
    isoMsg[12]	= orgIso[12] || undefined;	// echo O				Local (Terminal) Transaction Time
    isoMsg[13]	= orgIso[13] || undefined;	// echo O				Local (Terminal) Transaction Date
    isoMsg[18]	= orgIso[18] || undefined;	// echo O				Merchant Category Code
    isoMsg[19]	= orgIso[19] || undefined;	// echo O				Acquiring Institution Country Code
    isoMsg[22]	= orgIso[22] || undefined;	// echo O				POS Entry Mode
    isoMsg[23]	= orgIso[23] || undefined;	// echo D->M			card member number
    isoMsg[25]	= orgIso[25] || undefined;	// conditional			if transaction tipe is not 133 echo P-3.1 = 133 and S-123.BAI = MP
    isoMsg[26]	= orgIso[26] || undefined;	// echo conditional	    Message Reason Code !!! to handle this
    isoMsg[28]	= orgIso[28] || undefined;	// echo O/conditional   Fee Amount
    isoMsg[32]	= udfAcquirer.acquirerCode || orgIso[32] || undefined;	// echo M				Acquiring Institution Identification
    isoMsg[33]	= orgIso[33] || undefined;	// echo conditional	    Forwarding Institution Identification
    isoMsg[35]	= udfAcquirer.track2 || orgIso[35] || undefined;	// echo M				Track 2
    isoMsg[37] 	= transfer.retrievalReferenceNumber || orgIso[37] || undefined;   // echo M				Transaction Retrieval Reference Number !!! handle whetar values are equal
    if (transfer.balance && transfer.balance.authId) {
        isoMsg[38]  = transfer.balance.authId;   // conditional			!!! handle missing authId
    } else {
        isoMsg[38]  = undefined;
    }
    isoMsg[39]	= '00001'; // mandatory			!!! handle mapping TSS to NI 00001 is approval 
    isoMsg[41]	= udfAcquirer.terminalId || orgIso[41] || undefined;	// echo O				Card Acceptor Terminal ID
    isoMsg[43] 	= orgIso[43] || undefined;     // echo O				Card Acceptor Terminal Name/Location !!! get it from udfAcquirer.terminalName 
    isoMsg[44]	= orgIso[44] || undefined;	// desirable
    isoMsg[45]	= orgIso[45] || undefined;	// desirable echo
    isoMsg[49] 	= orgIso[49] || undefined;    // conditional echo !!! get it from transfer.amount 
    isoMsg[51]	= orgIso[51] || undefined;	// conditional echo !!! get it from transfer.amount 
    isoMsg[52]	= orgIso[52] || undefined;	// echo O
    isoMsg[54]	= orgIso[54] || undefined;    // echo O !!! adjustment amount
    isoMsg[55]  = orgIso[55] || undefined;    // conditional
    isoMsg[61]	= orgIso[61] || undefined;	// conditional / optional echo
    isoMsg[62]	= orgIso[62] || undefined;	// conditional / desirable
    // isoMsg[63]	// echo O // not send through DHI
    // isoMsg[64]	// conditional // not used yed
    // isoMsg[100]	    // desirable only for 0430 mti
    isoMsg[102]  = transfer.sourceAccount || orgIso[102] || undefined;   // echo D
    isoMsg[103]	 = transfer.destinationAccount || orgIso[103] || undefined;   // echo D
    isoMsg[104]	 = orgIso[104] || undefined;   // echo O
    if (transfer.balance && transfer.balance.available && transfer.balance.available.amount && transfer.balance.ledger && transfer.balance.ledger.amount) {
        let available = (parseFloat(transfer.balance.available.amount) * 100).toString().split('.')[0];
        let ledger = (parseFloat(transfer.balance.ledger.amount) * 100).toString().split('.')[0];
        isoMsg[105]  = available.padStart(12, '0') + ledger.padStart(12, '0') + '1';
    } else {
        isoMsg[105]  = undefined;
    }
    // isoMsg[105] = undefined;	// conditional !!! Account balance data
    isoMsg[106]	= orgIso[106] || undefined;   // desirable
    // isoMsg[108] = undefined; 	// conditional
    // isoMsg[109] = undefined;	// conditional
    isoMsg[110] = orgIso[110] || undefined;	// conditional
    isoMsg[111]	= orgIso[111] || undefined;    // echo O
    if (transfer.ministatement && transfer.ministatement.statement.rawStatement) {
        let rows = transfer.ministatement.statement.rawStatement.split('~');
        let statementData = '';
        for (let i = rows.length; i > 0; i--) {
            statementData += `${rows[i]}~`;
            if (statementData.length >= 250 - rows[rows.length - i + 1].length) {
                break;
            }
        }
        isoMsg[114] = statementData;	// conditional !!! ministatement lines to be printed
    }
    
    // isoMsg[115] = undefined;	// conditional statement data
    // isoMsg[116] = undefined	// conditional billing data
    isoMsg[121]	= orgIso[121] || undefined;    // echo O
    isoMsg[123] = orgIso[123] || undefined;	// conditional
    // isoMsg[124] = undefined; 	// conditional !!! complex field with a lot of data
    isoMsg[126]	= orgIso[126] || undefined;    // echo O
    // isoMsg[127] = undefined; 	// conditional
    // isoMsg[128] = undefined;	// conditional
 
    return isoMsg;
}

function errorToIsoMsg(error, $meta) {
    const orgIso = error.originalMsg;
    const cause = error.cause;
    let isoMsg = {};

    isoMsg.header = orgIso.header;
    if  (orgIso.mtid == '0200') {
        isoMsg.mtid = '0210';
    } else if (orgIso.mtid == '0220') {
        isoMsg.mtid = '0230';
    } else if (orgIso.mtid == '0420') {
        isoMsg.mtid = '0430';
    }
    // isoMsg.mtid = orgIso.mtid; //'0210';
    isoMsg[2] = cause && cause.iso2 || orgIso[2];		// optional			    PAN		!!! handle it better		
    isoMsg[3] = orgIso[3];		// echo M				Processing code
    isoMsg[4] = cause && cause.iso4 || orgIso[4];		// conditional			Transaction amount !!! handle it better
    isoMsg[6] = orgIso[6] || undefined;		// echo M				Cardholder billing Amount
    isoMsg[7] = orgIso[7] || undefined;		// echo M				Transmission Greenwich Time
    isoMsg[10]	= orgIso[10] || undefined;	// echo conditional	    Conversion Rate, Cardholder Billing
    isoMsg[11]	= orgIso[11] || undefined;	// echo M				System Trace Audit Number
    isoMsg[12]	= orgIso[12] || undefined;	// echo O				Local (Terminal) Transaction Time
    isoMsg[13]	= orgIso[13] || undefined;	// echo O				Local (Terminal) Transaction Date
    isoMsg[18]	= orgIso[18] || undefined;	// echo O				Merchant Category Code
    isoMsg[19]	= orgIso[19] || undefined;	// echo O				Acquiring Institution Country Code
    isoMsg[22]	= orgIso[22] || undefined;	// echo O				POS Entry Mode
    isoMsg[23]	= orgIso[23] || undefined;	// echo D->M			card member number
    isoMsg[25]	= orgIso[25] || undefined;	// conditional			if transaction tipe is not 133 echo P-3.1 = 133 and S-123.BAI = MP
    isoMsg[26]	= orgIso[26] || undefined;	// echo conditional	    Message Reason Code !!! to handle this
    isoMsg[28]	= orgIso[28] || undefined;	// echo O/conditional   Fee Amount
    isoMsg[32]	= orgIso[32] || undefined;	// echo M				Acquiring Institution Identification
    isoMsg[33]	= orgIso[33] || undefined;	// echo conditional	    Forwarding Institution Identification
    isoMsg[35]	= orgIso[35] || undefined;	// echo M				Track 2
    isoMsg[37] 	= orgIso[37] || undefined;   // echo M				Transaction Retrieval Reference Number !!! handle whetar values are equal
    if(cause && cause.iso39) {
        isoMsg[39]	= respCodeSgToNi(cause.iso39); // mandatory			!!! handle mapping TSS to NI 00001 is approval
    } else {
        isoMsg[39]	= respCodeSgToNi('06');
    }
    isoMsg[41]	= orgIso[41] || undefined;	// echo O				Card Acceptor Terminal ID
    isoMsg[43] 	= orgIso[43] || undefined;     // echo O				Card Acceptor Terminal Name/Location !!! get it from udfAcquirer.terminalName 
    isoMsg[44]	= orgIso[44] || undefined;	// desirable
    isoMsg[45]	= orgIso[45] || undefined;	// desirable echo
    isoMsg[49] 	= orgIso[49] || undefined;    // conditional echo !!! get it from transfer.amount 
    isoMsg[51]	= orgIso[51] || undefined;	// conditional echo !!! get it from transfer.amount 
    isoMsg[52]	= orgIso[52] || undefined;	// echo O
    isoMsg[54]	= orgIso[54] || undefined;    // echo O !!! adjustment amount
    isoMsg[55]  = orgIso[55] || undefined;    // conditional
    isoMsg[61]	= orgIso[61] || undefined;	// conditional / optional echo
    isoMsg[62]	= orgIso[62] || undefined;	// conditional / desirable
    isoMsg[102]  = orgIso[102] || undefined;   // echo D
    isoMsg[103]	 = orgIso[103] || undefined;   // echo D
    isoMsg[104]	 = orgIso[104] || undefined;   // echo O
    isoMsg[105] = undefined;	// conditional !!! Account balance data
    isoMsg[106]	= orgIso[106] || undefined;   // desirable
    isoMsg[110] = orgIso[110] || undefined;	// conditional
    isoMsg[111]	= orgIso[111] || undefined;    // echo O
    isoMsg[121]	= orgIso[121] || undefined;    // echo O
    isoMsg[123] = orgIso[123] || undefined;	// conditional
    isoMsg[126]	= orgIso[126] || undefined;    // echo O

    return isoMsg;
}

function replyTo0800(msg, $meta) {
    const reply = Object.assign({}, msg);
    reply.mtid = '0810';
    reply[39] = '00001';
    return reply;
}

module.exports = {
    id: 'dhi',
    type: 'tcp',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    namespace: ['dhi/transfer'],
    listen: true,
    // socketTimeOut: 10000,//how much time to wait without communication until closing connection, defaults to "forever"
    format: {
        size: '16/integer',
        codec: require('ut-codec-iso8583NI'),
        version: 0,
        baseEncoding: 'ascii' //,
    },
    start: function() {
        if (!this.config.host) {
            // throw Error('TSS host IP not configured');
        }
        
        bus = this.bus;
        return this.bus.importMethod('db/iso.terminal.info[0]')({institutionCode: '012345'})
            .then(info => {
                this.config.channelId = info.isoId; 
                return {};
                })

    },
    // 'transfer.push.execute.error.receive': processHttpError,
    //'transfer.push.execute.response.receive': function (msg, $meta) {



    // '0800.response.send': function (msg, $meta) {
    //     msg[39] = '00';
    //     return msg;
    // },
    // '0800.request.receive': function (msg, $meta) {
    //     return msg;
    // },

    '0800.echo.request.receive': function (msg, $meta) {
        $meta.method = 'dhi/transfer.send';
        return replyTo0800(msg, $meta);
    },
    '0800.logon.request.receive': function (msg, $meta) {
        $meta.method = 'dhi/transfer.send';
        return replyTo0800(msg, $meta);     
    },
    '0800.keyChange.request.receive': function (msg, $meta) {
        $meta.method = 'dhi/transfer.send';
        msg.mtid = '0810'; // !!! to handle this
        msg[39] = '00054';
        return msg;
    },
    '0800.logoff.request.receive': function (msg, $meta) {
        $meta.method = 'dhi/transfer.send';
        msg.mtid = '0810'; // !!! to handle this
        msg[39] = '00054';
        return msg;
    },    
    '0800.cutOver.request.receive': function (msg, $meta) {
        $meta.method = 'dhi/transfer.send';
        msg.mtid = '0810'; // !!! to handle this
        msg[39] = '00054';
        return msg;
    },    
    '0800.inquiryMode.request.receive': function (msg, $meta) {
        $meta.method = 'dhi/transfer.send';
        msg.mtid = '0810'; // !!! to handle this
        msg[39] = '00054';
        return msg;
    },




    // '0200.010.request.receive': function (msg, $meta) {
    //     console.log('0200 010 received');
    //     Object.assign(tciMsg, msg); // !!! the original message have to be received with the error !!!
    //     let transfer = isoMsgToTrasfer(msg, $meta);
    //     // transfer.issuerId = ''; //'tss';
    //     transfer.ledgerId = 'cbs';
    //     transfer.issuerId = 'cbs';
    //     // transfer.ledgerPort = 'tss/transfer';
    //     console.log('0200 010 received transfer object');
    //     return this.bus.importMethod('transfer.push.execute')(transfer, $meta) //transfer.push.execute ...params ledgerId = cbs
    //     .then((result) => {
    //         console.log(result);
    //         const reply = trasferToIsoMsg(result, $meta);
    //         $meta.destination = 'dhi/transfer';
    //         $meta.method = '0210.010';
    //         $meta.mtid = 'response';
    //          return reply;
    //         })
    //     .catch( error => {
    //         console.log(error);
    //         const reply = errorToIsoMsg(Object.assign({}, error, { originalMsg: tciMsg }), $meta)
    //         $meta.destination = 'dhi/transfer';
    //         $meta.method = '0210.010';
    //         $meta.mtid = 'response';
    //         return reply;
    //     })
    // },

    '0210.010.response.send': function (msg, $meta) {
        return msg;
    },

    receive:function(msg, $meta, context){
        if ($meta.mtid === 'notification')
        {
            return  msg;
        }
        if (msg.mtid === '0800') { // unknown network code -> return error
            $meta.method = 'dhi/transfer.send';
            msg.mtid = '0810'; 
            msg[39] = '00054';
            return msg;
        }
        if (msg.mtid === '0200' || msg.mtid === '0220') {
            Object.assign(tciMsg, msg); // !!! the original message have to be received with the error !!!
            let transfer = isoMsgToTrasfer(msg, $meta);
            // transfer.issuerId = ''; //'tss';
            transfer.ledgerId = 'cbs';
            transfer.issuerId = 'cbs';
            return this.bus.importMethod('transfer.push.execute')(transfer, $meta) //transfer.push.execute ...params ledgerId = cbs
            .then((result) => {
                const reply = trasferToIsoMsg(result, $meta);
                $meta.destination = 'dhi/transfer';
                // $meta.method = '0210.010';
                $meta.mtid = 'response';
                 return reply;
                })
            .catch( error => {
                const reply = errorToIsoMsg(Object.assign({}, error, { originalMsg: tciMsg }), $meta)
                $meta.destination = 'dhi/transfer';
                // $meta.method = '0210.010';
                $meta.mtid = 'response';
                return reply;
            })
        }
        if (msg.mtid === '0420') {
            Object.assign(tciMsg, msg); // !!! the original message have to be received with the error !!!
            let transfer = isoMsgToTrasfer(msg, $meta);
            // transfer.issuerId = ''; //'tss';
            transfer.ledgerId = 'cbs';
            transfer.issuerId = 'cbs';
            $meta.auth = {actorId: this.config.channelId};
            // transfer.ledgerPort = 'tss/transfer';
            return this.bus.importMethod('transfer.push.reverse')(transfer, $meta) //transfer.push.execute ...params ledgerId = cbs
            .then((result) => {
                const reply = trasferToIsoMsg(result, $meta);
                $meta.destination = 'dhi/transfer';
                // $meta.method = '0210.010';
                $meta.mtid = 'response';
                 return reply;
                })
            .catch( error => {
                const reply = errorToIsoMsg(Object.assign({}, error, { originalMsg: tciMsg }), $meta)
                $meta.destination = 'dhi/transfer';
                // $meta.method = '0210.010';
                $meta.mtid = 'response';
                return reply;
            })
        }
        return msg;
    },
    send:function(msg,$meta){
        return msg;
    } // ,
    // 'transfer.push.reverse.request.send': function (msg, $meta) {
    //     return msg;
    // },
    // 'transfer.push.reverse.response.receive': function ({ payload }) {
    //     return {};
    // },
    // 'transfer.push.reverse.error.receive': processHttpError
};