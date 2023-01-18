module.exports = () => ({
    ports: [
        require('./port/script'),
        require('./port/iso/tcp'),
        require('./port/update/tcp'),
        require('./port/httpServerMonitoring')
    ],
    modules: {
        posMonitoring: require('./module/monitoring')
    },
    validation: {}
});
