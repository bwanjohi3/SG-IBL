var errors = require('./errors');
var assign = require('lodash.assign');

module.exports = (bus) => ({
    cardParams: ({cardId, hsmError}) => {
        if (!cardId) {
            if (hsmError && hsmError.type === 'card.invalidTrack2') {
                throw errors.invalidTrack2();
            } else {
                throw errors.invalidNumber();
            }
        }
        return bus.importMethod('db/atm.card.params')({ cardId }).then(params => {
            if (params.flow == 'external') {
                return { cardFlow: 'acq' }
            } else {
                return { cardFlow: (params && params.flow) || 'acq' }
            }
        }
        );
    },
    checkCard: (params) => {
        if (params && (params.cardFlow === 'acq' || params.cardFlow === 'external')) {
            return params;
        }
        return bus.importMethod('db/atm.card.check')({
            cardId: params.cardId,
            sourceAccount: params.sourceAccount,
            destinationAccount: params.destinationAccount,
            pinOffset: params.pinOffset,
            mode: params.mode,
            currency: params.currency || ''
        }).then(result => assign(params, {
            sourceAccount: result.sourceAccount,
            sourceAccountName: result.sourceAccountName,
            destinationAccount: result.destinationAccount,
            destinationAccountName: result.destinationAccountName,
            cardNumber: result.cardNumber,
            ordererId: result.ordererId,
            mobileNumber: result.cardHolderName
        }));
    },
    getAccountDetails: (params) => {
        if (params.udfAcquirer && params.udfAcquirer.cardFlow === 'acq') {
            return params;
        }
        return bus.importMethod('db/atm.card.getAccounts')({
            cardId: params.cardId,
            sourceAccount: params.sourceAccount,
            destinationAccount: params.destinationAccount,
            pinOffset: params.pinOffset,
            mode: params.mode
        })
            .then((result) => {
                //Format our array accounts nicely into something the atm can display
                var accounts = Array.isArray(result) ? result[0] : [result];
                return accounts;
            })
            .catch((error) => {
                throw error;
            })
    },
    accountHolder: (account) => bus.importMethod('impl/atm.account.holder')(account),
    listAccounts: (params, skipDestination) => {
        return bus.importMethod('db/atm.account.list')({
            cardId: params.cardId,
            accountType: (skipDestination == null) ? params.accType1 : params.accType2
        })
            .then(accounts => {
                accounts = Array.isArray(accounts) ? accounts : [accounts];
                (skipDestination != null) && accounts.splice(skipDestination, 1);
                accounts = accounts.slice(0, 4);

                if (!accounts || accounts.length === 0) {
                    throw errors.noAccounts();
                }

                return accounts;
            });
    }
});
