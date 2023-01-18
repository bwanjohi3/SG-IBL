module.exports = {
    id: 'atmFlow',
    createPort: require('ut-port-httpserver'),
    logLevel: 'trace',
    log: {
        transform: {
            session: 'hide'
        }
    },
    api: ['flow'],
    host: '127.0.0.1',
    port: 8005,
    validationPassThrough: true,
    identityNamespace: false,
    routes: {
        rpc: {
            method: '*',
            path: '/rpc/{method?}',
            config: {
                auth: false
            }
        }
    }
};
