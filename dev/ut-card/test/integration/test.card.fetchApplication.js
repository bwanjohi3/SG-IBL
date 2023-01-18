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
const PAGESIZE = cardConstants.PAGESIZE;
const PAGENUMBER = cardConstants.PAGENUMBER;
const PRODUCTNAME = 'fa' + cardConstants.PRODUCTNAME;
const USERNAME = 'fa' + userConstants.USERNAME;
const DESCRIPTION = cardConstants.DESCRIPTION;
const STARTDATE = cardConstants.STARTDATE;
const ENDDATE = cardConstants.ENDDATE;
const PERMISSION = 'card.application.fetch';
const CUSTOMERNUMBER = '100240';
const ACCOUNTTYPEID = '2'; // savings
const CURRENCYID = '1';
const STATUSID = 'active';
const BALANCE = '1000';
const ACCOUNTNAME = 'CURRENT_ACCOUNT';
const ACCOUNTORDER = 1;
const ACCOUNTNUMBER = commonFunc.generateRandomNumber().toString();
const CUSTOMERNAME = 'AUTOMATIONTEST' + commonFunc.generateRandomNumber().toString();
const ASC = cardConstants.ASC;
const DESC = cardConstants.DESC;
const TEST1 = cardConstants.TEST1;
const INVALIDTYPEID = cardConstants.INVALIDTYPEID;
const INVALIDSTATUSID = cardConstants.INVALIDSTATUSID;
const INVALIDPRODUCTID = cardConstants.INVALIDPRODUCTID;
const INVALIDAPPLICATIONID = cardConstants.INVALIDAPPLICATIONID;
const APPLICATIONID1 = cardConstants.APPLICATIONID1;
const TYPEID2 = cardConstants.TYPEID2;
const STATUSID1 = cardConstants.STATUSID1;
const CUSTOMERNAMETEXT = cardConstants.CUSTOMERNAMETEXT;
const PERSONNAME = cardConstants.PERSONNAME;
const TARGETBRANCHNAME = cardConstants.TARGETBRANCHNAME;
const APPLICATIONIDTEXT = cardConstants.APPLICATIONIDTEXT;
const STATUSNAME = cardConstants.STATUSNAME;
const PRODUCTNAMETEXT = cardConstants.PRODUCTNAMETEXT;
const CREATEDONTEXT = cardConstants.CREATEDONTEXT;
const CARDNUMBERTEXT = cardConstants.CARDNUMBERTEXT;
const BATCHNAME = cardConstants.BATCHNAME;
const CURRENTBRANCHNAMETEXT = cardConstants.CURRENTBRANCHNAMETEXT;
const ISSUINGBRANCHNAMETEXT = cardConstants.ISSUINGBRANCHNAMETEXT;
const TYPENAME = cardConstants.TYPENAME;
// kyc
const RANDOMCONDITIONID = customerConstants.RANDOMCONDITIONID;
const KYCDESCRIPTION = customerConstants.KYCDESCRIPTION;
const TYPEOWN = 'own';
const NAME = cardConstants.RANDOMNAME;
const BIN1 = parseInt('29' + commonFunc.generateRandomFixedInteger(4));
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
var productMethods = require('ut-test/lib/methods/product');
var productJoiValidation = require('ut-test/lib/joiValidations/product');
var applicationId, applicationId1, cardProductName, CARDPRODUCTNAMECHECK, stdPolicy, customerTypeId;
var customerTypeClient, currencyId, productType2, periodicFeeId, productGroupId;
var orgId1, organizationDepthArray, kycId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'fetch application',
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
                cardMethods.fetchEmbossedTypes('get all embossed types', context => {
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
                commonFunc.createStep('customerTest.customer.mChStatusChange', 'disable maker checker of customers', (context) => {
                    return {
                        isMCHDisabled: 1
                    };
                }, (result, assert) => {
                    assert.equals(typeof result, 'object', 'return object');
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

                commonFunc.createStep('card.product.add', 'add product successfully', (context) => {
                    return {
                        product: {
                            name: PRODUCTNAME + 1,
                            description: DESCRIPTION,
                            startDate: STARTDATE,
                            endDate: ENDDATE,
                            embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                            isActive: true,
                            periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                            branchId: context['get admin details'].memberOF[0].object,
                            pinRetriesLimit: 9,
                            pinRetriesDailyLimit: 3,
                            accountLinkLimit: 2
                        },
                        productAccountType: [{
                            accountTypeId: context['list account types'][0][0].accountTypeId
                        }],
                        productCustomerType: [{
                            customerTypeId: context['list customer types'][0][0].customerTypeId
                        }]
                    };
                }, (result, assert) => {
                    cardProductName = result.cardProduct[0].name;
                    assert.equals(cardJoiValidation.validateAddProduct(result.cardProduct[0], PRODUCTNAME + 1).error, null, 'return card product');
                    assert.true(result.cardProduct[0].isActive, 'return isActive true');
                }),
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
                            businessUnitId: orgId1,
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
                commonFunc.createStep('customer.customer.add', 'add second customer', (context) => {
                    return {
                        customer: {
                            customerNumber: CUSTOMERNUMBER,
                            customerTypeId: customerTypeId,
                            organizationId: orgId1
                        },
                        person: {
                            isEnabled: true,
                            isDeleted: false,
                            firstName: CUSTOMERNAME,
                            lastName: CUSTOMERNAME
                        },
                        account: [{
                            productId: context['add product 1'].product[0].productId,
                            accountTypeId: ACCOUNTTYPEID,
                            businessUnitId: orgId1,
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
                commonFunc.createStep('card.application.add', 'add application', (context) => {
                    return {
                        application: {
                            customerName: CUSTOMERNAME + ' ' + CUSTOMERNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: CUSTOMERNAME + ' ' + CUSTOMERNAME,
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
                    applicationId = result.cardApplication[0].applicationId;
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                    assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                }),
                commonFunc.createStep('card.application.add', 'add second application', (context) => {
                    return {
                        application: {
                            customerName: CUSTOMERNAME + '1 ' + CUSTOMERNAME,
                            customerNumber: context['add second customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personName: CUSTOMERNAME + '1 ' + CUSTOMERNAME,
                            personNumber: context['add second customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            typeId: typeIdOwn,
                            targetBranchId: context['add second customer'].customer.organizationId,
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
                }, (result, assert) => {
                    applicationId1 = result.cardApplication[0].applicationId;
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                    assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                }),
                cardMethods.fetchApplication('fetch application successfully', (context) => {}),
                cardMethods.fetchApplication('fetch application successfully - statusId New', (context) => {}, 1),
                cardMethods.fetchApplication('fetch application successfully - statusId approved', (context) => {}, 2),
                cardMethods.fetchApplication('fetch application successfully - statusId rejected', (context) => {}, 3),
                cardMethods.fetchApplication('fetch application successfully - statusId declined', (context) => {}, 4),
                cardMethods.fetchApplication('fetch application successfully - statusId completed', (context) => {}, 5),
                cardMethods.fetchApplication('fetch application successfully - embossedTypeId no name cards', (context) => {}, null, 1),
                cardMethods.fetchApplication('fetch application successfully - embossedTypeId name cards', (context) => {}, null, 2),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - by customer name', context => {
                    return {
                        filterBy: {customerName: CUSTOMERNAME + 1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.true(result.applications.every(applications => applications.customerName.indexOf(CUSTOMERNAME + 1) > -1));
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - by applicationId', context => {
                    return {
                        filterBy: {applicationId: context['add application'].cardApplication[0].applicationId.toString()},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(result.applications[0].applicationId, applicationId, 'return correct applicationId');
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                }),
                commonFunc.createStep('card.product.list', 'list all products', context => {
                    return {};
                }, (result, assert) => {
                    assert.true(result.product.find(product => product.name.indexOf(cardProductName) > -1), 'return correct productName');
                    var cardProductNameCheck = result.product.find((singleFunction) => singleFunction.name.indexOf(cardProductName) > -1);
                    CARDPRODUCTNAMECHECK = cardProductNameCheck.productId;
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - by productId', context => {
                    return {
                        filterBy: {productId: CARDPRODUCTNAMECHECK},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.true(result.applications.find(applications => applications.productName.indexOf(cardProductName) > -1), 'return correct productName');
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - missing filterBy', context => {
                    return {
                        // filterBy: {},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - missing orderBy', context => {
                    return {
                        filterBy: {},
                        // orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - missing paging', context => {
                    return {
                        filterBy: {},
                        orderBy: []
                        // paging: {pageSize: PAGESIZE, pageNumber: PAGENUMBER}
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - missing pageSize', context => {
                    return {
                        filterBy: {},
                        orderBy: [],
                        paging: {
                            // pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'pageSize is required');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - missing pageNumber', context => {
                    return {
                        filterBy: {},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE
                            // pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'pageNumber is required');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy non-existing statusId ', context => {
                    return {
                        filterBy: {statusId: INVALIDSTATUSID},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'statusId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy empty string statusId', context => {
                    return {
                        filterBy: {statusId: ''},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'statusId must be a number');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy invalid statusId', context => {
                    return {
                        filterBy: {statusId: TEST1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'statusId must be a number');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy non-existing embossedTypeId', context => {
                    return {
                        filterBy: {embossedTypeId: INVALIDTYPEID},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'embossedTypeId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy empty string embossedTypeId', context => {
                    return {
                        filterBy: {embossedTypeId: ''},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'embossedTypeId must be a number');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy invalid embossedTypeId', context => {
                    return {
                        filterBy: {embossedTypeId: TEST1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'embossedTypeId must be a number');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy non-existing productId', context => {
                    return {
                        filterBy: {productId: INVALIDPRODUCTID},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'productId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy empty string productId', context => {
                    return {
                        filterBy: {productId: ''},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'productId must be a number');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy invalid productId', context => {
                    return {
                        filterBy: {productId: TEST1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'productId must be a number');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy non-existing applicationId', context => {
                    return {
                        filterBy: {applicationId: INVALIDAPPLICATIONID},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'applicationId  must be a string');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy empty string applicationId', context => {
                    return {
                        filterBy: {applicationId: ''},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'applicationId is not allowed to be empty');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy invalid applicationId', context => {
                    return {
                        filterBy: {applicationId: TEST1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.same(result.applications, [], 'return empty result');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy empty string customerName', context => {
                    return {
                        filterBy: {customerName: ''},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'customerName is not allowed to be empty');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - fileterBy invalid applicationId', context => {
                    return {
                        filterBy: {applicationId: APPLICATIONID1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'applicationId must be a string');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - filterBy embossedTypeId and productId', context => {
                    return {
                        filterBy: {embossedTypeId: TYPEID2, productId: CARDPRODUCTNAMECHECK},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                    assert.true(result.applications.find(applications => applications.productName.indexOf(cardProductName) > -1), 'return correct productName');
                    assert.true(result.applications.find(applications => applications.embossedTypeId === TYPEID2, 'return correct embossedTypeId'));
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - filterBy embossedTypeId and statusId', context => {
                    return {
                        filterBy: {embossedTypeId: TYPEID2, statusId: STATUSID1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                    assert.true(result.applications.find(applications => applications.statusId === STATUSID1, 'return correct statusId'));
                    assert.true(result.applications.find(applications => applications.embossedTypeId === TYPEID2, 'return correct embossedTypeId'));
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - filterBy productId and statusId', context => {
                    return {
                        filterBy: {productId: CARDPRODUCTNAMECHECK, statusId: STATUSID1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                    assert.true(result.applications.find(applications => applications.statusId === STATUSID1, 'return correct statusId'));
                    assert.true(result.applications.find(applications => applications.productName.indexOf(cardProductName) > -1), 'return correct productName');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - filterBy customerName and statusId', context => {
                    return {
                        filterBy: {customerName: CUSTOMERNAME, statusId: STATUSID1},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                    assert.true(result.applications.find(applications => applications.statusId === STATUSID1, 'return correct statusId'));
                    assert.true(result.applications.every(applications => applications.customerName.indexOf(CUSTOMERNAME) > -1));
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - filterBy customerName and productId', context => {
                    return {
                        filterBy: {customerName: CUSTOMERNAME, productId: CARDPRODUCTNAMECHECK},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                    assert.true(result.applications.find(applications => applications.productName.indexOf(cardProductName) > -1), 'return correct productName');
                    assert.true(result.applications.every(applications => applications.customerName.indexOf(CUSTOMERNAME) > -1));
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - filterBy customerName and embossedTypeId', context => {
                    return {
                        filterBy: {customerName: CUSTOMERNAME, embossedTypeId: TYPEID2},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                    assert.true(result.applications.find(applications => applications.embossedTypeId === TYPEID2, 'return correct embossedTypeId'));
                    assert.true(result.applications.every(applications => applications.customerName.indexOf(CUSTOMERNAME) > -1));
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application unsuccessfully - filterBy applicationId and customerName', context => {
                    return {
                        filterBy: {applicationId: context['add second application'].cardApplication[0].applicationId.toString(), customerName: CUSTOMERNAME},
                        orderBy: [],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return fetch applications');
                    assert.true(result.applications.every(applications => applications.customerName.indexOf(CUSTOMERNAME) > -1));
                    assert.equals(result.applications[0].applicationId, applicationId1, 'return correct applicationId');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column customerName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CUSTOMERNAMETEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderString(result.applications, 'customerName', 1), 'return results in ASC order by customerName');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column customerName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CUSTOMERNAMETEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderString(result.applications, 'customerName', 0), 'return results in DESC order by customerName');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy missing column', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderDate(result.applications, 'updatedOn', 0), 'return results in DESC order by updatedOn (default)');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy non-existing column', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: TEST1, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderDate(result.applications, 'updatedOn', 0), 'return results in DESC order by updatedOn (default)');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy empty string column', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: '', direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'column length must be at least 1 characters long');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy invalid direction', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CUSTOMERNAMETEXT, direction: TEST1}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return direction must be one of ASC, DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy empty string direction', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CUSTOMERNAMETEXT, direction: ''}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null,
                (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return joi failure');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy missing direction', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CUSTOMERNAMETEXT}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderDate(result.applications, 'updatedOn', 0), 'return results in DESC order by applicationId (default)');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column personName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: PERSONNAME, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].personName || '').localeCompare(result.applications[1].personName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column personName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: PERSONNAME, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].personName || '').localeCompare(result.applications[1].personName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column targetBranchName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: TARGETBRANCHNAME, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].targetBranchName || '').localeCompare(result.applications[1].targetBranchName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column targetBranchName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: TARGETBRANCHNAME, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].targetBranchName || '').localeCompare(result.applications[1].targetBranchName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column applicationId ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: APPLICATIONIDTEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(parseInt(result.applications[0].applicationId || 0) <= parseInt(result.applications[1].applicationId || 0), 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column applicationId DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: APPLICATIONIDTEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(parseInt(result.applications[0].applicationId || 0) >= parseInt(result.applications[1].applicationId || 0), 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column statusName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: STATUSNAME, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].statusName || '').localeCompare(result.applications[1].statusName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column statusName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: STATUSNAME, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].statusName || '').localeCompare(result.applications[1].statusName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column productName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: PRODUCTNAMETEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].productName || '').localeCompare(result.applications[1].productName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column productName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: PRODUCTNAMETEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].productName || '').localeCompare(result.applications[1].productName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column createdOn ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CREATEDONTEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(new Date(result.applications[0].createdOn) <= new Date(result.applications[1].createdOn), 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column createdOn DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CREATEDONTEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(new Date(result.applications[0].createdOn) >= new Date(result.applications[1].createdOn), 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column typeName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: TYPENAME, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].typeName || '').localeCompare(result.applications[1].typeName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column typeName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: TYPENAME, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].typeName || '').localeCompare(result.applications[1].typeName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column cardNumber ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CARDNUMBERTEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(parseInt(result.applications[0].cardNumber || 0) <= parseInt(result.applications[1].cardNumber || 0), 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column cardNumber DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CARDNUMBERTEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true(parseInt(result.applications[0].cardNumber || 0) >= parseInt(result.applications[1].cardNumber || 0), 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column batchName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: BATCHNAME, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].batchName || '').localeCompare(result.applications[1].batchName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column batchName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: BATCHNAME, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].batchName || '').localeCompare(result.applications[1].batchName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column currentBranchName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CURRENTBRANCHNAMETEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].currentBranchName || '').localeCompare(result.applications[1].currentBranchName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column currentBranchName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: CURRENTBRANCHNAMETEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].currentBranchName || '').localeCompare(result.applications[1].currentBranchName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column issuingBranchName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: ISSUINGBRANCHNAMETEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].issuingBranchName || '').localeCompare(result.applications[1].issuingBranchName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.application.fetch', 'fetch application successfully - orderBy column issuingBranchName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [{column: ISSUINGBRANCHNAMETEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchApplication(result.applications).error, null, 'return all card products');
                    assert.true((result.applications[0].issuingBranchName || '').localeCompare(result.applications[1].issuingBranchName || '') >= 0, 'return results in DESC');
                }),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.application.fetch', 'missing permission', context => {
                    return {
                        filterBy: {},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
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
