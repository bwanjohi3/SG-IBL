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
        msg.diagnosticStatus
    ].join('<br/>');
};
