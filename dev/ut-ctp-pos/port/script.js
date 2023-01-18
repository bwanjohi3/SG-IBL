module.exports = {
    id: 'ctpScript',
    createPort: require('ut-port-script'),
    logLevel: 'trace',
    log: {
        transform: {
            session: 'hide'
        }
    },
    imports: ['posMonitoring']
};
