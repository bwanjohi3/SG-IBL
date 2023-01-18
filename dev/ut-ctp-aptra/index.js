module.exports = () => ({
    ports: [
        require('./port/script'),
        require('./port/tcpAptra'),
        require('./port/tcpAgent'),
        require('./port/httpServerMonitoring')
    ],
    modules: {
        aptra: require('./module/aptra'),
        monitoring: require('./module/monitoring')
    }
});
