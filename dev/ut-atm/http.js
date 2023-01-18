'use strict';
const path = require('path');
const Boom = require('boom');
const jwt = require('jsonwebtoken');

module.exports = {
    start: function() {
        const cookieConf = Object.assign({}, this.config.cookie, {path: '/', isHttpOnly: false});
        this &&
        this.registerRequestHandler &&
        this.registerRequestHandler([{
            method: 'GET',
            path: '/s/ut-atm/repository/{p*}',
            config: {auth: 'jwt'},
            handler: {
                directory: {
                    path: path.resolve(path.join(__dirname, 'assets/static')),
                    listing: false,
                    index: false
                }
            }
        }, {
            method: 'GET',
            path: '/monitoring/js/config.js',
            config: {auth: false},
            handler: (req, reply) => {
                var monitoringSsoAuthUrl = this.config.ssoAuthUrl && this.config.ssoAuthUrl.monitoring;
                var config = {
                    ssoAuthUrl: monitoringSsoAuthUrl,
                    txListSize: (this.config.txListSize || 10),
                    monitoringSocketAddress: this.config.monitoringSocketAddress,
                    xsrfToken: req.state && req.state['xsrf-token']
                };
                reply(`var config = ${JSON.stringify(config)}`);
            }
        }, {
            method: 'POST',
            path: '/monitoring/logout',
            config: {auth: false},
            handler: (req, reply) => reply('')
                .unstate(this.config.jwt.cookieKey, cookieConf)
                .unstate('xsrf-token', cookieConf)
        }, {
            method: 'GET',
            path: '/monitoring/{file*}',
            config: {auth: false},
            handler: {
                directory: {
                    path: path.join(__dirname, './ui/monitoring'),
                    listing: false,
                    index: true,
                    lookupCompressed: true
                }
            }
        }, {
            method: 'GET',
            path: '/sso/client',
            config: {auth: false},
            handler: {
                file: path.join(__dirname, 'ui', 'sso', 'sso.html')
            }
        }, {
            method: 'POST',
            path: '/sso/client',
            config: {auth: false},
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
        }]);
    }
};
