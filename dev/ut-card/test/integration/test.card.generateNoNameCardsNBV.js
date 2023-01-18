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
const PRODUCTNAME = 'gnncnbv' + cardConstants.PRODUCTNAME;
const USERNAME = 'gnncnbv' + userConstants.USERNAME;
const NUMBEROFCARDS = 12;
const BATCHNAME = cardConstants.NONAMEBATCH;
const ACTIVATE = 'Activate';
const APPROVEDESTRUCTION = 'ApproveDestruction';
const ACTIVE = 'Active';
const COMPLETESTATUS = 'Complete';
const PENDINGACTIVATION = 'Pending Activation';
const ACTIONHOT = 'Hot';
const STATUSHOT = 'HOT';
const DEACTIVATE = 'Deactivate';
const DESTRUCT = 'Destruct';
const PENDINGDESTRUCTION = 'Pending Destruction';
const ACCOUNTORDER = 1;
var stdPolicy, embosedTypeIdName;
var cardIds = [];
var approvedCards = [];
var applicationIds = [];
var accountTypes = [];
var customerTypes = [];

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'generate no name cards',
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
                cardMethods.fetchConfig('list statuses', context => {
                    return {};
                }),
                commonFunc.createStep('card.embossedType.fetch', 'get all embossed types', context => {
                    return {};
                }, (result, assert) => {
                    var embosedType = result.embossedType.find(
                        (embossedType) => embossedType.itemCode === 'noNamed'
                    );
                    embosedTypeIdName = embosedType.embossedTypeId;
                    assert.equals(cardJoiValidation.validateFetchEmbossedType(result.embossedType[0]).error, null, 'return embossed types');
                }),
                cardMethods.fetchCardNumberConstruction('get all number constructions', context => {
                    return {};
                }),
                cardMethods.fetchPeriodicCardFee('get periodic card fees', context => {
                    return {};
                }),
                commonFunc.createStep('card.accountType.list', 'list account types', context => {
                    return {};
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateListAccountTypes(result[0][0]).error, null, 'return account types');
                    result[0].map(type => {
                        accountTypes.push({accountTypeId: type.accountTypeId});
                    });
                }),
                commonFunc.createStep('card.customerType.list', 'list customer types', context => {
                    return {};
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateListCustomerTypes(result[0][0]).error, null, 'return customer types');
                    result[0].map(type => {
                        customerTypes.push({customerTypeId: type.customerTypeId});
                    });
                }),
                cardMethods.listCipher('list cipher', context => {
                    return {};
                }),
                commonFunc.createStep('card.product.add', 'add product successfully', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 1,
                            embossedTypeId: embosedTypeIdName,
                            description: cardConstants.DESCRIPTION,
                            startDate: cardConstants.STARTDATE,
                            endDate: cardConstants.ENDDATE,
                            isActive: 1,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            pinRetriesLimit: 9,
                            pinRetriesDailyLimit: 3,
                            accountLinkLimit: 2
                        },
                        productAccountType: accountTypes,
                        productCustomerType: customerTypes
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 1).error, null, 'return card product');
                }),
                // commonFunc.createStep('card.product.add', 'add product that is expired', (context) => {
                //     return {
                //         product: {
                //             name: PRODUCTNAME + 2,
                //             embossedTypeId: embosedTypeIdName,
                //             description: cardConstants.DESCRIPTION,
                //             startDate: cardConstants.STARTDATE,
                //             endDate: cardConstants.ENDDATE,
                //             isActive: 1,
                //             periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //             branchId: context['get admin details'].memberOF[0].object,
                //             pinRetriesLimit: 9,
                //             pinRetriesDailyLimit: 3,
                //             accountLinkLimit: 2
                //         },
                //         productAccountType: accountTypes,
                //         productCustomerType: customerTypes
                //     };
                // }, (result, assert) => {
                //     assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 2).error, null, 'return card product');
                // }),
                commonFunc.createStep('card.product.list', 'list products', context => {
                    return {};
                }, (result, assert) => {
                    assert.true(result.product.length > 0, 'return products');
                }),
                commonFunc.createStep('card.account.search', 'list accountIds', context => {
                    return {
                        customerNumber: opt.customerNumber,
                        personNumber: opt.personNumber,
                        productId: context['add product successfully'].cardProduct[0].productId
                    };
                }, (result, assert) => {
                    assert.true(result.account.length > 0, 'return account');
                    assert.equals(cardJoiValidation.validateAccountSearch(result.accountLink).error, null, 'return all accountLinkIds');
                }),
                commonFunc.createStep('card.batch.addNoNameBatch', 'add no name batch', context => {
                    return {
                        batch: {
                            batchName: BATCHNAME,
                            numberOfCards: NUMBEROFCARDS,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddNoNameBatch(result.batch[0]).error, null, 'return no name batch');
                }),
                commonFunc.createStep('card.batch.get', 'get batch', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                cardMethods.editBatch('send to production batch', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: false,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionLabel === cardConstants.ACTIONSENDTOPRODUCTION).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionLabel === cardConstants.ACTIONSENDTOPRODUCTION).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get production batch', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                cardMethods.editBatch('complete batch', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: false,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['get production batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionLabel === COMPLETESTATUS).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionLabel === COMPLETESTATUS).actionLabel
                    };
                }),
                commonFunc.createStep('card.cardInProduction.fetch', 'get created cards', context => {
                    return {
                        filterBy: {
                            batchName: context['add no name batch'].batch[0].batchName
                        }
                    };
                }, (result, assert) => {
                    assert.true(result.cards.length === NUMBEROFCARDS, 'return all cards');
                    result.cards.map((card, index) => {
                        if (index < NUMBEROFCARDS - 3) {
                            approvedCards.push(card.cardId);
                        }
                        cardIds.push(card.cardId);
                    });
                }), {
                    name: 'Create applications',
                    steps: (context) => cardIds.map((cardId) => ({
                        name: 'Create app',
                        steps: () => [
                            commonFunc.createStep('card.noNameApplication.add', 'add application' + cardId, context2 => {
                                return {
                                    application: {
                                        cardNumber: commonFunc.generateRandomNumber().toString(),
                                        customerNumber: opt.customerNumber,
                                        customerName: opt.customerName,
                                        personName: opt.personName,
                                        personNumber: opt.personNumber,
                                        productId: context['add product successfully'].cardProduct[0].productId
                                    },
                                    account: [{
                                        accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                                        accountNumber: context['list accountIds'].account[0].accountNumber,
                                        accountOrder: ACCOUNTORDER,
                                        accountTypeName: context['list accountIds'].account[0].accountTypeName,
                                        currency: context['list accountIds'].account[0].currency,
                                        isPrimary: 1
                                    }],
                                    cardId: cardId
                                };
                            },
                        (result, assert) => {
                            assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                            result.cardApplication.map(application => {
                                applicationIds.push({applicationId: application.applicationId, batchId: application.batchId});
                            });
                        })
                        ]
                    }))
                }, {
                    name: 'Approve cards',
                    steps: (context) => approvedCards.map((cardId) => ({
                        name: 'change status',
                        steps: () => [
                            commonFunc.createStep('card.cardInUse.statusUpdate', 'approve all cards in use', context5 => {
                                return {
                                    card: [{
                                        cardId: cardId,
                                        statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === PENDINGACTIVATION).fromStatusId
                                    }],
                                    cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === ACTIVATE).actionId
                                };
                            }, (result, assert) => {
                                assert.same(result, [], 'approve cards');
                            })
                        ]
                    }))
                }, commonFunc.createStep('card.cardInUse.statusUpdate', 'mark one card as HOT', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[0].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === ACTIVE).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === ACTIONHOT).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'status hot');
                }),
                commonFunc.createStep('card.cardInUse.statusUpdate', 'mark one card as pending deactivation', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[1].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusLabel === ACTIVE).fromStatusId,
                            reasonId: context['list statuses'].CardInUseReason[0].reasonId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionLabel === DEACTIVATE).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'status pending deactivation');
                }),
                commonFunc.createStep('card.cardInUse.statusUpdate', 'mark second card as HOT', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[2].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === ACTIVE).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === ACTIONHOT).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'status hot');
                }),
                commonFunc.createStep('card.cardInUse.statusUpdate', 'mark card as pending destruction', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[2].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === STATUSHOT).fromStatusId,
                            reasonId: context['list statuses'].CardInUseReason[0].reasonId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === DESTRUCT).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'status pending destruction');
                }),
                commonFunc.createStep('card.cardInUse.statusUpdate', 'mark card as destructed', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[2].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === PENDINGDESTRUCTION).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionLabel === APPROVEDESTRUCTION).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'status destructed');
                }),
                // TO DO: make a product that expires today
                commonFunc.createStep('card.batch.addNoNameBatch', 'add second no name batch', context => {
                    return {
                        batch: {
                            batchName: BATCHNAME + 1,
                            numberOfCards: 1,
                            productId: context['add product that is expired'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddNoNameBatch(result.batch[0]).error, null, 'return no name batch');
                }),
                commonFunc.createStep('card.batch.get', 'get second batch', context => {
                    return {
                        batchId: context['add second no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                cardMethods.editBatch('send to production second batch', context => {
                    return {
                        batch: {
                            batchId: context['add second no name batch'].batch[0].batchId,
                            namedBatch: false,
                            batchName: context['add second no name batch'].batch[0].batchName,
                            branchId: context['add second no name batch'].batch[0].branchId,
                            numberOfCards: context['add second no name batch'].batch[0].numberOfCards,
                            statusId: context['get second batch'].batch[0].statusId,
                            targetBranchId: context['add second no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add second no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionLabel === cardConstants.ACTIONSENDTOPRODUCTION).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionLabel === cardConstants.ACTIONSENDTOPRODUCTION).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get second production batch', context => {
                    return {
                        batchId: context['add second no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                cardMethods.editBatch('complete second batch', context => {
                    return {
                        batch: {
                            batchId: context['add second no name batch'].batch[0].batchId,
                            namedBatch: false,
                            batchName: context['add second no name batch'].batch[0].batchName,
                            branchId: context['add second no name batch'].batch[0].branchId,
                            numberOfCards: context['add second no name batch'].batch[0].numberOfCards,
                            statusId: context['get second production batch'].batch[0].statusId,
                            targetBranchId: context['add second no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add second no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionLabel === COMPLETESTATUS).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionLabel === COMPLETESTATUS).actionLabel
                    };
                }),
                commonFunc.createStep('card.cardInProduction.fetch', 'get created cards', context => {
                    return {
                        filterBy: {
                            batchName: context['add second no name batch'].batch[0].batchName
                        }
                    };
                }, (result, assert) => {
                    assert.true(result.cards.length === 1, 'return all cards');
                }),
                // assing the expired card to a customer
                commonFunc.createStep('card.noNameApplication.add', 'add application for card that is expired', context => {
                    return {
                        application: {
                            cardNumber: commonFunc.generateRandomNumber().toString(),
                            customerNumber: opt.customerNumber,
                            customerName: opt.customerName,
                            personName: opt.personName,
                            personNumber: opt.personNumber,
                            productId: context['add second no name batch'].batch[0].productId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        cardId: context['get created cards'].cards[0].cardId
                    };
                },
                (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                }),
                commonFunc.createStep('card.cardInUse.statusUpdate', 'approve expired card', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[0].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === PENDINGACTIVATION).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === ACTIVATE).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'approve card');
                })
                // userMethods.logout('logout sa', context => context.login['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
