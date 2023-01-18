module.exports = {
    id: 'ctp',
    createPort: require('ut-port-httpserver'),
    logLevel: 'trace',
    host: '127.0.0.1',
    port: 8006,
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
    },
    api: ['pan', 'iso', 'ncr', 'atmAgent','pos'],
    receive: function(msg, $meta) {
        if (/^ncr\./.test($meta.method)) {
            $meta.conId = msg.conId;
        }
        return msg;
    }
};
