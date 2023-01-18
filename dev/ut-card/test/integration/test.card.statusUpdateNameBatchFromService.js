var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userConstants = require('ut-test/lib/constants/user').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
const PRODUCTNAME = 'sunbs' + cardConstants.PRODUCTNAME;
const TEST1 = cardConstants.TEST1;
const NAMEDBATCHTRUE = true;
const USERNAME = 'sunbs' + userConstants.USERNAME;
const PERMISSION = 'card.batch.statusUpdate';
const ACCOUNTORDER = 1;
const ACTIONAPPROVE = cardConstants.ACTIONAPPROVE;
const ACTIONSAVE = cardConstants.ACTIONSAVE;
const STATUSNAMEAPPROVED = cardConstants.STATUSNAMEAPPROVED;
const STATUSNAMECOMPLETED = cardConstants.STATUSNAMECOMPLETED;
const ACTIONCREATEBATCH = cardConstants.ACTIONCREATEBATCH;
const NAMEBATCH = cardConstants.NAMEBATCH;
var stdPolicy, orgId, orgId2, embosedTypeIdName, statusId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'edit name batch',
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
                    orgId = result.memberOF[0].object;
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
                cardMethods.fetchBin('get all bins', context => {
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
                cardMethods.fetchBrand('get all card brands', context => {
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
                        embossedTypeId: embosedTypeIdName,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 1, true),
                cardMethods.addCardProduct('add second product successfully', (context) => {
                    return {
                        embossedTypeId: embosedTypeIdName,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 2, true),
                commonFunc.createStep('card.account.search', 'list accountIds', context => {
                    return {
                        customerNumber: opt.customerNumber,
                        personNumber: opt.customerNumber,
                        productId: context['add product successfully'].cardProduct[0].productId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateAccountSearch(result.accountLink).error, null, 'return all accountLinkIds');
                }),
                commonFunc.createStep('card.account.search', 'list second accountIds', context => {
                    return {
                        customerNumber: opt.secondCustomerNumber,
                        personNumber: opt.secondCustomerNumber,
                        productId: context['add second product successfully'].cardProduct[0].productId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateAccountSearch(result.accountLink).error, null, 'return all accountLinkIds');
                }),
                cardMethods.addApplication('add application', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
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
                }, opt.customerName, opt.customerName),
                cardMethods.addApplication('add second application', context => {
                    return {
                        application: {
                            customerNumber: context['list second accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list second accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        },
                        account: [{
                            accountNumber: context['list second accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list second accountIds'].account[0].accountTypeName,
                            currency: context['list second accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                }, opt.secondCustomerName, opt.secondCustomerName),
                cardMethods.fetchConfig('list statuses', context => {
                    return {};
                }),
                cardMethods.updateApplicationState('approve application', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: context['add application'].cardApplication[0].personName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['add application'].cardApplication[0].targetBranchId,
                            issuingBranchId: context['add application'].cardApplication[0].issuingBranchId,
                            comments: context['add application'].cardApplication[0].comments,
                            makerComments: context['add application'].cardApplication[0].makerComments,
                            batchId: null,
                            reasonId: context['add application'].cardApplication[0].reasonId,
                            customerId: null
                        },
                        account: [{
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }, opt.secondCustomerName, opt.secondCustomerName),
                commonFunc.createStep('card.application.get', 'get updated application after set status to approve', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].statusName, STATUSNAMEAPPROVED, 'return correct status name');
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                cardMethods.updateApplicationState('create name batch', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            batchId: null,
                            customerId: null
                        },
                        account: [{
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONCREATEBATCH).actionId,
                        batch: {
                            batchName: NAMEBATCH,
                            targetBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, opt.secondCustomerName, opt.secondCustomerName),
                commonFunc.createStep('card.application.get', 'get application after create name batch', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].batchName, NAMEBATCH, 'return correct batch name');
                    assert.equals(result.application[0].statusName, STATUSNAMECOMPLETED, 'return correct status name');
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                cardMethods.updateApplicationState('approve second application', context => {
                    return {
                        application: {
                            applicationId: context['add second application'].cardApplication[0].applicationId,
                            customerNumber: opt.secondCustomerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.secondCustomerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['add second application'].cardApplication[0].issuingBranchId,
                            comments: context['add second application'].cardApplication[0].comments,
                            batchId: null,
                            customerId: null
                        },
                        account: [{
                            applicationId: context['add second application'].cardApplication[0].applicationId,
                            accountNumber: context['list second accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list second accountIds'].account[0].accountTypeName,
                            currency: context['list second accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }, opt.secondCustomerName, opt.secondCustomerName),
                commonFunc.createStep('card.application.get', 'get approved second application', context => {
                    return {
                        applicationId: context['add second application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].statusName, STATUSNAMEAPPROVED, 'return correct status name');
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                cardMethods.updateApplicationState('create second batch', context => {
                    return {
                        application: {
                            applicationId: context['add second application'].cardApplication[0].applicationId,
                            customerNumber: opt.secondCustomerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.secondCustomerNumber,
                            productId: context['add second product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['add second application'].cardApplication[0].issuingBranchId,
                            comments: context['add second application'].cardApplication[0].comments,
                            batchId: null,
                            customerId: null
                        },
                        account: [{
                            applicationId: context['add second application'].cardApplication[0].applicationId,
                            accountNumber: context['list second accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list second accountIds'].account[0].accountTypeName,
                            currency: context['list second accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONCREATEBATCH).actionId,
                        batch: {
                            batchName: NAMEBATCH + 10,
                            targetBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, opt.secondCustomerName, opt.secondCustomerName),
                commonFunc.createStep('card.application.get', 'get application after create second name batch', context => {
                    return {
                        applicationId: context['add second application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].batchName, NAMEBATCH + 10, 'return correct batch name');
                    assert.equals(result.application[0].statusName, STATUSNAMECOMPLETED, 'return correct status name');
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                commonFunc.createStep('card.batch.get', 'get batch', context => {
                    return {
                        batchId: context['get application after create name batch'].application[0].batchId
                    };
                }, (result, assert) => {
                    statusId = result.batch[0].statusId;
                    assert.equals(result.batch[0].batchName, NAMEBATCH, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                cardMethods.editBatch('edit name batch - change batchName', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: context['get batch'].batch[0].targetBranchId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change batchName', context => {
                    return {
                        batchId: context['get application after create name batch'].application[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].batchName, NAMEBATCH + 1, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - duplicate batchName', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: NAMEBATCH + 10,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: null,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: context['get batch'].batch[0].targetBranchId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return Batch name already exists');
                }),
                commonFunc.createStep('card.application.get', 'get application after change batchName', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].batchName, NAMEBATCH + 1, 'return correct batch name');
                }),
                cardMethods.editBatch('edit name batch - change targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change targetBranchId', context => {
                    return {
                        batchId: context['get application after create name batch'].application[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].targetBranchId, orgId2, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.application.get', 'get application after change targetBranchId', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].targetBranchId, orgId, 'return same application org');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - missing batchId', context => {
                    return {
                        batch: {
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - empty string batchId', context => {
                    return {
                        batch: {
                            batchId: '',
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - string batchId', context => {
                    return {
                        batch: {
                            batchId: TEST1,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - invalid number batchId', context => {
                    return {
                        batch: {
                            batchId: 0,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - null batchId', context => {
                    return {
                        batch: {
                            batchId: null,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - missing batchName', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchName is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - empty string batchName', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: '',
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchName length must be at least 1 characters long');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - invalid number batchName', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: 0,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchName length must be at least 1 characters long');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - null batchName', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: null,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchName must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - missing branchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - empty string branchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: '',
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - string branchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: TEST1,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - invalid number branchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: 0,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - null branchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: null,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId must be a number');
                }),
                cardMethods.editBatch('edit name batch - change branchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: orgId2,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change branchId', context => {
                    return {
                        batchId: context['get application after create name batch'].application[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].branchId, orgId, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - missing statusId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId is required');
                }),
                cardMethods.editBatch('edit name batch - change statusId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            statusId: 2,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change statusId', context => {
                    return {
                        batchId: context['get application after create name batch'].application[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].statusId, statusId, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - empty string statusId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: '',
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - string statusId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: TEST1,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - invalid number statusId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: 0,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - null statusId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: null,
                            targetBranchId: orgId2
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - missing targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - empty string targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: ''
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - string targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: TEST1
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - invalid number targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: 0
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit name batch - null targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: context['get batch'].batch[0].numberOfCards,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: null
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId must be a number');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.batch.statusUpdate', 'missing permission', context => {
                    return {
                        batch: {
                            batchId: context['get batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHTRUE,
                            batchName: context['get batch'].batch[0].batchName + 1,
                            branchId: context['get batch'].batch[0].branchId,
                            numberOfCards: null,
                            statusId: context['get batch'].batch[0].statusId,
                            targetBranchId: context['get batch'].batch[0].targetBranchId
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
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
