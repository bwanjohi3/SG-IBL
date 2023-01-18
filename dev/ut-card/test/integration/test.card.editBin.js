var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userConstants = require('ut-test/lib/constants/user').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var stdPolicy;
const USERNAME = 'eb' + userConstants.USERNAME;
const BINDESCRIPTION = cardConstants.RANDOMBINDESCRIPTION;
const TEST1 = cardConstants.TEST1;
const PERMISSION = 'card.bin.edit';
const RANDOMBIN = parseInt('28' + commonFunc.generateRandomFixedInteger(4));
const RANDOMBINLESSNUM = parseInt('28' + commonFunc.generateRandomFixedInteger(3));
const TYPEOWN = 'own';

var typeIdOwn, typeNameOwn, ownBin;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'edit bin',
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
                    typeNameOwn = ownershipType1.ownershipTypeName;
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

                commonFunc.createStep('card.bin.edit', 'edit bin - missing bin array', context => {
                    return {};
                }, (result, assert) => {
                    assert.same(result, [], 'return empty array');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - missing binId', context => {
                    return {
                        bin: [{
                            bin: RANDOMBIN,
                            description: BINDESCRIPTION + 1,
                            isActive: true
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId is required');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - empty string for binId', context => {
                    return {
                        bin: [{
                            binId: '',
                            bin: RANDOMBIN,
                            description: BINDESCRIPTION + 1,
                            isActive: true
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be a number');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - string for binId', context => {
                    return {
                        bin: [{
                            binId: TEST1,
                            bin: RANDOMBIN,
                            description: BINDESCRIPTION + 1,
                            isActive: true
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be a number');
                }),

                commonFunc.createStep('card.bin.edit', 'edit bin - 0 for binId', context => {
                    return {
                        bin: [{
                            binId: 0,
                            bin: RANDOMBIN,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: BINDESCRIPTION + 1,
                            isActive: true
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - null for binId', context => {
                    return {
                        bin: [{
                            binId: null,
                            bin: RANDOMBIN,
                            description: BINDESCRIPTION + 1,
                            isActive: true
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return binId must be a number');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - missing bin param', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            description: BINDESCRIPTION + 1,
                            isActive: true
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return bin is required');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - empty string bin', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            bin: '',
                            description: BINDESCRIPTION + 1,
                            isActive: true
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return bin is not allowed to be empty');
                }),
                // TODO:
                // fix card.bin.edit first
                // commonFunc.createStep('card.bin.edit', 'edit bin - duplicate bin', context => {
                //     return {
                //         bin: [{
                //             binId: ownBin,
                //             startBin: RANDOMBIN + 1,
                //             endBin: RANDOMBIN + 1,
                //             ownershipTypeLabel: typeNameOwn,
                //             ownershipTypeId: typeIdOwn,
                //             description: BINDESCRIPTION + 1
                //         }]
                //     };
                // }, null, (error, assert) => {
                //     assert.equals(error.type, 'portSQL', 'return Bin already exists');
                // }),
                commonFunc.createStep('card.bin.edit', 'edit bin - less numbers bin', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: RANDOMBINLESSNUM,
                            endBin: RANDOMBINLESSNUM,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: BINDESCRIPTION + 1
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return Bin length must be at least 6 characters long');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - more numbers bin', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: RANDOMBIN.toString() + 1,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: BINDESCRIPTION + 1
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return Bin length must be less than or equal to 6 characters long');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - 0 bin', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: 0,
                            endBin: 0,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: BINDESCRIPTION + 1
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return bin must be a string');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - null bin', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: null,
                            endBin: null,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: BINDESCRIPTION + 1
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return bin must be a string');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - missing description', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return description is required');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - empty string description', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: ''
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return description is not allowed to be empty');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - 0 description', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: 0
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return description must be a string');
                }),
                commonFunc.createStep('card.bin.edit', 'edit bin - null description', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: null
                        }]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return description must be a string');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.bin.edit', 'missing permission', context => {
                    return {
                        bin: [{
                            binId: ownBin,
                            startBin: RANDOMBIN,
                            endBin: RANDOMBIN,
                            ownershipTypeLabel: typeNameOwn,
                            ownershipTypeId: typeIdOwn,
                            description: BINDESCRIPTION + 100
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
