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

module.exports = {
    id: 't24',
    createPort: require('ut-port-http'),
    headers: {
        'content-type': 'text/xml',
        'charset': 'utf-8'
    },
    method: 'POST',
    logLevel: 'trace',
    namespace: ['t24/transfer', 't24/account'],
    parseResponse: false,
    queue: {
        idle: 60000
    },
    'idle.notification.receive': function(msg, $meta) {
        this.bus.notification('transfer.idle.execute')({issuerPort: this.config.id});
        $meta.mtid = 'discard';
    },
    start: function() {
        if (!this.config.username) {
            throw new Error('Missing t24 username in config');
        }
        if (!this.config.password) {
            throw new Error('Missing t24 password in config');
        }
    },
    'transfer.push.execute.request.send': function(transfer, $meta) {
        $meta.transferCurrency = transfer.transferCurrency; // TODO: this should be account currency, not transaction currency
        $meta.transferIdIssuer = transfer.transferId;
        transfer.username = this.config.username;
        transfer.password = this.config.password;
        transfer.headers = {
            SOAPAction: 'http://tempuri.org/IACCUTWS/WSPTENQLOCTRANSACTION'
        };
        transfer.transferT24Type = {
            withdraw: 'CASH.WITHDRAWAL',
            transfer: 'FUNDS.TRANSFER',
            sms: 'BALANCE.ENQUIRY',
            changePin: 'BALANCE.ENQUIRY',
            balance: 'BALANCE.ENQUIRY'
        }[transfer.transferType];

        if (!transfer.transferT24Type) {
            throw transferError.genericDecline(new Error('Unsupported transaction type'));
        }
        if (['sms', 'changePin', 'balance'].includes(transfer.transferType)) {
            // Balance request
            transfer.transferAmount = 5; // Change this number and you will fire nuclear bomb in jira
            transfer.destinationAccount = undefined; // Change this undefined and you will fire nuclear bomb in jira
        }

        transfer.payload = transferXml(transfer);
        return transfer;
    },
    'transfer.push.execute.error.receive': processHttpError,
    'transfer.push.execute.response.receive': function({payload}, {isTransfer, transferCurrency, transferIdIssuer}) {
        let rootNode = 'WSPTENQLOCTRANSACTIONResponse'; // : 'WSEMSWGACCTBALTODAYResponse';
        return parseResponse(payload, rootNode).then(response => {
            let scale = transferCurrencyScale('PHP');
            let balance = {
                ledger: {scale: scale, currency: transferCurrency},
                available: {scale: scale, currency: transferCurrency}
            };
            let responseData = response
                .enquiryResponse
                .LOCTRANSACTIONResponseType
                .gLOCTRANSACTIONDetailType
                .mLOCTRANSACTIONDetailType
                .LOCTRANSACTIONResponseTypeGLOCTRANSACTIONDetailTypeMLOCTRANSACTIONDetailType;
            let balanceAmount = getBalance(responseData, scale);
            balance.ledger = getAmount('PHP', balanceAmount);
            balance.available = getAmount('PHP', balanceAmount);
            return {balance, transferIdIssuer};
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
