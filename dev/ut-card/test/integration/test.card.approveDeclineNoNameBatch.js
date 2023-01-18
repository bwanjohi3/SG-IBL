var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userConstants = require('ut-test/lib/constants/user').constants();
var customerConstants = require('ut-test/lib/constants/customer').constants();
var customerMethods = require('ut-test/lib/methods/customer');
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
const NAMEDBATCHFALSE = false;
const TEST1 = cardConstants.TEST1;
const ORGNAME = customerConstants.ORGNAME;
const USERNAME = 'appdnnb' + userConstants.USERNAME;
const PERMISSION = 'card.batch.statusUpdate';
const NUMBEROFCARDS = 12;
const BATCHNAME = cardConstants.NONAMEBATCH;
const ACTIONSAVE = cardConstants.ACTIONSAVE;
const PRODUCTNAME = 'appdnnb' + cardConstants.PRODUCTNAME;
const ACTIONAPPROVE = cardConstants.ACTIONAPPROVE;
const STATUSNAMEAPPROVED = cardConstants.STATUSNAMEAPPROVED;
const ACTIONDECLINE = cardConstants.ACTIONDECLINE;
const STATUSNAMEDECLINED = cardConstants.STATUSNAMEDECLINED;
const ACTIONSENDTOPRODUCTION = cardConstants.ACTIONSENDTOPRODUCTION;
var stdPolicy, embosedTypeIdNoName;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'Approve Decline no name Batch',
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
                        (embossedType) => embossedType.itemCode === 'noNamed'
                    );
                    embosedTypeIdNoName = embosedType.embossedTypeId;
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
                cardMethods.addCardProduct('add product successfully', (context) => {
                    return {
                        embossedTypeId: embosedTypeIdNoName,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 1, true),
                cardMethods.addNoNameBatch('add no name batch', context => {
                    return {
                        batch: {
                            batchName: BATCHNAME,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, NUMBEROFCARDS),
                cardMethods.editBatch('edit no name batch - Approve batch', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].batchName, BATCHNAME, 'return correct batch name');
                    assert.equals(result.batch[0].statusName, STATUSNAMEAPPROVED, 'return correct status name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - save batch', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return card.batch.statusUpdate.thisActionIsNotAllowedForBatchesInThisStatus');
                }),
                cardMethods.editBatch('edit no name batch - Decline batch', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add no name batch'].batch[0].productId,
                            reasonId: context['list statuses'].BatchReason[0].reasonId,
                            comments: TEST1
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONDECLINE).actionId
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after Decline', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].batchName, BATCHNAME, 'return correct batch name');
                    assert.equals(result.batch[0].statusName, STATUSNAMEDECLINED, 'return correct status name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - send to production batch', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add no name batch'].batch[0].productId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSENDTOPRODUCTION).actionId
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return card.batch.statusUpdate.thisActionIsNotAllowedForBatchesInThisStatus');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.batch.statusUpdate', 'missing permission', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            productId: context['add no name batch'].batch[0].productId,
                            reasonId: context['list statuses'].BatchReason[0].reasonId,
                            comments: TEST1
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONAPPROVE).actionId
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
