'use strict';

const NOR = "\x1B\x21\x02";//CLEAR STYLE
const BOL = "\x1B\x21\x08";//BOLD
const DBX = "\x1B\x21\x20";//# Double width text
const DBY = "\x1B\x21\x10";//# Double height text
const DXY = "\x1B\x21\x30";//# Double height & Width
const ITA = "\x1B\x21\x80";
const ALL = "\x1B\x61\x00";//LEFT - DEFAULT
const ALC = "\x1B\x61\x01";//CENTER
const ALR = "\x1B\x61\x02";//RIGHT
const UTF8P = "\x1B\x75\x0F";
const {formatDateTime, formatAmount} = require('../utils');
const generateHeader = require('./header');
const generateFooter = require('./footer');
module.exports = (params, transfer) =>
{
let aid = transfer.session.applicationIdentifierAIDCard ? transfer.session.applicationIdentifierAIDCard + '\n' + transfer.session.applicationLabel : '';
let caschBack = transfer[54] && ('\nCashback Amount:' + (parseFloat(transfer[54]) / 100).toFixed(2).toString() + ' ' +  transfer.amount.transfer.currency);
let dateTime = transfer[13].substr(2,2) + '/'+ transfer[13].substr(0,2) + '/' + new Date().getFullYear() + ' ' + transfer[12].substr(0,2) + ':' + transfer[12].substr(2,2);
let header = generateHeader(params, transfer);
let footer = generateFooter(params, transfer);
return [
`${header}
TerminalID: ${transfer[41]}
Merchant Name: ${transfer.session.organizationName}
AID: ${aid}
Authcode: ${transfer[38] || transfer.balance.authId}
DateTime: ${dateTime}
Account: **** **** **** ${transfer.balance.cardNumber}
RNN: ${transfer.balance.rrn}

${BOL}POS PURCHASE${NOR} 

Transaction Amount: ${(parseFloat(transfer[4]) / 100).toFixed(2)}  ${transfer.amount.transfer.currency} ${caschBack ? caschBack : ''}

${footer}\n\n
`][0].toString();
}

/*return [
    `${UTF8P}${BOL}ячоШ !:)${NOR}
    TerminalID: ${transfer.udfAcquirer.terminalId}
    Merchant Name
    ${BOL}AuthCode${NOR}
    DateTime: ${formatDateTime(transfer.localDateTime)}
    Account Number: ${Array(transfer.sourceAccount.length - 3).join("*") + transfer.sourceAccount.substr(-3)}
    RNN: 1333
    Balance: ${transfer.balance.available.amount} ${transfer.balance.available.currency}
    ${BOL}BALANCE INQUERY${NOR} \n\n\n\n\n\n\n
    `][0].toString();
    }*/