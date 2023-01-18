module.exports = (customization) => ({
    ports: [
        require('./script'),
        require('./rpc'),
        require('./journal'),
        require('./mail'),
        require('./server')
    ],
    modules: {
        atm: require('./flow')(customization),
        'db/atm': require('./sql'),
        'db/rule': require('ut-rule/api/sql'),
        'db/core': require('ut-core/api/sql')
    },
    validations: {
        'db/atm': require('./validations')
    }
});
