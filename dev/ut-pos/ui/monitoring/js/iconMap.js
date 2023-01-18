window.app = window.app || {};

window.app.connectedMap = {
    notConnected: 'Disconnected',
    connected: 'Connected',
    connectionUnknown: 'Connection Unknown'
};

window.app.supervisorMap = {
    active: 'Supervisor mode on',
    '': 'Supervisor mode off',
    null: 'Unknown',
    undefined: 'Unknown'
};

window.app.inServiceMap = {
    inService: 'In service',
    outOfService: 'Out of service'
};

window.app.doorMap = {
    active: 'Door open',
    '': 'Door closed',
    null: 'Unknown',
    undefined: 'Unknown'
};

window.app.cassetteMap = {
    '': 'Cassette in',
    null: 'Unknown',
    undefined: 'Unknown',
    out: 'Cassette out'
};

window.app.supplyMap = {
    unchanged: 'Unchanged',
    good: 'Good',
    mediaLow: 'Media Low',
    mediaOut: 'Media Out',
    overfill: 'Overfill',
    null: 'Unknown',
    undefined: 'Unknown'
};

window.app.fitnessMap = {
    noError: 'No Error',
    routine: 'Routine',
    warning: 'Warning',
    suspend: 'Suspend',
    fatal: 'Fatal',
    null: 'Unknown',
    undefined: 'Unknown'
};
