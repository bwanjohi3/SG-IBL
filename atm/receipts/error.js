'use strict';
const {formatDateTime, serNum} = require('./utils');

module.exports = (params, transfer) =>
`${transfer.description || ''}

ATM ID: ${(params.session && params.session.terminalName) || ''}

DATE       TIME       SEQ#
${formatDateTime(transfer.localDateTime)}   ${serNum(transfer)}

CARD: ${transfer.cardNumber || ''}

${transfer.transferIdIssuer || ''}
TRANSACTION#: ${transfer.transferId || ''}

TRANSACTION FAILED.
YOU MAY CONTACT ANY BRANCH FOR
FURTHER CLARIFICATIONS.`;
