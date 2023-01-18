'use strict';
module.exports = (msg) => {
    return [
        '======== Transaction data ========',
        `Trans#:${msg.session.transferId || ''}`,
        `Card  :${msg.session.cardNumber || ''}`,
        '======== Transaction status ========',
        msg.deviceStatusDescription || '',
        '',
        '======== Device status ========',
        msg.severities[0] || '',
        '',
        '======== Diagnostic status ========',
        msg.diagnosticStatus || '',
        '',
        '======== Supplies status ========',
        `Paper is ${msg.supplies[0] || ''}`,
        `Ribbon ${msg.supplies[1] || ''}`,
        `Print-head ${msg.supplies[2] || ''}`,
        `Knife ${msg.supplies[3] || ''}`
    ].join('<br/>');
};
