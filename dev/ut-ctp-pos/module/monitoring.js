'use strict';
const jwt = require('jsonwebtoken');
const path = require('path');
const Boom = require('boom');
const fs = require('fs');

const getRequestHandlerConfig = customization => Object.assign({
    auth: 'jwt',
    cors: {
        origin: ['*'],
        credentials: true,
        additionalHeaders: ['content-type', 'x-xsrf-token']
    }
}, customization);

module.exports = () => {
    let monitoring = {
        connections: new Map(),
        terminals: [],
        transfers: []
    };

    return {
        'httpServer.start': function() {
            const cookieConf = Object.assign({}, this.config.cookie, {path: '/', isHttpOnly: false, isSameSite: false});
            var log = this.log;
            monitoring.publishStatus = this.registerSocketSubscription('/status');
            monitoring.publishTransfer = this.registerSocketSubscription('/transfer');

            this.registerRequestHandler([
                {
                    method: 'POST',
                    path: '/rpc/monitoring.terminal.fetch',
                    config: getRequestHandlerConfig(),
                    handler: (req, reply) => Promise.resolve({terminals: [{institutionCode: '999991'}]})
                        .then(result => ({
                            terminals: result.terminals,
                            transfers: monitoring.transfers,
                            connections: Array.from(monitoring.connections.values())
                        }))
                        .then((r) => {
                            return reply({result: r});
                        })
                        .catch((e) => {
                            log && log.error && log.error(e);
                            reply({error: e});
                        })
                }, {
                    method: 'POST',
                    path: '/rpc/monitoring.terminal.connections',
                    config: getRequestHandlerConfig(),
                    handler: (req, reply) => reply({result: Array.from(monitoring.connections.values())})
                }, {
                    method: 'GET',
                    path: '/sso/client',
                    config: {security: {xframe: false, noSniff: false}, auth: false},
                    handler: (req, reply) => reply(fs.createReadStream(path.join(__dirname, '../', 'ui', 'sso', 'sso.html')))
                }, {
                    method: 'POST',
                    path: '/sso/client',
                    config: {security: {xframe: false, noSniff: false}, auth: false},
                    handler: (req, reply) => {
                        if (!req.payload || !req.payload.cookie || !req.payload.cookie.name || !req.payload.cookie.value) {
                            return reply(Boom.unauthorized());
                        }
                        jwt.verify(req.payload.cookie.value, this.config.jwt.key, Object.assign({}, this.config.jwt.verifyOptions, {ignoreExpiration: false}), (err, decoded) => {
                            if (err) {
                                reply(Boom.unauthorized());
                            } else {
                                reply('OK')
                                .state(req.payload.cookie.name, req.payload.cookie.value, cookieConf)
                                .state('xsrf-token', decoded.xsrfToken, cookieConf);
                            }
                        });
                    }
                }
            ]);
        },
        publishStatus: function(status) {
            if (!status.session || !status.session.institutionCode) {
                return {};
            }
            if (status.connected === true) {
                monitoring.connections.set(status.session.institutionCode, {
                    institutionCode: status.session.institutionCode,
                    channelId: status.session.channelId,
                    profileName: status.session.profileName,
                    conId: status.conId
                });
            } else if (status.connected === false) {
                monitoring.connections.delete(status.session.institutionCode);
            }
            const broadcastData = Object.assign({}, status, {
                session: { // Skip secure data like keys
                    institutionCode: status.session.institutionCode
                }
            });
            monitoring.publishStatus({}, broadcastData);
            return {};
        },
        publishTransfer: function(transfer) {
            monitoring.transfers.push(transfer.transfer);
            monitoring.publishTransfer({}, transfer);
            if (monitoring.transfers.length > (this.config.txListSize || 10)) {
                monitoring.transfers.shift();
            }
            return {};
        }
    };
};
