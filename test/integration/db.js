var test = require('ut-run/test');
var config = require('./../lib/db');
var userConstants = require('ut-test/lib/constants/user').constants();
var userMethods = require('ut-test/lib/methods/user');

// create the database, login and persist cookies in store
test({
    type: 'integration',
    name: 'Start app',
    server: config.server,
    serverConfig: config.serverConfig,
    client: config.client,
    clientConfig: config.clientConfig,
    steps: function(test, bus, run) {
        return run(test, bus, [
            userMethods.login('login admin', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE)
        ]);
    }
});
