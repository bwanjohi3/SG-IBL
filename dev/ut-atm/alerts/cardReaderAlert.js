'use strict';
module.exports = (msg) => {
    return [
        '======== Transaction data ========',
        `Trans#:${msg.session.transferId || ''}`,
        `Card  :${msg.session.cardNumber || ''}`,
        '======== Transaction status ========',
        msg.deviceStatusDescription || '',
        `M-Status:${(msg.diagnosticStatus || '').substr(0, 2)}`,
        `M-Data:${(msg.diagnosticStatus || '').substr(3)}`,
        '',
        '======== Device status ========',
        msg.severities[0] || '',
        '',
        '======== Diagnostic status ========',
        msg.diagnosticStatus || '',
        '',
        '======== Supplies status ========',
        msg.supplies[0] || ''
    ].join('<br/>');
};
