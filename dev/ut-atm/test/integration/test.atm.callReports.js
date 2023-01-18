var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var userMethods = require('ut-test/lib/methods/user');
var userConstants = require('ut-test/lib/constants/user').constants();

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'call atm reports',
        server: opt.server,
        serverConfig: opt.serverConfig,
        client: opt.client,
        clientConfig: opt.clientConfig,
        steps: function(test, bus, run) {
            return run(test, bus, [userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                commonFunc.createStep('db/atm.cashPosition', 'call cashPosition report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                })
            ]);
        }
    }, cache);
};
