const transferError = require('ut-transfer/errors');
const atmError = require('ut-atm/errors');
const ruleError = require('ut-rule/errors');
// 'atm.noAvailableAccounts'

const getErrorMap = defineError => {
    const ctpIsoError = require('ut-ctp-iso/errors')(defineError);
    const ctpPayshieldError = require('ut-ctp-payshield/errors')(defineError);

    return {
        fromISO: {
            /**
             * Unable to process; Wrong correction code; Invalid
             * operating mode; Invalid message mode; Original
             * transaction rejected; Original transaction not found;
             * Suspected fraud; Catch all (private)
             */
            '05': [
                transferError.genericDecline, // transfer.genericDecline
                transferError.notFound // transfer.notFound
            ],

            /**
             * BancNet Times-out Issuer
             */
            '08': [
                // transferError.issuerTimeout
            ],

            /**
             * Request in progress
             */
            '09': [],

            /**
             * No activity allowed; Transaction A/C type invalid;
             * Account not current account; Invalid transaction
             */
            '12': [
                transferError.invalidAccountType // transfer.invalidAccountType
            ],

            /**
             * Below minimum amount; Invalid amount
             */
            '13': [
                ruleError.exceedMinLimitAmount, // rule.exceedMinLimitAmount
                ruleError.unauthorizedMinLimitAmount, // rule.unauthorizedMinLimitAmount;
                atmError.invalidAmount, // atm.invalidAmount
                atmError.zeroAmount
            ],

            /**
             * No such issuer; Invalid transferee bank
             */
            '15': [
                transferError.invalidIssuer
            ],

            /**
             * Customer cancellation
             */
            '17': [],

            /**
             * System error
             */
            '19': [
                transferError.systemDecline // transfer.systemDecline
            ],

            '21': [
                transferError.transferAlreadyReversed
            ],

            /**
             * Hardware error
             */
            '22': [
                atmError.outOfNotes, // atm.outOfNotes
                atmError.notesOverflow, // atm.notesOverflow
                atmError.insufficientNotes // atm.insufficientNotes
            ],

            /**
             * Not supported transaction
             */
            '24': [
                transferError.invalidTransferType
            ],

            /**
             * No record on file; account does not exist
             */
            '25': [
                transferError.invalidAccount // transfer.invalidAccount
            ],

            /**
             * Invalid message content
             */
            '30': [],

            /**
             * System malfunction
             */
            '31': [],

            /**
             * Partial dispense
             */
            '32': [],

            /**
             * Allowable PIN tries exceeded
             */
            '38': [
                // atmError.retryDailyLimitExceeded // card.retryDailyLimitExceeded
            ],
            /**
             * No credit account
             */
            '39': [
                transferError.creditAccountNotAllowed // transfer.creditAccountNotAllowed
            ],

            /**
             * Insufficient account balance
             */
            '51': [
                transferError.insufficientFunds // transfer.insufficientFunds
            ],

            /**
             * Invalid current account
             */
            '52': [
                atmError.invalidCheckingsAccount, // card.invalidCheckingsAccount
                transferError.invalidCurrentAccount // transfer.invalidCurrentAccount
            ],

            /**
             * Invalid savings account
             */
            '53': [
                atmError.invalidSavingsAccount, // card.invalidSavingsAccount
                transferError.invalidSavingsAccount // transfer.invalidSavingsAccount
            ],

            /**
             * Expired card
             */
            '54': [
                atmError.expired // card.expired
            ],

            /**
             * Incorrect PIN
             */
            '55': [
                transferError.incorrectPin, // transfer.incorrectPin
                atmError.incorrectPin // card.incorrectPin
            ],

            /**
             * No card record
             */
            '56': [
                atmError.unknown, // card.unknown
                atmError.invalidNumber, // card.invalidNumber
                atmError.invalidTrack2 // card.invalidTrack2
            ],

            /**
             * Invalid terminal ID
             */
            '58': [],

            /**
             * Exceeds amount limit
             */
            '61': [
                ruleError.exceedDailyLimitAmount, // rule.exceedDailyLimitAmount
                ruleError.exceedWeeklyLimitAmount, // rule.exceedWeeklyLimitAmount
                ruleError.exceedMonthlyLimitAmount, // rule.exceedMonthlyLimitAmount
                ruleError.unauthorizedDailyLimitAmount, // rule.unauthorizedDailyLimitAmount;
                ruleError.unauthorizedWeeklyLimitAmount, // rule.unauthorizedWeeklyLimitAmount;
                ruleError.unauthorizedMonthlyLimitAmount // rule.unauthorizedMonthlyLimitAmount;
            ],

            /**
             * Primary account closed; Account closed; Account
             * inactive; Dormant account; Transferee account;
             * Account frozen; Account blocked; Transferee
             * account - blocked; Restricted card
             */
            '62': [
                atmError.inactive, // card.inactive
                atmError.notActivated, // card.notActivated
                atmError.forDestruction // card.forDestruction
            ],

            /**
             * Exceeds transaction limit
             */
            '64': [
                ruleError.exceedMaxLimitAmount // rule.exceedMaxLimitAmount
            ],

            /**
             * Exceeds frequency limit; Exceeds withdrawal limit
             */
            '65': [
                ruleError.reachedDailyLimitAmount,
                ruleError.reachedWeeklyLimitAmount,
                ruleError.reachedMonthlyLimitAmount,
                ruleError.exceedDailyLimitCount, // rule.exceedDailyLimitCount
                ruleError.exceedWeeklyLimitCount, // rule.exceedWeeklyLimitCount
                ruleError.exceedMonthlyLimitCount, // rule.exceedMonthlyLimitCount
                ruleError.unauthorizedDailyLimitCount, // rule.unauthorizedDailyLimitCount; ut-rule^9.12.0
                ruleError.unauthorizedWeeklyLimitCount, // rule.unauthorizedWeeklyLimitCount; ut-rule^9.12.0
                ruleError.unauthorizedMonthlyLimitCount // rule.unauthorizedMonthlyLimitCount; ut-rule^9.12.0
            ],

            /**
             * Hot card; Stolen card; Hard captured card;
             * Restricted card; Lost card
             */
            '67': [
                atmError.hot // card.hot
            ],

            /**
             * BancNet times out issuer; No reply from associated
             * system; No reply received; Reversal due to
             * time-out; No reply from bank; OB initiated reversal
             * due to time-out; ATM initiated reversal due to
             * time-out; POS initiated reversal due to time-out
             */
            '68': [
                transferError.issuerTimeout,
                atmError.lastTransactionTimeout,
                atmError.lastTransactionNoReply
            ],

            /**
             * Transferee Bank not Ready for IBFT
             */
            '70': [],

            /**
             * Maximum PIN tries exceeded
             */
            '75': [
                atmError.retryLimitExceeded, // card.retryLimitExceeded
                atmError.retryDailyLimitExceeded // card.retryDailyLimitExceeded
            ],

            /**
             * Atalla device time-out
             */
            '76': [
                ctpPayshieldError.deviceTimeout, // hsm.timeout
                ctpPayshieldError.deviceNotConnected
            ],

            /**
             * Synchronization error; Atalla transmission key unmatched
             */
            '77': [
                ctpIsoError.invalidTransmissionKey
            ],

            /**
             * Undefined bank code; Invalid bank
             */
            '78': [
                transferError.unknownIssuer
            ],

            /**
             * Invalid business date
             */
            '79': [],

            /**
             * Bank not accepting payment
             */
            '80': [],

            /**
             * Invalid client account number
             */
            '81': [],

            /**
             * Destination not available
             */
            '82': [
                transferError.issuerDisconnected
            ],

            /**
             * Unable to process
             */
            '83': [
                atmError.invalidPinData // card.invalidPinData
            ],

            /**
             * Reversal - no line to TB
             */
            '84': [],

            /**
             * Reversal - TRD was rejected
             */
            '85': [],

            /**
             * Reversal - TRD was timed out
             */
            '86': [],

            /**
             * Reversal - fail to send to TB
             */
            '87': [],

            /**
             * MAC Error
             */
            '88': [],

            /**
             * Transferee rejected the deposit request
             */
            '89': [],

            /**
             * Cut off processing
             */
            '90': [],

            /**
             * Fail to send message to Issuer; Issuer is closed;
             * Issuer is down; No line to TB; Failed to send request
             * to TB; BancNet links all closed; Switch
             * deinitialization; BancNet is closed;
             */
            '91': [
                transferError.issuerNotConnected
            ],

            /**
             * Overdispense
             */
            '93': [],

            /**
             * Exceeds record length; Communication failure
             * between Acquirer and BancNet; Invalid
             * transmission key; Key unsynch between Acquirer
             * and BancNet; No transmission key from BancNet;
             * Suspected system failure; Unable to process
             */
            '96': [
                transferError.unknown, // transfer.unknown
                atmError.lastTransactionMissingSernum,
                atmError.lastTransactionUnexpectedSernum,
                atmError.lastTransactionUnexpectedDispense,
                atmError.lastTransactionZeroDispense,
                atmError.lastTransactionDifferentDispense
            ],

            /**
             * Duplicate transaction
             */
            '99': [
                transferError.transferIdAlreadyExists // transfer.idAlreadyExists
            ]
        }
    };
};

module.exports = defineError => {
    let errorMap = getErrorMap(defineError);
    if (!errorMap.toISO) {
        errorMap.toISO = {};
        Object.keys(errorMap.fromISO).forEach(code => {
            errorMap.fromISO[code].forEach(error => {
                errorMap.toISO[error().type] = code;
            });
        });
    }
    let portErrors = {
        'port.disconnectBeforeResponse': '82',
        'port.receiveTimeout': '68',
        'port.timeout': '68'
    };

    let payshieldError = errorType => {
        if (errorType && errorType.startsWith('payshield.')) {
            return '05';
        }
    };

    return {
        toISOMap: errorMap.toISO,
        fromISOMap: errorMap.fromISO,
        fromISO: (errorIsoCode) => {
            // prioritize first error
            let error;
            if (errorMap.fromISO[errorIsoCode] && errorMap.fromISO[errorIsoCode][0]) {
                error = errorMap.fromISO[errorIsoCode][0]();
                error.responseCode = errorIsoCode;
                error.reverse = [
                    'port.disconnectBeforeResponse',
                    'port.receiveTimeout',
                    'port.timeout',
                    'transfer.issuerTimeout',
                    'transfer.issuerDisconnected'
                ].includes(error.type);
            } else {
                error = transferError.unknown();
                error.responseCode = '96';
                error.reverse = true;
            }
            throw error;
        },
        toISO: (errorType) => {
            switch (errorType) {
                case 'atm.cardReaderFault':
                    return '17';
                case 'atm.cFault':
                    return '88';
                case 'atm.clockFault':
                case 'atm.powerFault':
                case 'atm.cashHandlerFault':
                case 'atm.depositoryFault':
                case 'atm.receiptPrinterFault':
                case 'atm.journalPrinterFault':
                case 'atm.nightDepositoryFault':
                case 'atm.encryptorFault':
                case 'atm.cameraFault':
                case 'atm.sensorsFault':
                case 'atm.touchScreenFault':
                case 'atm.supervisorKeysFault':
                case 'atm.cardholderDisplayFault':
                case 'atm.statementPrinterFault':
                case 'atm.coinDispenserFault':
                case 'atm.voiceGuidanceFault':
                case 'atm.barcodeReaderFault':
                case 'atm.chequeProcessorFault':
                case 'atm.noteAcceptorFault':
                case 'atm.envelopeDispenserFault':
                    return '22'; // dispenser/hardware error
            }
            return errorMap.toISO[errorType] || payshieldError(errorType) || portErrors[errorType] || '96';
        }
    };
};
