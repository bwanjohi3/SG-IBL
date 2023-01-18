'use strict';
const {formatDateTime, serNum, formatAmount} = require('./utils');

module.exports = (params, transfer) =>
`${transfer.description || ''}

DATE       TIME       SEQ#
${formatDateTime(transfer.localDateTime)}   ${serNum(transfer)}

CARD: ${transfer.cardNumber || ''}
ACCOUNT: ${transfer.sourceAccountName || ''}

ATM ID: ${(params.session && params.session.terminalName) || ''}
TRANSACTION#: ${transfer.transferId || ''}
RECEIPT#: ${transfer.transferIdIssuer || ''}

AMOUNT: VT ${formatAmount(transfer.amount.transfer)}
AVAILABLE: VT ${formatAmount(transfer.balance && transfer.balance.available)}`;
