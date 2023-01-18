const transferError = require('ut-transfer/errors');
const transferCurrencyScale = require('ut-transfer/currency').scale;
const getAmount = require('ut-transfer/currency').amount;
const getAlpha = require('ut-transfer/currency').alphabetic;
const parseXmlString = require('xml2js').parseString;
const stripPrefix = require('xml2js').processors.stripPrefix;
var sequence = 0;
var tracer = [];

const crypto = require('crypto');


function decrypt(key, value, clearFormat, cipherName) {
    var decipher = crypto.createDecipher(cipherName || 'aes128', key);
    return decipher.update(value, 'hex', clearFormat || 'hex').toUpperCase() + decipher.final(clearFormat || 'hex').toUpperCase();
}

function processIsoError(msg, $meta) {
    if (msg.cause && msg.cause.errno === 'ESOCKETTIMEDOUT') {
        throw transferError.unknown(msg);
    }
    else if(msg.iso39=='51'){
        $meta.callback = tracer[$meta.trace].callback;
        delete tracer[$meta.trace];
        var err = transferError.insufficientFunds(msg);
        throw err;
    }
    else {
        $meta.callback = tracer[$meta.trace].callback;
        delete tracer[$meta.trace];
        var err = transferError.genericDecline(msg);
        throw err;
    }
}
var opcode = {
    'balance': '311000',
    'ministatement': '381000',
    'withdraw': '011000',
    'topup': '901000',
    'transfer': '401000',
    'transferOtp': '401000',
    'deposit': '211000',
    'sale': '001000',
	'acquiringFee':'401000',
    'withdrawExternalNi': '011000',
    'balanceExternalNi': '311000',
    'ministatementExternalNi': '381000'
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function padMinStat(amount){
    var space="";
    while(space.length<14-amount.length) space=" "+space;
    return space;
}

function sendSMS(payload, bus, $meta) {

    return bus.importMethod('db/alert.queueOut.push')({
        port: 'sms',
        channel: "sms",
        recipient: (Array.isArray(payload.recipient)) ? payload.recipient : [payload.recipient],
        content: formatMessage(payload),
        priority: 1
    }, $meta).then((response) => {
        return {};
    })
}

function formatMessage(payload) {
    switch (payload.txType) {
        case 'withdraw':
            return `Dear Customer, Withdrawal of amount ${parseFloat(payload.amount)/100} from account number ${payload.accountnumber} on ${payload.datetime} was successful. New account balance is ${payload.balance}`
        case 'transfer':
            return `Dear Customer, Transfer of amount ${parseFloat(payload.amount)/100} from account number ${payload.accountnumber} on ${payload.datetime} was successful. New account balance is ${payload.balance}`
    }
}

function processDate() {
    var date = new Date();
    var formattedDate = ('0' + date.getDate()).slice(-2);
    var formattedMonth = ('0' + (date.getMonth() + 1)).slice(-2);
    return formattedDate + formattedMonth;
}

function processTime() {
    var date = new Date();
    var formattedHour = ('0' + date.getHours()).slice(-2);
    var formattedMinute = ('0' + date.getMinutes()).slice(-2);
    var formattedSeconds = ('0' + date.getSeconds()).slice(-2);
    return formattedHour + formattedMinute + formattedSeconds;
}

// function genRRN(rrn) {
//     if (parseInt(rrn) < 100000) {
//         return (parseInt(rrn) + 100000).toString();
//     }else{
// 		return  rrn;
// 	}
// }
function genRRN(rrn) {
    return ((parseInt(rrn) % 900000 + 100000)).toString();
}

function genReversalRequest(msg, $meta, bus) {
    var req = {};
    req.mtid = req.MTI = msg.mtid || '0420';//'0200';//msg.transferType === 'sale' ? '0100' : '0200';
    req[2] = decrypt('a password', msg.udfAcquirer.pan, 'hex',msg.udfAcquirer.cipher);
    // req[3] = opcode[msg.udfAcquirer.originalTransferType];
    if (msg.udfAcquirer && msg.udfAcquirer.originalTransferType) {
        req[3] = opcode[msg.udfAcquirer.originalTransferType];
    } else if (msg.udfAcquirer.processingCode) {
        req[3] = msg.udfAcquirer.processingCode;
    } else {
        req[3] = '990000';
    }
    
    if (msg.channelType === 'pos') {
        req[4] =  (msg.amount && msg.amount.transfer && msg.amount.transfer.amount) ? pad(msg.amount.transfer.amount.replace('.', ''), 12) : pad(0, 12);  
        req[18] = '0001';
    } else if (msg.channelType === 'dhi') { // !!! handle this
        req[4] =  (msg.amount && msg.amount.transfer && msg.amount.transfer.amount) ? pad(msg.amount.transfer.amount.replace('.', ''), 12) : pad(0, 12);
		req[18] = '0002';
    }  
    else {
        // req[4] =  (msg.amount && msg.amount.transfer && msg.amount.transfer.amount) ? pad(msg.amount.transfer.amount.replace('.', '')+'00', 12) : pad(0, 12);
        req[4] =  (msg.amount && msg.amount.transfer && msg.amount.transfer.amount) ? pad(msg.amount.transfer.amount.replace('.', ''), 12) : pad(0, 12);
        req[18] = '0000';
    } 
    
    if (msg.udfAcquirer.track2 === 'false')
        msg.udfAcquirer.track2 = undefined;

    req[7] =  processDate() + processTime();
    req[11] = genRRN(msg.transferId);
    req[12] = processTime();
    req[13] = processDate();
    req[32] = decrypt('a password', msg.udfAcquirer.pan, 'hex',msg.udfAcquirer.cipher).substring(0,6);
    //req[35] = decrypt('a password',  msg.udfAcquirer.track2 || msg.udfAcquirer.track2EquivalentData , 'ascii',msg.udfAcquirer.cipher);
    req[37] = pad(genRRN(msg.transferId), 12);
    req[41] = msg.udfAcquirer.terminalId;//Get the terminal id from the system
    req[42] = msg.udfAcquirer.merchantId;
    req[43] = msg.udfAcquirer.terminalName; //Get the branch from the system
    req[49] = msg.transferCurrency=='USD'? '840' :'430'; //Get the currency to use
    if (msg.channelType === 'dhi') {
        req[71] = '1002'; // MasterCard issued by IBL !!! handle this
    } else if (msg.udfAcquirer.flow === 'externalNi') {
        req[71] = '1003'; // Not IBL MasterCard
    } else if (msg.udfAcquirer.cardFlow === 'own'){
        req[71] = '1000'; //  IBL own card
    } else {
        req[71] = '1001'; // Not IBL Card
    }
    req[90] = '0200' + req[11] + msg.localDateTime + (msg.acquirerCode ? msg.acquirerCode : '000000') + '0000000000000'
    req[102] = msg.sourceAccount;
    if (msg.udfAcquirer.flow === 'externalNi') { 
        let settlementAccount = msg.split && msg.split.filter(x=> x.description.includes(msg.transferCurrency)).pop()
        req[102]  = settlementAccount && settlementAccount.debit;
    }
    if (msg.transferType == 'transfer' || msg.transferType == 'transferOtp' || msg.itemCode == 'transfer' || msg.itemCode == 'transferOtp') {
        req[103] = msg.destinationAccount
    } else if (msg.transferType == 'topup') {
        req[103] = bus.config.tss.airtimeSuspenseAccount;
    } else if (msg.transferType == 'deposit') {
        req[103] =  msg.sourceAccount;
        delete req[102];
    }
    req.$$ = {};
    sequence++; 
    req.trace = sequence;
    tracer[req[11]] = {
        callback: $meta.callback,
        mobileNumber: msg.mobileNumber
    };

    return req;

}

function genRequest(msg, $meta, bus) {
    var req = {};
    req.MTI = msg.mtid || '0200';//'0200';//msg.transferType === 'sale' ? '0100' : '0200';
    req[2] = decrypt('a password', msg.udfAcquirer.pan, 'hex',msg.udfAcquirer.cipher);
    req[3] = opcode[msg.transferType];
    
    if (msg.channelType == 'pos') {
		req[4] =  (msg.amount && msg.amount.transfer && msg.amount.transfer.amount) ? pad(msg.amount.transfer.amount.replace('.', ''), 12) : pad(0, 12);
		req[18] = '0001';
    } else if (msg.channelType === 'dhi') { // !!! handle this
        req[4] =  (msg.amount && msg.amount.transfer && msg.amount.transfer.amount) ? pad(msg.amount.transfer.amount.replace('.', ''), 12) : pad(0, 12);
		req[18] = '0002';
    } 
    else {
        req[4] =  (msg.amount && msg.amount.transfer && msg.amount.transfer.amount) ? pad(msg.amount.transfer.amount.replace('.', '')+'00', 12) : pad(0, 12);
		req[18] = '0000';
    } 
    
    req[7] =  processDate() + processTime();
    req[11] = genRRN(msg.transferId);
    req[12] = processTime();
    req[13] = processDate();
    req[32] = decrypt('a password', msg.udfAcquirer.pan, 'hex',msg.udfAcquirer.cipher).substring(0,6);
    //req[35] = decrypt('a password', msg.udfAcquirer.track2 || msg.udfAcquirer.track2EquivalentData , 'ascii',msg.udfAcquirer.cipher);
    req[37] = pad(genRRN(msg.transferId), 12);
    req[41] = msg.udfAcquirer.terminalId;//Get the terminal id from the system
    if(msg.udfAcquirer.merchantId){        
        req[42] = msg.udfAcquirer.merchantId ;
    }
    req[43] = msg.udfAcquirer.terminalName; //Get the branch from the system
    req[49] = msg.transferCurrency=='USD'? '840' :'430'; //Get the currency to use
    if (msg.channelType === 'dhi') {
        req[71] = '1002'; // MasterCard issued by IBL !!! handle this
    } else if (msg.udfAcquirer.flow === 'externalNi' || msg.udfAcquirer.cardFlow === 'externalNi') {
        req[71] = '1003'; // Not IBL MasterCard
    }
    req[102] = msg.sourceAccount;
    if (msg.udfAcquirer.flow === 'externalNi' || msg.udfAcquirer.cardFlow === 'externalNi') { 
        if (msg.channelType === 'atm') {
            req[102] = msg.settlementAccountMC;
        } else {
            let settlementAccount = msg.split.filter(x=> x.description.includes(msg.transferCurrency)).pop()
            req[102]  = settlementAccount && settlementAccount.debit;
        }
    }
    if (msg.transferType == 'transfer' || msg.transferType == 'transferOtp') {
        req[103] = msg.destinationAccount
    } else if (msg.transferType == 'topup') {
        req[103] = bus.config.tss.airtimeSuspenseAccount;
    } else if (msg.transferType == 'deposit') {
        req[103] =  msg.sourceAccount;
        delete req[102];
    }
   
    req.$$ = {};
    req.mtid = '0200';
    sequence++; req.trace = sequence;
    tracer[req[11]] = {
        callback: $meta.callback,
        mobileNumber: msg.mobileNumber
    };
    return req;

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
    });

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
    return receiptData.toString().replace(',', '');
}

function dateConvert(date) {
    return date.substring(6, 8) + '-' + date.substring(4, 6) + '-' + date.substring(0, 4)
}

function getBalanceData(balanceString) {
    let legbal = (parseFloat(balanceString.substring(8, 20)) > 0 ? parseFloat(balanceString.substring(8, 20)) / 100 : 0).toString();
    let availbal = (parseFloat(balanceString.substring(28, 40)) > 0 ? parseFloat(balanceString.substring(28, 40)) / 100 : 0).toString();
    var balance = {
        ledger: { amount: legbal },
        available: { amount: availbal }
    }

    return balance;
}

module.exports = {
    id: 'tss',
    type: 'tcp',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    namespace: ['tss/transfer'],
    format: {
        size: '16/integer',
        codec: require('ut-codec-iso8583'),
        version: 0,
        baseEncoding: 'ascii'
    },
    start: function () {
        if (!this.config.host) {
            throw Error('TSS host IP not configured');
        }
    },
    'transfer.push.execute.request.send': function (msg, $meta) {
        var request = genRequest(msg, $meta, this.bus);
        request.iso = msg.udfAcquirer.iso;
        return request;
    },
    'transfer.push.confirm.request.send': function (msg, $meta) {
        const account = msg.transferCurrency === 'USD' ? 'MCaccountUSD' : 'MCaccountLRD';
        return this.bus.importMethod('db/core.configuration.fetch')({
            key: account},
            {auth: {actorId: 1001}}
            // {auth: {actorId: msg.channelId}}
        )
        .then(result => {
            msg.settlementAccountMC = result[0][0] && result[0][0].value;
            return genRequest(msg, $meta, this.bus);
        })
        .catch(e => {
            return e;
        })
    },
    'transfer.push.execute.error.receive': function(msg,$meta){
        processIsoError(msg,$meta);
    },
    'transfer.push.execute.response.receive': function (msg, $meta) {
        $meta.callback = tracer[parseInt(msg[11])].callback;
        var mobileNumber = tracer[parseInt(msg[11])].mobileNumber;
        delete tracer[msg[11]];       
        let balance = {};
        let ministatement = {};
        balance = {
            ledger: "",
            available: ""            
        }
        if (msg[3] == '381000') {
            ministatement = {
                statement: {
                    receiptLines: ministatFormatReceipt(msg[121]),
                    lines: ministatFormat(msg[121]),
                    rawStatement: msg[121]
                }
            },
                balance = msg[54] && getBalanceData(msg[54]);
        }

        if (msg[3] == opcode['balance'] || msg[3] == opcode['transfer'] || msg[3] == opcode['transferOtp'] || msg[3] == opcode['withdraw']) {
            balance = msg[54] && getBalanceData(msg[54]);
        }
        //Send sendSMS..... TO DO, get the customer's mobile number
       /* if (msg[3] == opcode['withdraw']) {
            sendSMS({ txType: 'withdraw', recipient: mobileNumber, accountnumber: msg[102], amount: msg[4], datetime: new Date(), balance: balance.ledger.amount }, this.bus, $meta)
        }
        else if (msg[3] == opcode['transfer']) {
            sendSMS({ txType: 'transfer', recipient: mobileNumber, accountnumber: msg[102], amount: msg[4], datetime: new Date(), balance: balance.ledger.amount }, this.bus, $meta)
        }*///BH** no - sms ...
            balance = balance || {};
            balance.rrn  =  msg[37];
            balance.stan = msg[11];
            balance.authId = msg[38];
            balance.cardNumber = msg[2].substring(msg[2].length-4);
            balance.currency = getAlpha(msg[49]);
        return { balance, ministatement }
    },
    'transfer.push.reverse.request.send': function (msg, $meta) {
        var request = genReversalRequest(msg, $meta, this.bus);
        request.headers = {
            SOAPAction: 'http://tempuri.org/IACCUTWS/WSPTENQLOCTRANSACTION'
        };
        return request;
    },
    'transfer.push.reverse.response.receive': function (msg, $meta) {
        $meta.callback = tracer[parseInt(msg[11])].callback;
        return {balance: '00000000'};
    },
    'transfer.push.reverse.error.receive': processIsoError
    ,
    'hooks': {
        'testConnection.request.send': function (msg, $meta) {
            return {
                service: msg.service,
                host: msg.url,
                port: msg.port,
                secure: msg.secure,
                auth: {
                    user: msg.username,
                    pass: msg.password
                },
                from: msg.username,
                to: msg.username,
                subject: 'Test connection',
                text: 'Test connection',
                html: '<b>Test connection</b>'
            };
        },
        'testConnection.response.receive': function (msg, $meta) {
            if (msg.messageId) {
                return { success: true };
            } else {
                return { success: false };
            }
        },
    },
    receive: function(msg, $meta) {
        if ($meta.mtid === 'notification')
        {
            return  msg;
        }
        
        if ($meta.method.slice(0,4) === '0210' || $meta.method.slice(0,4) === '0110' || $meta.method.slice(0,4) === '0230'){
             return Promise.resolve()
            .then(() => this.config[`transfer.push.execute.${$meta.mtid}.receive`](msg, $meta))
            .catch(e => {
                e.iserror = true;
                throw e;
            });
        } 
        else if ($meta.method.slice(0,4) === '0430' || ($meta.method.slice(0,4) === '0430')) {
            return Promise.resolve()
            .then(() =>this.config[`transfer.push.reverse.${$meta.mtid}.receive`](msg, $meta))
            .catch(e => {
                e.iserror = true;
                throw e;
            });
        } else {
            return msg;
        }
    },
    send:function(msg,$meta){
        return msg;
    }
};
