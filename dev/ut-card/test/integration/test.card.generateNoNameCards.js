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
const PRODUCTNAME = 'gnnc' + cardConstants.PRODUCTNAME;
const USERNAME = 'gnnc' + userConstants.USERNAME;
const NUMBEROFCARDS = 12;
const BATCHNAME = cardConstants.NONAMEBATCH;
const ACTIONAPPROVE = 'Approve';
const APPROVEDEACTIVATION = 'ApproveDeactivation';
const APPROVEDESTRUCTION = 'ApproveDestruction';
const ACTIVE = 'Active';
const SENDTOPRODUCTION = 'Send to Production';
const COMPLETESTATUS = 'Complete';
const PENDINGACTIVATION = 'Pending Activation';
const GENERATEPINS = 'Generate PIN Mails';
const ACTIONHOT = 'Hot';
const STATUSHOT = 'HOT';
const DEACTIVATE = 'Deactivate';
const PENDINGDEACTIVATION = 'Pending Deactivation';
const DESTRUCT = 'Destruct';
const PENDINGDESTRUCTION = 'Pending Destruction';
const CUSTOMERNUMBER = commonFunc.generateRandomNumber().toString().slice(7);
const ACCOUNTTYPEID = '2'; // savings
const CURRENCYID = '1';
const STATUSID = 'active';
const BALANCE = '1000';
const ACCOUNTNAME = 'CURRENT_ACCOUNT';
const ACCOUNTORDER = 1;
const ACCOUNTNUMBER = commonFunc.generateRandomNumber().toString();
var stdPolicy, embosedTypeIdName, customerTypeId;
var cardIds = [];
var approvedCards = [];
var applicationIds = [];

const GETBYDEPTHORGANIZATION = customerConstants.GETBYDEPTHORGANIZATION;
var productConstants = require('ut-test/lib/constants/product').constants();
var productMethods = require('ut-test/lib/methods/product');
var productJoiValidation = require('ut-test/lib/joiValidations/product');
const STARTDATE = productConstants.STARTDATE;
var customerTypeClient, currencyId, productType2, periodicFeeId, productGroupId;

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
                cardMethods.listAccountTypes('list account types', context => {
                    return {};
                }),
                cardMethods.listCustomerTypes('list customer types', context => {
                    return {};
                }),
                cardMethods.listCipher('list cipher', context => {
                    return {};
                }),
                commonFunc.createStep('core.currency.fetch', 'fetch currencies', (context) => {
                    return {};
                }, (result, assert) => {
                    currencyId = result.currency[0].currencyId;
                }),
                commonFunc.createStep('customerTest.customer.mChStatusChange', 'disable maker checker of customers', (context) => {
                    return {
                        isMCHDisabled: 1
                    };
                }, (result, assert) => {
                    assert.equals(typeof result, 'object', 'return object');
                }),
                customerMethods.getByDepthOrganization('get organizations by depth', context => GETBYDEPTHORGANIZATION),
                commonFunc.createStep('ledger.productGroup.fetch', 'fetch product groups', (context) => {
                    return {};
                }, (result, assert) => {
                    var productGroup = result.productGroup.find((group) => group.isForCustomer === false);
                    productGroupId = productGroup.productGroupId;
                }),
                commonFunc.createStep('ledger.productType.fetch', 'fetch product types', (context) => {
                    return {
                        productGroupId: productGroupId
                    };
                }, (result, assert) => {
                    productType2 = result.productType[0].productTypeId;
                }),
                // fetch product periodic periodicFeeId
                commonFunc.createStep('ledger.productPeriodicFee.fetch', 'fetch product periodic fee', (context) => {
                    return {};
                }, (result, assert) => {
                    periodicFeeId = result.periodicFee[0].periodicFeeId;
                }),
                commonFunc.createStep('ledger.product.add', 'add product 1', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME,
                            customerTypeId: customerTypeClient,
                            businessUnitId: context['get organizations by depth'].organizations[1].actorId,
                            currencyId: currencyId,
                            startDate: STARTDATE,
                            productTypeId: productType2,
                            periodicFeeId: periodicFeeId
                        }
                    };
                }, (result, assert) => {
                    assert.equals(productJoiValidation.validateAddProduct(result).error, null, 'Return all details after adding a product');
                }),
                productMethods.approveProduct('approve product 1', context => {
                    return {
                        productId: context['add product 1'].product[0].productId,
                        currentVersion: context['add product 1'].product[0].currentVersion
                    };
                }),
                cardMethods.addCardProduct('add product successfully', (context) => {
                    return {
                        embossedTypeId: embosedTypeIdName,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 1, true),
                // cardMethods.addCardProduct('add product that is expired', (context) => {
                //     return {
                //         embossedTypeId: embosedTypeIdName,
                //         periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                //         branchId: context['get admin details'].memberOF[0].object,
                //         // termMonth: -1,
                //         accountTypeId: context['list account types'][0][0].accountTypeId,
                //         customerTypeId: context['list customer types'][0][0].customerTypeId
                //     };
                // }, PRODUCTNAME + 2, true),
                commonFunc.createStep('customer.type.fetch', 'fetch customer types', (context) => {
                    return {};
                }, (result, assert) => {
                    customerTypeId = result.customerType[0].customerTypeId;
                }),
                commonFunc.createStep('customer.customer.add', 'add customer', (context) => {
                    return {
                        customer: {
                            customerNumber: CUSTOMERNUMBER,
                            customerTypeId: customerTypeId,
                            organizationId: context['get organizations by depth'].organizations[1].actorId
                        },
                        person: {
                            isEnabled: true,
                            isDeleted: false,
                            firstName: customerConstants.FIRSTNAME,
                            lastName: customerConstants.LASTNAME
                        },
                        account: [{
                            productId: context['add product 1'].product[0].productId,
                            accountTypeId: ACCOUNTTYPEID,
                            businessUnitId: context['get organizations by depth'].organizations[1].actorId,
                            statusId: STATUSID,
                            accountName: ACCOUNTNAME,
                            accountNumber: ACCOUNTNUMBER + 2,
                            currencyId: CURRENCYID,
                            balance: BALANCE
                        }]
                    };
                }, (result, assert) => {
                    assert.equals(customerJoiValidation.validateAddCustomer(result.customer).error, null, 'Return all details after adding a customer');
                }),
                commonFunc.createStep('card.account.search', 'list accountIds', context => {
                    return {
                        customerNumber: context['add customer'].customer.customerNumber,
                        personNumber: context['add customer'].customer.actorId,
                        productId: context['add product successfully'].cardProduct[0].productId
                    };
                }, (result, assert) => {
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
                cardMethods.editBatch('approve batch', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: false,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionLabel
                    };
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
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionLabel
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
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionLabel
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
                        name: 'Applications',
                        steps: () => [
                            commonFunc.createStep('card.noNameApplication.add', 'add application' + cardId, context2 => {
                                return {
                                    application: {
                                        cardNumber: commonFunc.generateRandomNumber().toString(),
                                        customerNumber: context['add customer'].customer.customerNumber,
                                        customerName: customerConstants.FIRSTNAME + customerConstants.LASTNAME,
                                        personName: customerConstants.FIRSTNAME + customerConstants.LASTNAME,
                                        personNumber: context['add customer'].customer.actorId,
                                        productId: context['add product successfully'].cardProduct[0].productId
                                    },
                                    account: [{
                                        accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                                        accountNumber: ACCOUNTNUMBER,
                                        accountOrder: ACCOUNTORDER,
                                        accountTypeName: ACCOUNTNAME,
                                        currency: CURRENCYID,
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
                    name: 'Approve applications',
                    steps: (context) => [
                        commonFunc.createStep('card.application.statusUpdate', 'approve applications', context3 => {
                            return {
                                application: applicationIds,
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                            };
                        }, (result, assert) => {
                            assert.same(result, [], 'return updated application');
                        })
                    ]
                }, {
                    name: 'Approve cards',
                    steps: (context) => approvedCards.map((cardId) => ({
                        name: 'Change status',
                        steps: () => [
                            commonFunc.createStep('card.cardInUse.statusUpdate', 'approve all cards in use', context5 => {
                                return {
                                    card: [{
                                        cardId: cardId,
                                        statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === PENDINGACTIVATION).fromStatusId
                                    }],
                                    cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === ACTIONAPPROVE).actionId
                                };
                            }, (result, assert) => {
                                assert.same(result, [], 'approve cards');
                            })
                        ]
                    }))
                }, {
                    name: 'Generate pin mails',
                    steps: (context) => approvedCards.map((cardId) => ({
                        name: 'Change status',
                        steps: () => [
                            commonFunc.createStep('card.cardInUse.statusUpdate', 'approve all cards in use', context5 => {
                                return {
                                    card: [{
                                        cardId: cardId,
                                        statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === ACTIVE).fromStatusId
                                    }],
                                    cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === GENERATEPINS).actionId
                                };
                            }, (result, assert) => {
                                assert.same(result, [], 'pin generation');
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
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === ACTIVE).fromStatusId,
                            reasonId: context['list statuses'].CardInUseReason[0].reasonId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === DEACTIVATE).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'status pending deactivation');
                }), commonFunc.createStep('card.cardInUse.statusUpdate', 'mark one card as deactivated', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[1].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === PENDINGDEACTIVATION).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionLabel === APPROVEDEACTIVATION).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'status deactivation');
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
                commonFunc.createStep('card.cardInUse.statusUpdate', 'approve card that will have no pin data', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[NUMBEROFCARDS - 1].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === PENDINGACTIVATION).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'approve missing pin data card');
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
                cardMethods.editBatch('approve second batch', context => {
                    return {
                        batch: {
                            batchId: context['add second no name batch'].batch[0].batchId,
                            namedBatch: false,
                            batchName: context['add second no name batch'].batch[0].batchName,
                            branchId: context['add second no name batch'].batch[0].branchId,
                            numberOfCards: context['add second no name batch'].batch[0].numberOfCards,
                            statusId: context['add second no name batch'].batch[0].statusId,
                            targetBranchId: context['add second no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add second no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionLabel
                    };
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
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionLabel
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
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionLabel
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
                            customerNumber: context['add customer'].customer.customerNumber,
                            customerName: customerConstants.FIRSTNAME + customerConstants.LASTNAME,
                            personName: customerConstants.FIRSTNAME + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add second no name batch'].batch[0].productId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        cardId: context['get created cards'].cards[0].cardId
                    };
                },
                (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'approve application', context => {
                    return {
                        application: [{
                            applicationId: context['add application for card that is expired'].cardApplication[0].applicationId,
                            batchId: context['add application for card that is expired'].cardApplication[0].batchId
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'return updated application');
                }),
                commonFunc.createStep('card.cardInUse.statusUpdate', 'approve expired card', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[0].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === PENDINGACTIVATION).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'approve card');
                }),
                commonFunc.createStep('card.cardInUse.statusUpdate', 'approve all cards in use', context => {
                    return {
                        card: [{
                            cardId: context['get created cards'].cards[0].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === ACTIVE).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === GENERATEPINS).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'pin generation');
                })
                // userMethods.logout('logout sa', context => context.login['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
