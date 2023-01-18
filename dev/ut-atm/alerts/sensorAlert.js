'use strict';
module.exports = (msg) => {
    let result = [`======== ${msg.deviceStatusDescription} ========`];
    if (msg.deviceStatus.substr(0, 1) === '2') {
        result.push(msg.supervisorMode ? 'Supervisor mode enter' : 'Supervisor mode exit');
    } else {
        if (msg.vibration === true) result.push('Vibration/heat');
        if (msg.door === true) result.push('Door open');
        if (msg.silentSignal === true) result.push('Silent signal');
        if (msg.electronicsEnclosure === true) result.push('Enclosure open');
        if (msg.depositBin === false) result.push('Deposit bin out');
        if (msg.cardBin === false) result.push('Card bin out');
        if (msg.rejectBin === false) result.push('Reject bin out');
        if (msg.cassette1 === false) result.push('Cassette 1 out');
        if (msg.cassette2 === false) result.push('Cassette 2 out');
        if (msg.cassette3 === false) result.push('Cassette 3 out');
        if (msg.cassette4 === false) result.push('Cassette 4 out');
    }
    return result.join('<br/>');
};
