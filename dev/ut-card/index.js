module.exports = function(params) {
    return {
        ports: [
            require('./rpc')(params.config || {})
        ],
        modules: {
            cardHTTP: require('./api/routes'),
            card: require('./api/sql')(params)
        },
        validations: {
            card: require('./validations')
        }
    };
};
