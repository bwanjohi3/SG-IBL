'use strict';
const {formatDateTime, formatAmount, rightAlign} = require('./utils');

module.exports = (params, transfer) =>
`           IBL

         TRANSACTION RECORD

 DATE        TIME       LOCATION
 ${formatDateTime(transfer.localDateTime)}   ${params.session && (params.session.terminalName || '')}

 TRANSACTION            AMOUNT
 FAST CASH              ${formatAmount(transfer.amount.transfer)}

 CURRENT BALANCE    AVAILABLE BALANCE
 ${rightAlign(formatAmount(transfer.balance.ledger), 15)}    ${rightAlign(formatAmount(transfer.balance.available), 17)}

 TRACE NUMBER
 ${rightAlign((transfer.transferId || '').toString(), 15)}

 STAN  ${transfer.balance.stan} 
 CARD NUMBER  ${transfer.balance.cardNumber}
 AUTHORIZATION ID ${transfer.balance.authId}


`;
