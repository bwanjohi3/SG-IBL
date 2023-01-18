module.exports = () => {
    let ports = [
        require('./port')
    ];

    ports = ports.map(port => {
        if (port.hooks) {
            for (var hook in port.hooks) {
                port[`${port.id}.${hook}`] = port.hooks[hook];
            }
        }
        return port;
    });

    return {
        ports,
        modules: {},
        validations: {}
    };
};
