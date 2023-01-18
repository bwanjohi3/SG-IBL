var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var transferJoiValidation = require('ut-test/lib/joiValidations/transfer');
var userConstants = require('ut-test/lib/constants/user').constants();
var customerConstants = require('ut-test/lib/constants/customer').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
var customerMethods = require('ut-test/lib/methods/customer');
const ORGNAME = customerConstants.ORGNAME;
const PRODUCTNAME = 'gncs' + cardConstants.PRODUCTNAME;
const USERNAME = 'gncs' + userConstants.USERNAME;
const ACCOUNTORDER = 1;
const ACTIONAPPROVE = 'Approve';
const ACTIONAPPROVEACTIVATION = 'ApproveActivate';
const APPROVEDEACTIVATION = 'ApproveDeactivation';
const APPROVEDESTRUCTION = 'ApproveDestruction';
const SENDTOPRODUCTION = 'Send to Production';
const ACTIVATE = 'Activate';
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
const PENDINGACTIVATION = 'PendingActivation';
const ACCEPTED = 'Accepted';
const NAMEBATCH = cardConstants.NAMEBATCH;
const NUMBEROFCARDS = 12;
const TYPEOWN = 'own';
const NAME = cardConstants.RANDOMNAME;
const BIN1 = parseInt('34' + commonFunc.generateRandomFixedInteger(4));
const TERMMONTH12 = 12;
const VALUE1 = 1;
const VALUE0 = 0;
const RANDOM32 = 'abcdefabcdefabcde' + commonFunc.generateRandomNumber();
const RANDOM16 = 'a' + commonFunc.generateRandomNumber();
const FOURSYMBOLS = 'ac01';
const CRYPTOMETHODKQ = 'KQ';
const TRUE = true;
const FALSE = false;

var applicationIds = [];
var cardIds = [];
var approvedCards = [];
var APPARRAY = Array.apply(null, {length: NUMBEROFCARDS}).map(Number.call, Number);
var stdPolicy, embosedTypeIdName;
var typeIdOwn, typeNameOwn, issuerId, ownBin, cardNumberConstructionId, cipher;

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
                commonFunc.createStep('card.embossedType.fetch', 'get all embossed types', context => {
                    return {};
                }, (result, assert) => {
                    var embosedType = result.embossedType.find(
                        (embossedType) => embossedType.itemCode === 'named'
                    );
                    embosedTypeIdName = embosedType.embossedTypeId;
                    assert.equals(cardJoiValidation.validateFetchEmbossedType(result.embossedType[0]).error, null, 'return embossed types');
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

                cardMethods.fetchBrand('get all card brands', context => {
                    return {};
                }),
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
                            startBin: BIN1,
                            endBin: BIN1,
                            description: NAME
                        }
                    };
                }, (result, assert) => {
                    ownBin = result.cardBin[0].binId;
                    assert.equals(cardJoiValidation.validateAddBin(result.cardBin[0]).error, null, 'return correct bin');
                }),
                commonFunc.createStep('transfer.partner.add', 'add transfer partner', context => {
                    return {
                        partner: {
                            port: commonFunc.generateRandomFixedInteger(6).toString(),
                            partnerId: commonFunc.generateRandomFixedInteger(6).toString(),
                            mode: commonFunc.generateRandomFixedInteger(6).toString(),
                            name: NAME
                        }
                    };
                }, (result, assert) => {
                    issuerId = result.partner[0].partnerId;
                    assert.equals(transferJoiValidation.validateAddTransferPartner(result.partner).error, null, 'return partner details');
                }),
                commonFunc.createStep('card.cardNumberConstruction.fetch', 'fetch card Number Construction', context => {
                    return {};
                }, (result, assert) => {
                    cardNumberConstructionId = result.cardNumberConstruction[0].cardNumberConstructionId;
                    assert.true(result.cardNumberConstruction.length > 0, 'return more than one result');
                }),
                commonFunc.createStep('card.cipher.list', 'list card cipher', context => {
                    return {};
                }, (result, assert) => {
                    cipher = result.ciphers[0];
                    assert.true(result.ciphers.length > 0, 'return more than one result');
                }),
                commonFunc.createStep('card.type.add', 'add card type own with required fields only', context => {
                    return {
                        type: [{
                            ownershipTypeName: typeNameOwn, // string, allow own, external
                            ownershipTypeId: typeIdOwn,
                            name: NAME, // string, max 100
                            description: NAME, // string, allow ''
                            cardBrandId: context['get all card brands'].cardBrand[0].cardBrandId, // when embossedTypeName is own, required, number
                            cardNumberConstructionId: cardNumberConstructionId, // when embossedTypeName is own, required, number
                            termMonth: TERMMONTH12, // when embossedTypeName is own, required, number
                            cryptogramMethodIndex: VALUE1, // when embossedTypeName is own, required, number
                            cryptogramMethodName: CRYPTOMETHODKQ,  // when embossedTypeName is own, required, string, KQ, KW
                            schemeId: VALUE0, // when embossedTypeName is own and cryptogramMethodName is KQ required, number 0, 1, 2 // when embossedTypeName is own and cryptogramMethodName is KW required, number 0, 1, 2, 3
                            ivac: RANDOM32, // when embossedTypeName is own, required, string, regex(/^[a-f0-9]{32}$/i),
                            applicationInterchangeProfile: FOURSYMBOLS, // when embossedTypeName is own, required, string, regex(/^[a-f0-9]{4}$/i)
                            decimalisation: RANDOM16, // when embossedTypeName is own, required, string, regex(/^[a-f0-9]{16}$/)
                            cdol1ProfileId: VALUE1, // when embossedTypeName is own, required, number
                            cipher: cipher, // when embossedTypeName is own, required, string, aes128, aes192, aes256, des3, blowfish
                            cvv1: TRUE, // when embossedTypeName is own, required, boolean
                            cvv2: TRUE, // when embossedTypeName is own, required, boolean
                            icvv: FALSE, // when embossedTypeName is own, required, boolean
                            serviceCode1: VALUE1, // when embossedTypeName is own, required, number 1, 2, 5, 6, 7, 9
                            serviceCode2: VALUE0, // when embossedTypeName is own, required, number 0, 2, 4
                            serviceCode3: VALUE0, // when embossedTypeName is own, required, number 0-7
                            issuerId: issuerId, // required, string
                            generateControlDigit: FALSE, // when embossedTypeName is own, required, boolean (Use Luhn Validation)
                            isActive: VALUE1
                        }],
                        binId: [ownBin]
                    };
                }, (result, assert) => {
                    typeIdOwn = result.cardType[0].typeId;
                    assert.true(result.cardType[0].name === NAME, 'return correct card type name');
                    assert.equals(cardJoiValidation.validateAddCardType(result.cardType).error, null, 'return card type details');
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
                // TODO:
                // do this with product end date < today

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
                commonFunc.createStep('card.account.search', 'list accountIds', context => {
                    return {
                        customerNumber: opt.customerNumber,
                        personNumber: opt.customerNumber,
                        productId: context['add product successfully'].cardProduct[0].productId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateAccountSearch(result.accountLink).error, null, 'return all accountLinkIds');
                })].concat(APPARRAY.map(application => {
                    return commonFunc.createStep('card.application.add', 'add application' + application, context => {
                        return {
                            application: {
                                customerNumber: context['list accountIds'].account[0].customerNumber,
                                customerName: opt.customerName,
                                holderName: cardConstants.HOLDERNAME,
                                personNumber: context['list accountIds'].account[0].customerNumber,
                                personName: opt.personName,
                                productId: context['add product successfully'].cardProduct[0].productId,
                                typeId: typeIdOwn,
                                targetBranchId: context['get admin details'].memberOF[0].object,
                                issuingBranchId: context['get admin details'].memberOF[0].object
                            },
                            account: [{
                                accountNumber: context['list accountIds'].account[0].accountNumber,
                                accountOrder: ACCOUNTORDER,
                                accountTypeName: context['list accountIds'].account[0].accountTypeName,
                                currency: context['list accountIds'].account[0].currency,
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
                                    batchName: NAMEBATCH
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
                                    issuingBranchId: null
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
                                    issuingBranchId: null
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
                                    issuingBranchId: null
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
                        steps: () => [
                            commonFunc.createStep('card.card.statusUpdate', 'Generate pin mails', context5 => {
                                return {
                                    card: [{
                                        cardId: cardId,
                                        statusId: context['list statuses'].Card.find(element => element.fromStatusName === ACCEPTED).fromStatusId
                                    }],
                                    cardActionId: context['list statuses'].Card.find(element => element.actionName === GENERATEPINS).actionId
                                };
                            }, (result, assert) => {
                                assert.same(result, [], 'pin generation');
                            })
                        ]
                    }))
                }, {
                    name: 'Pending activation',
                    steps: (context) => approvedCards.map((cardId) => ({
                        name: 'Change status',
                        steps: () => [
                            commonFunc.createStep('card.cardInUse.statusUpdate', 'activate all cards in use', context5 => {
                                return {
                                    card: [{
                                        cardId: cardId,
                                        statusId: context['list statuses'].CardInUse.find(element => element.fromStatusName === ACCEPTED).fromStatusId
                                    }],
                                    cardActionId: context['list statuses'].CardInUse.find(element => element.actionName === ACTIVATE).actionId
                                };
                            }, (result, assert) => {
                                assert.same(result, [], 'Pending activation');
                            })
                        ]
                    }))
                }, {
                    name: 'Activate',
                    steps: (context) => approvedCards.map((cardId) => ({
                        name: 'Change status',
                        steps: () => [
                            commonFunc.createStep('card.cardInUse.statusUpdate', 'approve activation for all cards in use', context5 => {
                                return {
                                    card: [{
                                        cardId: cardId,
                                        statusId: context['list statuses'].CardInUse.find(element => element.fromStatusLabel === PENDINGACTIVATION).fromStatusId
                                    }],
                                    cardActionId: context['list statuses'].CardInUse.find(element => element.actionLabel === ACTIONAPPROVEACTIVATION).actionId
                                };
                            }, (result, assert) => {
                                assert.same(result, [], 'Approve activation');
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
                // commonFunc.createStep('card.application.add', 'add application with expired product', context => {
                //     return {
                //         application: {
                //             customerNumber: context['list accountIds'].account[0].customerNumber,
                //             customerName: opt.customerName,
                //             holderName: cardConstants.HOLDERNAME,
                //             personNumber: context['list accountIds'].account[0].customerNumber,
                //             personName: opt.personName,
                //             productId: context['add product that is expired'].cardProduct[0].productId,
                //             targetBranchId: context['get admin details'].memberOF[0].object,
                //             issuingBranchId: context['get admin details'].memberOF[0].object
                //         },
                //         account: [{
                //             accountOrder: ACCOUNTORDER,
                //             accountNumber: context['list accountIds'].account[0].accountNumber,
                //             accountTypeName: context['list accountIds'].account[0].accountTypeName,
                //             currency: context['list accountIds'].account[0].currency,
                //             isPrimary: 1
                //         }]
                //     };
                // }, (result, assert) => {
                //     assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                //     assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                // }),
                // commonFunc.createStep('card.application.statusUpdate', 'approve applications', context => {
                //     return {
                //         application: [{
                //             applicationId: context['add application with expired product'].cardApplication[0].applicationId
                //         }],
                //         applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                //     };
                // }, (result, assert) => {
                //     assert.same(result, [], 'applications approved');
                // }),
                // commonFunc.createStep('card.application.statusUpdate', 'create expired batch', context => {
                //     return {
                //         application: [{
                //             applicationId: context['add application with expired product'].cardApplication[0].applicationId
                //         }],
                //         applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONCREATEBATCH).actionId,
                //         batch: {
                //             batchName: NAMEBATCH + 'expired',
                //             targetBranchId: context['get admin details'].memberOF[0].object
                //         }
                //     };
                // }, (result, assert) => {
                //     assert.same(result, [], 'batch created');
                // }),
                // commonFunc.createStep('card.batch.fetch', 'fetch expired batch', context => {
                //     return {
                //         filterBy: {
                //             batchName: NAMEBATCH + 'expired',
                //             productId: null
                //         }
                //     };
                // }, (result, assert) => {
                //     assert.true(result.batch.length === 1, 'return batch');
                // }),
                // commonFunc.createStep('card.batch.get', 'get expired batch', context => {
                //     return {
                //         batchId: context['fetch expired batch'].batch[0].id
                //     };
                // }, (result, assert) => {
                //     assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                // }),
                // cardMethods.editBatch('approve expired batch', context => {
                //     return {
                //         batch: {
                //             batchId: context['get expired batch'].batch[0].batchId,
                //             namedBatch: true,
                //             batchName: context['get expired batch'].batch[0].batchName,
                //             branchId: context['get expired batch'].batch[0].branchId,
                //             numberOfCards: null,
                //             statusId: context['get expired batch'].batch[0].statusId,
                //             targetBranchId: context['get expired batch'].batch[0].targetBranchId,
                //             issuingBranchId: null,
                //             productId: null
                //         },
                //         batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionId,
                //         batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionLabel
                //     };
                // }),
                // commonFunc.createStep('card.batch.get', 'get batch', context => {
                //     return {
                //         batchId: context['get expired batch'].batch[0].batchId
                //     };
                // }, (result, assert) => {
                //     assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                // }),
                // cardMethods.editBatch('send to production batch', context => {
                //     return {
                //         batch: {
                //             batchId: context['get expired batch'].batch[0].batchId,
                //             namedBatch: true,
                //             batchName: context['get expired batch'].batch[0].batchName,
                //             branchId: context['get expired batch'].batch[0].branchId,
                //             numberOfCards: null,
                //             statusId: context['get batch'].batch[0].statusId,
                //             targetBranchId: context['get expired batch'].batch[0].targetBranchId,
                //             issuingBranchId: null,
                //             productId: null
                //         },
                //         batchActionId: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionId,
                //         batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === SENDTOPRODUCTION).actionLabel
                //     };
                // }),
                // commonFunc.createStep('card.batch.get', 'get batch before complete', context => {
                //     return {
                //         batchId: context['get expired batch'].batch[0].batchId
                //     };
                // }, (result, assert) => {
                //     assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                // }),
                // cardMethods.editBatch('complete batch', context => {
                //     return {
                //         batch: {
                //             batchId: context['get expired batch'].batch[0].batchId,
                //             namedBatch: true,
                //             batchName: context['get expired batch'].batch[0].batchName,
                //             branchId: context['get expired batch'].batch[0].branchId,
                //             numberOfCards: null,
                //             statusId: context['get batch before complete'].batch[0].statusId,
                //             targetBranchId: context['get expired batch'].batch[0].targetBranchId,
                //             issuingBranchId: null,
                //             productId: null
                //         },
                //         batchActionId: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionId,
                //         batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === COMPLETESTATUS).actionLabel
                //     };
                // }),
                // commonFunc.createStep('card.cardInProduction.fetch', 'get expired card', context => {
                //     return {
                //         filterBy: {
                //             batchName: context['get expired batch'].batch[0].batchName
                //         }
                //     };
                // }, (result, assert) => {
                //     assert.true(result.cards.length === 1, 'return all cards');
                //     result.cards.map((card, index) => {
                //         if (index < NUMBEROFCARDS - 3) {
                //             approvedCards.push(card.cardId);
                //         }
                //         cardIds.push(card.cardId);
                //     });
                // }),
                // commonFunc.createStep('card.card.statusUpdate', 'generate pin', context => {
                //     return {
                //         card: [{
                //             cardId: context['get expired card'].cards[0].cardId,
                //             statusId: context['list statuses'].Card.find(element => element.fromStatusName === ACCEPTED).fromStatusId
                //         }],
                //         cardActionId: context['list statuses'].Card.find(element => element.actionName === GENERATEPINS).actionId
                //     };
                // }, (result, assert) => {
                //     assert.same(result, [], 'pin generation');
                // })
                // userMethods.logout('logout sa', context => context.login['identity.check'].sessionId)
            ));
        }
    }, cache);
};
