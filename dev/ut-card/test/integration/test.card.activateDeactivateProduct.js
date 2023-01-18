var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var userConstants = require('ut-test/lib/constants/user').constants();
var customerConstants = require('ut-test/lib/constants/customer').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var cardMethods = require('ut-test/lib/methods/card');
var customerMethods = require('ut-test/lib/methods/customer');
var cardParams = require('ut-test/lib/requestParams/card');
const ORGNAME = customerConstants.ORGNAME;
const PRODUCTNAME = 'ad' + cardConstants.PRODUCTNAME;
const USERNAME = 'ad' + userConstants.USERNAME;
const STARTDATE = commonFunc.getFormattedDate(Date.now());
const ENDDATE = commonFunc.getFormattedDate(Date.now() + 1000 * 60 * 60 * 24);
const PERMISSION = 'card.product.edit';
var stdPolicy;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'activate/deactivate product',
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
                        object: context['get admin details']['memberOF'][0].object,
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
                cardMethods.listAccountTypes('list account types', context => {
                    return {};
                }),
                cardMethods.listCipher('list cipher', context => {
                    return {};
                }),
                cardMethods.listCustomerTypes('list customer types', context => {
                    return {};
                }),
                cardMethods.addCardProduct('add product successfully', (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME, true),
                cardMethods.addCardProduct('add product to make it inactive', (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 1, true),
                cardMethods.editCardProduct('edit product successfully - make it inactive', (context) => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                },
                STARTDATE, ENDDATE, 0),
                cardMethods.fetchCardProduct('fetch all card products successfully', (context) => {}),
                cardMethods.editCardProduct('edit product successfully - make it active again', (context) => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                },
                STARTDATE, ENDDATE, 1),
                cardMethods.editCardProduct('edit product successfully - set back to false - used in the tests below', (context) => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                },
                STARTDATE, ENDDATE, 0),
                commonFunc.createStep('card.product.edit', 'edit product unsuccessfully - isActive empty string', context => cardParams.editProductParams(context, context => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, ENDDATE, STARTDATE, ''), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be boolean');
                }),
                commonFunc.createStep('card.product.edit', 'edit product unsuccessfully - isActive invalid value', context => cardParams.editProductParams(context, context => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, ENDDATE, STARTDATE, 2), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be boolean');
                }),
                commonFunc.createStep('card.product.edit', 'edit product unsuccessfully - isActive missing value', (context) => {
                    return {
                        product: {
                            productId: context['add product successfully'].cardProduct[0].productId,
                            startDate: STARTDATE,
                            endDate: ENDDATE
                            // isActive: true
                        },
                        productAccountType: [{
                            productId: context['add product successfully'].cardProduct[0].productId,
                            accountTypeId: context['list account types'][0][0].accountTypeId
                        }]
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateEditProduct(result.cardProduct[0]).error, null, 'return card product');
                    assert.true(result.cardProduct[0].isActive, 'return true isActive/ current default value');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login second user', USERNAME + 1, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.product.edit', 'edit product for BU that is not visible', (context) => cardParams.editProductParams(context, context => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                },
                STARTDATE, ENDDATE), null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'branchId is not visible');
                }),
                userMethods.logout('logout second user', context => context['login second user']['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.product.edit', 'edit product for BU that is not visible with missing permissions', (context) => cardParams.editProductParams(context, context => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                },
                STARTDATE, ENDDATE), null,
                (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
