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
const ORGNAME = customerConstants.ORGNAME;
const PRODUCTNAME = 'uas' + cardConstants.PRODUCTNAME;
const USERNAME = 'uas' + userConstants.USERNAME;
const PERMISSION = 'card.application.updateState';
const ACCOUNTORDER = 1;
const WRONGACCOUNTORDER = 10;
const ACTIONSAVE = cardConstants.ACTIONSAVE;
const ACTIONAPPROVE = cardConstants.ACTIONAPPROVE;
const TYPEOWN = 'own';
const NAME = cardConstants.RANDOMNAME;
const BIN1 = parseInt('55' + commonFunc.generateRandomFixedInteger(4));
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
        name: 'update application from service',
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
                cardMethods.fetchBrand('get all card brands', context => {
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
                    orgId = result['organization.info'][0].actorId;
                    assert.equals(customerJoiValidation.validateAddOrganization(result['organization.info'][0]).error, null, 'return all details after creating the organization');
                    assert.equals(result['organization.info'][0].organizationName, ORGNAME, 'return organizationName');
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
                commonFunc.createStep('card.account.search', 'list second accountIds', context => {
                    return {
                        customerNumber: opt.secondCustomerNumber,
                        personNumber: opt.secondCustomerNumber,
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
                cardMethods.addApplication('add second application', context => {
                    return {
                        application: {
                            customerNumber: context['list second accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list second accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                cardMethods.updateApplicationState('update application - change targetBranchId', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: orgId,
                            issuingBranchId: context['get admin details'].memberOF[0].object
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
                commonFunc.createStep('card.application.get', 'get updated application', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                cardMethods.updateApplicationState('update application - add personName and customerName, change targetBranchId', context => {
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
                commonFunc.createStep('card.application.get', 'get updated person and customer names', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].personName, opt.customerName, 'return updated personName');
                    assert.equals(result.application[0].customerName, opt.customerName, 'return updated customerName');
                }),
                /* cardMethods.updateApplicationState('update customerName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update',
                            batchId: null,
                            customerId: null,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME
                        },
                        account: [{
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }),
                commonFunc.createStep('card.application.get', 'get updated customerName', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].customerName, customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update', 'return updated customerName');
                }),
                cardMethods.updateApplicationState('update personName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update',
                            batchId: null,
                            customerId: null,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update'
                        },
                        account: [{
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }),
                commonFunc.createStep('card.application.get', 'get updated personName', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].personName, customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update', 'return updated personName');
                }), */
                cardMethods.updateApplicationState('update holderName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME + '1',
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
                }, opt.customerName, opt.personName),
                commonFunc.createStep('card.application.get', 'get updated holderName', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].holderName, cardConstants.HOLDERNAME + '1', 'return updated holderName');
                }),
                // commonFunc.createStep('card.application.statusUpdate', 'applicationId from different customer', context => {
                //     return {
                //         application: {
                //             applicationId: context['add second application'].cardApplication[0].applicationId,
                //             holderName: cardConstants.HOLDERNAME + '1',
                //             customerNumber: context['add customer'].customer.customerNumber,
                //             personNumber: context['add customer'].customer.actorId,
                //             customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update',
                //             productId: context['add product successfully'].cardProduct[0].productId,
                // typeId: typeIdOwn,
                //             targetBranchId: context['add customer'].customer.organizationId,
                //             batchId: null,
                //             customerId: null,
                //             personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update'
                //         },
                //         account: [{
                //             applicationId: context['add application'].cardApplication[0].applicationId,
                //             applicationAccountId: context['get updated application'].accounts.find(account => account.isLinked === 1).applicationAccountId,
                //             accountNumber: ACCOUNTNUMBER,
                //             accountOrder: ACCOUNTORDER,
                //             accountTypeName: ACCOUNTNAME,
                //             currency: CURRENCYID,
                //             isPrimary: 1
                //         }],
                //         applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                //     };
                // }, null,
                // (error, assert) => {
                //     assert.equals(error.type, 'portSQL', 'return sql failure');
                // }),
                // commonFunc.createStep('card.application.statusUpdate', 'account applicationId from different customer', context => {
                //     return {
                //         application: {
                //             applicationId: context['add application'].cardApplication[0].applicationId,
                //             holderName: cardConstants.HOLDERNAME + '1',
                //             customerNumber: context['add customer'].customer.customerNumber,
                //             personNumber: context['add customer'].customer.actorId,
                //             customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update',
                //             productId: context['add product successfully'].cardProduct[0].productId,
                // typeId: typeIdOwn,
                //             targetBranchId: context['add customer'].customer.organizationId,
                //             batchId: null,
                //             customerId: null,
                //             personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Update'
                //         },
                //         account: [{
                //             applicationId: context['add second application'].cardApplication[0].applicationId,
                //             applicationAccountId: context['get updated application'].accounts.find(account => account.isLinked === 1).applicationAccountId,
                //             accountNumber: ACCOUNTNUMBER,
                //             accountOrder: ACCOUNTORDER,
                //             accountTypeName: ACCOUNTNAME,
                //             currency: CURRENCYID,
                //             isPrimary: 1
                //         }],
                //         applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                //     };
                // }, null,
                // (error, assert) => {
                //     assert.equals(error.type, 'portSQL', 'return sql failure');
                // }),
                commonFunc.createStep('card.application.statusUpdate', 'wrong account order', context => {
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
                            accountOrder: WRONGACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return sql failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'accountNumber from different customer', context => {
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
                            accountNumber: context['list second accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'cbs', 'return cbs failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'customerNumber from different customer', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.secondCustomerNumber,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'cbs', 'return cbs failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'personNumber from different customer', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.secondCustomerNumber,
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
                }, (result, assert) => {
                    assert.same(result, [], 'return updated application');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing customerNumber', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string customerNumber', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: '',
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing applicationId', context => {
                    return {
                        application: {
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string applicationId', context => {
                    return {
                        application: {
                            applicationId: '',
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing holderName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string holderName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: '',
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing personNumber', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string personNumber', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: '',
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
                }, (result, assert) => {
                    assert.same(result, [], 'return updated application');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing customerName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string customerName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: '',
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missng productId', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: context['add application'].cardApplication[0].personName,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string productId', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: context['add application'].cardApplication[0].personName,
                            productId: '',
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing targetBranchId', context => {
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string targetBranchId', context => {
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
                            targetBranchId: '',
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing personName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string personName', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.customerNumber,
                            customerName: context['add application'].cardApplication[0].customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: opt.customerNumber,
                            personName: '',
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
                },
                (result, assert) => {
                    assert.same(result, [], 'return updated application');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing batchId', context => {
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string batchId', context => {
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
                            batchId: '',
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing customerId', context => {
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
                            reasonId: context['add application'].cardApplication[0].reasonId
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string customerId', context => {
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
                            customerId: ''
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing account applicationId', context => {
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
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string account applicationId', context => {
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
                            applicationId: '',
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing accountNumber', context => {
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
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string accountNumber', context => {
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
                            accountNumber: '',
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing accountOrder', context => {
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
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string accountOrder', context => {
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
                            accountOrder: '',
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing accountTypeName', context => {
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
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string accountTypeName', context => {
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
                            accountTypeName: '',
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing currency', context => {
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
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string currency', context => {
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
                            currency: '',
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing isPrimary', context => {
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
                            currency: context['list accountIds'].account[0].currency
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string isPrimary', context => {
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
                            isPrimary: ''
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'missing applicationActionId', context => {
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
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'empty string applicationActionId', context => {
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
                        applicationActionId: ''
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }), {
                    name: 'Two accounts',
                    params: (context, utils) => {
                        if (context['list accountIds'].account.length < 2) {
                            return utils.skip();
                        }
                    },
                    steps: (context) => [
                        commonFunc.createStep('card.application.statusUpdate', 'update with second account', context2 => {
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
                                },
                                {
                                    applicationId: context['add application'].cardApplication[0].applicationId,
                                    accountNumber: context['list accountIds'].account[1].accountNumber,
                                    accountOrder: ACCOUNTORDER + 1,
                                    accountTypeName: context['list accountIds'].account[1].accountTypeName,
                                    currency: context['list accountIds'].account[1].currency,
                                    isPrimary: 0
                                }],
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                            };
                        }, (result, assert) => {
                            assert.same(result, [], 'return updated application');
                        }),
                        commonFunc.createStep('card.application.get', 'get updated account', context2 => {
                            return {
                                applicationId: context['add application'].cardApplication[0].applicationId
                            };
                        }, (result, assert) => {
                            assert.true(result.accounts.length > 1, 'return updated account');
                        }),
                        commonFunc.createStep('card.application.statusUpdate', 'two primary accounts', context2 => {
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
                                },
                                {
                                    applicationId: context['add application'].cardApplication[0].applicationId,
                                    accountNumber: context['list accountIds'].account[1].accountNumber,
                                    accountOrder: ACCOUNTORDER + 1,
                                    accountTypeName: context['list accountIds'].account[1].accountTypeName,
                                    currency: context['list accountIds'].account[1].currency,
                                    isPrimary: 1
                                }],
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                            };
                        }, null,
                        (error, assert) => {
                            assert.equals(error.type, 'portSQL', 'return sql failure');
                        }),
                        commonFunc.createStep('card.application.statusUpdate', 'same account order', context2 => {
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
                                },
                                {
                                    applicationId: context['add application'].cardApplication[0].applicationId,
                                    accountNumber: context['list accountIds'].account[1].accountNumber,
                                    accountOrder: ACCOUNTORDER,
                                    accountTypeName: context['list accountIds'].account[1].accountTypeName,
                                    currency: context['list accountIds'].account[1].currency,
                                    isPrimary: 0
                                }],
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                            };
                        }, null,
                        (error, assert) => {
                            assert.equals(error.type, 'portSQL', 'return sql failure');
                        }),
                        commonFunc.createStep('card.application.statusUpdate', 'change isPrimary', context2 => {
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
                                    isPrimary: 0
                                },
                                {
                                    applicationId: context['add application'].cardApplication[0].applicationId,
                                    accountNumber: context['list accountIds'].account[1].accountNumber,
                                    accountOrder: ACCOUNTORDER + 1,
                                    accountTypeName: context['list accountIds'].account[1].accountTypeName,
                                    currency: context['list accountIds'].account[1].currency,
                                    isPrimary: 1
                                }],
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                            };
                        }, (result, assert) => {
                            assert.same(result, [], 'return updated application');
                        }),
                        commonFunc.createStep('card.application.get', 'get updated isPrimary', context2 => {
                            return {
                                applicationId: context['add application'].cardApplication[0].applicationId
                            };
                        }, (result, assert) => {
                            assert.true(result.accounts.find(account => account.accountOrder === ACCOUNTORDER + 1).isPrimary, 'return updated isPrimary');
                        }),
                        commonFunc.createStep('card.application.statusUpdate', 'change order', context2 => {
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
                                    accountOrder: ACCOUNTORDER + 1,
                                    accountTypeName: context['list accountIds'].account[0].accountTypeName,
                                    currency: context['list accountIds'].account[0].currency,
                                    isPrimary: 0
                                },
                                {
                                    applicationId: context['add application'].cardApplication[0].applicationId,
                                    accountNumber: context['list accountIds'].account[1].accountNumber,
                                    accountOrder: ACCOUNTORDER,
                                    accountTypeName: context['list accountIds'].account[1].accountTypeName,
                                    currency: context['list accountIds'].account[1].currency,
                                    isPrimary: 1
                                }],
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                            };
                        }, (result, assert) => {
                            assert.same(result, [], 'return updated application');
                        }),
                        commonFunc.createStep('card.application.get', 'get updated account order', context2 => {
                            return {
                                applicationId: context['add application'].cardApplication[0].applicationId
                            };
                        }, (result, assert) => {
                            assert.equals(result.accounts.find(account => account.isPrimary === true).accountOrder, ACCOUNTORDER, 'return updated accountOrder');
                        }),
                        commonFunc.createStep('card.application.statusUpdate', 'remove primary account', context2 => {
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
                                    isPrimary: 0
                                }],
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                            };
                        }, null,
                        (error, assert) => {
                            assert.equals(error.type, 'portSQL', 'return sql failure');
                        }),
                        commonFunc.createStep('card.application.statusUpdate', 'remove primary account and order doesnt start from 1', context2 => {
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
                                    accountOrder: ACCOUNTORDER + 1,
                                    accountTypeName: context['list accountIds'].account[0].accountTypeName,
                                    currency: context['list accountIds'].account[0].currency,
                                    isPrimary: 0
                                }],
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                            };
                        }, null,
                        (error, assert) => {
                            assert.equals(error.type, 'portSQL', 'return sql failure');
                        }),
                        cardMethods.updateApplicationState('remove account', context2 => {
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
                                applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                            };
                        }),
                        commonFunc.createStep('card.application.get', 'get updated account count', context2 => {
                            return {
                                applicationId: context['add application'].cardApplication[0].applicationId
                            };
                        }, (result, assert) => {
                            assert.true(result.accounts.filter(accounts => accounts.isLinked === 1).length === 1, 'return updated account count');
                        })
                    ]
                }, commonFunc.createStep('card.application.statusUpdate', 'change customerNumber', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.secondCustomerNumber,
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
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'cbs', 'return cbs failure');
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
                }),
                commonFunc.createStep('card.application.statusUpdate', 'edit approved application', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: opt.secondCustomerNumber,
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
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'cbs', 'return cbs failure');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.application.updateState', 'missing permission', context => {
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
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId
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
