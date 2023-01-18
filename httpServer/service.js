var path = require('path');
var pkg = require(path.join('../', 'package.json'));

module.exports = {
    id: 'httpserverService',
    createPort: require('ut-port-httpserver'),
    logLevel: 'trace',
    imports: ['utfront', 'frontend', 'documentHTTP', 'userHTTP', 'mirrors', 'mirrorsHTTP', 'bulkHTTP', 'reportHTTP'],
    api: ['identity', 'card', 'core', 'ledger', 'customer', 'rule', 'transfer', 'mirrors', 'document', 'bulk', 'user', 'externalAudit', 'history'],
    port: 9001,
    entryPoint: './browser/service.js',
    dist: path.resolve(__dirname, '../dist'),
    jwt: {key: 'options - optional configuration for expiring cookie. If the state was previously registered'},
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
        path.resolve(__dirname, '..', 'ui', 'service', 'assets', 'react', 'images'),
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
