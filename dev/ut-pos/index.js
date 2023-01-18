module.exports = function utPos() {
    return {
        ports: [
            require('./posScript')
        ],
        modules: {
            'db/pos': require('./api/sql')
        },
        validations: {
            'db/pos': require('./validations')
        }
    };
};
