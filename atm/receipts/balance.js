'use strict';
const {formatDateTime, formatAmount, rightAlign, serNum} = require('./utils');

module.exports = (params, transfer) =>
`           IBL
        BALANCE ENQUIRY

 DATE        TIME       SEQ#
 ${formatDateTime(transfer.localDateTime)}   ${params.session && (serNum(transfer) || '')}
 =======================================
 Card #:${params.cardMasked}

 Avail. Balance:   ${formatAmount(transfer.balance.available)}

 =======================================

 ATM ID: ${params.session && (params.session.terminalName || '')}
 Transaction #:${(transfer.transferId || '').toString()}
 Receipt #:${(transfer.transferId || '').toString()}

 STAN  ${transfer.balance.stan} 
 CARD NUMBER  ${transfer.balance.cardNumber}
 AUTHORIZATION ID ${transfer.balance.authId}

        Thank you for using our ATM!

`;
