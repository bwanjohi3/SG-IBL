var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userConstants = require('ut-test/lib/constants/user').constants();
var customerConstants = require('ut-test/lib/constants/customer').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
var customerMethods = require('ut-test/lib/methods/customer');
var cardParams = require('ut-test/lib/requestParams/card');
const ORGNAME = customerConstants.ORGNAME;
const APPLICATIONTEXT = cardConstants.APPLICATIONTEXT;
const BATCHTEXT = cardConstants.BATCHTEXT;
const REASONNAME = cardConstants.PRODUCTNAME;
const TEST1 = cardConstants.TEST1;
const USERNAME = 'addReason' + userConstants.USERNAME;
const PERMISSION = 'card.reason.add';
var stdPolicy, actionId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'add card reason',
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
                        object: context['get admin details'].memberOF[0].object,
                        policyId: stdPolicy,
                        roles: [context['add role successfully'].role[0].actorId],
                        defaultRoleId: context['add role successfully'].role[0].actorId
                    };
                }, USERNAME),
                userMethods.approveUser('approve first user', context => context['add new user'].person.actorId),
                commonFunc.createStep('customer.organization.add', 'add organization child of main org', (context) => {
                    return {
                        organization: {
                            organizationName: ORGNAME,
                            isEnabled: 1,
                            isDeleted: 0
                        },
                        parent: [context['get admin details'].memberOF[0].object]
                    };
                }, (result, assert) => {
                    assert.equals(customerJoiValidation.validateAddOrganization(result['organization.info'][0]).error, null, 'return all details after creating the organization');
                    assert.equals(result['organization.info'][0].organizationName, ORGNAME, 'return organizationName');
                }),
                customerMethods.approveOrganization('approve add organization child of main org', (context) => context['add organization child of main org']['organization.info'][0].actorId),
                cardMethods.fetchBin('get all bins', context => {
                    return {};
                }),
                cardMethods.fetchCardNumberConstruction('get all number constructions', context => {
                    return {};
                }),
                cardMethods.fetchPeriodicCardFee('get periodic card fees', context => {
                    return {};
                }),
                cardMethods.listAccountTypes('list account types', context => {
                    return {};
                }),
                cardMethods.listCustomerTypes('list customer types', context => {
                    return {};
                }),
                cardMethods.listCipher('list cipher', context => {
                    return {};
                }),
                commonFunc.createStep('card.moduleAction.list', 'list module actions', context => {
                    return {};
                }, (result, assert) => {
                    actionId = result.Application[0].actionId;
                    assert.equals(cardJoiValidation.validateListModuleAction(result.Application).error, null, 'return module action list');
                }),
                cardMethods.addCardReason('add reason successfully', (context) => {
                    return {
                        action: [actionId]
                    };
                }, 1, APPLICATIONTEXT, REASONNAME),
                commonFunc.createStep('card.reason.get', 'get reason', context => {
                    return {
                        reasonId: context['add reason successfully'].cardReason[0].reasonId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetCardReason(result).error, null, 'return reason details');
                    assert.equals(result.reasonAction[0].actionId, actionId, 'return correct actionId');
                    assert.equals(result.cardReason[0].reasonName, REASONNAME, 'return correct reason name');
                }),
                cardMethods.addCardReason('add reason with two actions', (context) => {
                    return {
                        action: [context['list module actions'].Application[0].actionId, context['list module actions'].Application[1].actionId]
                    };
                }, 1, APPLICATIONTEXT, REASONNAME + 1),
                commonFunc.createStep('card.reason.get', 'get reason with two actions', context => {
                    return {
                        reasonId: context['add reason with two actions'].cardReason[0].reasonId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetCardReason(result).error, null, 'return reason details');
                    assert.true(result.reasonAction.length === 2, 'return two actions');
                }),
                cardMethods.addCardReason('add inactive reason successfully', (context) => {
                    return {
                        action: [actionId]
                    };
                }, 0, APPLICATIONTEXT, REASONNAME + 2),
                commonFunc.createStep('card.reason.add', 'add reason - missing action', (context) => cardParams.addCardReasonParams(context, (context) => {
                    return {};
                }, 1, APPLICATIONTEXT, REASONNAME + 3), null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'action is required');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - invalid number for action', (context) => cardParams.addCardReasonParams(context, (context) => {
                    return {
                        action: [0]
                    };
                }, 1, APPLICATIONTEXT, REASONNAME + 4), null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'action must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - empty array action', (context) => cardParams.addCardReasonParams(context, (context) => {
                    return {
                        action: []
                    };
                }, 1, APPLICATIONTEXT, REASONNAME + 5), null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'action must contain atleast one item');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - string for action', (context) => cardParams.addCardReasonParams(context, (context) => {
                    return {
                        action: [TEST1]
                    };
                }, 1, APPLICATIONTEXT, REASONNAME + 3), null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return errror');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - empty string for action', (context) => cardParams.addCardReasonParams(context, (context) => {
                    return {
                        action: ['']
                    };
                }, 1, APPLICATIONTEXT, REASONNAME + 3), null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return errror');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - missing reason', (context) => {
                    return {
                        action: [actionId]
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'reason is required');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - missing isActive', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            module: APPLICATIONTEXT,
                            name: REASONNAME + 3
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive is required');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - invalid isActive', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 3,
                            module: APPLICATIONTEXT,
                            name: REASONNAME + 3
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be boolean');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - empty string isActive', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: '',
                            module: APPLICATIONTEXT,
                            name: REASONNAME + 3
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive  must be boolean');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - string for isActive', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: TEST1,
                            module: APPLICATIONTEXT,
                            name: REASONNAME + 3
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive  must be boolean');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - missing module', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 1,
                            name: REASONNAME + 3
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'module is required');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - empty string module', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 1,
                            module: '',
                            name: REASONNAME + 3
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'module not allowed to be empty');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - invalid module', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 1,
                            module: TEST1,
                            name: REASONNAME + 3
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return error - invalid module');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - missing name', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 1,
                            module: APPLICATIONTEXT
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'name is required');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - duplicate name', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 1,
                            module: APPLICATIONTEXT,
                            name: REASONNAME
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'duplicate name');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - empty string name', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 1,
                            module: APPLICATIONTEXT,
                            name: ''
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'name is not allowed to be empty');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - null for name', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 1,
                            module: APPLICATIONTEXT,
                            name: null
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'name must be a string');
                }),
                commonFunc.createStep('card.reason.add', 'add reason - action that doesnt belong to this module', (context) => {
                    return {
                        action: [actionId],
                        reason: {
                            isActive: 1,
                            module: BATCHTEXT,
                            name: REASONNAME + 4
                        }
                    };
                }, null, (error, assert) => {
                    // console.log(error);
                    assert.equals(error.type, 'portSQL', 'invalid action');
                }),
                // commonFunc.createStep('card.reason.get', 'get reason - action that doesnt belong to this module', context => {
                //     return {
                //         reasonId: context['add reason - action that doesnt belong to this module'].cardReason[0].reasonId
                //     };
                // }, (result, assert) => {
                //     console.log(result);
                //     assert.equals(cardJoiValidation.validateGetCardReason(result).error, null, 'return reason details');
                //     assert.equals(result.reasonAction[0].actionId, actionId, 'return correct actionId');
                //     assert.equals(result.cardReason[0].reasonName, REASONNAME, 'return correct reason name');
                // }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.reason.add', 'missing permissions', (context) => cardParams.addCardReasonParams(context, (context) => {
                    return {
                        action: [actionId]
                    };
                }, 1, APPLICATIONTEXT, REASONNAME), null,
                (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
