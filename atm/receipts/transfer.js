'use strict';
const {formatDateTime, formatAmount, rightAlign} = require('./utils');

module.exports = (params, transfer) =>
`           IBL

         TRANSACTION RECORD

 DATE        TIME       LOCATION
 ${formatDateTime(transfer.localDateTime)}   ${params.session && (params.session.terminalName || '')}
 
 TRANSACTION            AMOUNT
 TRANSFER               ${formatAmount(transfer.amount.transfer)}

 CURRENT BALANCE    AVAILABLE BALANCE
 ${rightAlign(formatAmount(transfer.balance.ledger), 15)}    ${rightAlign(formatAmount(transfer.balance.available), 17)}

 TRACE NUMBER
 ${rightAlign((transfer.transferId || '').toString(), 15)}

 APPLICATION ID     xxxxxx
 APPLICATION LABEL  xxxxxx

`;
