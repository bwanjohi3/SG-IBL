'use strict';
const {formatDateTime} = require('./utils');

module.exports = (params, transfer) =>
`       ATM AUDIT REPORT

ATM: ${(params.session && params.session.terminalName) || ''}
DATE: ${formatDateTime(transfer.localDateTime)}

LAST TX#: ${params.lastTxId || ''}
TRANSACTIONS COUNT: ${params.txCount || ''}
CAPTURED CARDS: ${params.capCard || ''}

NOTES       CAS1  CAS2  CAS3  CAS4
DISPENSED: ${params.Disp1.substring(0, 5) || ''} ${params.Disp2.substring(0, 5) || ''} ${params.Disp3.substring(0, 5) || ''} ${params.Disp4.substring(0, 5) || ''}
REJECTED : ${params.Rej1.substring(0, 5) || ''} ${params.Rej2.substring(0, 5) || ''} ${params.Rej3.substring(0, 5) || ''} ${params.Rej4.substring(0, 5) || ''}
AVAILABLE: ${params.Avail1.substring(0, 5) || ''} ${params.Avail2.substring(0, 5) || ''} ${params.Avail3.substring(0, 5) || ''} ${params.Avail4.substring(0, 5) || ''}`;
