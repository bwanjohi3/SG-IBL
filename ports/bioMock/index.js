module.exports = function(config) {
    let ports = [
        require('./port')
    ];
    if (config.mock) {
        ports.unshift(require('../../mock').bio(config));
    }
    return {
        ports,
        modules: {},
        validations: {}
    };
};
