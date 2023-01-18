'use strict';
const CONNECTIONS_REF = Symbol('Terminal Id -> Connection Id map');
module.exports = {
    id: 'atmAgent',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    port: 123,
    listen: true,
    disconnectTimeout: 30,
    queue: {
        idle: 60000
    },
    idleSend: 60000,
    idleReceive: 130000,
    format: {
        size: '16/integer',
        codec: require('ut-codec-jsonrpc')
    },
    start: function() {
        this[CONNECTIONS_REF] = new Map();
    },
    connRouter: function(queue, [msg, $meta]) {
        return this[CONNECTIONS_REF].get(msg.terminalId);
    },
    'idle.notification.receive': function(msg, $meta) {
        $meta.mtid = 'request';
        $meta.destination = 'atmAgent';
        $meta.method = 'idle';
    },
    'idle.response.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
    },
    'disconnected.notification.receive': function(msg, $meta, context) {
        this[CONNECTIONS_REF].delete(context.terminalId);
        $meta.mtid = 'discard';
    },
    'connected.notification.receive': function(msg, $meta) {
        $meta.mtid = 'request';
        $meta.destination = 'atmAgent';
        $meta.opcode = $meta.method = 'getTerminalId';
    },
    'idleSend.event.receive': function(msg, $meta) {
        $meta.dispatch = () => [{}, {
            mtid: 'request',
            method: 'idle',
            dispatch: () => false
        }];
    },
    'disconnected.event.receive': function(msg, $meta, context) {
        this[CONNECTIONS_REF].delete(context.terminalId);
    },
    'connected.event.receive': function(msg, $meta) {
        $meta.dispatch = () => [{}, {
            mtid: 'request',
            method: 'getTerminalId',
            dispatch: () => false
        }];
    },
    'getTerminalId.response.receive': function(msg, $meta, context) {
        this[CONNECTIONS_REF].set(msg.terminalId, $meta.conId);
        context.terminalId = msg.terminalId;
        $meta.mtid = 'discard';
        return msg;
    }
};
