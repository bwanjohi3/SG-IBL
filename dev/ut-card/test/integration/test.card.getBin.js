var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userConstants = require('ut-test/lib/constants/user').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
var stdPolicy;
const USERNAME = 'gb' + userConstants.USERNAME;
const BINDESCRIPTION = cardConstants.RANDOMBINDESCRIPTION;
const RANDOMBIN = parseInt('37' + commonFunc.generateRandomFixedInteger(4));
const TEST1 = cardConstants.TEST1;
const PERMISSION = 'card.bin.get';
const TYPEOWN = 'own';

var typeIdOwn;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'get bin',
        server: opt.server,
        serverConfig: opt.serverConfig,
        client: opt.client,
        clientConfig: opt.clientConfig,
        steps: function(test, bus, run) {
            return run(test, bus, [userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                userMethods.getUser('get admin details', context => context.login['identity.check'].actorId),
                commonFunc.createStep('policy.policy.fetch', 'get std input by admin policy', (context) => {
                    return {
                        searchString: 'STD'
                    };
                }, (result, assert) => {
                    var policy = result.policy.find(
                        (singlePolicy) => singlePolicy.name.indexOf('STD_input') > -1
                    );
                    stdPolicy = policy.policyId;
                }),
                commonFunc.createStep('user.role.add', 'add role successfully', (context) => userParams.addRoleParams(context, context => {
                    return {
                        visibleFor: [context['get admin details'].memberOF[0].object],
                        policyId: stdPolicy
                    };
                }, userConstants.ROLENAME, userConstants.ROLEDESCRIPTION),
                (result, assert) => {
                    assert.equals(userJoiValidation.validateAddRole(result.role[0]).error, null, 'Return all details after adding role');
                    assert.equals(result.role[0].name, userConstants.ROLENAME, 'return role name');
                    assert.equals(result.role[0].description, userConstants.ROLEDESCRIPTION, 'return role description');
                    assert.equals(result.role[0].isEnabled, false, 'return unlocked role status');
                }),
                userMethods.approveRole('approve role', context => context['add role successfully'].role[0].actorId),
                userMethods.addUser('add new user', context => {
                    return {
                        object: context['get admin details']['memberOF'][0].object,
                        policyId: stdPolicy,
                        roles: [context['add role successfully'].role[0].actorId],
                        defaultRoleId: context['add role successfully'].role[0].actorId
                    };
                }, USERNAME),
                userMethods.approveUser('approve first user', context => context['add new user'].person.actorId),
                commonFunc.createStep('card.ownershipType.fetch', 'fetch card ownershipType', context => {
                    return {};
                }, (result, assert) => {
                    var ownershipType1 = result.ownershipType.find((ownershipType) => ownershipType.itemCode === TYPEOWN);
                    typeIdOwn = ownershipType1.ownershipTypeId;
                    assert.equals(cardJoiValidation.validateFetchOwnershipType(result.ownershipType[0]).error, null, 'return ownership types');
                }),
                cardMethods.addBin('add bin', context => {
                    return {
                        description: BINDESCRIPTION,
                        ownershipTypeId: typeIdOwn
                    };
                }, RANDOMBIN),
                commonFunc.createStep('card.bin.get', 'get bin', context => {
                    return {
                        binId: context['add bin'].cardBin[0].binId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBin(result.cardBin[0]).error, null, 'return correct bin');
                    assert.equals(result.cardBin[0].startBin, RANDOMBIN.toString(), 'return correct bin');
                }),
                commonFunc.createStep('card.bin.get', 'get bin - missing binId', context => {
                    return {};
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId is required');
                }),
                commonFunc.createStep('card.bin.get', 'get bin - invalid number binId', context => {
                    return {
                        binId: 0
                    };
                }, (result, assert) => {
                    assert.same(result.cardBin, [], 'return empty array');
                }),
                commonFunc.createStep('card.bin.get', 'get bin - invalid string binId', context => {
                    return {
                        binId: TEST1
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be a number');
                }),
                commonFunc.createStep('card.bin.get', 'get bin - empty string binId', context => {
                    return {
                        binId: ''
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be a number');
                }),
                commonFunc.createStep('card.bin.get', 'get bin - null binId', context => {
                    return {
                        binId: null
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be a number');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.bin.get', 'missing permission', context => {
                    return {
                        binId: context['add bin'].cardBin[0].binId
                    };
                }, null, (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
