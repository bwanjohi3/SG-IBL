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


const formatTranLine = (line) => {
    let aLine = line.transferId + ' ' +  line.tranTime.slice(0,5) + ' ' + ('             ' + parseFloat(line.transferAmount).toFixed(2)).slice(-13) + ' ' + line.transferCurrency + '\n' + line.description.toUpperCase() + '\n';
    return aLine;
}

const formatSummaryLine = (line) => {
    let aLine = line.description.toUpperCase() + '(' + line.countOfType +')\n' + (' '.repeat(30) + parseFloat(line.totalAmount).toFixed(2)).slice(-25) + ' ' + line.transferCurrency + '\n';
    return aLine;
}

const formatLine = (line) => {
    let trnDate = line[0];
    let description =line[1];
    let amount = ('             ' + parseFloat(line[2]).toFixed(2)).slice(-13);

    return trnDate + '   ' + description + '  ' + amount;
}


module.exports = (params, msg) =>
{
let tranLines = msg.detailTranReport.map(ln => formatTranLine(ln)).join('');
let summaryLines = msg.summaryTranReport.map(ln => formatSummaryLine(ln)).join('');
let dateTime = msg[13].substr(2,2) + '/'+ msg[13].substr(0,2) + '/' + new Date().getFullYear() + ' ' + msg[12].substr(0,2) + ':' + msg[12].substr(2,2);
let reportDate = msg.startDate.substr(4,2) +'-' + msg.startDate.substr(2,2) + '-20' + msg.startDate.substr(0,2);
let header = generateHeader(params, msg);
let footer = generateFooter(params, msg);
return [
`${header}
TerminalID: ${msg[41]}
Merchant Name: ${msg.session.organizationName}
DateTime: ${dateTime}

${BOL}${reportDate} Transaction Report ${NOR} \n
ID   Time  Amount
${tranLines}

Type Count  Amount
${summaryLines}\n
${footer}\n\n
`][0].toString();
}
