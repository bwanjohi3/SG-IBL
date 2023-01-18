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
const PRODUCTNAME = 'addCardProd' + cardConstants.PRODUCTNAME;
const USERNAME = 'addCardProd' + userConstants.USERNAME;
const PERMISSION = 'card.product.add';
var stdPolicy;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'add product',
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
                cardMethods.addCardProduct('add product successfully', (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountLinkLimit: 2,
                        pinRetriesLimit: 3,
                        pinRetriesDailyLimit: 3,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 1, true),
                cardMethods.addCardProduct('add product inactive', (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountLinkLimit: 2,
                        pinRetriesLimit: 3,
                        pinRetriesDailyLimit: 3,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME, false),
                commonFunc.createStep('card.product.add', 'add duplicated product', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,

                        accountLinkLimit: 2,
                        pinRetriesLimit: 3,
                        pinRetriesDailyLimit: 3,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME), null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'cannot insert duplicated product name');
                }),
                commonFunc.createStep('card.product.add', 'no name', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountLinkLimit: 2,
                        pinRetriesLimit: 3,
                        pinRetriesDailyLimit: 3,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, null), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'cannot insert without product name');
                }),
                commonFunc.createStep('card.product.add', 'name empty string', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountLinkLimit: 2,
                        pinRetriesLimit: 3,
                        pinRetriesDailyLimit: 3,
                        startDate: new Date(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, ''), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'cannot insert with product name empty string');
                }),
                commonFunc.createStep('card.product.add', 'customerTypeId null', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountLinkLimit: 2,
                        pinRetriesLimit: 3,
                        pinRetriesDailyLimit: 3,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId
                    };
                }, PRODUCTNAME + 11), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'cannot insert with product name empty string');
                }),
                commonFunc.createStep('card.product.add', 'accountTypeId empty string', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountLinkLimit: 2,
                        pinRetriesLimit: 3,
                        pinRetriesDailyLimit: 3,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: '',
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 11), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'cannot insert with product name empty string');
                }),
                // commonFunc.createStep('card.product.add', 'customerType null', (context) => cardParams.addProductParams(context, (context) => {
                //     return {
                //         embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         accountLinkLimit: 2,
                //         pinRetriesLimit: 3,
                //         pinRetriesDailyLimit: 3,
                //         startDate: new Date(),
                //         name: Math.random().toString(),
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 12), null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'cannot insert with product name empty string');
                // }),
                // commonFunc.createStep('card.product.add', 'customerType empty string', (context) => cardParams.addProductParams(context, (context) => {
                //     return {
                //         embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         accountLinkLimit: 2,
                //         pinRetriesLimit: 3,
                //         pinRetriesDailyLimit: 3,
                //         startDate: new Date(),
                //         name: Math.random().toString(),
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 12), null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'cannot insert with product name empty string');
                // }),
                commonFunc.createStep('card.product.add', 'no description', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 2,
                            startDate: cardConstants.STARTDATE,
                            endDate: cardConstants.ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: 0,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            accountLinkLimit: 2,
                            pinRetriesLimit: 3,
                            pinRetriesDailyLimit: 3,
                            accountTypeId: context['list account types'][0][0].accountTypeId,
                            customerTypeId: context['list customer types'][0][0].customerTypeId
                        },
                        productAccountType: [{}],
                        productCustomerType: [{}]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'no description');
                }),
                commonFunc.createStep('card.product.add', 'description empty string', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 222,
                            description: '',
                            startDate: cardConstants.STARTDATE,
                            endDate: cardConstants.ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: 0,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            accountLinkLimit: 2,
                            pinRetriesLimit: 3,
                            pinRetriesDailyLimit: 3,
                            accountTypeId: context['list account types'][0][0].accountTypeId,
                            customerTypeId: context['list customer types'][0][0].customerTypeId
                        },
                        productAccountType: [{}],
                        productCustomerType: [{}]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'cannot insert with product description empty string');
                }),
                commonFunc.createStep('card.product.add', 'no start time', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 3,
                            description: cardConstants.DESCRIPTION,
                            endDate: cardConstants.ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: 0,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            accountLinkLimit: 2,
                            pinRetriesLimit: 3,
                            pinRetriesDailyLimit: 3,
                            startDate: new Date(),
                            accountTypeId: context['list account types'][0][0].accountTypeId,
                            customerTypeId: context['list customer types'][0][0].customerTypeId
                        },
                        productAccountType: [{}],
                        productCustomerType: [{}]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'start time is required');
                }),
                commonFunc.createStep('card.product.add', 'start time empty string', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 3,
                            description: cardConstants.DESCRIPTION,
                            startDate: '',
                            endDate: cardConstants.ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: 0,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            accountLinkLimit: 2,
                            pinRetriesLimit: 3,
                            pinRetriesDailyLimit: 3,
                            accountTypeId: context['list account types'][0][0].accountTypeId,
                            customerTypeId: context['list customer types'][0][0].customerTypeId
                        },
                        productAccountType: [{}],
                        productCustomerType: [{}]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'start time cannot be empty string');
                }),
                commonFunc.createStep('card.product.add', 'no end time', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 4,
                            description: cardConstants.DESCRIPTION,
                            startDate: cardConstants.STARTDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: 0,
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
                    assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 4).error, null, 'return card product');
                    assert.equals(result.cardProduct[0].endDate, null, 'no endDate');
                }),
                commonFunc.createStep('card.product.add', 'end time empty string', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 3,
                            description: cardConstants.DESCRIPTION,
                            startDate: cardConstants.STARTDATE,
                            endDate: '',
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: 0,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'end time cannot be empty string');
                }),
                // commonFunc.createStep('card.product.add', 'no cardTypeId', (context) => cardParams.addProductParams(context, (context) => {
                //     return {
                //         embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         pinRetriesLimit: 9,
                //         pinRetriesDailyLimit: 3,
                //         accountLinkLimit: 2,
                //         startDate: new Date(),
                //         name: Math.random().toString(),
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 5), null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'cardTypeId is required');
                // }),
                // commonFunc.createStep('card.product.add', 'cardTypeId empty string', (context) => cardParams.addProductParams(context, (context) => {
                //     return {
                //         embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         pinRetriesLimit: 9,
                //         pinRetriesDailyLimit: 3,
                //         accountLinkLimit: 2,
                //         startDate: new Date(),
                //         name: Math.random().toString(),
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 5), null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'typeId cannot be empty string');
                // }),
                // commonFunc.createStep('card.product.add', 'no binId', (context) => cardParams.addProductParams(context, (context) => {
                //     return {
                //         embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         pinRetriesLimit: 9,
                //         pinRetriesDailyLimit: 3,
                //         accountLinkLimit: 2,
                //         startDate: new Date(),
                //         name: Math.random().toString(),
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 55), null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'binId is required');
                // }),
                // commonFunc.createStep('card.product.add', 'binId empty string', (context) => cardParams.addProductParams(context, (context) => {
                //     return {
                //         embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         pinRetriesLimit: 9,
                //         pinRetriesDailyLimit: 3,
                //         accountLinkLimit: 2,
                //         startDate: new Date(),
                //         name: Math.random().toString(),
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 55), null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'binId cannot be empty string');
                // }),
                // commonFunc.createStep('card.product.add', 'no cardNumberConstructionId', (context) => cardParams.addProductParams(context, (context) => {
                //     return {
                //         embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         pinRetriesLimit: 9,
                //         pinRetriesDailyLimit: 3,
                //         accountLinkLimit: 2,
                //         startDate: new Date(),
                //         name: Math.random().toString(),
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 5), null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'cardNumberConstructionId is null');
                // }),
                // commonFunc.createStep('card.product.add', 'cardNumberConstructionId empty string', (context) => cardParams.addProductParams(context, (context) => {
                //     return {
                //         embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         pinRetriesLimit: 9,
                //         pinRetriesDailyLimit: 3,
                //         accountLinkLimit: 2,
                //         startDate: new Date(),
                //         name: Math.random().toString(),
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 5), null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'cardNumberConstructionId cannot be empty string');
                // }),
                // commonFunc.createStep('card.product.add', 'no termMonth', (context) => {
                //     return {
                //         product: {
                //             name: PRODUCTNAME + 6,
                //             description: cardConstants.DESCRIPTION,
                //             startDate: cardConstants.STARTDATE,
                //             endDate: cardConstants.ENDDATE,
                //             embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //             isActive: 0,
                //             periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //             branchId: context['get admin details'].memberOF[0].object,
                //             pinRetriesLimit: 9,
                //             pinRetriesDailyLimit: 3,
                //             accountLinkLimit: 2,
                //             accountTypeId: context['list account types'][0][0].accountTypeId,
                //             customerTypeId: context['list customer types'][0][0].customerTypeId
                //         },
                //         productAccountType: [{}],
                //         productCustomerType: [{}]
                //     };
                // }, null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'no termMonth');
                // }),
                // commonFunc.createStep('card.product.add', 'termMonth empty string', (context) => {
                //     return {
                //         product: {
                //             name: PRODUCTNAME + 6,
                //             description: cardConstants.DESCRIPTION,
                //             startDate: cardConstants.STARTDATE,
                //             endDate: cardConstants.ENDDATE,
                //             embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                //             isActive: 0,
                //             periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //             branchId: context['get admin details'].memberOF[0].object,
                //             pinRetriesLimit: 9,
                //             pinRetriesDailyLimit: 3,
                //             accountLinkLimit: 2,
                //             accountTypeId: context['list account types'][0][0].accountTypeId,
                //             customerTypeId: context['list customer types'][0][0].customerTypeId
                //         },
                //         productAccountType: [{}],
                //         productCustomerType: [{}]
                //     };
                // }, null,
                // (error, assert) => {
                //     assert.equals(error.type, 'PortHTTP', 'termMonth cannot be empty string');
                // }),
                commonFunc.createStep('card.product.add', 'no isActive', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 8,
                            description: cardConstants.DESCRIPTION,
                            startDate: cardConstants.STARTDATE,
                            endDate: cardConstants.ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
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
                    assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 8).error, null, 'return card product');
                    assert.true(result.cardProduct[0].isActive, 'isActive default false');
                }),
                commonFunc.createStep('card.product.add', 'isActive empty string', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 8,
                            description: cardConstants.DESCRIPTION,
                            startDate: cardConstants.STARTDATE,
                            endDate: cardConstants.ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: '',
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            pinRetriesLimit: 9,
                            pinRetriesDailyLimit: 3,
                            accountLinkLimit: 2
                        },
                        productAccountType: [{accountTypeId: context['list account types'][0][0].accountTypeId}],
                        productCustomerType: [{customerTypeId: context['list customer types'][0][0].customerTypeId}]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive cannot be empty string');
                }),
                commonFunc.createStep('card.product.add', 'no periodicCardFeeId', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        pinRetriesLimit: 9,
                        pinRetriesDailyLimit: 3,
                        accountLinkLimit: 2,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 9), (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 9).error, null, 'return card product');
                }),
                commonFunc.createStep('card.product.add', 'periodicCardFeeId empty string', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: '',
                        branchId: context['get admin details'].memberOF[0].object,
                        pinRetriesLimit: 9,
                        pinRetriesDailyLimit: 3,
                        accountLinkLimit: 2,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 9), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'periodicCardFeeId cannot be empty string');
                }),
                commonFunc.createStep('card.product.add', 'no branchId', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        pinRetriesLimit: 9,
                        pinRetriesDailyLimit: 3,
                        accountLinkLimit: 2,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 99), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'branchId is required');
                }),
                commonFunc.createStep('card.product.add', 'branchId empty string', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        branchId: '',
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        pinRetriesLimit: 9,
                        pinRetriesDailyLimit: 3,
                        accountLinkLimit: 2,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 99), null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'branchId is required');
                }),
                commonFunc.createStep('card.product.add', 'start time > end time', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 3,
                            description: cardConstants.DESCRIPTION,
                            startDate: cardConstants.ENDDATE,
                            endDate: cardConstants.STARTDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: 0,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            pinRetriesLimit: 9,
                            pinRetriesDailyLimit: 3,
                            accountLinkLimit: 2
                        },
                        productAccountType: [{accountTypeId: context['list account types'][0][0].accountTypeId}],
                        productCustomerType: [{customerTypeId: context['list customer types'][0][0].customerTypeId}]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'start date could not be greater than end date');
                }), {
                    name: 'Add two account and customer types',
                    params: (context, utils) => {
                        if (context['list customer types'][0].length === 1 || context['list account types'][0] === 1) {
                            return utils.skip();
                        }
                    },
                    steps: (context) => [
                        commonFunc.createStep('card.product.add', 'add 2 account types and 2 customer types', (context1) => {
                            return {
                                product: {
                                    name: PRODUCTNAME + 55,
                                    description: cardConstants.DESCRIPTION,
                                    startDate: cardConstants.STARTDATE,
                                    endDate: cardConstants.ENDDATE,
                                    embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                                    isActive: 0,
                                    periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                                    branchId: context['get admin details'].memberOF[0].object,
                                    pinRetriesLimit: 9,
                                    pinRetriesDailyLimit: 3,
                                    accountLinkLimit: 2
                                },
                                productAccountType: [{accountTypeId: context['list account types'][0][0].accountTypeId}],
                                productCustomerType: [{customerTypeId: context['list customer types'][0][0].customerTypeId}]
                            };
                        }, (result, assert) => {
                            assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 55).error, null, 'return card product');
                        }),
                        cardMethods.getCardProduct('get product', context1 => context1['add 2 account types and 2 customer types'].cardProduct[0].productId),
                        commonFunc.createStep('card.product.add', 'add same accountTypeId twice', (context1) => {
                            return {
                                product: {
                                    name: PRODUCTNAME + 55,
                                    description: cardConstants.DESCRIPTION,
                                    startDate: cardConstants.STARTDATE,
                                    endDate: cardConstants.ENDDATE,
                                    embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                                    isActive: 0,
                                    periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                                    branchId: context['get admin details'].memberOF[0].object,
                                    pinRetriesLimit: 9,
                                    pinRetriesDailyLimit: 3,
                                    accountLinkLimit: 2
                                },
                                productAccountType: [{accountTypeId: context['list account types'][0][0].accountTypeId}],
                                productCustomerType: [{customerTypeId: context['list customer types'][0][0].customerTypeId}]
                            };
                        }, null,
                        (error, assert) => {
                            assert.equals(error.type, 'portSQL', 'return sql failure');
                        }),
                        commonFunc.createStep('card.product.add', 'add same customerTypeId twice', (context1) => {
                            return {
                                product: {
                                    name: PRODUCTNAME + 55,
                                    description: cardConstants.DESCRIPTION,
                                    startDate: cardConstants.STARTDATE,
                                    endDate: cardConstants.ENDDATE,
                                    embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                                    isActive: 0,
                                    periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                                    branchId: context['get admin details'].memberOF[0].object,
                                    pinRetriesLimit: 9,
                                    pinRetriesDailyLimit: 3,
                                    accountLinkLimit: 2
                                },
                                productAccountType: [{accountTypeId: context['list account types'][0][0].accountTypeId}],
                                productCustomerType: [{customerTypeId: context['list customer types'][0][0].customerTypeId}]
                            };
                        }, null,
                        (error, assert) => {
                            assert.equals(error.type, 'portSQL', 'return sql failure');
                        })
                    ]
                }, // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login second user', USERNAME + 1, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.product.add', 'add product for BU that is not visible', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        pinRetriesLimit: 9,
                        pinRetriesDailyLimit: 3,
                        accountLinkLimit: 2,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 10), null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'branchId is not visible');
                }),
                userMethods.logout('logout second user', context => context['login second user']['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.product.add', 'missing permissions', (context) => cardParams.addProductParams(context, (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        pinRetriesLimit: 9,
                        pinRetriesDailyLimit: 3,
                        accountLinkLimit: 2,
                        startDate: new Date(),
                        name: Math.random().toString(),
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 11), null,
                (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
