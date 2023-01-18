var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var userConstants = require('ut-test/lib/constants/user').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
var stdPolicy;
const USERNAME = 'addBin' + userConstants.USERNAME;
const BINDESCRIPTION = cardConstants.RANDOMBINDESCRIPTION;
const TEST1 = cardConstants.TEST1;
const PERMISSION = 'card.bin.add';
const RANDOMBIN = parseInt('13' + commonFunc.generateRandomFixedInteger(4));
const RANDOMBINLESSNUM = parseInt('13' + commonFunc.generateRandomFixedInteger(3));
const TYPEOWN = 'own';
var typeIdOwn;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'add bin',
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
                commonFunc.createStep('card.bin.add', 'add bin - duplicate bin', context => {
                    return {
                        bin: {
                            startBin: context['add bin'].cardBin[0].startBin,
                            endBin: context['add bin'].cardBin[0].endBin,
                            description: BINDESCRIPTION + 1,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return Bin already exists');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - duplicate description', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN + 1,
                            endBin: RANDOMBIN + 1,
                            description: BINDESCRIPTION,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return Bin already exists');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - missing bin', context => {
                    return {};
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return Bin is required');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - missing second bin param', context => {
                    return {
                        bin: {
                            description: BINDESCRIPTION,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return startBin is required');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - missing description', context => {
                    return {
                        bin: {
                            startBin: context['add bin'].cardBin[0].startBin,
                            endBin: context['add bin'].cardBin[0].endBin,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return description is required');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - bin with less numbers', context => {
                    return {
                        bin: {
                            startBin: RANDOMBINLESSNUM,
                            endBin: RANDOMBINLESSNUM,
                            description: BINDESCRIPTION + 2,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return startBin must be larger than or equal to 100000');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - bin with more numbers', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN.toString() + 2,
                            endBin: RANDOMBIN.toString() + 2,
                            description: BINDESCRIPTION + 3,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return startBin must be less than or equal to 999999');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - string startBin', context => {
                    return {
                        bin: {
                            startBin: TEST1,
                            endBin: RANDOMBIN + 2,
                            description: BINDESCRIPTION + 4,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return startBin must be a number');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - string endBin', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN + 2,
                            endBin: TEST1,
                            description: BINDESCRIPTION + 5,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return endBin must be a number');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - empty string startBin', context => {
                    return {
                        bin: {
                            startBin: '',
                            endBin: RANDOMBIN + 2,
                            description: BINDESCRIPTION + 6,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return startBin must be a number');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - empty string endBin', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN + 2,
                            endBin: '',
                            description: BINDESCRIPTION + 7,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return endBin must be a number');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - null startBin', context => {
                    return {
                        bin: {
                            startBin: null,
                            endBin: RANDOMBIN + 2,
                            description: BINDESCRIPTION + 8,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return startBin must be a number');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - null endBin', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN + 2,
                            endBin: null,
                            description: BINDESCRIPTION + 9,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return endBin must be a number');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - empty string description', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            description: '',
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return description is not allowed to be empty');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - null description', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            description: null,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return description must be a string');
                }),
                commonFunc.createStep('card.bin.add', 'add bin - number description', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            description: 0,
                            ownershipTypeId: typeIdOwn
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return description must be a string');
                }),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.bin.add', 'missing permission', context => {
                    return {
                        bin: {
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            description: BINDESCRIPTION + 100,
                            ownershipTypeId: typeIdOwn
                        }
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
