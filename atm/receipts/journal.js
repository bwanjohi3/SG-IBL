'use strict';
const {serNum, formatAmount} = require('./utils');

module.exports = (params, transfer) =>
` *****START*****
 DATE/TIME : ${new Date(transfer.transferDateTime).toLocaleString('PH', {hour12: false})}
 SEQ NO    : ${serNum(transfer)}
 CARD NO   : ${transfer.cardNumber}
 FR ACCT   : ${transfer.sourceAccount}
 TRN TYPE  : ${params.txMode || ({
     'transfer': 'FUND TRANSFER',
     'pinChange': 'CHANGE PIN'
 }[params.txType]) || transfer.description.toUpperCase()}
 AMT AUTH  : ${formatAmount(transfer.amount.transfer)}
 SWCT DATE : ${new Date(transfer.transferDateTime).toLocaleDateString('PH')}
 ${params.txType === 'withdraw' ? `\n DISPENSED : 1:${params.type1Notes} 2:${params.type2Notes} 3:${params.type3Notes} 4:${params.type4Notes}` : ''}
 *****END*****

`;
