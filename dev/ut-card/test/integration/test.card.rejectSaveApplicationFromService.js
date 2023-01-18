var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var transferJoiValidation = require('ut-test/lib/joiValidations/transfer');
var userConstants = require('ut-test/lib/constants/user').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
const PRODUCTNAME = 'rsas' + cardConstants.PRODUCTNAME;
const USERNAME = 'rsas' + userConstants.USERNAME;
const PERMISSION = 'card.application.statusUpdate';
const ACCOUNTORDER = 1;
const ACTIONREJECT = cardConstants.ACTIONREJECT;
const STATUSNAMEREJECTED = cardConstants.STATUSNAMEREJECTED;
const ACTIONSENDTOPRODUCTION = cardConstants.ACTIONSENDTOPRODUCTION;
const ACTIONREMOVEFROMBATCH = cardConstants.ACTIONREMOVEFROMBATCH;
const ACTIONSAVE = cardConstants.ACTIONSAVE;
const STATUSNAMENEW = cardConstants.STATUSNAMENEW;
const TYPEOWN = 'own';
const NAME = cardConstants.RANDOMNAME;
const BIN1 = parseInt('49' + commonFunc.generateRandomFixedInteger(4));
const TERMMONTH12 = 12;
const VALUE1 = 1;
const VALUE0 = 0;
const RANDOM32 = 'abcdefabcdefabcde' + commonFunc.generateRandomNumber();
const RANDOM16 = 'a' + commonFunc.generateRandomNumber();
const FOURSYMBOLS = 'ac01';
const CRYPTOMETHODKQ = 'KQ';
const TRUE = true;
const FALSE = false;

var stdPolicy, orgId, embosedTypeIdName;
var typeIdOwn, typeNameOwn, issuerId, ownBin, cardNumberConstructionId, cipher;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'Reject save status update application from service',
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
                cardMethods.fetchBrand('get all card brands', context => {
                    return {};
                }),
                cardMethods.fetchEmbossedTypes('get all embossed types', context => {
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
                cardMethods.fetchPeriodicCardFee('get periodic card fees', context => {
                    return {};
                }),
                cardMethods.listAccountTypes('list account types', context => {
                    return {};
                }),
                cardMethods.listCustomerTypes('list customer types', context => {
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
                commonFunc.createStep('card.account.search', 'list accountIds', context => {
                    return {
                        customerNumber: opt.customerNumber,
                        personNumber: opt.customerNumber,
                        productId: context['add product successfully'].cardProduct[0].productId
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateAccountSearch(result.accountLink).error, null, 'return all accountLinkIds');
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

                cardMethods.addApplication('add application', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
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
                }, opt.customerName, opt.customerName),
                cardMethods.fetchConfig('list statuses', context => {
                    return {};
                }),
                cardMethods.updateApplicationState('update application - set status to Reject successfully', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: context['add application'].cardApplication[0].personName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONREJECT).actionId
                    };
                }, opt.customerName, opt.customerName),
                commonFunc.createStep('card.application.get', 'get updated application with status Reject', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].statusName, STATUSNAMEREJECTED, 'return correct status name');
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                cardMethods.updateApplicationState('update application - set status to Save successfully', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: context['add application'].cardApplication[0].personName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, opt.customerName, opt.customerName),
                commonFunc.createStep('card.application.get', 'get updated application with status Save', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].statusName, STATUSNAMENEW, 'return correct status name');
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'update application - status ACTIONREMOVEFROMBATCH unsuccessfully', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: context['add application'].cardApplication[0].personName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONREMOVEFROMBATCH).actionId
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return portSQL - action is not allowed');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'update application - status ACTIONSENDTOPRODUCTION unsuccessfully', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: context['add application'].cardApplication[0].personName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        applicationActionId: context['list statuses'].Batch.find(element => element.actionLabel === ACTIONSENDTOPRODUCTION).actionId
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return portSQL - action is not allowed');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.application.statusUpdate', 'missing permission', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: context['add application'].cardApplication[0].personName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONREJECT).actionId
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
