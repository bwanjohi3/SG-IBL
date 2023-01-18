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
const ORGNAME = customerConstants.ORGNAME;
const APPLICATIONTEXT = cardConstants.APPLICATIONTEXT;
const REASONNAME = cardConstants.PRODUCTNAME;
const TEST1 = cardConstants.TEST1;
const USERNAME = 'gr' + userConstants.USERNAME;
const PERMISSION = 'card.reason.get';
var stdPolicy, actionId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'get card reason',
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
                userMethods.addUser('add second user', context => {
                    return {
                        object: context['add organization child of main org']['organization.info'][0].actorId,
                        policyId: stdPolicy,
                        roles: [context['add role successfully'].role[0].actorId],
                        defaultRoleId: context['add role successfully'].role[0].actorId
                    };
                }, USERNAME + 1),
                userMethods.approveUser('approve second user', (context) => context['add second user'].person.actorId),
                userMethods.grantAction('grant admin permissions to user 2', context => context['add second user'].person.actorId),
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
                commonFunc.createStep('card.reason.get', 'get reason successfully', context => {
                    return {
                        reasonId: context['add reason successfully'].cardReason[0].reasonId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetCardReason(result).error, null, 'return reason details');
                    assert.equals(result.reasonAction[0].actionId, actionId, 'return correct actionId');
                    assert.equals(result.cardReason[0].reasonName, REASONNAME, 'return correct reason name');
                }),
                commonFunc.createStep('card.reason.get', 'get reason - missing reasonId', context => {
                    return {};
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'reasonId is required');
                }),
                commonFunc.createStep('card.reason.get', 'get reason - invalid reasonId', context => {
                    return {
                        reasonId: 0
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return error - ust be larger than or equal to 1');
                }),
                commonFunc.createStep('card.reason.get', 'get reason - string reasonId', context => {
                    return {
                        reasonId: TEST1
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return error - must be a number');
                }),
                commonFunc.createStep('card.reason.get', 'get reason - empty string reasonId', context => {
                    return {
                        reasonId: ''
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return error - must be a number');
                }),
                commonFunc.createStep('card.reason.get', 'get reason - null reasonId', context => {
                    return {
                        reasonId: null
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return error - must be a number');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.reason.get', 'missing permissions', (context) => {
                    return {
                        reasonId: context['add reason successfully'].cardReason[0].reasonId
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
