var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var transferJoiValidation = require('ut-test/lib/joiValidations/transfer');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var userConstants = require('ut-test/lib/constants/user').constants();
var customerConstants = require('ut-test/lib/constants/customer').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var cardMethods = require('ut-test/lib/methods/card');
var customerMethods = require('ut-test/lib/methods/customer');
const ORGNAME = customerConstants.ORGNAME;
const PRODUCTNAME = 'aas' + cardConstants.PRODUCTNAME;
const USERNAME = 'aas' + userConstants.USERNAME;
const PERMISSION = 'card.application.add';
const ACCOUNTORDER = 1;
const TERMMONTH12 = 12;
const CYPTOMETHODKQ = 'KQ';
const RANDOM32 = 'abcdefabcdefabcde' + commonFunc.generateRandomNumber();
const RANDOM16 = 'a' + commonFunc.generateRandomNumber();
const FOURSYMBOLS = 'ac01';
const TYPEOWN = 'own';
const VALUE1 = 1;
const VALUE0 = 0;
const TRUE = true;
const FALSE = false;
const BIN1 = parseInt('12' + commonFunc.generateRandomFixedInteger(4));
const NAME = cardConstants.RANDOMNAME;

var stdPolicy, embosedTypeIdName, typeIdOnw, typeNameOnw, ownBin, issuerId, cardNumberConstructionId, cipher, typeId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'add application',
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
                commonFunc.createStep('card.brand.fetch', 'get all card brands', context => {
                    return {};
                }, (result, assert) => {
                    assert.true(result.cardBrand.length > 0, 'return more than one result');
                }),
                commonFunc.createStep('card.ownershipType.fetch', 'fetch card ownershipType', context => {
                    return {};
                }, (result, assert) => {
                    var ownershipType1 = result.ownershipType.find((ownershipType) => ownershipType.itemCode === TYPEOWN);
                    typeIdOnw = ownershipType1.ownershipTypeId;
                    typeNameOnw = ownershipType1.ownershipTypeName;
                    assert.equals(cardJoiValidation.validateFetchOwnershipType(result.ownershipType[0]).error, null, 'return ownership types');
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
                commonFunc.createStep('card.bin.add', 'add own bin', context => {
                    return {
                        bin: {
                            ownershipTypeId: typeIdOnw,
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
                            ownershipTypeName: typeNameOnw, // string, allow own, external
                            ownershipTypeId: typeIdOnw,
                            name: NAME, // string, max 100
                            description: NAME, // string, allow ''
                            cardBrandId: context['get all card brands'].cardBrand[0].cardBrandId, // when embossedTypeName is own, required, number
                            cardNumberConstructionId: cardNumberConstructionId, // when embossedTypeName is own, required, number
                            termMonth: TERMMONTH12, // when embossedTypeName is own, required, number
                            cryptogramMethodIndex: VALUE1, // when embossedTypeName is own, required, number
                            cryptogramMethodName: CYPTOMETHODKQ,  // when embossedTypeName is own, required, string, KQ, KW
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
                    typeId = result.cardType[0].typeId;
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
                commonFunc.createStep('card.account.search', 'list accountIds', context => {
                    return {
                        customerNumber: opt.customerNumber.toString(),
                        personNumber: opt.customerNumber.toString(),
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
                // TODO
                cardMethods.addApplication('add application', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
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
                commonFunc.createStep('card.application.add', 'empty string customer name', context => {
                    return {
                        application: {
                            customerName: '',
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'empty string customer Number', context => {
                    return {
                        application: {
                            customerNumber: '',
                            customerName: opt.customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'empty string holder name', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: '',
                            customerName: opt.customerName,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'empty string personName', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: '',
                            customerName: opt.customerName,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                },
                (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                }),
                commonFunc.createStep('card.application.add', 'empty string personNumber', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: '',
                            customerName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
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
                }),
                commonFunc.createStep('card.application.add', 'empty string productId', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: '',
                            customerName: opt.customerName,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'empty string targetBranch', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: '',
                            customerName: opt.customerName,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'empty string accountNumber', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            customerName: opt.customerName,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: '',
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
                commonFunc.createStep('card.application.add', 'empty string account order', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            customerName: opt.customerName,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: '',
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string account type name', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            customerName: opt.customerName,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: '',
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string currency', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            customerName: opt.customerName,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: '',
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string isPrimary', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            customerName: opt.customerName,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: ''
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'isPrimary only 0', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            customerName: opt.customerName,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 0
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return sql failure');
                }),
                commonFunc.createStep('card.application.add', 'missing customerName', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'missing customerNumber', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'missing holderName', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'missing personName', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
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
                }),
                commonFunc.createStep('card.application.add', 'missing personNumber', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
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
                }),
                commonFunc.createStep('card.application.add', 'missing productId', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'missing targetBranchId', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'missing accountNumber', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
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
                commonFunc.createStep('card.application.add', 'missing accountOrder', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'missing accountTypeName', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'missing currency', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'missing isPrimary', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                cardMethods.addApplication('add duplicated application', context => {
                    return {
                        application: {
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
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
                commonFunc.createStep('card.application.add', 'missing account', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        }
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'account to other customer', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list second accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'cbs', 'return cbs failure');
                }), {
                    name: 'More than one accoun',
                    params: (context, utils) => {
                        if (context['list accountIds'].account.length < 2) {
                            return utils.skip();
                        }
                    },
                    steps: (context) => [
                        commonFunc.createStep('card.application.add', 'add application with two accounts', context2 => {
                            return {
                                application: {
                                    customerName: opt.customerName,
                                    customerNumber: context['list accountIds'].account[0].customerNumber,
                                    holderName: cardConstants.HOLDERNAME,
                                    personNumber: context['list accountIds'].account[0].customerNumber,
                                    personName: opt.customerName,
                                    productId: context['add product successfully'].cardProduct[0].productId,
                                    targetBranchId: context['get admin details'].memberOF[0].object,
                                    issuingBranchId: context['get admin details'].memberOF[0].object,
                                    typeId: typeId
                                },
                                account: [{
                                    accountNumber: context['list accountIds'].account[0].accountNumber,
                                    accountOrder: ACCOUNTORDER,
                                    accountTypeName: context['list accountIds'].account[0].accountTypeName,
                                    currency: context['list accountIds'].account[0].currency,
                                    isPrimary: 1
                                },
                                {
                                    accountNumber: context['list accountIds'].account[1].accountNumber,
                                    accountOrder: ACCOUNTORDER + 1,
                                    accountTypeName: context['list accountIds'].account[1].accountTypeName,
                                    currency: context['list accountIds'].account[1].currency,
                                    isPrimary: 0
                                }]
                            };
                        },
                        (result, assert) => {
                            assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                            assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                            assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[1]).error, null, 'return second card application account');
                        }),
                        commonFunc.createStep('card.application.add', 'two isPrimary accounts', context2 => {
                            return {
                                application: {
                                    customerName: opt.customerName,
                                    customerNumber: context['list accountIds'].account[0].customerNumber,
                                    holderName: cardConstants.HOLDERNAME,
                                    personNumber: context['list accountIds'].account[0].customerNumber,
                                    personName: opt.customerName,
                                    productId: context['add product successfully'].cardProduct[0].productId,
                                    targetBranchId: context['get admin details'].memberOF[0].object,
                                    issuingBranchId: context['get admin details'].memberOF[0].object,
                                    typeId: typeId
                                },
                                account: [{
                                    accountNumber: context['list accountIds'].account[0].accountNumber,
                                    accountOrder: ACCOUNTORDER,
                                    accountTypeName: context['list accountIds'].account[0].accountTypeName,
                                    currency: context['list accountIds'].account[0].currency,
                                    isPrimary: 1
                                },
                                {
                                    accountNumber: context['list accountIds'].account[1].accountNumber,
                                    accountOrder: ACCOUNTORDER + 1,
                                    accountTypeName: context['list accountIds'].account[1].accountTypeName,
                                    currency: context['list accountIds'].account[1].currency,
                                    isPrimary: 1
                                }]
                            };
                        }, null,
                        (error, assert) => {
                            assert.equals(error.type, 'portSQL', 'return db error');
                        }),
                        commonFunc.createStep('card.application.add', 'same order twice', context2 => {
                            return {
                                application: {
                                    customerName: opt.customerName,
                                    customerNumber: context['list accountIds'].account[0].customerNumber,
                                    holderName: cardConstants.HOLDERNAME,
                                    personNumber: context['list accountIds'].account[0].customerNumber,
                                    personName: opt.customerName,
                                    productId: context['add product successfully'].cardProduct[0].productId,
                                    targetBranchId: context['get admin details'].memberOF[0].object,
                                    issuingBranchId: context['get admin details'].memberOF[0].object,
                                    typeId: typeId
                                },
                                account: [{
                                    accountNumber: context['list accountIds'].account[0].accountNumber,
                                    accountOrder: ACCOUNTORDER,
                                    accountTypeName: context['list accountIds'].account[0].accountTypeName,
                                    currency: context['list accountIds'].account[0].currency,
                                    isPrimary: 1
                                },
                                {
                                    accountNumber: context['list accountIds'].account[1].accountNumber,
                                    accountOrder: ACCOUNTORDER,
                                    accountTypeName: context['list accountIds'].account[1].accountTypeName,
                                    currency: context['list accountIds'].account[1].currency,
                                    isPrimary: 0
                                }]
                            };
                        }, null,
                    (error, assert) => {
                        assert.equals(error.type, 'portSQL', 'return db error');
                    })
                    ]
                }, commonFunc.createStep('card.application.add', 'same account twice', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        },
                        {
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return db error');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.application.add', 'missing permission', context => {
                    return {
                        application: {
                            customerName: opt.customerName,
                            customerNumber: context['list accountIds'].account[0].customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['list accountIds'].account[0].customerNumber,
                            personName: opt.customerName,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object,
                            typeId: typeId
                        },
                        account: [{
                            accountNumber: context['list accountIds'].account[0].accountNumber,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: context['list accountIds'].account[0].accountTypeName,
                            currency: context['list accountIds'].account[0].currency,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)]);
        }
    }, cache);
};
