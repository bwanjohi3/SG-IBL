const transferError = require('ut-transfer/errors');
const crypto = require('crypto');
const processing = require('../transferTypes');
var emv = require('ut-emv');
var sequence = 0;

var tracer = [];
let bus;

function decrypt(key, value, clearFormat, cipherName) {
    var decipher = crypto.createDecipher(cipherName || 'aes128', key);
    return decipher.update(value, 'hex', clearFormat || 'hex').toUpperCase() + decipher.final(clearFormat || 'hex').toUpperCase();
}

function processHttpError(msg, $meta) {
    var err;
    if (msg.cause && msg.cause.errno === 'ESOCKETTIMEDOUT') {
        err = transferError.unknown(msg);
    } 
    else if(msg.iso39=='00051'){
        $meta.callback = tracer[parseInt($meta.trace)].callback;
        delete tracer[parseInt($meta.trace)];
        err = transferError.insufficientFunds(msg);
    }
    else {
        $meta.callback = tracer[parseInt($meta.trace)].callback;
        delete tracer[parseInt($meta.trace)];
        err = transferError.genericDecline(msg);
    }
    err.iserror = true;
    throw err;
}
function processReversalResponse (msg, $meta) {
    $meta.callback = tracer[parseInt($meta.trace)].callback;
    delete tracer[$meta.trace];
    return {balance: '00000000'};
}

function ministatFormat(msg) {
    var rows = msg.split('~');
    var formattedLineString = '';
    while (rows.length > 7) {
        rows.shift();
    }
    var ministatData = rows.map((line) => {
        var splitLine = line.split('|');
        if (splitLine[2]) {
            let amount = (parseFloat(splitLine[3])).toString();
            while(amount.length<16){
                amount = ' '+amount;
            }
            var formattedLine = `${dateConvert(splitLine[0]).toString()}` +
                "    " +
                `${splitLine[2]}` +
                `${amount}`;
            formattedLine.concat('\u001b');
            formattedLineString += formattedLine;
            return formattedLine.toString().replace(',', '');
        } else {
            return {};
        }
    })

    return formattedLineString;
}

function ministatFormatReceipt(msg) {
    var rows = msg.split('~');
    var receiptData = rows.map((line) => {
        var splitLine = line.split('|');
		if(!splitLine[2]){
			return;
		}
        var formattedLine = `${dateConvert(splitLine[0]).toString() + " \t" + splitLine[2] + " \t\t" + (parseFloat(splitLine[3])).toString()} \n`;
        return formattedLine;
    })
    return receiptData.toString().replace(/,/g, '');
}

function dateConvert(date) {
    return date.substring(6, 8) + '-' + date.substring(4, 6) + '-' + date.substring(0, 4)
}

function processIsoResponse(msg, $meta) {
    let currency = msg[51] === '840' ? 'USD' : 'LRD';
    let pan4 =  msg[35] && msg[35].split('D')[0].slice(-4);
    // if (processing.types[msg[3].slice(0,3)] === 'balance' && msg[105]) {
    if (processing.types[msg[3].slice(0,3)] === 'balance' || processing.types[msg[3].slice(0,3)] === 'ministatement' && msg[105]) {
            // S-105.1 Leger Balance (N12) – account ledger balance,
        // S-105.2 Available Balance (N12) – account available balance,
        // S-105.3 Balance currency account (N1) – ‘1’ – account balance is to be transmitted in the account currency, ‘0’ – in the transaction currency.
        let ledger = parseInt(msg[105].slice(0, 12)) / 100;
        let available = parseInt(msg[105].slice(12, 24)) / 100;
        
        msg.balance = {
            ledger: {amount: ledger},
            available: {amount: available},
            currency: currency,
            authId: msg[41],
            cardNumber: pan4,
            rrn: msg[37]
        };
    } else {
        msg.balance = {
            ledger: {amount: 0},
            available: {amount: 0},
            currency: currency,
            authId: msg[41],
            cardNumber: pan4,
            rrn: msg[37]
        };
        msg.amount = {transfer: {amount: msg[4] && (parseFloat(msg[4]) / 100).toFixed(2), currency: currency}};
    }
    if (processing.types[msg[3].slice(0,3)] === 'ministatement' && msg[114]) {
        msg.ministatement = {
            statement: {
                receiptLines: ministatFormatReceipt(msg[114]),
                lines: ministatFormat(msg[114]),
            }
        }

    }
    
    msg[3] = processing.typesNI2SG[msg[3].slice(0,3)].concat(msg[3].slice(3,7));
    
    if(msg.emvTags && msg.emvTags.issuerAuthenticationData) {
        msg[55] =  '910A' + msg.emvTags.issuerAuthenticationData.val;
        msg.emvCryptogramVerifyDataNI = msg.emvTags.issuerAuthenticationData;
    }
    
    if(msg[123] && (msg[123].indexOf('RC=') !== -1)) {
        const indexOfRC = msg[123].indexOf('RC=');
        msg.emvResponseCodeNI = msg[123].substr(indexOfRC + 3, 2);
    }
    
    
    $meta.callback = tracer[parseInt($meta.trace)].callback;
    delete tracer[$meta.trace];
    return msg
}

function genRRN(rrn) {
    if (!rrn) {
        return Math.floor(Math.random() * 1000000)
    }
	return ((parseInt(rrn) % 900000 + 100000)).toString();
}

function processTime() {
    var date = new Date();
    var formattedHour = ('0' + date.getHours()).slice(-2);
    var formattedMinute = ('0' + date.getMinutes()).slice(-2);
    var formattedSeconds = ('0' + date.getSeconds()).slice(-2);
    return formattedHour + formattedMinute + formattedSeconds;
}

function processDate(variance) {
    var date = new Date();
    var formattedDate = ('0' + date.getDate()).slice(-2);
    var formattedMonth = ('0' + (date.getMonth() + 1)).slice(-2);
    var formattedYear = date.getFullYear().toString();
    if (variance == 'short') {
        return formattedMonth + formattedDate;
    } else {
        return formattedYear.concat(formattedMonth).concat(formattedDate);
    }
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function padSapce(value, length) {
    return (value + ' '.repeat(length)).slice(0, length);
}

function generateField43(msg) {
    let terminalClass;
    switch(msg.channelType) {
        case 'pos':
            terminalClass = '002';
            break;
        case 'atm':
            terminalClass = '001';
            msg.udfAcquirer.merchantName = 'IBL'; // To be improved 
            break;
        default:
            terminalClass = '000';
    }
    const terminalOwner = msg.udfAcquirer.merchantName ? (msg.udfAcquirer.merchantName + ' '.repeat(30)).slice(0, 30) : ' '.repeat(30); 
    const terminalCity = msg.udfAcquirer.location ? msg.udfAcquirer.location.slice(-12) + ' '.repeat(18) : ' '.repeat(30);   
    const terminalAddress = msg.udfAcquirer.location ? msg.udfAcquirer.location.slice(0, 23) + ' '.repeat(7) : ' '.repeat(30)
    const terminalDate = msg.localDateTime ? msg.localDateTime.slice(0, 8) : '0'.repeat(8);
    const terminalPaymentSysName = msg.udfAcquirer.organizationName ? (msg.udfAcquirer.organizationName + ' '.repeat(10)).slice(0, 10) : ' '.repeat(10);
    const terminalFinancialInstitute = msg.udfAcquirer.organizationName ? (msg.udfAcquirer.organizationName + ' '.repeat(10)).slice(0, 4) : ' '.repeat(4);
    return terminalOwner //1.Terminal owner
        + terminalCity //2.Terminal city
        + '0'.repeat(3) //3.Terminal state
        + '430' //4.Terminal country
        + terminalAddress //5.Terminal address
        + ' '.repeat(30) //6.Terminal branch
        + ' '.repeat(30) //7.Terminal region
        + terminalClass //8.Terminal class
        + terminalDate //9.Terminal date YYYYMMDD
        + terminalPaymentSysName //10.Terminal payment system name
        + terminalFinancialInstitute //11.Terminal financial institution name
        + ' '.repeat(25) //12.Terminal retailer name
        + '0'.repeat(3) //13.Terminal county
        + '0'.repeat(9) //14.Terminal zip code
        + '0'.repeat(4); //15.Terminal time offset
}

function getFee({amount}, reversal) {
    const type = reversal ? 'C' : 'D';
    let totalFee = 0;
    if (amount.acquirerFee && amount.acquirerFee.cents)
        totalFee += amount.acquirerFee.cents;
    if (amount.issuerFee && amount.issuerFee.cents)
        totalFee += amount.issuerFee.cents;
    const fee = ('0'.repeat(8) + totalFee).slice(-8);
    return `${type}${fee}`;
}

function genRequest(msg, $meta, bus, config) {
    var req = {};
    var emvTagsStr = msg.udfAcquirer.emvTags;
    if (msg.udfAcquirer.emvTags && 
        typeof msg.udfAcquirer.emvTags === 'object')
        emvTagsStr = emv.tagsEncode(msg.udfAcquirer.emvTags);

    var reversal = msg.udfAcquirer.mti === '420' || msg.udfAcquirer.mti === '430';
    var transactionType = msg.transferType === "push" ? msg.itemCode : msg.transferType;
    if (msg.channelType === 'pos')
        transactionType += 'POS'
    if (msg.channelType === 'atm')
        transactionType += 'ATM'
    var track2 = msg.udfAcquirer.track2 && msg.udfAcquirer.track2 !== 'false' && decrypt('a password', msg.udfAcquirer.track2, 'ascii', msg.udfAcquirer.cipher);
    var track2EquivalentData = msg.udfAcquirer.track2EquivalentData && msg.udfAcquirer.track2EquivalentData !== 'false' && decrypt('a password', msg.udfAcquirer.track2EquivalentData, 'ascii', msg.udfAcquirer.cipher);
    track2 = track2 ? track2.replace(';', '').replace('?', '') : '';
    req.MTI = reversal ? '0420' : '0200';
    req[2] = decrypt('a password', msg.udfAcquirer.pan, 'hex', msg.udfAcquirer.cipher);
    req[2] = req[2].replace('F', '');
    req[3] = processing.codes[transactionType].concat('00').concat('00');//NB, for IFT, send the correct accounttype in destination account
    if (msg.channelType === 'atm'){
        req[4] = msg.amount.transfer.amount ? pad(msg.amount.transfer.amount*100, 12) : 0;
    }else {
        req[4] = msg.amount.transfer.amount ? pad(msg.amount.transfer.amount.replace('.', ''), 12) : 0;
    }
    
    req[7] = processDate('short') + processTime();
    req[11] = genRRN(msg.transferId);
    req[12] = processTime();
    req[13] = processDate('short');
    if (msg.channelType === 'atm'){
        req[18] = '6011';//merchant type n-4 mandatory - Always 0000 for ATM transactions
    } else{
        req[18] = '6010';//merchant type n-4 mandatory - Always 0000 for ATM transactions
    }
    req[19] = '430';
    req[22] = msg.udfAcquirer.emvTags ? '051' : '901'; // fix for emv 51 // BZV handle the fallback case !!! should be 801
    req[23] = msg.panSeqenceNumber || '000';
    req[25] = msg.udfAcquirer.emvTags ? '091' : '000'; // fix for emv
    req[28] = getFee(msg, reversal);
    req[32] = '999901';
    req[35] = track2 || track2EquivalentData;
    req[37] = msg.retrievalReferenceNumber || pad(genRRN(msg.transferId), 12);//an-12 retrieval reference number mandatory
    req[41] = msg.udfAcquirer.terminalId;// '101201' for test
    //req[42] = '1231000753033';
    req[43] = generateField43(msg)
    if(msg.transferCurrency) {
        req[49] = msg.transferCurrency === 'USD' ? '840' : '430'; //Get the currency to use
    } else if (msg.amount && msg.amount.transfer && msg.amount.transfer.currency){
        req[49] = msg.amount.transfer.currency === 'USD' ? '840' : '430';
    } else {
        req[49] = '430';
    }
    req[52] = msg.pinBlock; //pinblock data
    req[55] = emvTagsStr && Buffer.from(emvTagsStr, 'hex') ;// req[55] = msg.udfAcquirer.emvTags;
    if(transactionType === 'changePinExternalOwnATM' || transactionType === 'changePinExternalNiATM') {
        req[63] = msg.pinBlockNew;
    }
    req[102] = '?';
    req[105] = '0'.repeat(25);
    if (msg.channelType === 'pos'){
        req[121] = '001230' + ' '.repeat(41);
    }
    req[123] = 'TC=05';
    //req.emvTags = emvTagsStr || msg.udfAcquirer.emvTags;
    //req[60] = '01234567+0003456'; //private data
    //req[52] = msg.transferCurrency=='USD'? '998' :'430'; //Get the currency to use
    req.$$ = {};
    req.mtid = reversal ? '0420' : '0200';
    req.header = 'A4M10000';
    sequence++; req.trace = sequence;
    tracer[req[11]] = {
        callback: $meta.callback
    };
    let isPinBlockExist =  msg.pinBlock &&  msg.pinBlock !== '0000000000000000';
    let isPinBlockNewExist =  msg.pinBlockNew &&  msg.pinBlockNew !== '0000000000000000';
    let _meta = $meta;
    return bus.importMethod('db/iso.terminal.info[0]')({institutionCode: 999991})
            .then(info => {
                // debugger;
                return Promise.all([
                    isPinBlockExist && msg.channelType === 'pos' && bus.importMethod('hsm.translateBdkZpk')({
                        bdk: msg.bdk,
                        zpk: info.zpk,
                        ksnDescriptor: msg.ksnDescriptor,
                        ksn: msg.ksn,
                        pinBlock: msg.pinBlock,
                        desPinBlockFormat: '01',
                        card: req[2]
                    }),
                    isPinBlockExist && msg.channelType !== 'pos' && bus.importMethod('hsm.translateTpkZpk')({
                        sourceTpk: msg.tpk,
                        destinationZpk: info.zpk,
                        maximumPinLength: config.maximumPinLength,
                        sourcePinBlock: msg.pinBlock,
                        sourcePinBlockFormat: '01',//config.sourcePinBlockFormat,
                        destinationPinBlockFormat: '01',//config.destinationPinBlockFormat,
                        card: req[2]
                    }),
                    isPinBlockNewExist && msg.channelType !== 'pos' && bus.importMethod('hsm.translateTpkZpk')({
                        sourceTpk: msg.tpk,
                        destinationZpk: info.zpk,
                        maximumPinLength: config.maximumPinLength,
                        sourcePinBlock: msg.pinBlockNew,
                        sourcePinBlockFormat: '01',//config.sourcePinBlockFormat,
                        destinationPinBlockFormat: '01',//config.destinationPinBlockFormat,
                        card: req[2]
                    })
                ])
                .then(([data1, data2, data3]) => {
                    $meta = _meta;
                    if (isPinBlockExist) {
                        req[52] = data1 ? data1.destinationPinBlock : data2 ? data2.destinationPinBlock ? data2.destinationPinBlock : data2.pinBlock : msg.pinBlock;//translated pinblock
                    }
                    else {
                        delete req[52];
                    }
                    if (isPinBlockNewExist) {
                        req[63] = data3.pinBlock;
                    } else {
                        delete req[63];
                    }
                    return req;
                })
        })
        .catch(e => {
            // debugger;
            throw e;
        });
}

module.exports = Object.assign({},{
    id: 'h2h',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    namespace: ['h2h/transfer'],
    listen: false,
    //socketTimeOut: 10000,//how much time to wait without communication until closing connection, defaults to "forever"
    format: {
        size: '16/integer',
        codec: require('ut-codec-iso8583NI'),
        version: 0,
        baseEncoding: 'ascii'
    },
    start: function () {
        // if (!this.config.host) {
        //     throw Error('TSS host IP not configured');
        // }
        bus = this.bus;
    },
    'connected.notification.receive': function (msg, $meta) {
        $meta.destination = 'h2h/transfer';
        $meta.method = 'transfer.key.exchange';
        $meta.mtid = 'request';
        return msg;
    },
    'transfer.push.execute.request.send': function (msg, $meta) {
        const toSend = genRequest(msg, $meta, this.bus, this.config);
        return toSend;
    },
    'transfer.push.reverse.request.send': function (msg, $meta) {
        if( msg.reversalSource === 'ATM') {
            console.log('reversal');
            console.log(msg.reversal);
            return msg.reversal;
        } else {
            return genRequest(msg, $meta, this.bus, this.config)
        }
    },
    'transfer.push.execute.error.receive': processHttpError,
    '0210.error.receive': function (msg, $meta) {
        $meta.callback = tracer[parseInt(msg[11])].callback;
        delete tracer[msg[11]];
        return msg;
    },
    //'transfer.push.execute.response.receive': function (msg, $meta) {


    '0800.echo.request.receive': function (msg, $meta) {
        $meta.destination = 'h2h/transfer';
        msg[39] = '00000';
        msg.mtid = '0810';
        $meta.mtid = 'response';
        return msg;
    },
    '0800.logon.request.receive': function (msg, $meta) {
        $meta.destination = 'h2h/transfer';
        msg[39] = '00000';
        msg.mtid = '0810';
        $meta.mtid = 'response';
        return msg;
    },
    '0800.keyChange.request.receive': function (msg, $meta) {
        $meta.destination = 'h2h/transfer';
        $meta.mtid = 'response';
        msg.mtid = '0810';
        return this.bus.importMethod('db/iso.terminal.info[0]')({institutionCode: 999991})
            .then(info => {
                return this.bus.importMethod('hsm.generateKey')({
                    mode: '1',
                    keyType: '001',
                    keyScheme: 'U',
                    keyZmkTmkFlag: '0',
                    keyZmkTmk: info.zmk,
                    keyScheme1: 'X',
                    deriveKeyMode: 0
                })
                .then(res => {
                    let newKey = Buffer.from(res.rest.data, 'hex').toString();
                    msg[39] = '00000';
                    msg[53] = newKey.slice(-38) + '0'.repeat(58);
                    return msg;
                    // This key use only for NI -> SG transaction flow if needed, ZPK for NI -> SG direction.
                    /* return this.bus.importMethod('db/iso.terminal.setZpk')({
                        isoId: info.isoId,
                        zpk: res.keyA32,
                        zpkkvv: newKey.slice(-6)
                    })
                    .then(r => {
                        msg[39] = '00000';
                        msg[53] = newKey.slice(-38) + '0'.repeat(58);
                        return msg;
                    }); */
                });
            })
            .catch(e => {
                // debugger;
                msg[39] = '00054';
                return msg;
            });
    },
    '0810.keyChange.response.receive': function (msg, $meta) {
        if (!tracer[parseInt(msg[11])])
            $meta.mtid = 'discard';
        else
            $meta.callback = tracer[parseInt(msg[11])].callback;
        delete tracer[msg[11]];
        let data = msg[53].toUpperCase();
        let newKey = data.slice(0,32);
        let newKeyKvv = data.slice(32,38);
        return this.bus.importMethod('db/iso.terminal.info[0]')({institutionCode: 999991})
            .then(info => {
                return this.bus.importMethod('hsm.importZpk')({
                    zmk: info.zmk,
                    zpk: 'X' + newKey
                })
                    .then(({zpk, zpkkvv}) => {
                        return this.bus.importMethod('db/iso.terminal.setZpk')({
                            isoId: info.isoId,
                                zpk,
                                zpkkvv
                            })
                            .then(r => {
                                msg.zpk = zpk;
                                return msg;
                            })
                    })
                    .catch(e => {
                        throw(e);
                    });
        });
    },
    receive: function(msg,$meta){
        if($meta.mtid == 'notification' || $meta.mtid == '9800'  || $meta.mtid == '9810') {
            $meta.mtid = 'discard';
        }

        return msg;
    },
    send: function(msg,$meta){
        return msg;
    },
    'transfer.key.exchange.request.send': function (msg, $meta) {
        var req = {};
        req.MTI = '0800';
        req[7] = processDate('short') + processTime();
        req[11] = genRRN(msg.transferId);
        req[70] = '101';
        req.mtid = '0800';
        req.header = 'A4M10000';
        if ($meta.opcode !== 'connected') {
            tracer[req[11]] = {
                callback: $meta.callback
            };
        }
        
        return req;
    },
    'transfer.push.reverse.response.receive': function ({ payload }) {
        return {};
    },
    'transfer.push.reverse.error.receive': processHttpError,
    '0430.response.receive': processReversalResponse
},
    Object.keys(processing.types).reduce((f, key) => {
        return Object.assign({}, f, {
            [`0210.${key}.error.receive`]: processHttpError,
            [`0210.${key}.response.receive`]: processIsoResponse,
            
        });
    }, {})
);