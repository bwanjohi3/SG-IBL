'use strict';
module.exports = (msg) => {
    return [
        '======== Transaction data ========',
        `Trans#:${msg.session.transferId || ''}`,
        `Card  :${msg.session.cardNumber || ''}`,
        '======== Transaction status ========',
        msg.deviceStatus || '',
        '',
        '======== Device status ========',
        (msg.severities || []).join('<br/>'),
        '',
        '======== Diagnostic status ========',
        msg.diagnosticStatus || '',
        '',
        '======== Supplies status ========',
        (msg.supplies || []).join('<br/>')
    ].join('<br/>');
};
