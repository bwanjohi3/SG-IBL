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
const USERNAME = userConstants.USERNAME;
const BINDESCRIPTION = cardConstants.RANDOMBINDESCRIPTION;
const TEST1 = cardConstants.TEST1;
const PERMISSION = 'card.bin.statusUpdate';
const RANDOMBIN = parseInt('52' + commonFunc.generateRandomFixedInteger(4));
const TYPEOWN = 'own';

var typeIdOwn, ownBin;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'status update bin',
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
                commonFunc.createStep('card.bin.add', 'add own bin', context => {
                    return {
                        bin: {
                            ownershipTypeId: typeIdOwn,
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            description: BINDESCRIPTION
                        }
                    };
                }, (result, assert) => {
                    ownBin = result.cardBin[0].binId;
                    assert.equals(cardJoiValidation.validateAddBin(result.cardBin[0]).error, null, 'return correct bin');
                }),
                commonFunc.createStep('card.bin.add', 'add second own bin', context => {
                    return {
                        bin: {
                            ownershipTypeId: typeIdOwn,
                            startBin: RANDOMBIN + 1,
                            endBin: RANDOMBIN + 1,
                            description: BINDESCRIPTION + 10
                        }
                    };
                }, (result, assert) => {
                    ownBin = result.cardBin[0].binId;
                    assert.equals(cardJoiValidation.validateAddBin(result.cardBin[0]).error, null, 'return correct bin');
                }),

                cardMethods.statusUpdateBin('status update bin - change isActive to false', context => {
                    return {
                        binId: ownBin
                    };
                }, false),
                commonFunc.createStep('card.bin.get', 'get bin - isActive to false', context => {
                    return {
                        binId: ownBin
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBin(result.cardBin[0]).error, null, 'return correct bin');
                    assert.equals(result.cardBin[0].isActive, false, 'return correct bin');
                }),
                cardMethods.statusUpdateBin('status update bin - change isActive to true', context => {
                    return {
                        binId: ownBin
                    };
                }, true),
                commonFunc.createStep('card.bin.get', 'get bin - isActive to true', context => {
                    return {
                        binId: ownBin
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBin(result.cardBin[0]).error, null, 'return correct bin');
                    assert.equals(result.cardBin[0].isActive, true, 'return correct bin');
                }),

                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - missing isActive', context => {
                    return {
                        binId: ownBin
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return isActive is required');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - invalid number isActive', context => {
                    return {
                        binId: ownBin,
                        isActive: 3
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return isActive must be a boolean');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - invalid text isActive', context => {
                    return {
                        binId: ownBin,
                        isActive: TEST1
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return isActive must be a boolean');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - empty string isActive', context => {
                    return {
                        binId: ownBin,
                        isActive: ''
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return isActive must be a boolean');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - null isActive', context => {
                    return {
                        binId: ownBin,
                        isActive: null
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return isActive must be a boolean');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - missing bin array', context => {
                    return {};
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId is required');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - missing binId', context => {
                    return {
                        isActive: true
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId is required');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - empty string for binId', context => {
                    return {
                        binId: '',
                        isActive: true
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be a number');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - string for binId', context => {
                    return {
                        binId: TEST1,
                        isActive: true
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be a number');
                }),
                commonFunc.createStep('card.bin.statusUpdate', 'status update bin - 0 for binId', context => {
                    return {
                        binId: 0,
                        isActive: true
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be larger than or equal to 1');
                }),

                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.bin.statusUpdate', 'missing permission', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            isActive: true
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
