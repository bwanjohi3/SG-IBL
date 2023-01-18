const create = require('ut-error').define;

const Atm = create('atm');
const Hsm = create('hsm');
const Card = create('card');

module.exports = {
    badTransaction: (cause) => new Atm(cause),
    badLanguage: (cause) => new Atm(cause),
    badAccountType: (cause) => new Atm(cause),
    badRequestType: (cause) => new Atm(cause),
    expectedThreeDigitInteger: (cause) => new Atm(cause),
    terminalNotFound: create('terminalNotFound', Atm, 'Unknown terminal'),
    noAccounts: create('noAvailableAccounts', Atm, 'No available accounts'),
    noAccountsCurrency: create('noAvailableAccountsCurrency', Atm, 'No available accounts for selected currency'),
    badWithdrawAmount: create('badWithdrawAmount', Atm, 'Invalid withdraw amount'),
    zeroAmount: create('zeroAmount', Atm, 'Zero amount dispense'),
    invalidAmount: create('invalidAmount', Atm, 'Invalid dispense amount'),
    outOfNotes: create('outOfNotes', Atm, 'Out of notes'),
    notesOverflow: create('notesOverflow', Atm, 'Over maximum dispense count'),
    invalidCurrency: create('invalidCurrency', Atm, 'Invalid currency'),
    nextId: create('nextId', Atm, 'Failed to generate serial number'),
    hsm: create('hsm', Hsm, 'HSM error'),
    invalidCustomization: create('atmCustomization', Atm, 'Invalid or missing customization'),
    duplicateTerminalId: create('duplicateTerminalId', Atm, 'Terminal Id already exists'),
    duplicateTmkkvv: create('duplicateTmkkvv', Atm, 'Terminal TMKKVV already exists'),

    unknown: create('unknown', Card, 'Unknown card or account'),
    hot: create('hot', Card, 'Hot card'),
    notActivated: create('notActivated', Card, 'Card not active yet'),
    expired: create('expired', Card, 'Card expired'),
    inactive: create('inactive', Card, 'Card deactivated'),
    forDestruction: create('forDestruction', Card, 'Card is for destruction'),
    retryLimitExceeded: create('retryLimitExceeded', Card, 'PIN retries exceeded'),
    incorrectPin: create('incorrectPin', Card, 'Incorrect PIN'),
    retryDailyLimitExceeded: create('retryDailyLimitExceeded', Card, 'DAILY PIN RETRIES EXCEEDED'),
    invalidPinData: create('invalidPinData', Card, 'Invalid PIN data'),
    emptyPin: create('emptyPin', Card, 'Empty PIN'),
    invalidNumber: create('invalidNumber', Card, 'Invalid card number'),
    invalidTrack2: create('invalidTrack2', Card, 'Invalid track2')
};
