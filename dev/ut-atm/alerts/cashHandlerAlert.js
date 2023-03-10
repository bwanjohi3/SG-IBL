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
        '======== Notes ========',
        `notes of type1: ${msg.dispensed1 || ''}`,
        `notes of type2: ${msg.dispensed2 || ''}`,
        `notes of type3: ${msg.dispensed3 || ''}`,
        `notes of type4: ${msg.dispensed4 || ''}`,
        '',
        '======== Device status ========',
        `cash handler     : ${msg.severities[0] || ''}`,
        `cassette of type1: ${msg.severities[1] || ''}`,
        `cassette of type2: ${msg.severities[2] || ''}`,
        `cassette of type3: ${msg.severities[3] || ''}`,
        `cassette of type4: ${msg.severities[4] || ''}`,
        '',
        '======== Diagnostic status ========',
        msg.diagnosticStatus || '',
        '',
        '======== Supplies status ========',
        `reject bin       : ${msg.supplies[0] || ''}`,
        `cassette of type1: ${msg.supplies[1] || ''}`,
        `cassette of type2: ${msg.supplies[2] || ''}`,
        `cassette of type3: ${msg.supplies[3] || ''}`,
        `cassette of type4: ${msg.supplies[4] || ''}`
    ].join('<br/>');
};
