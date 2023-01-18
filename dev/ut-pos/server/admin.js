module.exports = function utPos() {
    return {
        ports: [],
        modules: {
            'pos': require('../api/sql')
        },
        validations: {
            'pos': require('../validations')
        },
        error: require('../errors')
    };
};
