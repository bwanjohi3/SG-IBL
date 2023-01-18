var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var transferJoiValidation = require('ut-test/lib/joiValidations/transfer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userConstants = require('ut-test/lib/constants/user').constants();
var customerConstants = require('ut-test/lib/constants/customer').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var customerMethods = require('ut-test/lib/methods/customer');
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
const NAMEDBATCHFALSE = false;
const TEST1 = cardConstants.TEST1;
const ORGNAME = customerConstants.ORGNAME;
const USERNAME = 'sunnb' + userConstants.USERNAME;
const PERMISSION = 'card.batch.statusUpdate';
const NUMBEROFCARDS = 12;
const BATCHNAME = cardConstants.NONAMEBATCH;
const ACTIONSAVE = cardConstants.ACTIONSAVE;
const TYPEOWN = 'own';
const NAME = cardConstants.RANDOMNAME;
const BIN1 = parseInt('53' + commonFunc.generateRandomFixedInteger(4));
const TERMMONTH12 = 12;
const VALUE1 = 1;
const VALUE0 = 0;
const RANDOM32 = 'abcdefabcdefabcde' + commonFunc.generateRandomNumber();
const RANDOM16 = 'a' + commonFunc.generateRandomNumber();
const FOURSYMBOLS = 'ac01';
const CRYPTOMETHODKQ = 'KQ';
const TRUE = true;
const FALSE = false;

var typeIdOwn, typeNameOwn, issuerId, ownBin, cardNumberConstructionId, cipher;
var stdPolicy, orgId, orgId2, statusId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'edit no name Batch',
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
                    orgId2 = result['organization.info'][0].actorId;
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
                cardMethods.fetchBrand('get all card brands', context => {
                    return {};
                }),
                cardMethods.fetchConfig('list statuses', context => {
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

                cardMethods.addNoNameBatch('add no name batch', context => {
                    return {
                        batch: {
                            batchName: BATCHNAME,
                            typeId: typeIdOwn,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, NUMBEROFCARDS),
                cardMethods.addNoNameBatch('add second no name batch', context => {
                    return {
                        batch: {
                            batchName: BATCHNAME + 10,
                            typeId: typeIdOwn,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, NUMBEROFCARDS),
                cardMethods.editBatch('edit no name batch - change batchName', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change batchName', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    statusId = result.batch[0].statusId;
                    assert.equals(result.batch[0].batchName, BATCHNAME + 1, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - duplicate batchName', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: BATCHNAME + 10,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return Batch name already exists');
                }),
                cardMethods.editBatch('edit no name batch - change targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change targetBranchId', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].targetBranchId, orgId2, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - missing batchId', context => {
                    return {
                        batch: {
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - empty string batchId', context => {
                    return {
                        batch: {
                            batchId: '',
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - string batchId', context => {
                    return {
                        batch: {
                            batchId: TEST1,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - invalid number batchId', context => {
                    return {
                        batch: {
                            batchId: 0,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - null batchId', context => {
                    return {
                        batch: {
                            batchId: null,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - missing batchName', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchName is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - empty string batchName', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: '',
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchName length must be at least 1 characters long');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - invalid number batchName', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: 0,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchName length must be at least 1 characters long');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - null batchName', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: null,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure batchName must be a string');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - missing branchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - empty string branchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: '',
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - string branchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: TEST1,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - invalid number branchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: 0,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - null branchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: null,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure branchId must be a number');
                }),
                cardMethods.editBatch('edit no name batch - change branchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: orgId2,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change branchId', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].branchId, orgId, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - missing numberOfCards', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure numberOfCards is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - empty string numberOfCards', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: '',
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure numberOfCards must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - string numberOfCards', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: TEST1,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure numberOfCards must be a number');
                }),
                cardMethods.editBatch('edit no name batch - 0 for numberOfCards', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: 0,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after 0 for numberOfCards', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].numberOfCards, 0, 'return updated numberOfCards');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - null numberOfCards', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: null,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure numberOfCards must be a number');
                }),
                cardMethods.editBatch('edit no name batch - change numberOfCards', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: NUMBEROFCARDS,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change branchId', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].numberOfCards, NUMBEROFCARDS, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - missing statusId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId is required');
                }),
                cardMethods.editBatch('edit no name batch - change statusId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: 2,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }),
                commonFunc.createStep('card.batch.get', 'get batch after change statusId', context => {
                    return {
                        batchId: context['add no name batch'].batch[0].batchId
                    };
                }, (result, assert) => {
                    assert.equals(result.batch[0].statusId, statusId, 'return correct batch name');
                    assert.equals(cardJoiValidation.validateGetBatch(result.batch).error, null, 'return batch');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - empty string statusId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: '',
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - string statusId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: TEST1,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - invalid number statusId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: 0,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - null statusId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: null,
                            targetBranchId: orgId2,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure statusId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - missing targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId is required');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - empty string targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: '',
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - string targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: TEST1,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - invalid number targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: 0,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - null targetBranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: null,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure targetBranchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - empty string issuingbranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: '',
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure issuingBranchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - string issuingbranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: TEST1,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure issuingBranchId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - invalid number issuingbranchId', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: 0,
                            typeId: typeIdOwn
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure issuingBranchId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - empty string typeId', context => {
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
                            typeId: ''
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure typeId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - string typeId', context => {
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
                            typeId: TEST1
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure typeId must be a number');
                }),
                commonFunc.createStep('card.batch.statusUpdate', 'edit no name batch - invalid number typeId', context => {
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
                            typeId: 0
                        },
                        batchActionId: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionId,
                        batchActionLabel: context['list statuses'].Batch.find(element => element.actionName === ACTIONSAVE).actionLabel
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure typeId must be larger than or equal to 1');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.batch.statusUpdate', 'missing permission', context => {
                    return {
                        batch: {
                            batchId: context['add no name batch'].batch[0].batchId,
                            namedBatch: NAMEDBATCHFALSE,
                            batchName: context['add no name batch'].batch[0].batchName + 1,
                            branchId: context['add no name batch'].batch[0].branchId,
                            numberOfCards: context['add no name batch'].batch[0].numberOfCards,
                            statusId: context['add no name batch'].batch[0].statusId,
                            targetBranchId: context['add no name batch'].batch[0].targetBranchId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeIdOwn
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
