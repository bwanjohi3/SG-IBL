var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var transferJoiValidation = require('ut-test/lib/joiValidations/transfer');
var userConstants = require('ut-test/lib/constants/user').constants();
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var customerConstants = require('ut-test/lib/constants/customer').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var cardMethods = require('ut-test/lib/methods/card');
var customerMethods = require('ut-test/lib/methods/customer');
const ORGNAME = customerConstants.ORGNAME;
const PRODUCTNAME = 'aa' + cardConstants.PRODUCTNAME;
const USERNAME = 'aa' + userConstants.USERNAME;
const PERMISSION = 'card.application.add';
const CUSTOMERNUMBER = commonFunc.generateRandomNumber().toString().slice(7);
const ACCOUNTTYPEID = '2'; // savings
const CURRENCYID = '1';
const STATUSID = 'active';
const BALANCE = '1000';
const ACCOUNTNAME = 'CURRENT_ACCOUNT';
const ACCOUNTORDER = 1;
const ACCOUNTNUMBER = commonFunc.generateRandomNumber().toString();
// kyc
const RANDOMCONDITIONID = customerConstants.RANDOMCONDITIONID;
const KYCDESCRIPTION = customerConstants.KYCDESCRIPTION;
// const GETBYDEPTHORGANIZATION = customerConstants.GETBYDEPTHORGANIZATION;
var productConstants = require('ut-test/lib/constants/product').constants();
var productMethods = require('ut-test/lib/methods/product');
var productJoiValidation = require('ut-test/lib/joiValidations/product');
const STARTDATE = productConstants.STARTDATE;
var customerTypeClient, currencyId, productType2, periodicFeeId, productGroupId;
var stdPolicy, embosedTypeIdName, customerTypeId;
const TYPEOWN = 'own';
const NAME = cardConstants.RANDOMNAME;
const BIN1 = parseInt('11' + commonFunc.generateRandomFixedInteger(4));
const TERMMONTH12 = 12;
const VALUE1 = 1;
const VALUE0 = 0;
const RANDOM32 = 'abcdefabcdefabcde' + commonFunc.generateRandomNumber();
const RANDOM16 = 'a' + commonFunc.generateRandomNumber();
const FOURSYMBOLS = 'ac01';
const CRYPTOMETHODKQ = 'KQ';
const TRUE = true;
const FALSE = false;

var orgId1, organizationDepthArray, kycId;
var typeIdOwn, typeNameOwn, issuerId, ownBin, cardNumberConstructionId, cipher;

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
                commonFunc.createStep('user.user.get', 'get admin details', (context) => {
                    return {
                        actorId: context.login['identity.check'].actorId
                    };
                }, (result, assert) => {
                    assert.equals(customerJoiValidation.validateGetPerson(result.person, userConstants.ADMINFIRSTNAME).error, null, 'return person');
                    orgId1 = result.memberOF[0].object;
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
                commonFunc.createStep('customerTest.customer.mChStatusChange', 'disable maker checker of customers', (context) => {
                    return {
                        isMCHDisabled: 1
                    };
                }, (result, assert) => {
                    assert.equals(typeof result, 'object', 'return object');
                }),
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
                commonFunc.createStep('customer.type.fetch', 'fetch customer types', (context) => {
                    return {};
                }, (result, assert) => {
                    customerTypeId = result.customerType[0].customerTypeId;
                }),
                cardMethods.fetchBrand('get all card brands', context => {
                    return {};
                }),
                cardMethods.fetchOwnershipTypes('list ownership types', context => {
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
                commonFunc.createStep('customer.type.fetch', 'fetch customer types', (context) => {
                    return {};
                }, (result, assert) => {
                    customerTypeClient = result.customerType[0].customerTypeNumber;
                }),
                commonFunc.createStep('core.currency.fetch', 'fetch currencies', (context) => {
                    return {};
                }, (result, assert) => {
                    currencyId = result.currency[0].currencyId;
                }),
                // add kyc
                commonFunc.createStep('core.configuration.fetch', 'fetch defaultBu setting', (context) => {
                    return {
                        key: customerConstants.GETBYDEPTHORGANIZATION
                    };
                }, (result, assert) => {
                    var orgDepth = result[0][0].value;
                    organizationDepthArray = (new Array(orgDepth - 1)).fill(0).map((v, k) => k); // if orgDepth is 4, organizationDepthArray is [0, 1, 2]
                    assert.true(typeof result, 'object', 'return result');
                }), {
                    name: 'Create organization by depth',
                    steps: () => organizationDepthArray.map(org => ({
                        name: 'Add and approve organizations',
                        steps: () => [
                            commonFunc.createStep('customer.organization.add', 'add organization', context => {
                                return {
                                    organization: {
                                        organizationName: customerConstants.ORGNAME
                                    },
                                    parent: [orgId1]
                                };
                            }, (result, assert) => {
                                orgId1 = result['organization.info'][0].actorId;
                                assert.equals(customerJoiValidation.validateAddOrganization(result['organization.info'][0]).error, null, 'return all details after creating the organization');
                            }),
                            customerMethods.approveOrganization('approve organization', context => orgId1)]
                    }))
                },
                customerMethods.getForCreateKyc('get levels for creating kyc 1', context => {
                    return {
                        customerType: customerTypeClient,
                        organizationId: orgId1
                    };
                }),
                customerMethods.listKycAttributes('list kyc attributes 1', context => customerTypeClient),
                customerMethods.addKyc('add kyc 1', context => {
                    return {
                        display: context['get levels for creating kyc 1'].levels[0].itemNameTranslation,
                        customerTypeId: customerTypeClient,
                        organizationId: orgId1,
                        itemNameId: context['get levels for creating kyc 1'].levels[0].itemNameId,
                        conditionId: RANDOMCONDITIONID,
                        attributeId: context['list kyc attributes 1'].kycAttributes[0].itemNameId

                    };
                }, KYCDESCRIPTION),
                commonFunc.createStep('customer.kyc.fetch', 'fetch customer kyc - individual', (context) => {
                    return {
                        businessUnitId: orgId1,
                        customerTypeId: customerTypeClient
                    };
                }, (result, assert) => {
                    kycId = result.kyc[0].kycId;
                }),
                commonFunc.createStep('ledger.productGroup.fetch', 'fetch product groups', (context) => {
                    return {};
                }, (result, assert) => {
                    var productGroup = result.productGroup.find((group) => group.isForCustomer === true);
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

                commonFunc.createStep('ledger.product.add', 'add product 1', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME,
                            customerTypeId: customerTypeClient,
                            businessUnitId: orgId1,
                            currencyId: currencyId,
                            startDate: STARTDATE,
                            productTypeId: productType2,
                            periodicFeeId: periodicFeeId
                        },
                        kyc: [kycId]
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
                commonFunc.createStep('customer.customer.add', 'add customer', (context) => {
                    return {
                        customer: {
                            customerNumber: CUSTOMERNUMBER,
                            customerTypeId: customerTypeId,
                            organizationId: orgId1
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
                            businessUnitId: orgId1,
                            statusId: STATUSID,
                            accountName: ACCOUNTNAME,
                            accountNumber: ACCOUNTNUMBER,
                            currencyId: CURRENCYID,
                            balance: BALANCE
                        }, {
                            productId: context['add product 1'].product[0].productId,
                            accountTypeId: ACCOUNTTYPEID,
                            statusId: STATUSID,
                            businessUnitId: orgId1,
                            accountName: ACCOUNTNAME,
                            accountNumber: ACCOUNTNUMBER + 1,
                            currencyId: CURRENCYID,
                            balance: BALANCE
                        }]
                    };
                }, (result, assert) => {
                    assert.equals(customerJoiValidation.validateAddCustomer(result.customer).error, null, 'Return all details after adding a customer');
                }),
                commonFunc.createStep('customer.customer.add', 'add second customer', (context) => {
                    return {
                        customer: {
                            customerNumber: CUSTOMERNUMBER + 1,
                            customerTypeId: customerTypeId,
                            organizationId: orgId1
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
                            statusId: STATUSID,
                            businessUnitId: orgId1,
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
                cardMethods.addApplication('add application', context => {
                    return {
                        application: {
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }),
                commonFunc.createStep('card.application.add', 'empty string customer name', context => {
                    return {
                        application: {
                            customerName: '',
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string customer Number', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: '',
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string holder name', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: '',
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string personName', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: '',
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                },
                (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                }),
                commonFunc.createStep('card.application.add', 'empty string personNumber', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: '',
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return sql failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string productId', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: '',
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string targetBranch', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: '',
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'empty string accountNumber', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: '',
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: '',
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: '',
                            currency: CURRENCYID,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
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
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'missing customerNumber', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'missing holderName', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'missing personName', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }),
                commonFunc.createStep('card.application.add', 'missing personNumber', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return sql failure');
                }),
                commonFunc.createStep('card.application.add', 'missing productId', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            typeId: typeIdOwn,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'missing targetBranchId', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'missing accountNumber', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            currency: CURRENCYID,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
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
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                cardMethods.addApplication('add duplicated application', context => {
                    return {
                        application: {
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }),
                commonFunc.createStep('card.application.add', 'missing account', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        }
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.add', 'account to other customer', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER + 2,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return sql failure');
                }),
                commonFunc.createStep('card.application.add', 'add application with two accounts', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        },
                        {
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER + 1,
                            accountOrder: ACCOUNTORDER + 1,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 0
                        }]
                    };
                },
                (result, assert) => {
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                    assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                    assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[1]).error, null, 'return second card application account');
                }),
                commonFunc.createStep('card.application.add', 'two isPrimary accounts', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        },
                        {
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER + 1,
                            accountOrder: ACCOUNTORDER + 1,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return db error');
                }),
                commonFunc.createStep('card.application.add', 'person that doesnt belong to that customer', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add second customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        },
                        {
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER + 1,
                            accountOrder: ACCOUNTORDER + 1,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return db error');
                }),
                commonFunc.createStep('card.application.add', 'same account twice', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        },
                        {
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER + 1,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 0
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return db error');
                }),
                commonFunc.createStep('card.application.add', 'same order twice', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                        },
                        {
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER + 1,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 0
                        }]
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return db error');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login second user', USERNAME + 1, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                // enable when we have organizations in nbv
                // commonFunc.createStep('card.application.add', 'branchId not visible', context => {
                //     return {
                //         application: {
                //             customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                //             customerNumber: context['add customer'].customer.customerNumber,
                //             holderName: cardConstants.HOLDERNAME,
                //             personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                //             personNumber: context['add customer'].customer.actorId,
                //             productId: context['add product successfully'].cardProduct[0].productId,
                // typeId: typeIdOwn,
                //             targetBranchId: context['add customer'].customer.organizationId,
                //            issuingBranchId: context['add customer'].customer.organizationId
                //         },
                //         account: [{
                //             accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                //             accountNumber: ACCOUNTNUMBER,
                //             accountOrder: ACCOUNTORDER,
                //             accountTypeName: ACCOUNTNAME,
                //             currency: CURRENCYID,
                //             isPrimary: 1
                //         }]
                //     };
                // }, null,
                // (error, assert) => {
                //     console.log(error);
                // }),
                userMethods.logout('logout second user', context => context['login second user']['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.application.add', 'missing permission', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
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
                }, null,
                (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
