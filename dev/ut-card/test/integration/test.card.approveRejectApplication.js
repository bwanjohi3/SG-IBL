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
const PRODUCTNAME = 'appra' + cardConstants.PRODUCTNAME;
const USERNAME = 'appra' + userConstants.USERNAME;
const PERMISSION = 'card.application.statusUpdate';
const CUSTOMERNUMBER = commonFunc.generateRandomNumber().toString().slice(7);
const CUSTOMERNAME = 'AUTOMATIONTEST' + commonFunc.generateRandomNumber().toString();
const ACCOUNTTYPEID = '2'; // savings
const CURRENCYID = '1';
const STATUSID = 'active';
const BALANCE = '1000';
const ACCOUNTNAME = 'CURRENT_ACCOUNT';
const ACCOUNTORDER = 1;
const ACTIONAPPROVE = cardConstants.ACTIONAPPROVE;
const STATUSNAMEAPPROVED = cardConstants.STATUSNAMEAPPROVED;
const ACTIONSENDTOPRODUCTION = cardConstants.ACTIONSENDTOPRODUCTION;
const ACTIONREJECT = cardConstants.ACTIONREJECT;
const STATUSNAMEREJECTED = cardConstants.STATUSNAMEREJECTED;
const ACCOUNTNUMBER = commonFunc.generateRandomNumber().toString();
var stdPolicy, orgId, embosedTypeIdName, customerTypeId;

const GETBYDEPTHORGANIZATION = customerConstants.GETBYDEPTHORGANIZATION;
var productConstants = require('ut-test/lib/constants/product').constants();
var productMethods = require('ut-test/lib/methods/product');
var productJoiValidation = require('ut-test/lib/joiValidations/product');
const STARTDATE = productConstants.STARTDATE;
var customerTypeClient, currencyId, productType2, periodicFeeId, productGroupId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'Approve reject status update application',
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
                cardMethods.listCipher('list cipher', context => {
                    return {};
                }),
                commonFunc.createStep('customerTest.customer.mChStatusChange', 'disable maker checker of customers', (context) => {
                    return {
                        isMCHDisabled: 1
                    };
                }, (result, assert) => {
                    assert.equals(typeof result, 'object', 'return object');
                }),
                commonFunc.createStep('core.currency.fetch', 'fetch currencies', (context) => {
                    return {};
                }, (result, assert) => {
                    currencyId = result.currency[0].currencyId;
                }),
                commonFunc.createStep('customer.organization.getByDepth', 'get organizations by depth', (context) => {
                    return {
                        key: GETBYDEPTHORGANIZATION
                    };
                }, (result, assert) => {
                    assert.equals(customerJoiValidation.validateGetByDepthOrganization(result.organizations).error, null, 'Return all details after get by depth organizations');
                    orgId = result.organizations[1].actorId;
                }),
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
                }),
                cardMethods.addApplication('add application', context => {
                    return {
                        application: {
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
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
                cardMethods.fetchConfig('list statuses', context => {
                    return {};
                }),
                cardMethods.updateApplicationState('update application - set status to Approve successfully', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: context['add customer'].customer.customerNumber,
                            issuingBranchId: context['add application'].cardApplication[0].issuingBranchId,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            reasonId: context['add application'].cardApplication[0].reasonId,
                            makerComments: context['add application'].cardApplication[0].makerComments,
                            comments: context['add application'].cardApplication[0].comments,
                            targetBranchId: context['add customer'].customer.organizationId,
                            batchId: null,
                            customerId: null
                        },
                        account: [{
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            accountLinkId: 1,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }),
                commonFunc.createStep('card.application.get', 'get updated application', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].statusName, STATUSNAMEAPPROVED, 'return correct status name');
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                cardMethods.updateApplicationState('update application - set status to ACTIONREJECT successfully', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: context['add customer'].customer.customerNumber,
                            issuingBranchId: context['add application'].cardApplication[0].issuingBranchId,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            reasonId: context['add application'].cardApplication[0].reasonId,
                            makerComments: context['add application'].cardApplication[0].makerComments,
                            comments: context['add application'].cardApplication[0].comments,
                            targetBranchId: context['add customer'].customer.organizationId,
                            batchId: null,
                            customerId: null
                        },
                        account: [{
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            accountLinkId: 1,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONREJECT).actionId
                    };
                }),
                commonFunc.createStep('card.application.get', 'get updated application', context => {
                    return {
                        applicationId: context['add application'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].statusName, STATUSNAMEREJECTED, 'return correct status name');
                    assert.equals(result.application[0].targetBranchId, orgId, 'return updated org');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'update application - status STATUSNAMEAPPROVED unsuccessfully', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: context['add customer'].customer.customerNumber,
                            issuingBranchId: context['add application'].cardApplication[0].issuingBranchId,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            reasonId: context['add application'].cardApplication[0].reasonId,
                            makerComments: context['add application'].cardApplication[0].makerComments,
                            comments: context['add application'].cardApplication[0].comments,
                            targetBranchId: context['add customer'].customer.organizationId,
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
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
                            accountLinkId: 1,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'portSQL', 'return portSQL - action is not allowed');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'update application - status ACTIONSENDTOPRODUCTION unsuccessfully', context => {
                    return {
                        application: {
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: context['add customer'].customer.customerNumber,
                            issuingBranchId: context['add application'].cardApplication[0].issuingBranchId,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            reasonId: context['add application'].cardApplication[0].reasonId,
                            makerComments: context['add application'].cardApplication[0].makerComments,
                            comments: context['add application'].cardApplication[0].comments,
                            targetBranchId: context['add customer'].customer.organizationId,
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
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
                            accountLinkId: 1,
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
                            customerName: CUSTOMERNAME + 2 + ' ' + CUSTOMERNAME + 2,
                            personName: CUSTOMERNAME + 2 + ' ' + CUSTOMERNAME + 2,
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            customerNumber: context['add customer'].customer.customerNumber,
                            issuingBranchId: context['add application'].cardApplication[0].issuingBranchId,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            reasonId: context['add application'].cardApplication[0].reasonId,
                            makerComments: context['add application'].cardApplication[0].makerComments,
                            comments: context['add application'].cardApplication[0].comments,
                            targetBranchId: context['add customer'].customer.organizationId,
                            batchId: null,
                            customerId: null
                        },
                        account: [{
                            applicationId: context['add application'].cardApplication[0].applicationId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            accountLinkId: 1,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONAPPROVE).actionId
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
