'use strict';
const {formatDateTime, formatAmount} = require('./utils');

module.exports = (params, transfer) =>
`CARDLESS WITHDRAW
LOCATION: ${(params.session && params.session.terminalName) || ''}
TRANSACTION #: ${transfer.transferId || ''}
AMOUNT : ${formatAmount(transfer.amount.transfer)}
APPROVAL CODE: ${transfer.transferIdIsssuer || ''}
DATE: ${formatDateTime(transfer.localDateTime)}`;
