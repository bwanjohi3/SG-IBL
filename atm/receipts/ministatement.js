'use strict';
const {formatDateTime, formatAmount, rightAlign, serNum} = require('./utils');

module.exports = (params, transfer) =>
`           IBL
        MINISTATEMENT
DATE        TIME       SEQ#
${formatDateTime(transfer.localDateTime)}   ${params.session && (serNum(transfer) || '')}
=======================================
Card #:${params.cardMasked.substring(params.length-4)}
DATE        DESCRIPTION       AMOUNT
${transfer.ministatement.statement.receiptLines}

Avail. Balance:   ${formatAmount(transfer.balance.available)}

=======================================
ATM ID: ${params.session && (params.session.terminalName || '')}
Transaction #:${(transfer.transferId || '').toString()}
Receipt #:${(transfer.transferId || '').toString()}

STAN  ${transfer.balance.stan} 
AUTHORIZATION ID ${transfer.balance.authId}
        Thank you for using our ATM!`;
