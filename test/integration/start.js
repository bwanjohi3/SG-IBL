var test = require('ut-run/test');
var config = require('./../lib/appConfig');
module.parent.stop = test({
    type: 'integration',
    name: 'Start app',
    server: config.server,
    serverConfig: config.serverConfig,
    client: config.client,
    clientConfig: config.clientConfig,
    peerImplementations: [require('../../index-pan')],
    steps: function() {}
}, module.parent);
