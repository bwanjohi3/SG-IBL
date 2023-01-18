var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userConstants = require('ut-test/lib/constants/user').constants();
var customerConstants = require('ut-test/lib/constants/customer').constants();
var customerMethods = require('ut-test/lib/methods/customer');
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var cardMethods = require('ut-test/lib/methods/card');
const PRODUCTNAME = 'ud' + cardConstants.PRODUCTNAME;
const CUSTOMERNUMBER = commonFunc.generateRandomNumber().toString().slice(7);
const ACCOUNTTYPEID = '2'; // savings
const CURRENCYID = '1';
const STATUSID = 'active';
const BALANCE = '1000';
const ACCOUNTNAME = 'CURRENT_ACCOUNT';
const ACCOUNTORDER = 1;
const ACCOUNTNUMBER = commonFunc.generateRandomNumber().toString();
const DOCUMENTID = '1001';
const ACTIONSAVE = 'Save';
var applicationId, applicationId2, documentTypeId, documentTypeId2, attachmentId, customerTypeId;

const GETBYDEPTHORGANIZATION = customerConstants.GETBYDEPTHORGANIZATION;
var productConstants = require('ut-test/lib/constants/product').constants();
var productMethods = require('ut-test/lib/methods/product');
var productJoiValidation = require('ut-test/lib/joiValidations/product');
const STARTDATE = productConstants.STARTDATE;
var customerTypeClient, currencyId, productType2, periodicFeeId, productGroupId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'upload Document',
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
                commonFunc.createStep('customer.organization.fetch', 'child organizations of main org', (context) => {
                    return {
                        businessUnitId: context['get admin details'].memberOF[0].object
                    };
                }, (result, assert) => {
                    assert.equals(customerJoiValidation.validateFetchOrganization(result.organization).error, null, 'return all details after fetching organization');
                }),
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
                commonFunc.createStep('card.documentType.list', 'list document types', (context) => {
                    return {};
                }, (result, assert) => {
                    documentTypeId = result[0][0].key;
                    documentTypeId2 = result[0][1].key;
                    // console.log(result);
                    assert.equals(cardJoiValidation.validateListDocumentTypes(result[0][0]).error, null, 'return customer types');
                }),
                commonFunc.createStep('core.currency.fetch', 'fetch currencies', (context) => {
                    return {};
                }, (result, assert) => {
                    currencyId = result.currency[0].currencyId;
                }),
                customerMethods.getByDepthOrganization('get organizations by depth', context => GETBYDEPTHORGANIZATION),
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
                commonFunc.createStep('customerTest.customer.mChStatusChange', 'disable maker checker of customers', (context) => {
                    return {
                        isMCHDisabled: 1
                    };
                }, (result, assert) => {
                    assert.equals(typeof result, 'object', 'return object');
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
                commonFunc.createStep('card.application.add', 'add application', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        document: [{
                            documentId: DOCUMENTID,
                            documentTypeId: documentTypeId
                        }],
                        attachment: [{
                            content: cardConstants.CONTENT,
                            contentEncoding: cardConstants.ENCODING,
                            contentType: cardConstants.CONTENTTYPE,
                            documentId: DOCUMENTID,
                            page: 1
                        }]
                    };
                }, (result, assert) => {
                    applicationId = result.cardApplication[0].applicationId;
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                    assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                }),
                cardMethods.fetchConfig('list statuses', context => {
                    return {};
                }),
                commonFunc.createStep('card.application.get', 'get updated application', context => {
                    return {
                        applicationId: applicationId
                    };
                }, (result, assert) => {
                    attachmentId = result.documents[0].attachmentId;
                    assert.true(result.documents.every(documents => documents.documentTypeId === documentTypeId), 'return correct documentTypeId');
                    assert.true(result.documents.length > 0, 'return more than 0 documents attached');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'update application - adding one more document', context => {
                    return {
                        application: {
                            applicationId: applicationId,
                            holderName: cardConstants.HOLDERNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            personNumber: context['add customer'].customer.actorId,
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['add customer'].customer.organizationId,
                            batchId: null,
                            customerId: null,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME
                        },
                        account: [{
                            applicationId: applicationId,
                            applicationAccountId: context['get updated application'].accounts.find(account => account.isLinked === 1).applicationAccountId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId,
                        document: [{
                            documentId: context['get updated application'].documents[0].documentId,
                            documentTypeId: documentTypeId
                        }],
                        attachment: [{
                            documentId: context['get updated application'].documents[0].documentId,
                            attachmentId: attachmentId,
                            documentTypeId: documentTypeId,  // should be not required - to be removed after fix
                            contentType: context['get updated application'].documents[0].contentType,
                            extension: context['get updated application'].documents[0].extension,
                            filename: context['get updated application'].documents[0].filename,
                            hash: context['get updated application'].documents[0].hash,
                            page: 1
                        }],
                        newAttachments: [{
                            content: cardConstants.CONTENT,
                            contentEncoding: cardConstants.ENCODING,
                            contentType: cardConstants.CONTENTTYPE,
                            documentId: context['get updated application'].documents[0].documentId,
                            documentTypeId: documentTypeId,
                            page: 2
                        }]
                    };
                }, (result, assert) => {
                    assert.equals(result[0][0].applicationId, applicationId, 'return correct applicationId');
                    assert.equals(cardJoiValidation.validateUpdateApplication(result[0][0]).error, null, 'return updated application');
                }),
                commonFunc.createStep('card.application.get', 'get updated application after adding one more document', context => {
                    return {
                        applicationId: context['update application - adding one more document'][0][0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.application[0].applicationId, applicationId, 'return correct applicationId');
                    assert.true(result.documents.every(documents => documents.documentTypeId === documentTypeId), 'return correct documentTypeId');
                    assert.true(result.documents.length > 1, 'return more than one documents attached');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'update application - editting uploaded doc', context => {
                    return {
                        application: {
                            applicationId: applicationId,
                            holderName: cardConstants.HOLDERNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            personNumber: context['add customer'].customer.actorId,
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['add customer'].customer.organizationId,
                            batchId: null,
                            customerId: null,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME
                        },
                        account: [{
                            applicationId: applicationId,
                            applicationAccountId: context['get updated application after adding one more document'].accounts.find(account => account.isLinked === 1).applicationAccountId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId,
                        document: [{
                            documentId: context['get updated application after adding one more document'].documents[0].documentId,
                            documentTypeId: documentTypeId2
                        }],
                        attachment: [{
                            documentId: context['get updated application after adding one more document'].documents[0].documentId,
                            attachmentId: attachmentId,
                            documentTypeId: documentTypeId,  // should be not required - to be removed after fix
                            contentType: context['get updated application after adding one more document'].documents[0].contentType,
                            extension: context['get updated application after adding one more document'].documents[0].extension,
                            filename: context['get updated application after adding one more document'].documents[0].filename,
                            hash: context['get updated application after adding one more document'].documents[0].hash,
                            page: 1
                        }],
                        newAttachments: []
                    };
                }, (result, assert) => {
                    assert.equals(result[0][0].applicationId, applicationId, 'return correct applicationId');
                    assert.equals(cardJoiValidation.validateUpdateApplication(result[0][0]).error, null, 'return updated application');
                }),
                commonFunc.createStep('card.application.get', 'get updated application after editting uploaded doc', context => {
                    return {
                        applicationId: context['update application - editting uploaded doc'][0][0].applicationId
                    };
                }, (result, assert) => {
                    assert.equals(result.documents[0].attachmentId, attachmentId, 'return correct attachmentId');
                    assert.equals(result.application[0].applicationId, applicationId, 'return correct applicationId');
                    assert.equals(result.documents[0].documentTypeId, documentTypeId2, 'return correct documentTypeId');
                    assert.true(result.documents.length === 1, 'return one document');
                }),
                commonFunc.createStep('card.application.statusUpdate', 'update application - removing all documents', context => {
                    return {
                        application: {
                            applicationId: applicationId,
                            holderName: cardConstants.HOLDERNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            personNumber: context['add customer'].customer.actorId,
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['add customer'].customer.organizationId,
                            batchId: null,
                            customerId: null,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME
                        },
                        account: [{
                            applicationId: applicationId,
                            applicationAccountId: context['get updated application'].accounts.find(account => account.isLinked === 1).applicationAccountId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        applicationActionId: context['list statuses'].Application.find(element => element.actionName === ACTIONSAVE).actionId,
                        document: [],
                        attachment: [],
                        newAttachments: []
                    };
                }, (result, assert) => {
                    assert.equals(result[0][0].applicationId, applicationId, 'return correct applicationId');
                    assert.equals(cardJoiValidation.validateUpdateApplication(result[0][0]).error, null, 'return updated application');
                }),
                commonFunc.createStep('card.application.get', 'get updated application after removing all doc', context => {
                    return {
                        applicationId: context['update application - removing all documents'][0][0].applicationId
                    };
                }, (result, assert) => {
                    // console.log(result);
                    assert.equals(result.application[0].applicationId, applicationId, 'return correct applicationId');
                    assert.same(result.documents, [], 'return empty string');
                }),
                commonFunc.createStep('card.application.add', 'add application with images for all docs', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        document: [{
                            documentId: DOCUMENTID,
                            documentTypeId: documentTypeId
                        }/** , {
                            documentId: DOCUMENTID + 1,
                            documentTypeId: documentTypeId2
                        }, {
                            documentid: DOCUMENTID + 2,
                            documentTypeId: context['list document types'][0][2].key
                        }],
                        attachment: [{
                            content: cardConstants.CONTENT,
                            contentEncoding: cardConstants.ENCODING,
                            contentType: cardConstants.CONTENTTYPE,
                            documentId: DOCUMENTID,
                            page: 1
                        } */]
                    };
                }, (result, assert) => {
                    applicationId2 = result.cardApplication[0].applicationId;
                    // console.log(result);
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                    assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                }),
                commonFunc.createStep('card.application.get', 'get application with images for all docs', context => {
                    return {
                        applicationId: context['add application with images for all docs'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    // console.log(result);
                    assert.equals(result.application[0].applicationId, applicationId2, 'return correct applicationId');
                    assert.true(result.documents.length > 1, 'return more than one documents attached');
                }),
                commonFunc.createStep('card.application.add', 'add application with max image size', context => {
                    return {
                        application: {
                            customerName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME,
                            customerNumber: context['add customer'].customer.customerNumber,
                            holderName: cardConstants.HOLDERNAME,
                            personNumber: context['add customer'].customer.actorId,
                            productId: context['add product successfully'].cardProduct[0].productId,
                            targetBranchId: context['add customer'].customer.organizationId,
                            issuingBranchId: context['add customer'].customer.organizationId,
                            personName: customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME
                        },
                        account: [{
                            accountLinkId: context['list accountIds'].accountLink[0].accountLinkId,
                            accountNumber: ACCOUNTNUMBER,
                            accountOrder: ACCOUNTORDER,
                            accountTypeName: ACCOUNTNAME,
                            currency: CURRENCYID,
                            isPrimary: 1
                        }],
                        document: [{
                            documentId: DOCUMENTID,
                            documentTypeId: documentTypeId
                        }],
                        attachment: [{
                            content: cardConstants.CONTENT,
                            contentEncoding: cardConstants.ENCODING,
                            contentType: cardConstants.CONTENTTYPE,
                            documentId: DOCUMENTID,
                            page: 1
                        }]
                    };
                }, (result, assert) => {
                    applicationId2 = result.cardApplication[0].applicationId;
                    // console.log(result);
                    assert.equals(cardJoiValidation.validateAddApplication(result.cardApplication[0]).error, null, 'return card application');
                    assert.equals(cardJoiValidation.validateCardApplicationAccount(result.cardApplicationAccount[0]).error, null, 'return card application account');
                }),
                commonFunc.createStep('card.application.get', 'get application with images for all docs', context => {
                    return {
                        applicationId: context['add application with max image size'].cardApplication[0].applicationId
                    };
                }, (result, assert) => {
                    // console.log(result);
                    assert.equals(result.application[0].applicationId, applicationId2, 'return correct applicationId');
                    assert.true(result.documents.length > 1, 'return more than one documents attached');
                })
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
