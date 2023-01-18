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
const PRODUCTNAME = 'gnc' + cardConstants.PRODUCTNAME;
const USERNAME = 'gnc' + userConstants.USERNAME;
const CUSTOMERNUMBER = commonFunc.generateRandomNumber().toString().slice(7);
const ACCOUNTTYPEID = '2'; // savings
const CURRENCYID = '1';
const STATUSID = 'active';
const BALANCE = '1000';
const ACCOUNTNAME = 'CURRENT_ACCOUNT';
const ACCOUNTORDER = 1;
const ACTIONAPPROVE = 'Approve';
const APPROVEDEACTIVATION = 'ApproveDeactivation';
const APPROVEDESTRUCTION = 'ApproveDestruction';
const SENDTOPRODUCTION = 'Send to Production';
const ACTIVE = 'Active';
const GENERATEPINS = 'Generate PIN Mails';
const COMPLETESTATUS = 'Complete';
const ACTIONCREATEBATCH = 'Create Batch';
const ACTIONHOT = 'Hot';
const STATUSHOT = 'HOT';
const DEACTIVATE = 'Deactivate';
const PENDINGDEACTIVATION = 'Pending Deactivation';
const DESTRUCT = 'Destruct';
const PENDINGDESTRUCTION = 'Pending Destruction';
const ACCOUNTNUMBER = commonFunc.generateRandomNumber().toString();
const NAMEBATCH = cardConstants.NAMEBATCH;
const NUMBEROFCARDS = 12;
var applicationIds = [];
var cardIds = [];
var approvedCards = [];
var APPARRAY = Array.apply(null, {length: NUMBEROFCARDS}).map(Number.call, Number);
var stdPolicy, embosedTypeIdName, customerTypeId;

const GETBYDEPTHORGANIZATION = customerConstants.GETBYDEPTHORGANIZATION;
var productConstants = require('ut-test/lib/constants/product').constants();
var productMethods = require('ut-test/lib/methods/product');
var productJoiValidation = require('ut-test/lib/joiValidations/product');
const STARTDATE = productConstants.STARTDATE;
var customerTypeClient, currencyId, productType2, periodicFeeId, productGroupId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'generate name cards',
        server: opt.server,
        serverConfig: opt.serverConfig,
        client: opt.client,
        clientConfig: opt.clientConfig,
        services: [opt.services.pan],
        steps: function(test, bus, run) {
            return run(test, bus, [userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                commonFunc.createStep('user.user.get', 'get admin details', (context) => {
                    return {
                        actorId: context.login['identity.check'].actorId
                    };
                }, (result, assert) => {
                    assert.equals(customerJoiValidation.validateGetPerson(result.person, userConstants.ADMINFIRSTNAME).error, null, 'return person');
                }),
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
                commonFunc.createStep('customer.type.fetch', 'fetch customer types', (context) => {
                    return {};
                }, (result, assert) => {
                    customerTypeId = result.customerType[0].customerTypeId;
                }),
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
                commonFunc.createStep('card.embossedType.fetch', 'get all embossed types', context => {
                    return {};
                }, (result, assert) => {
                    var embosedType = result.embossedType.find(
                        (embossedType) => embossedType.itemCode === 'named'
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
                cardMethods.fetchConfig('list statuses', context => {
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
                            accountNumber: ACCOUNTNUMBER,
                            currencyId: CURRENCYID,
                            balance: BALANCE
                        },
                        {
                            productId: context['add product 1'].product[0].productId,
                            accountTypeId: ACCOUNTTYPEID,
                            businessUnitId: context['get organizations by depth'].organizations[1].actorId,
                            statusId: STATUSID,
                            accountName: ACCOUNTNAME,
                            accountNumber: ACCOUNTNUMBER + 1,
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
                })].concat(APPARRAY.map(application => {
                    return commonFunc.createStep('card.application.add', 'add application' + application, context => {
                        return {
                            application: {
                                customerNumber: context['add customer'].customer.customerNumber,
                                customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                                holderName: cardConstants.HOLDERNAME + application,
                                personNumber: context['add customer'].customer.actorId,
                                productId: context['add product successfully'].cardProduct[0].productId,
                                personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                                targetBranchId: context['add customer'].customer.organizationId,
                                issuingBranchId: context['add customer'].customer.organizationId
                            },
                            account: [{
                                accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                                accountNumber: ACCOUNTNUMBER,
                                accountOrder: ACCOUNTORDER,
                                accountTypeName: ACCOUNTNAME,
                                currency: CURRENCYID,
                                isPrimary: 1
                            }]
                        };
                    }, (result, assert) => {
                        assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                        assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                        applicationIds.push({applicationId: result.cardApplication[0].applicationId});
                    });
                }), {
                    name: 'Approve applications and create batch',
                    steps: (context) => [
                        commonFunc.createStep('card.application.statusUpdate', 'approve applications', context3 => {
                            return {
                                application: applicationIds,
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                            };
                        }, (result, assert) => {
                            assert.same(result, [], 'applications approved');
                        }),
                        commonFunc.createStep('card.application.statusUpdate', 'create batch', context3 => {
                            return {
                                application: applicationIds,
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONCREATEBATCH).actionId,
                                batch: {
                                    batchName: NAMEBATCH,
                                    targetBranchId: context['get admin details'].memberOF[0].object
                                }
                            };
                        }, (result, assert) => {
                            assert.same(result, [], 'batch created');
                        }),
                        commonFunc.createStep('card.batch.fetch', 'fetch newly created batch', context3 => {
                            return {
                                filterBy: {
                                    batchName: NAMEBATCH,
                                    productId: null
                                }
                            };
                        }, (result, assert) => {
                            assert.true(result.batch.length === 1, 'return batch');
                        }),
                        commonFunc.createStep('card.batch.get', 'get batch details', context3 => {
                            return {
                                batchId: context3['fetch newly created batch'].batch[0].id
                            };
                        }, (result, assert) => {
                            assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                        }),
                        cardMethods.editBatch('approve batch', context3 => {
                            return {
                                batch: {
                                    batchId: context3['get batch details'].batch[0].batchId,
                                    namedBatch: true,
                                    batchName: context3['get batch details'].batch[0].batchName,
                                    branchId: context3['get batch details'].batch[0].branchId,
                                    numberOfCards: null,
                                    statusId: context3['get batch details'].batch[0].statusId,
                                    targetBranchId: context3['get batch details'].batch[0].targetBranchId,
                                    issuingBranchId: null,
                                    productId: null
                                },
                                batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionId,
                                batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionLabel
                            };
                        }),
                        commonFunc.createStep('card.batch.get', 'get batch', context3 => {
                            return {
                                batchId: context3['get batch details'].batch[0].batchId
                            };
                        }, (result, assert) => {
                            assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                        }),
                        cardMethods.editBatch('send to production batch', context3 => {
                            return {
                                batch: {
                                    batchId: context3['get batch details'].batch[0].batchId,
                                    namedBatch: true,
                                    batchName: context3['get batch details'].batch[0].batchName,
                                    branchId: context3['get batch details'].batch[0].branchId,
                                    numberOfCards: null,
                                    statusId: context3['get batch'].batch[0].statusId,
                                    targetBranchId: context3['get batch details'].batch[0].targetBranchId,
                                    issuingBranchId: null,
                                    productId: null
                                },
                                batchActionId: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionId,
                                batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionLabel
                            };
                        }),
                        commonFunc.createStep('card.batch.get', 'get batch before complete', context3 => {
                            return {
                                batchId: context3['get batch details'].batch[0].batchId
                            };
                        }, (result, assert) => {
                            assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                        }),
                        cardMethods.editBatch('complete batch', context3 => {
                            return {
                                batch: {
                                    batchId: context3['get batch details'].batch[0].batchId,
                                    namedBatch: true,
                                    batchName: context3['get batch details'].batch[0].batchName,
                                    branchId: context3['get batch details'].batch[0].branchId,
                                    numberOfCards: null,
                                    statusId: context3['get batch before complete'].batch[0].statusId,
                                    targetBranchId: context3['get batch details'].batch[0].targetBranchId,
                                    issuingBranchId: null,
                                    productId: null
                                },
                                batchActionId: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionId,
                                batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionLabel
                            };
                        }),
                        commonFunc.createStep('card.cardInProduction.fetch', 'get created cards', context3 => {
                            return {
                                filterBy: {
                                    batchName: context3['get batch details'].batch[0].batchName
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
                        })
                    ]
                }, {
                    name: 'Generate pin mails',
                    steps: (context) => approvedCards.map((cardId) => ({
                        name: 'Pin mails',
                        steps: [
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
                            cardId: approvedCards[0],
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
                            cardId: approvedCards[1],
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
                            cardId: approvedCards[1],
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
                            cardId: approvedCards[2],
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
                            cardId: approvedCards[2],
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
                            cardId: approvedCards[2],
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === PENDINGDESTRUCTION).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionLabel === APPROVEDESTRUCTION).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'status destructed');
                }),
                commonFunc.createStep('card.application.add', 'add application with expired product', context => {
                    return {
                        application: {
                            customerNumber: context['add customer'].customer.customerNumber,
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product that is expired'].cardProduct[0].productId,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }]
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                    assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'approve applications', context => {
                    return {
                        application: [{
                            applicationId: context['add application with expired product'].cardApplication[0].applicationId
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'applications approved');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'create expired batch', context => {
                    return {
                        application: [{
                            applicationId: context['add application with expired product'].cardApplication[0].applicationId
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONCREATEBATCH).actionId,
                        batch: {
                            batchName: NAMEBATCH + 'expired',
                            targetBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'batch created');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch expired batch', context => {
                    return {
                        filterBy: {
                            batchName: NAMEBATCH + 'expired',
                            productId: null
                        }
                    };
                }, (result, assert) => {
                    assert.true(result.batch.length === 1, 'return batch');
                }),
                commonFunc.createStep('card.batch.get', 'get expired batch', context => {
                    return {
                        batchId: context['fetch expired batch'].batch[0].id
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                cardMethods.editBatch('approve expired batch', context => {
                    return {
                        batch: {
                            batchId: context['get expired batch'].batch[0].batchId,
                            namedBatch: true,
                            batchName: context['get expired batch'].batch[0].batchName,
                            branchId: context['get expired batch'].batch[0].branchId,
                            numberOfCards: null,
                            statusId: context['get expired batch'].batch[0].statusId,
                            targetBranchId: context['get expired batch'].batch[0].targetBranchId,
                            issuingBranchId: null,
                            productId: null
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch', context => {
                    return {
                        batchId: context['get expired batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                cardMethods.editBatch('send to production batch', context => {
                    return {
                        batch: {
                            batchId: context['get expired batch'].batch[0].batchId,
                            namedBatch: true,
                            batchName: context['get expired batch'].batch[0].batchName,
                            branchId: context['get expired batch'].batch[0].branchId,
                            numberOfCards: null,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: context['get expired batch'].batch[0].targetBranchId,
                            issuingBranchId: null,
                            productId: null
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch before complete', context => {
                    return {
                        batchId: context['get expired batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                cardMethods.editBatch('complete batch', context => {
                    return {
                        batch: {
                            batchId: context['get expired batch'].batch[0].batchId,
                            namedBatch: true,
                            batchName: context['get expired batch'].batch[0].batchName,
                            branchId: context['get expired batch'].batch[0].branchId,
                            numberOfCards: null,
                            statusId: context['get batch before complete'].batch[0].statusId,
                            targetBranchId: context['get expired batch'].batch[0].targetBranchId,
                            issuingBranchId: null,
                            productId: null
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionLabel
                    };
                }),
                commonFunc.createStep('card.cardInProduction.fetch', 'get expired card', context => {
                    return {
                        filterBy: {
                            batchName: context['get expired batch'].batch[0].batchName
                        }
                    };
                }, (result, assert) => {
                    assert.true(result.cards.length === 1, 'return all cards');
                    result.cards.map((card, index) => {
                        if (index < NUMBEROFCARDS - 3) {
                            approvedCards.push(card.cardId);
                        }
                        cardIds.push(card.cardId);
                    });
                }),
                commonFunc.createStep('card.cardInUse.statusUpdate', 'approve all cards in use', context => {
                    return {
                        card: [{
                            cardId: context['get expired card'].cards[0].cardId,
                            statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === ACTIVE).fromStatusId
                        }],
                        cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === GENERATEPINS).actionId
                    };
                }, (result, assert) => {
                    assert.same(result, [], 'pin generation');
                })
                // userMethods.logout('logout sa', context => context.login['identity.check'].sessionId)
            ));
        }
    }, cache);
};
