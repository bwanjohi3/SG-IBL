'use strict';
const {formatDateTime, formatAmount} = require('./utils');

module.exports = (params, transfer) =>
`CARDLESS TRANSFER
LOCATION: ${(params.session && params.session.terminalName) || ''}
CARD: ${transfer.cardNumber || ''}
TRANSACTION #: ${transfer.transferId || ''}
AMOUNT : ${formatAmount(transfer.amount.transfer)}
APPROVAL CODE: ${transfer.transferIdIsssuer || ''}
DATE: ${formatDateTime(transfer.localDateTime)}
SECURITY CODE: ${params.code || ''}`;
