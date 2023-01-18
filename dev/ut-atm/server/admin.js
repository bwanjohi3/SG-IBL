module.exports = () => ({
    ports: [],
    modules: {
        'db/atm': require('../sql'),
        atmHTTP: require('../http')
    },
    validations: {
        'db/atm': require('../validations')
    },
    error: require('../errors')
});
