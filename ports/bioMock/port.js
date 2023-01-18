module.exports = {
    id: 'bioMock',
    createPort: require('ut-port-http'),
    logLevel: 'trace',
    namespace: ['bioMock'],
    format: {
        size: '32/integer',
        codec: require('ut-codec/smpp'),
        sizeAdjust: 4
    },
    listen: false,
    enquireInterval: 15000,
    workInterval: 5000,
    idleInterval: 60000,
    start: function() {
        if (!this.config.url) {
            throw Error('BIO URL not configured');
        }
    },
    send: function(msg, $meta) {
        if (!msg.url) {
            msg.url = this.config.url;
        }
        if (!msg.method) {
            msg.method = this.config.method;
        }
        return msg;
    },
    receive: function(msg) {
        return JSON.parse(msg.payload);
    }
};
