// http://192.168.132.74:8180/ACCU_TWS_EE/services
// http://192.168.132.74:8180/ACCU_TWS_EE/services?wsdl
// http://192.168.50.54:9080/ACCU_TWS_EE/services
'use strict';
const transferError = require('ut-transfer/errors');
const transferCurrencyScale = require('ut-transfer/currency').scale;
const getAmount = require('ut-transfer/currency').amount;
const parseXmlString = require('xml2js').parseString;
const stripPrefix = require('xml2js').processors.stripPrefix;
const withdrawJSON = require('./withdrawJSON');

var monthName = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
};

const xmlParserConfig = {
    tagNameProcessors: [stripPrefix],
    explicitArray: false
};

function parseResponse(payload, rootNode) {
    return new Promise((resolve, reject) => {
        parseXmlString(payload, xmlParserConfig, (err, json) => {
            if (err) {
                this.log.error && this.log.error(err);
                reject(transferError.unknown(err));
            } else {
                resolve(json.Envelope.Body[rootNode]);
            }
        });
    })
    .then(response => {
        let successIndicator = response.statusMessage.SuccessIndicatorValue;
        let statusMessages = response.statusMessage.Messages.string;

        if (successIndicator !== 'Success') {
            // In case of missing and/or invalid params in our request
            if (/Account not found \(.*\)/i.test(JSON.stringify(statusMessages))) {
                throw transferError.invalidAccount();
            }
            let error = new Error(JSON.stringify(statusMessages));
            error.code = -1;
            throw transferError.genericDecline(error);
        } else {
            return response;
        }
    });
}

function getBalance(resultset) {
    let code;
    let message;
    let balanceAmount;

    for (let i = 0, len = resultset.length; i < len; i++) {
        let resultPart = resultset[i];
        switch (resultPart.NAME) {
            case 'ret_code':
                code = resultPart.VALUE;
                break;
            case 'ret_msg':
                message = JSON.stringify(resultPart.VALUE);
                break;
            case 'balance':
                balanceAmount = resultPart.VALUE;
                // Balance is returned as '{accountNumber}={balanceAmount}'
                // Note: this pattern can occur more than once separated by space when more than one account is set in BALANCE param
                balanceAmount = balanceAmount.split('=')[1];
                break;
            default: // no op
                break;
        }
    }

    if (code !== '00') {
        let error = new Error(message);
        switch (code) {
            case '14':
                error = transferError.invalidAccount(error);
                break;
            case '25':
                error = transferError.notFound(error);
                break;
            case '51':
                error = transferError.insufficientFunds(error);
                break;
            default:
                error = transferError.genericDecline(error);
                break;
        }
        error.code = code;
        error.reason = message;
        throw error;
    }
    return balanceAmount;
}

function processHttpError(msg) {
    if (msg.cause && msg.cause.errno === 'ESOCKETTIMEDOUT') {
        throw transferError.unknown(msg);
    } else {
        throw transferError.genericDecline(msg);
    }
}

function getHeaders(config,msg){
    var authentication = new Buffer(config.username+":"+config.password).toString('base64');
    msg.headers = { 'Authorization': 'Basic '+authentication };
    return msg;
}

function dateConvert(date) {
    date = date.split('-');
    return date[0] + monthName[date[1]];
}

module.exports = {
    id: 'rmp',
    createPort: require('ut-port-http'),
    method: 'POST',
    logLevel: 'trace',
    namespace: ['rmp/transfer', 'rmp/account'],
    parseResponse: false,
    queue: {
        idle: 60000
    },
    'idle.notification.receive': function(msg, $meta) {
        this.bus.notification('transfer.idle.execute')({issuerPort: this.config.id});
        $meta.mtid = 'discard';
    },
    start: function() {},
    'transfer.push.execute.request.send': function(transfer, $meta) {
        $meta.transferCurrency = transfer.transferCurrency; // TODO: this should be account currency, not transaction currency
        $meta.transferIdIssuer = transfer.transferId;
        transfer.headers = { 'Content-Type': 'application/json' };

        if (!transfer.transferType) {
            throw transferError.genericDecline(new Error('Unsupported transaction type'));
        }

        if (!transfer.requestId) {
            transfer.requestId = Math.floor(Math.random() * (1000000 - 1 + 1)) + 1;
        }
            transfer.method = `SG_ATMWITHDRAWAL_BAYPORTCFCATM${transfer.udfAcquirer.terminalId}`;
            transfer.description = `ATM withdrawal from device ${transfer.udfAcquirer.terminalId}`;
            transfer.payload = withdrawJSON(transfer);
            return transfer;
    },
    'transfer.push.execute.error.receive': processHttpError,
    'transfer.push.execute.response.receive': function({payload}, {isTransfer, transferCurrency, transferIdIssuer}) {
        var results = JSON.parse(payload);
        let balance = {
            ledger : "",
            available : "",
        };
        let  amount = {
            transfer : ""
        }
            if(results && results.Done && results.Done.Mambu && results.Done.Mambu.returnCode == 200){
                balance.ledger = getAmount(transferCurrency, results.Done.Mambu.balance);
                balance.available = getAmount(transferCurrency, results.Done.Mambu.balance);
                return {balance, transferIdIssuer};
            }
    },
    'transfer.push.reverse.request.send': function(msg, $meta) {
        msg.headers = {
            SOAPAction: 'http://tempuri.org/IACCUTWS/WSPTENQLOCTRANSACTION'
        };
        msg.payload = reverseXml({
            transferId: msg.transferId,
            sourceAccount: msg.sourceAccount,
            user: this.config.username,
            pass: this.config.password
        });
        return msg;
    },
    'transfer.push.reverse.response.receive': function({payload}) {
        return parseResponse(payload, 'WSPTENQLOCTRANSACTIONResponse').then(response => {
            let balance = getBalance(
                response
                    .enquiryResponse
                    .LOCTRANSACTIONResponseType
                    .gLOCTRANSACTIONDetailType
                    .mLOCTRANSACTIONDetailType
                    .LOCTRANSACTIONResponseTypeGLOCTRANSACTIONDetailTypeMLOCTRANSACTIONDetailType
            );
            let balanceAmount = getAmount('PHP', balance.trim().replace(/,/g, ''));
            return {balance: balanceAmount.amount};
        })
        .catch(error => {
            if (error instanceof TypeError) {
                this.log.error && this.log.error(error);
                throw transferError.unknown(error);
            } else {
                throw error;
            }
        });
    },
    'transfer.push.reverse.error.receive': processHttpError
};
