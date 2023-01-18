const Port = require('ut-bus/port');
const Path = require('path');
const util = require('util');
const Hapi = require('hapi');
const Inert = require('inert');
const UtWss = require('ut-port-httpserver/socketServer');
const jwt = require('jsonwebtoken');
const Boom = require('boom');
const dgram = require('dgram');
var ndjson = require('ndjson');
var merge = require('lodash.merge');
const _undefined = undefined;

function Console(config) {
    Port.apply(this, arguments);
    this.config = merge({
        id: 'debug_console',
        exclusive: true,
        host: 'localhost',
        port: 30001,
        server: {
            host: 'localhost',
            port: 30001,
            state: {
                strictHeader: false
            }
        },
        cookie: {
            ttl: 100 * 60 * 1000,
            encoding: 'none',
            isSecure: true,
            isHttpOnly: true,
            clearInvalid: false,
            strictHeader: true
        },
        ssoAuthUrl: 'not configured',
        jwt: {
            cookieKey: 'ut5-cookie',
            key: 'ut5-secret',
            verifyOptions: {
                ignoreExpiration: true,
                algorithms: ['HS256']
            },
            signOptions: {
                expiresIn: '1h',
                algorithm: 'HS256'
            }
        }
    }, (config || {}));
    this.db = null;
    this.httpServer = null;
    this.socket = null;
    this.utWss = null;
    this.console = null;
    this.wsConsole = null;
    this.queue = [];
    this.browserConnected = false;
}

util.inherits(Console, Port);

Console.prototype.init = function ConsoleInit() {
    Port.prototype.init.apply(this, arguments);
};

Console.prototype.readFromDB = function readFromDB(criteria) {
    if (!this.db) {
        return;
    }
    var self = this;
    // this.console.emit('spinStart', '');
    this.db.createReadStream({
        keys: false,
        values: true,
        valueEncoding: 'json',
        gte: criteria.from + '0000',
        lte: criteria.to + '9999'
    }).on('data', function(log) {
        // self.console.emit(log.timestamp ? 'logMessage' : 'logJSON', log);
        // self.console.emit('logJSON', log);
        self.emit('logJSON', log);
    }).on('end', function() {
        // self.console.emit('spinStop', '');
    });
};

Console.prototype.start = function ConsoleStart() {
    Port.prototype.start.apply(this, arguments);
    var self = this;
    this.httpServer = new Hapi.Server();
    this.httpServer.register(Inert, function() {});
    this.httpServer.connection(this.config.server);
    this.httpServer.route({
        method: 'GET',
        path: '/{p*}',
        handler: {
            directory: {
                path: Path.join(__dirname, 'public'),
                listing: false,
                index: true
            }
        }
    });
    this.httpServer.route({
        method: 'GET',
        path: '/sso/client',
        config: {auth: false},
        handler: {
            file: Path.join(__dirname, 'public', 'sso.html')
        }
    });
    this.httpServer.route({
        method: 'GET',
        path: '/js/config.js',
        config: {auth: false},
        handler: (req, reply) => {
            var config = {
                ssoAuthUrl: this.config.ssoAuthUrl,
                xsrfToken: (req.state && req.state['xsrf-token'])
            };
            reply(`var config = ${JSON.stringify(config)}`);
        }
    });
    this.httpServer.route({
        method: 'POST',
        path: '/sso/client',
        config: {auth: false},
        handler: (req, reply) => {
            var cookieConf = Object.assign({}, this.config.cookie, {path: '/'});
            if (req.payload && req.payload.cookie && req.payload.cookie.name && req.payload.cookie.value) {
                jwt.verify(req.payload.cookie.value, this.config.jwt.key, Object.assign({}, this.config.jwt.verifyOptions, {ignoreExpiration: false}), (err, decoded) => {
                    if (err) {
                        reply(Boom.unauthorized());
                    } else {
                        reply('OK')
                        .state(
                            req.payload.cookie.name,
                            req.payload.cookie.value,
                            cookieConf
                        )
                        .state(
                            'xsrf-token',
                            decoded.xsrfToken,
                            cookieConf
                        );
                    }
                });
            } else {
                reply(Boom.unauthorized());
            }
        }
    });
    this.httpServer.route({
        method: 'POST',
        path: '/upload-logs',
        config: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: true
            },
            handler: function(request, reply) {
                request.payload.files.pipe(ndjson.parse('*')).on('data', function(log) {
                    self.emit('logJSON', log);
                });
                return reply('');
            }
        }
    });

    this.httpServer.route({
        method: 'POST',
        path: '/query-logs',
        handler: function(request, reply) {
            self.readFromDB(request.payload);
            return reply('');
        }
    });

    this.ldstream = ndjson.parse();
    this.ldstream.on('data', msg => this.emit('logJSON', msg));

    this.socket = dgram.createSocket('udp4');
    this.socket.on('message', (msg, rinfo) => {
        try {
            this.ldstream.write(msg);
        } catch (someerr) {
            
         }
    });
    this.socket.on('close', () => {
        this.ldstream = _undefined;
    });
    this.socket.bind({
        address: this.config.host,
        port: this.config.port,
        exclusive: this.config.exclusive
    });

    this.utWss = new UtWss({log: this.log}, this.config);
    this.utWss.on('connection', () => {
        self.browserConnected = true;
        self.emit('logJSON', '');
    });
    this.utWss.registerPath('/status');
    this.utWss.start(this.httpServer.listener);

    this.httpServer.start(function() {
        self.log.info && self.log.info('go to: ' + self.httpServer.info.uri + ' to access the debug console');
    });
};

Console.prototype.emit = function emit(type, msg) {
    if (this.browserConnected) {
        this.queue.push({type, msg});
        while (this.queue.length) {
            this.utWss.publish({path: '/status'}, JSON.stringify(this.queue.shift()));
        }
    } else {
        if (this.queue.length >= 100) {
            this.queue.shift();
        }
        this.queue.push({type, msg});
    }
};

Console.prototype.stop = function ConsoleStop() {
    Port.prototype.stop.apply(this, arguments);
    // cleanup
    this.socket.close();
    this.httpServer.stop();
    if (this.db && this.db.close) {
        this.db.close();
        this.db = _undefined;
    }
    this.httpServer = _undefined;
    this.socket = _undefined;
    this.console = _undefined;
    this.queue = _undefined;
    this.browserConnected = _undefined;
};

module.exports = Console;
