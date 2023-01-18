const transferError = require('ut-transfer/errors');
const transferCurrencyScale = require('ut-transfer/currency').scale;
const getAmount = require('ut-transfer/currency').amount;
const parseXmlString = require('xml2js').parseString;
const stripPrefix = require('xml2js').processors.stripPrefix;
var bcd = require('bcd');
var sequence = 0;
var tracer = [];
const crypto = require('crypto');
let bus;

function processHttpError(msg, $meta) {
    if (msg.cause && msg.cause.errno === 'ESOCKETTIMEDOUT') {
        throw transferError.unknown(msg);
    } else {
        $meta.callback = tracer[parseInt(msg[11])].callback;
        delete tracer[msg[11]];
        throw transferError.genericDecline(msg);
    }
}

function decrypt(key, value, clearFormat, cipherName) {
    var decipher = crypto.createDecipher(cipherName || 'aes128', key);
    return decipher.update(value, 'hex', clearFormat || 'hex').toUpperCase() + decipher.final(clearFormat || 'hex').toUpperCase();
}
//CBL will handle balance enquiry, withdrawal and transfer. 
//Format of proccode-> 1-2, trans type, 3-4 -> debit account type, 5-6 -> credit account
//01- withdrawal, 31 balance enquiry, 40 funds transfer
//00-default account, 10-savings account, 20 current account or checking account, 30 credit account, 40 universal account
var opcode = {
    'balanceAcq': '31',
    'withdrawAcq': '01',
    'transferAcq': '40'
}

var sourceaccountcode = {
    'number:all': '00',
    'number:savings': '10',
    'number:current': '20'
}
function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
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
//     }
	
// 	return rrn;
// }
function genRRN(rrn) {
    return ((parseInt(rrn) % 900000 + 100000)).toString();
}

function getPointOfServiceCode(msg) {
    //N/B.. Should have a method to derive the codes from message sent by ATM
    var arr = [];
    arr.push('5');//Indicates the primary means of getting information on the card into the terminal - 5 is ICC
    arr.push('1');//Indicates the primary means of verifying the cardholder at this terminal - 1 PIN
    arr.push('1');//Indicates whether the terminal has the ability to capture a card
    arr.push('1');//Indicates whether the terminal is attended by the card acceptor and location - 1-> on premises of card acceptor, attended
    arr.push('0');//Indicates if the cardholder is present at the point of service  - 0 card holder present
    arr.push('1');//Indicates if the card is present at the point of service - 1 card present
    arr.push('5');//Indicates method used to input the information from the card to the terminal.- 5 ICC
    arr.push('1');//Method of verifying card holder 1 is PIN
    arr.push('1');//Entity verifying the card holder - 1 is ICC
    arr.push('1');//Ability of terminal to update card - 1 is none
    arr.push('4');//Ability of terminal to print/display messages 4 is printing and display
    arr.push('7');//Lenth of PIN the terminal can capture - 7 is seven digits
    return arr.join('');

}

//Generate acquirerFee 

function createTransfer(msg, $meta, config) {
    var tType = 'acquiringFee'
    var postobject = {
        transferType: tType,
        retrievalReferenceNumber: '',//CBL transaction Number
        terminalId: '12344',//send correct terminalID
        channelType: 'atm',
        channelId: '',
        cardId: '',
        sourceAccount: config.cblaccount,
        transferAmount: 50,//parameterize this
        destinationAccount: config.iblincomeaccount,
        localDateTime: new Date(),
        transferDateTime: new Date(),
        issuerId: 'tss',
        ledgerId: 'tss',
        description: 'This is the acquirer fee for transaction - '
    }
    postobject.amount = { transfer: { amount: 50, currency: 'USD' } }
    return postobject;
};

function genRequest(msg, $meta, bus, config) {

    var req = {};
    var track2 = decrypt('a password', msg.udfAcquirer.track2, 'ascii', msg.udfAcquirer.cipher);
    track2 = track2 ? track2.replace(';', '').replace('?', '') : '';
    req.MTI = '1200';
    req[2] = decrypt('a password', msg.udfAcquirer.pan, 'hex', msg.udfAcquirer.cipher);
    req[3] = opcode[msg.transferType].concat('00').concat('00');//NB, for IFT, send the correct accounttype in destination account
    req[4] = msg.amount.transfer.amount ? pad(msg.amount.transfer.amount.replace('.', ''), 12) : 0;
    req[7] = processDate('short') + processTime();
    req[11] = genRRN(msg.transferId);
    req[12] = processDate('long') + processTime();
    req[15] = '20190702';//processDate('long');
    req[18] = '6011';//merchant type n-4 mandatory - Always 0000 for ATM transactions
    req[19] = '430';
    req[22] = '511101200140'; getPointOfServiceCode(msg);//point of service code n-12 mandatory
    req[24] = '200';//function code n-3 mandatory
    req[26] = '6011';//card acceptor business code n-4 mandatory
    req[32] = '91323900000';
    req[35] = track2;
    req[37] = pad(genRRN(msg.transferId), 12);//an-12 retrieval reference number mandatory
    req[41] = msg.udfAcquirer.terminalId;//Get the terminal id from the system
    req[42] = '1231000753033';
    req[43] = msg.udfAcquirer.terminalName; //Get the branch from the system
    req[49] = msg.transferCurrency == 'USD' ? '840' : '840'; //Get the currency to use
    req[52] = msg.pinBlock; //pinblock data
    req[55] = msg.udfAcquirer.emvTags;
    req[60] = '01234567+0003456'; //private data
    //req[52] = msg.transferCurrency=='USD'? '998' :'430'; //Get the currency to use
    req.$$ = {};
    req.mtid = '1200';
    sequence++; req.trace = sequence;
    tracer[req[11]] = {
        callback: $meta.callback
    };
    let _meta = $meta;

        return bus.importMethod('hsm.translateTpkZpk')({
            sourceTpk: msg.tpk,
            destinationZpk: config.destinationZpkAcquiring,
            maximumPinLength: config.maximumPinLength,
            sourcePinBlock: msg.pinBlock,
            sourcePinBlockFormat: config.sourcePinBlockFormat,
            destinationPinBlockFormat: config.destinationPinBlockFormat,
            card: req[2]
        }).then(data => {
            $meta = _meta;
            req[52] = data? data.pinBlock : msg.pinBlock;//translated pinblock
            return req;
        });
	//return req;

}

function getBalanceData(balanceString) {
    let legbal = (parseFloat(balanceString.substring(8, 20)) > 0 ? parseFloat(balanceString.substring(8, 20)) / 100 : 0).toString();
    let availbal = (parseFloat(balanceString.substring(8, 20)) > 0 ? parseFloat(balanceString.substring(8, 20)) / 100 : 0).toString();
    var balance = {
        ledger: { amount: legbal },
        available: { amount: availbal }
    }

    return balance;
}



function ministatFormat(msg) {
    var rows = msg.split('~');
    var ministatData = rows.map((line) => {
        var splitLine = line.split('|');
        var formattedLine = `${dateConvert(splitLine[0]).toString()}` +
            "       " +
            `${splitLine[2]}` +
            "          " +
            `${(parseFloat(splitLine[3])).toString()} \u000d`;
        return formattedLine;
    })

    return ministatData;
}

function ministatFormatReceipt(msg) {
    var rows = msg.split('~');
    var receiptData = rows.map((line) => {
        var splitLine = line.split('|');
        var formattedLine = `${dateConvert(splitLine[0]).toString() + " \t" + splitLine[2] + " \t" + (parseFloat(splitLine[3])).toString()} \n`;
        return formattedLine;
    })
    return receiptData;
}

function dateConvert(date) {
    return date.substring(6, 8) + '-' + date.substring(4, 6) + '-' + date.substring(0, 4)
}

module.exports = {
    id: 'cbl',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    namespace: ['cbl/transfer'],
    listen: false,
    //socketTimeOut: 10000,//how much time to wait without communication until closing connection, defaults to "forever"
    format: {
        size: '16/integer',
        codec: require('ut-codec-iso8583'),
        version: 1,
        baseEncoding: 'ascii'
    },
    start: function () {
        if (!this.config.host) {
            throw Error('TSS host IP not configured');
        }
        bus = this.bus;
    },
    'transfer.push.execute.request.send': function (msg, $meta) {
        /*let transferFee = createTransfer(msg, $meta, this.config);
        let _meta = $meta
        let _msg = msg
        $meta.method='db/transfer.push.execute';
        return bus.importMethod('db/transfer.push.execute')(transferFee).then(response => { 
            $meta=_meta;
            return genRequest(_msg, $meta, this.bus, this.config)
        });*/
        var pan =  decrypt('a password', msg.udfAcquirer.pan, 'hex', msg.udfAcquirer.cipher);
        var allowedPans = ['4413220000167723','4445831866090346','4445831609224061','4445831551696530','4413220000167723','4588067501068887'];
        if(allowedPans.indexOf(pan)<0){
            throw Error('Pan is not allowed');
        }
        return genRequest(msg, $meta, this.bus, this.config)

    },
    'transfer.push.execute.error.receive': processHttpError,
    //'transfer.push.execute.response.receive': function (msg, $meta) {
    '1210.31.response.receive': function (msg, $meta) {
        //Post acquirer fee after successful CBL posting
        let transferFee = createTransfer(msg, $meta, this.config);
        bus.importMethod('db/transfer.push.execute')(transferFee).then(response => {
            $meta.callback = tracer[parseInt(msg[11])].callback;
            delete tracer[msg[11]];
            let balance = {};
            let ministatement = {};

            if (msg[54]) {
                balance = getBalanceData(msg[54]);
            }
            if (msg[3] == '381000') {
                ministatement = {
                    statement: {
                        receiptLines: ministatFormat(msg[121]),
                        lines: ministatFormatReceipt(msg[121])
                    }
                }
            }


            return { balance, ministatement }
        })

    },
    '1210.01.response.receive': function (msg, $meta) {
        $meta.callback = tracer[parseInt(msg[11])].callback;
        delete tracer[msg[11]];
        let balance = {};
        let ministatement = {};

        if (msg[54]) {
            balance = getBalanceData(msg[54]);
        }
        if (msg[3] == '381000') {
            ministatement = {
                statement: {
                    receiptLines: ministatFormat(msg[121]),
                    lines: ministatFormatReceipt(msg[121])
                }
            }
        }


        return { balance, ministatement }
    },

    '1800.response.send': function (msg, $meta) {
        msg[39] = '00';
        return msg;
    },
    '1800.request.receive': function (msg, $meta) {
        return msg;
    },
    '1814.response.send': function (msg, $meta) {
        msg[39] = '00';
        return msg;
    },
    '1814.request.receive': function (msg, $meta) {
        return msg;
    },
    '1804.response.send': function (msg, $meta) {
        msg[39] = '00';
        return msg;
    },
    '1804.request.receive': function (msg, $meta) {
        return msg;
    },
    '1804.801.response.send': function (msg, $meta) {
        msg[39] = '00';
        return msg;
    },
    '1804.801.request.receive': function (msg, $meta) {
        return msg;
    },
    '1824.response.send': function (msg, $meta) {
        msg[39] = '00';
        return msg;
    },
    '1824.request.receive': function (msg, $meta) {
        return msg;
    },
    /*'1834.response.send': function (msg, $meta) {
        msg[39]='000';
        return msg;
    },
    '1834.request.receive': function (msg, $meta) {
        //msg[39]='000';
        return msg;
    },*/
    receive:function(msg,$meta){
        return msg;
    },
    send:function(msg,$meta){
        return msg;
    },
    'transfer.push.reverse.request.send': function (msg, $meta) {
        return msg;
    },
    'transfer.push.reverse.response.receive': function ({ payload }) {
        return {};
    },
    'transfer.push.reverse.error.receive': processHttpError
};