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
const {formatDateTime} = require('../utils');
const generateHeader = require('./header');
const generateFooter = require('./footer');
const get = (str, cur = []) => {
    if(str.length > 0) {
      var tmpstr = str.slice(0, 32).split(' ').filter((b) => b);
      cur.push(tmpstr);
      return get(str.slice(32), cur);
    }
    return cur;
  };

const formatLine = (line) => {
    let trnDate = line[0];
    let description =line[1];
    let amount = ('             ' + parseFloat(line[2]).toFixed(2)).slice(-13);

    return trnDate + '   ' + description + '  ' + amount;
}


module.exports = (params, transfer) =>
{
let aid = transfer.session.applicationIdentifierAIDCard ? transfer.session.applicationIdentifierAIDCard + '\n' + transfer.session.applicationLabel : '';
let ministatement = get(transfer.ministatement.statement.lines).map(it => formatLine(it) + '\n').join('');
let dateTime = transfer[13].substr(2,2) + '/'+ transfer[13].substr(0,2) + '/' + new Date().getFullYear() + ' ' + transfer[12].substr(0,2) + ':' + transfer[12].substr(2,2);
let header = generateHeader(params, transfer);
let footer = generateFooter(params, transfer);
ministatement = ministatement.split('\n').splice(1,5).join('\n');
return [
`${header}
TerminalID: ${transfer[41]}
Merchant Name: ${transfer.session.organizationName}
AID: ${aid}
Authcode: ${transfer.balance.authId}
DateTime: ${dateTime}
Account: **** **** **** ${transfer.balance.cardNumber}
RNN: ${transfer.balance.rrn}

${BOL}MINISTATEMENT ${NOR} \n

Date         Desc.      Amount
${ministatement}

Ledger Balance   : ${transfer.balance.ledger.amount } ${ transfer.balance.currency }
Avaliable Balance: ${transfer.balance.available.amount} ${transfer.balance.currency }\n
${footer}\n\n
`][0].toString();
}
