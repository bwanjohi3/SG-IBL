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
// var activeInvalidProductId, inactiveValidProductId;
const PRODUCTNAME = 'lp' + cardConstants.PRODUCTNAME;
const USERNAME = 'lp' + userConstants.USERNAME;
const PERMISSION = 'card.product.list';
var activeProductId, inActiveProductId, stdPolicy;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'list product',
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
                cardMethods.listAccountTypes('list account types', context => {
                    return {};
                }),
                cardMethods.listCustomerTypes('list customer types', context => {
                    return {};
                }),
                cardMethods.listCipher('list cipher', context => {
                    return {};
                }),
                commonFunc.createStep('card.product.add', 'add active product successfully', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME,
                            description: cardConstants.DESCRIPTION,
                            startDate: cardConstants.STARTDATE,
                            endDate: cardConstants.ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: true,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            pinRetriesLimit: 9,
                            pinRetriesDailyLimit: 3,
                            accountLinkLimit: 2
                        },
                        productAccountType: [{
                            accountTypeId: context['list account types'][0][0].accountTypeId
                        }],
                        productCustomerType: [{
                            customerTypeId: context['list customer types'][0][0].customerTypeId
                        }]
                    };
                }, (result, assert) => {
                    activeProductId = result.cardProduct[0].productId;
                    assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME).error, null, 'return card product');
                    assert.equals(result.cardProduct[0].isActive, true, 'return isActive true');
                }),
                commonFunc.createStep('card.product.add', 'add inactive product successfully', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 1,
                            description: cardConstants.DESCRIPTION,
                            startDate: cardConstants.STARTDATE,
                            endDate: cardConstants.ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: false,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            pinRetriesLimit: 9,
                            pinRetriesDailyLimit: 3,
                            accountLinkLimit: 2
                        },
                        productAccountType: [{
                            accountTypeId: context['list account types'][0][0].accountTypeId
                        }],
                        productCustomerType: [{
                            customerTypeId: context['list customer types'][0][0].customerTypeId
                        }]
                    };
                }, (result, assert) => {
                    inActiveProductId = result.cardProduct[0].productId;
                    assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 1).error, null, 'return card product');
                    assert.equals(result.cardProduct[0].isActive, false, 'return isActive true');
                }),
                // commonFunc.createStep('card.product.add', 'add active and invalid product successfully', (context) => {
                //     return {
                //         product: {
                //             name: PRODUCTNAME + 2,
                //             description: cardConstants.DESCRIPTION,
                //             startDate: cardConstants.INVALIDSTARTDATE,
                //             endDate: null,
                //             isActive: true,
                //             periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //             branchId: context['get admin details'].memberOF[0].object
                //         },
                //         productAccountType: [{
                //             accountTypeId: context['list account types'][0][0].accountTypeId
                //         }],
                //         productCustomerType: [{
                //             customerTypeId: context['list customer types'][0][0].customerTypeId
                //         }]
                //     };
                // }, (result, assert) => {
                //     activeInvalidProductId = result.cardProduct[0].productId;
                //     assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 2).error, null, 'return card product');
                //     assert.equals(result.cardProduct[0].isActive, true, 'return isActive true');
                // }),
                // commonFunc.createStep('card.product.add', 'add inactive and valid product successfully', (context) => {
                //     return {
                //         product: {
                //             name: PRODUCTNAME + 3,
                //             description: cardConstants.DESCRIPTION,
                //             startDate: cardConstants.STARTDATE,
                //             endDate: cardConstants.ENDDATE,
                //             isActive: false,
                //             periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //             branchId: context['get admin details'].memberOF[0].object
                //         },
                //         productAccountType: [{
                //             accountTypeId: context['list account types'][0][0].accountTypeId
                //         }],
                //         productCustomerType: [{
                //             customerTypeId: context['list customer types'][0][0].customerTypeId
                //         }]
                //     };
                // }, (result, assert) => {
                //     inactiveValidProductId = result.cardProduct[0].productId;
                //     assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 3).error, null, 'return card product');
                //     assert.equals(result.cardProduct[0].isActive, false, 'return isActive true');
                // }),
                // commonFunc.createStep('card.product.add', 'add inactive and invalid product successfully', (context) => {
                //     return {
                //         product: {
                //             name: PRODUCTNAME + 4,
                //             description: cardConstants.DESCRIPTION,
                //             startDate: cardConstants.INVALIDSTARTDATE,
                //             endDate: null,
                //             isActive: false,
                //             periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //             branchId: context['get admin details'].memberOF[0].object
                //         },
                //         productAccountType: [{
                //             accountTypeId: context['list account types'][0][0].accountTypeId
                //         }],
                //         productCustomerType: [{
                //             customerTypeId: context['list customer types'][0][0].customerTypeId
                //         }]
                //     };
                // }, (result, assert) => {
                //     inactiveValidProductId = result.cardProduct[0].productId;
                //     assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 4).error, null, 'return card product');
                //     assert.equals(result.cardProduct[0].isActive, false, 'return isActive true');
                // }),
                cardMethods.listCardProduct('list all card products', context => {
                    return {};
                }),
                commonFunc.createStep('card.product.list', 'list active card products', (context) => {
                    return {
                        isActive: 1
                    };
                }, (result, assert) => {
                    assert.true(result.product.find(product => product.productId !== inActiveProductId), 'return inActiveProduct that is created earlier is not present');
                    assert.equals(cardJoiValidation.validateListCardProduct(result.product).error, null, 'return list all products');
                }),
                commonFunc.createStep('card.product.list', 'list inactive card products', (context) => {
                    return {
                        isActive: 0
                    };
                }, (result, assert) => {
                    assert.true(result.product.find(product => product.productId !== activeProductId), 'return ActiveProduct that is created earlier is not present');
                    assert.equals(cardJoiValidation.validateListCardProduct(result.product).error, null, 'return list all products');
                }),
                // commonFunc.createStep('card.product.list', 'list valid card products', (context) => {
                //     return {
                //         isValid: 1
                //     };
                // }, (result, assert) => {
                //     assert.true(result.product.find(product => product.productId !== activeInvalidProductId), 'return activeInvalidProductId that is created earlier is not present');
                //     assert.equals(cardJoiValidation.validateListCardProduct(result.product).error, null, 'return list all products');
                // }),
                // commonFunc.createStep('card.product.list', 'list invalid card products', (context) => {
                //     return {
                //         isValid: 0
                //     };
                // }, (result, assert) => {
                //     assert.true(result.product.find(product => product.productId !== inactiveValidProductId), 'return inactiveValidProductId that is created earlier is not present');
                //     assert.equals(cardJoiValidation.validateListCardProduct(result.product).error, null, 'return list all products');
                // }),
                // commonFunc.createStep('card.product.list', 'list active and invalid card products', (context) => {
                //     return {
                //         isActive: 1,
                //         isValid: 0
                //     };
                // }, (result, assert) => {
                //     assert.true(result.product.find(product => product.productId !== inactiveValidProductId), 'return inactiveValidProductId that is created earlier is not present');
                //     assert.equals(cardJoiValidation.validateListCardProduct(result.product).error, null, 'return list all products');
                //     // assert.same(result.product, [], 'return empty result set');
                // }),
                // commonFunc.createStep('card.product.list', 'list inactive and valid card products', (context) => {
                //     return {
                //         isActive: 0,
                //         isValid: 1
                //     };
                // }, (result, assert) => {
                //     assert.true(result.product.find(product => product.productId !== activeInvalidProductId), 'return activeInvalidProductId that is created earlier is not present');
                //     assert.equals(cardJoiValidation.validateListCardProduct(result.product).error, null, 'return list all products');
                // }),
                // commonFunc.createStep('card.product.list', 'list active and valid card products', (context) => {
                //     return {
                //         isActive: 1,
                //         isValid: 1
                //     };
                // }, (result, assert) => {
                // }),
                // commonFunc.createStep('card.product.list', 'list inactive and invalid card products', (context) => {
                //     return {
                //         isActive: 0,
                //         isValid: 0
                //     };
                // }, (result, assert) => {
                // }),
                commonFunc.createStep('card.product.list', 'list Products - empty string isActive', (context) => {
                    return {
                        isActive: ''
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be a number');
                }),
                commonFunc.createStep('card.product.list', 'list Products - invalid isActive', (context) => {
                    return {
                        isActive: cardConstants.TEST1
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be a number');
                }),
                commonFunc.createStep('card.product.list', 'list Products - non-existing isActive', (context) => {
                    return {
                        isActive: 2
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be less than or equal to 1');
                }),
                // commonFunc.createStep('card.product.list', 'list Products - empty string isValid', (context) => {
                //     return {
                //         isValid: ''
                //     };
                // }, null, (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'isValid must be a number');
                // }),
                // commonFunc.createStep('card.product.list', 'list Products - invalid isValid', (context) => {
                //     return {
                //         isValid: cardConstants.TEST1
                //     };
                // }, null, (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'isValid must be a number');
                // }),
                // commonFunc.createStep('card.product.list', 'list Products - non-existing isValid', (context) => {
                //     return {
                //         isValid: 2
                //     };
                // }, null, (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'isValid must be less than or equal to 1');
                // }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.product.list', 'missing permissions', (context) => {
                    return {};
                }, null,
                (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
