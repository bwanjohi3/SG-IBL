'use strict';
const {formatDateTime, rightAlign} = require('./utils');

module.exports = (params, transfer) =>
`           IBL

         TRANSACTION RECORD

 DATE        TIME       LOCATION
 ${formatDateTime(transfer.localDateTime)}   ${params.session && (params.session.terminalName || '')}
 
 TRANSACTION            AMOUNT
 PIN CHANGE             0.00

 TRACE NUMBER
 ${rightAlign((transfer.transferId || '').toString(), 15)}

`;
