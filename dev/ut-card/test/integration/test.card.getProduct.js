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
const PRODUCTNAME = 'gp' + cardConstants.PRODUCTNAME;
const USERNAME = 'gp' + userConstants.USERNAME;
const TEST1 = cardConstants.TEST1;
const PERMISSION = 'card.product.get';
var accountTypeId, customerTypeId, stdPolicy;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'get product',
        server: opt.server,
        serverConfig: opt.serverConfig,
        client: opt.client,
        clientConfig: opt.clientConfig,
        services: [opt.services.pan],
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
                cardMethods.fetchBrand('get all card brands', context => {
                    return {};
                }),
                cardMethods.fetchEmbossedTypes('get all embossed types', context => {
                    return {};
                }),
                cardMethods.fetchOwnershipTypes('list ownership types', context => {
                    return {};
                }),
                cardMethods.fetchPartners('fetch partners', context => {
                    return {};
                }),
                cardMethods.fetchCardNumberConstruction('get all number constructions', context => {
                    return {};
                }),
                cardMethods.fetchPeriodicCardFee('get periodic card fees', context => {
                    return {};
                }),
                cardMethods.listCipher('list cipher', context => {
                    return {};
                }),
                commonFunc.createStep('card.accountType.list', 'list account types', (context) => {
                    return {};
                }, (result, assert) => {
                    accountTypeId = result[0][0].accountTypeId;
                    assert.equals(cardJoiValidation.validateListAccountTypes(result[0][0]).error, null, 'return account types');
                }),
                commonFunc.createStep('card.customerType.list', 'list customer types', (context) => {
                    return {};
                }, (result, assert) => {
                    customerTypeId = result[0][0].customerTypeId;
                    assert.equals(cardJoiValidation.validateListCustomerTypes(result[0][0]).error, null, 'return customer types');
                }),
                cardMethods.addCardProduct('add product successfully', (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 1, true),
                commonFunc.createStep('card.product.get', 'get product successfully', (context) => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId
                    };
                }, (result, assert) => {
                    assert.true(result.accountType[0].accountTypeId === accountTypeId && result.customerType[0].customerTypeId === customerTypeId, 'return correct accountTypeID and customerTypeId');
                    assert.equals(cardJoiValidation.validateAccountType(result.accountType[0]).error, null, 'return accountType');
                    assert.equals(cardJoiValidation.validateCustomerType(result.customerType[0]).error, null, 'return customerType');
                }),
                commonFunc.createStep('card.product.get', 'get product unsuccessfully - missing parameter', (context) => {
                    return {
                        // productId: context['add product successfully'].cardProduct[0].productId
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'productId is required');
                }),
                commonFunc.createStep('card.product.get', 'get product usuccessfully - productId empty string', (context) => {
                    return {
                        productId: ''
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'productId must be a number');
                }),
                commonFunc.createStep('card.product.get', 'get product usuccessfully - productId invalid', (context) => {
                    return {
                        productId: TEST1
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'productId must be a number');
                }),
                commonFunc.createStep('card.product.get', 'get product usuccessfully - productId invalid number', (context) => {
                    return {
                        productId: 0
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'productId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.product.get', 'get product usuccessfully - productId non-existing', (context) => {
                    return {
                        productId: 999999
                    };
                }, (result, assert) => {
                    assert.same(result.accountType, [], 'return empty array');
                    assert.same(result.customerType, [], 'return empty array');
                    assert.same(result.product, [], 'return empty array');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.product.get', 'missing permissions', (context) => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId
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
