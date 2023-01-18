// http://192.168.132.74:8180/ACCU_TWS_EE/services
// http://192.168.132.74:8180/ACCU_TWS_EE/services?wsdl
// http://192.168.50.54:9080/ACCU_TWS_EE/services
'use strict';
const transferError = require('ut-transfer/errors');
const transferCurrencyScale = require('ut-transfer/currency').scale;
const getAmount = require('ut-transfer/currency').amount;
const parseXmlString = require('xml2js').parseString;
const stripPrefix = require('xml2js').processors.stripPrefix;
const transferXml = require('./transferXml');
const reverseXml = require('./reverseXml');

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

function getHeaders(config, msg) {
    var authentication = new Buffer(config.username + ":" + config.password).toString('base64');
    msg.headers = { 'Authorization': 'Basic ' + authentication };
    return msg;
}

function dateConvert(date) {
    date = date.split('-');
    return date[0] + monthName[date[1]];
}

module.exports = {
    id: 'mambu',
    createPort: require('ut-port-http'),
    method: 'GET',
    logLevel: 'trace',
    namespace: ['mambu/transfer', 'mambu/account', 'mambu/branches','mambu/customers'],
    parseResponse: false,
    queue: {
        idle: 60000
    },
    'idle.notification.receive': function (msg, $meta) {
        this.bus.notification('transfer.idle.execute')({ issuerPort: this.config.id });
        $meta.mtid = 'discard';
    },
    start: function () {
        if (!this.config.username) {
            throw new Error('Missing mambu username in config');
        }
        if (!this.config.password) {
            throw new Error('Missing mambu password in config');
        }
    },
    'transfer.push.execute.request.send': function (transfer, $meta) {
        $meta.transferCurrency = transfer.transferCurrency; // TODO: this should be account currency, not transaction currency
        $meta.transferIdIssuer = transfer.transferId;
        transfer.headers = getHeaders(this.config, transfer);
        this.config.uri = '';
        if (transfer.transferType == 'balance') {
            this.config.uri = transfer.sourceAccount;
        } else if (transfer.transferType == 'ministatement') {
            this.config.uri = transfer.sourceAccount + '/transactions?offset=0&limit=5';
        }

        if (!transfer.transferType) {
            throw transferError.genericDecline(new Error('Unsupported transaction type'));
        }
        if (['sms', 'changePin', 'balance'].includes(transfer.transferType)) {
            // Balance request
            transfer.transferAmount = 5; // Change this number and you will fire nuclear bomb in jira
            transfer.destinationAccount = undefined; // Change this undefined and you will fire another nuclear bomb in jira
        }
        return transfer;
    },
    'branches.get': function (msg, $meta) {
        console.log('processing branches');
        
        msg.headers = getHeaders(this.config, msg);
        console.log(msg);
        console.log(this.config.uri);
        console.log(this.config.url);
        this.config.uri = '/branches?limit=100&offset=0';
        return msg;
    },
    'branches.get.response.receive': function (payload) {
        console.log('got response');
        return payload;
    },
    'transfer.push.execute.error.receive': processHttpError,
    'transfer.push.execute.response.receive': function ({payload}, {isTransfer, transferCurrency, transferIdIssuer}) {
        var results = JSON.parse(payload);
        let balance = {
            ledger: "",
            available: "",
        }
        let ministatement = {
            statement: {
                receiptLines: "",
                lines: ""
            }
        }
        if (Array.isArray(results)) {
            balance.ledger = getAmount(transferCurrency, results[0].balance);
            balance.available = getAmount(transferCurrency, results[0].balance);
            ministatement.statement.lines = results.reduce(function (prev, curr) {
                prev = `${prev + dateConvert(curr.creationDate).toString()}` +
                    "       " +
                    `${(curr.amount.indexOf("-") != -1 ? "DR" : "CR")}` +
                    "          " +
                    `${curr.amount.toString()} \u000d`;
                return prev;
            }, "");
            ministatement.statement.receiptLines = results.reduce(function (prev, curr) {
                prev = `${prev + dateConvert(curr.creationDate).toString() + " \t" + (curr.amount.indexOf("-") != -1 ? "DR" : "CR") + " \t" + curr.amount.toString()} \n`;
                return prev;
            }, "");
            return { balance, ministatement, transferIdIssuer };
        } else {
            balance.ledger = getAmount(transferCurrency, results.balance);
            balance.available = getAmount(transferCurrency, results.balance);
            return { balance, transferIdIssuer };
        }
    },
    'transfer.push.reverse.request.send': function (msg, $meta) {
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
    'transfer.push.reverse.response.receive': function ({payload}) {
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
            return { balance: balanceAmount.amount };
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
    'transfer.push.reverse.error.receive': processHttpError,
    'cms.request.send':function(msg){
        msg.headers = getHeaders(this.config, msg);
        return msg;
    },
    'cms.response.receive':function(msg){
        return msg.payload;
    }
};
