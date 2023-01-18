const transferError = require('ut-transfer/errors');
const transferCurrencyScale = require('ut-transfer/currency').scale;
const getAmount = require('ut-transfer/currency').amount;
const parseXmlString = require('xml2js').parseString;
const stripPrefix = require('xml2js').processors.stripPrefix;
var sequence = 0;
var tracer = [];

function processHttpError(msg, $meta) {
    if (msg.cause && msg.cause.errno === 'ESOCKETTIMEDOUT') {
        throw transferError.unknown(msg);
    } else {
        $meta.callback = tracer[parseInt(msg[11])].callback;
        delete tracer[msg[11]];
        throw transferError.genericDecline(msg);
    }
}
var opcode = {
    'balance': '311000',
    'ministatement': '381000',
    'withdraw': '011000',
    'topup': '901000',
    'transfer': '401000'
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
            return `Dear Customer, Withdrawal of amount ${payload.amount} from account number ${payload.accountnumber} on ${payload.datetime} was successful. New account balance is ${payload.balance}`
        case 'transfer':
            return `Dear Customer, Transfer of amount ${payload.amount} from account number ${payload.accountnumber} on ${payload.datetime} was successful. New account balance is ${payload.balance}`
    }
}

function processDate() {
    var date = new Date();
    var formattedDate = ('0' + date.getDate()).slice(-2);
    var formattedMonth = ('0' + (date.getMonth() + 1)).slice(-2);
    return formattedMonth + formattedDate;
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
// }

function genRRN(rrn) {
    return ((parseInt(rrn) % 900000 + 100000)).toString();
}

function genRequest(msg, $meta, config) {
    var req = {};
    req.MTI = '0200';
    req[2] = '6369180162705520';
    req[3] = opcode[msg.transferType];
    req[4] = (msg.amount && msg.amount.transfer && msg.amount.transfer.amount) ? pad(msg.amount.transfer.amount.replace('.', '')+'00', 12) : pad(0, 12);//'000000005000';
    req[7] = processDate() + processTime();
    req[11] = genRRN(msg.transferId);
    req[12] = processTime();
    req[13] = processDate();
    req[32] = '636918';
    req[35] = '6369180162705520=1906500?';
    req[37] = pad(genRRN(msg.transferId), 12);
    req[41] = '10500001';
    req[43] = 'IBLHQ';
    req[49] = '430';
    req[102] = msg.sourceAccount;// get this account from DB
    if (msg.transferType == 'transfer' || msg.transferType == 'transferOtp') {
        req[103] = msg.destinationAccount
    } else if (msg.transferType == 'topup') {
        req[103] = config.airtimeSuspenseAccount;
    } else if (msg.transferType == 'deposit') {
        req[103] = config.airtimeSuspenseAccount;
        delete req[102];
    }
    req.$$ = {};
    req.mtid = '0200';
    sequence++; req.trace = sequence;
    tracer[req[11]] = {
        callback: $meta.callback
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
            var formattedLine = `${dateConvert(splitLine[0]).toString()}` +
                "    " +
                `${splitLine[2]}` +
                "             " +
                `${(parseFloat(splitLine[3])).toString()} \u001b`;
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
        var formattedLine = `${dateConvert(splitLine[0]).toString() + " \t" + splitLine[2] + " \t" + (parseFloat(splitLine[3])).toString()} \n`;
        return formattedLine;
    })
    return receiptData.toString();
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
    id: 'cblremote',
    type: 'tcp',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    namespace: ['cblremote/transfer'],
    listen: true,
    host: "127.0.0.1",
    port: 8083,
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
        return genRequest(msg, $meta, this.config);
    },
    'transfer.push.execute.error.receive': processHttpError,
    'transfer.push.execute.response.receive': function (msg, $meta) {

        $meta.callback = tracer[parseInt(msg[11])].callback;
        delete tracer[msg[11]];
        let balance = {};
        let ministatement = {};
        balance = {
            ledger: "",
            available: "",
        }
        if (msg[3] == '381000') {
            ministatement = {
                statement: {
                    receiptLines: ministatFormatReceipt(msg[121]),
                    lines: ministatFormat(msg[121])
                }
            },
                balance = getBalanceData(msg[54]);
        }

        if (msg[3] == opcode['balance'] || msg[3] == opcode['transfer'] || msg[3] == opcode['withdraw']) {
            balance = getBalanceData(msg[54]);
        }
        //Send sendSMS
        if (msg[3] == opcode['withdraw']) {
            sendSMS({ txType: 'withdraw', recipient: "254723120063", accountnumber: msg[102], amount: msg[4], datetime: new Date(), balance: balance.ledger.amount }, this.bus, $meta)
        }
        else if (msg[3] == opcode['transfer']) {
            sendSMS({ txType: 'transfer', recipient: "254723120063", accountnumber: msg[102], amount: msg[4], datetime: new Date(), balance: balance.ledger.amount }, this.bus, $meta)
        }
        return { balance, ministatement }
    },
    'transfer.push.reverse.request.send': function (msg, $meta) {
        msg.headers = {
            SOAPAction: 'http://tempuri.org/IACCUTWS/WSPTENQLOCTRANSACTION'
        };
        return msg;
    },
    'transfer.push.reverse.response.receive': function ({payload}) {
        return {};
    },
    'transfer.push.reverse.error.receive': processHttpError
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
        }
    }
};