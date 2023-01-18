'use strict';
const MONITORING = Symbol('Monitoring private fields');

const getRequestHandlerConfig = customization => Object.assign({
    auth: 'jwt',
    cors: {
        origin: ['*'],
        credentials: true
    }
}, customization);

module.exports = {
    start: function() {
        var log = this.log;
        this[MONITORING] = {
            publishAtmStatus: this.registerSocketSubscription('/atmStatus'),
            publishAtmTransfer: this.registerSocketSubscription('/atmTransfer'),
            connections: new Map(),
            statusDescriptions: new Map(),
            transfers: []
        };
        this.registerRequestHandler([{
            method: 'GET',
            path: '/terminals',
            config: getRequestHandlerConfig(),
            handler: (req, reply) => this.bus.importMethod('atm.terminalFetch')({})
                .then(result => reply({
                    terminals: result.terminals,
                    connections: Array.from(this[MONITORING].connections.values()),
                    statusDescriptions: Array.from(this[MONITORING].statusDescriptions.entries()),
                    transfers: this[MONITORING].transfers
                }))
                .catch((e) => {
                    log && log.error && log.error(e);
                    reply(e);
                })
        }, {
            method: 'GET',
            path: '/connections',
            config: getRequestHandlerConfig(),
            handler: (req, reply) => reply(Array.from(this[MONITORING].connections.values()))
        }, {
            method: 'POST',
            path: '/remoteCommand',
            config: getRequestHandlerConfig(),
            handler: (req, reply) => this.bus.importMethod('atm.remoteCommand')(req.payload)
                .then(() => reply(''))
                .catch(err => reply(err.errorPrint || err.errorMessage))
        }, {
            method: 'OPTIONS',
            path: '/remoteCommand',
            config: {auth: false},
            handler: (req, reply) => reply()
                .header('Access-Control-Allow-Credentials', true)
                .header('Access-Control-Allow-Origin', req.headers.origin)
                .header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
                .header('Access-Control-Allow-Headers', 'Content-Type')
        }]);
    },
    publishAtmStatus: function(status) {
        if (!status.session || !status.session.atmId) {
            return {};
        }
        if (status.connected === true) {
            this[MONITORING].connections.set(status.session.atmId, {
                atmId: status.session.atmId,
                terminalId: status.session.terminalId,
                inService: status.session.inService,
                conId: status.conId
            });
        } else if (status.connected === false) {
            this[MONITORING].connections.delete(status.session.atmId);
        }
        if (status.deviceStatusDescription && status.device) {
            // in case of unsolicitedStatus
            if (!this[MONITORING].statusDescriptions.has(status.session.atmId)) {
                this[MONITORING].statusDescriptions.set(status.session.atmId, {});
            }
            this[MONITORING].statusDescriptions.get(status.session.atmId)[status.device] = status.deviceStatusDescription;
        }
        const broadcastData = Object.assign({}, status, {
            session: { // Skip secure data like keys
                atmId: status.session.atmId,
                inService: status.session.inService
            }
        });
        this[MONITORING].publishAtmStatus({}, broadcastData);
        return {};
    },
    publishAtmTransfer: function(transfer) {
        this[MONITORING].transfers.push(transfer.transfer);
        this[MONITORING].publishAtmTransfer({}, transfer);
        if (this[MONITORING].transfers.length > (this.config.txListSize || 10)) {
            this[MONITORING].transfers.shift();
        }
        return {};
    }
};
