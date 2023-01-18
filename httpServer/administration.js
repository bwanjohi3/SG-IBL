var path = require('path');
var pkg = require(path.join('../', 'package.json'));

module.exports = {
    id: 'httpserverAdministration',
    createPort: require('ut-port-httpserver'),
    logLevel: 'trace',
    imports: ['utfront', 'frontend', 'documentHTTP', 'userHTTP', 'reportHTTP', 'mirrors', 'mirrorsHTTP', 'transferHTTP', 'atmHTTP', 'amlHTTP'],
    api: ['user', 'identity', 'card', 'ledger', 'core', 'customer', 'rule', 'db/rule', 'alert', 'transfer', 'mirrors', 'db/transfer', 'db/atm', 'db/pos', 'aml', 'externalAudit', 'document', 'agent', 'history'],
    port: 8035,
    entryPoint: './browser/administration.js',
    dist: path.resolve(__dirname, '../dist'),
    jwt: {key: 'with a value in an extension methods or authentication function will be considered'},
    publicMethods: [
        'identity.forgottenPasswordRequest',
        'identity.forgottenPasswordValidate',
        'identity.forgottenPassword',
        'customer.selfregister'
    ],
    cssImport: {
        path: [path.resolve(__dirname, '../config')]
    },
    cssAssets: {loadPaths: [
        path.resolve(__dirname, '..', 'ui', 'administration', 'assets', 'react', 'images'),
        path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'components', '**', 'images')),
        path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'pages', '**', 'images')),
        path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'containers', '**', 'images')),
        path.resolve(path.join(path.dirname(require.resolve('ut-user')), 'ui', 'react', 'components', '**', 'images')),
        path.resolve(path.join(path.dirname(require.resolve('ut-user')), 'ui', 'assets', 'react', 'images'))
    ]},
    cookie: {
        ttl: 31536000000,
        encoding: 'none',
        isSecure: false,
        isHttpOnly: true,
        clearInvalid: false,
        strictHeader: true
    },
    cookiePaths: '/',
    start: function() {
        this.registerRequestHandler([{
            method: 'GET',
            path: '/currentVersion',
            config: {auth: false},
            handler: function(request, reply) {
                reply({
                    version: pkg.version
                });
            }
        }, {
            method: 'GET',
            path: '/docs/{p*}',
            config: {auth: false},
            handler: {
                directory: {
                    path: path.join(__dirname, '..', 'docs'),
                    listing: true,
                    index: true,
                    lookupCompressed: true
                }
            }
        }]);
    }
};
