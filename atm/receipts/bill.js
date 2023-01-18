'use strict';
const {formatDateTime, formatAmount} = require('./utils');

module.exports = (params, transfer) =>
`BILL PAYMENT
LOCATION: ${(params.session && params.session.terminalName) || ''}
TRANSACTION #: ${transfer.transferId || ''}
AMOUNT : ${formatAmount(transfer.amount.transfer)}
APPROVAL CODE: ${transfer.transferIdIsssuer || ''}
AVAILABLE BALANCE: ${formatAmount(transfer.balance && transfer.balance.available)}
DATE: ${formatDateTime(transfer.localDateTime)}
${params.voucher || ''}`;
