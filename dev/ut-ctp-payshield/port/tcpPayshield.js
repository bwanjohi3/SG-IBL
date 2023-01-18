module.exports = {
    id: 'payshield',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    log: {
        transform: {
            macMessage: 'hide'
        }
    },
    host: 'hsm',
    port: 1500,
    listen: false,
    queue: {
        _empty: 1000,
        idle: 130000
    },
    idleSend: 10000,
    idleReceive: 25000,
    format: {
        size: '16/integer',
        codec: require('ut-codec-payshield'),
        headerFormat: '6/string-left-zero'
    },
    'echo.request.send': function(msg, $meta) {
        msg = msg || {};
        msg.message = msg.message || 'ping';
        msg.msgSize = msg.message.length;
        return msg;
    },
    'echo.response.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
        return msg;
    },
    'idle.notification.receive': function(msg, $meta) {
        this.queue.push([{}, {mtid: 'request', method: 'echo', callback: () => (true)}]);
        $meta.mtid = 'discard';
    },
    'connected.notification.receive': function(msg, $meta) {
        // this.queues[$meta.conId].add([{}, {mtid: 'request', method: 'echo', callback: () => (true)}]);
        $meta.mtid = 'discard';
    },
    'idleSend.event.receive': function(msg, $meta) {
        $meta.dispatch = () => [{}, {
            mtid: 'request',
            method: 'echo',
            dispatch: () => false
        }];
    },
    'printPinEnd.response.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
    }
};
