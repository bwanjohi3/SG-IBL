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
const USERNAME = 'fb' + userConstants.USERNAME;
const PERMISSION = 'card.batch.fetch';
const NUMBEROFCARDS = 12;
const NONAMEBATCH = cardConstants.NONAMEBATCH;
const ASC = cardConstants.ASC;
const DESC = cardConstants.DESC;
const TEST1 = cardConstants.TEST1;
const COLUMNBATCHNAME = 'batchName';
const NUMBEROFCARDSTEXT = cardConstants.NUMBEROFCARDSTEXT;
const GENERATEDPINMAILS = cardConstants.GENERATEDPINMAILS;
const DOWNLOADS = cardConstants.DOWNLOADS;
const BATCHDATESENT = cardConstants.BATCHDATESENT;
const BATCHDATECREATED = cardConstants.BATCHDATECREATED;
const BATCHSTATUS = cardConstants.BATCHSTATUS;
const TARGETBRANCHNAMETEXT = cardConstants.TARGETBRANCHNAMETEXT;
const ISSUINGBRANCHNAMETEXT = cardConstants.ISSUINGBRANCHNAMETEXT;
const PRODUCTNAMETEXT = cardConstants.PRODUCTNAMETEXT;
const STATUSID1 = cardConstants.STATUSID1;
const INVALIDSTATUSID = cardConstants.INVALIDSTATUSID;
const TYPEOWN = 'own';
const NAME = cardConstants.RANDOMNAME;
const BIN1 = parseInt('31' + commonFunc.generateRandomFixedInteger(4));
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
var BATCHNAME1, stdPolicy;

module.exports = function(opt, cache) { // TODO: have to add scenarios after card.batch.statusUpdate is created (create one batch for each status)
    test({
        type: 'integration',
        name: 'fetch no name batch',
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
                cardMethods.fetchBrand('get all card brands', context => {
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

                commonFunc.createStep('card.batch.addNoNameBatch', 'add no name batch', (context) => {
                    return {
                        batch: {
                            batchName: NONAMEBATCH,
                            numberOfCards: NUMBEROFCARDS,
                            typeId: typeIdOwn,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, (result, assert) => {
                    BATCHNAME1 = result.batch[0].batchName;
                    assert.equals(cardJoiValidation.validateAddNoNameBatch(result.batch[0]).error, null, 'return no name batch');
                }),
                cardMethods.addNoNameBatch('add second no name batch', context => {
                    return {
                        batch: {
                            batchName: NONAMEBATCH + 1,
                            typeId: typeIdOwn,
                            targetBranchId: context['get admin details'].memberOF[0].object,
                            issuingBranchId: context['get admin details'].memberOF[0].object
                        }
                    };
                }, NUMBEROFCARDS),
                cardMethods.fetchBatch('fetch batch successfully', (context) => {}),
                cardMethods.fetchBatch('fetch batch successfully - by statusId - new', (context) => {}, 1),
                cardMethods.fetchBatch('fetch batch successfully - by statusId - approved', (context) => {}, 2),
                cardMethods.fetchBatch('fetch batch successfully- by statusId - rejected', (context) => {}, 3),
                cardMethods.fetchBatch('fetch batch successfully- by statusId - declined', (context) => {}, 4),
                cardMethods.fetchBatch('fetch batch successfully- by statusId - production', (context) => {}, 5),
                cardMethods.fetchBatch('fetch batch successfully- by statusId - completed', (context) => {}, 6),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - by batchName', context => {
                    return {
                        filterBy: {batchName: BATCHNAME1},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(result.batch.every(batch => batch.batchName.indexOf(BATCHNAME1) > -1), 'return correct batchName');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - missing filterBy', context => {
                    return {
                        // filterBy: {},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - missing orderBy', context => {
                    return {
                        filterBy: {},
                        // orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - missing paging', context => {
                    return {
                        filterBy: {},
                        orderBy: [{}]
                        // paging: {pageSize: PAGESIZE, pageNumber: PAGENUMBER}
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - missing page number', context => {
                    return {
                        filterBy: {},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE
                            // pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'pageNumber is required');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - missing pageSize', context => {
                    return {
                        filterBy: {},
                        orderBy: [{}],
                        paging: {
                            // pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'pageSize is required');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch unsuccessfully - fileterBy invalid statusId', context => {
                    return {
                        filterBy: {statusId: INVALIDSTATUSID},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'statusId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch unsuccessfully - fileterBy empty string statusId', context => {
                    return {
                        filterBy: {statusId: ''},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'statusId must be a number');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch unsuccessfully - fileterBy empty string statusId', context => {
                    return {
                        filterBy: {statusId: TEST1},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'statusId must be a number');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch unsuccessfully - batchName empty string', context => {
                    return {
                        filterBy: {batchName: ''},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'batchName length must be at least 1 characters long');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchName ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: COLUMNBATCHNAME, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(commonFunc.compareOrderString(result.batch, 'batchName', 1), 'return results in ASC order by name');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchName DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: COLUMNBATCHNAME, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(commonFunc.compareOrderString(result.batch, 'batchName', 0), 'return results in DESC order by name');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy missing column', context => {
                    return {
                        filterBy: {},
                        orderBy: [{direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(commonFunc.compareOrderDate(result.batch, 'updatedOn', 0), 'return results in DESC ordered by updatedOn (default)');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy non-existing column', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: TEST1, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(commonFunc.compareOrderDate(result.batch, 'updatedOn', 0), 'return results in DESC ordered by updatedOn (default)');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy empty string column', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: COLUMNBATCHNAME, direction: ''}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'direction is not allowed to be empty');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy missing direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: COLUMNBATCHNAME}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(commonFunc.compareOrderDate(result.batch, 'updatedOn', 0), 'return results in DESC ordered by updatedOn (default)');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchCardCount ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: NUMBEROFCARDSTEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(parseInt(result.batch[0].numberOfCards || 0) <= parseInt(result.batch[1].numberOfCards || 0), 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchCardCount DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: NUMBEROFCARDSTEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(parseInt(result.batch[0].numberOfCards || 0) >= parseInt(result.batch[1].numberOfCards || 0), 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy generatedPinMails ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: GENERATEDPINMAILS, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].generatedPinMails || '').localeCompare(result.batch[1].generatedPinMails || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy generatedPinMails DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: GENERATEDPINMAILS, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].generatedPinMails || '').localeCompare(result.batch[1].generatedPinMails || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy downloads ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: DOWNLOADS, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(((result.batch[0].downloads || '').toString()).localeCompare((result.batch[1].downloads || '').toString()) <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy downloads DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: DOWNLOADS, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(((result.batch[0].downloads || '').toString()).localeCompare((result.batch[1].downloads || '').toString()) >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchDateSent ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: BATCHDATESENT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(new Date(result.batch[0].batchDateSent) <= new Date(result.batch[1].batchDateSent), 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchDateSent DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: BATCHDATESENT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(new Date(result.batch[0].batchDateSent) >= new Date(result.batch[1].batchDateSent), 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchDateCreated ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: BATCHDATECREATED, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(new Date(result.batch[0].batchDateCreated) >= new Date(result.batch[1].batchDateCreated), 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchDateCreated DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: BATCHDATECREATED, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(new Date(result.batch[0].batchDateCreated) <= new Date(result.batch[1].batchDateCreated), 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchStatus ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: BATCHSTATUS, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].batchStatus || '').localeCompare(result.batch[1].batchStatus || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy batchStatus DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: BATCHSTATUS, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].batchStatus || '').localeCompare(result.batch[1].batchStatus || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy targetBranchName ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: TARGETBRANCHNAMETEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].targetBranchName || '').localeCompare(result.batch[1].targetBranchName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy targetBranchName DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: TARGETBRANCHNAMETEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].targetBranchName || '').localeCompare(result.batch[1].targetBranchName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy issuingBranchName ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: ISSUINGBRANCHNAMETEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].issuingBranchName || '').localeCompare(result.batch[1].issuingBranchName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy issuingBranchName DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: ISSUINGBRANCHNAMETEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].issuingBranchName || '').localeCompare(result.batch[1].issuingBranchName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy PRODUCTNAMETEXT ASC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: PRODUCTNAMETEXT, direction: ASC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].productName || '').localeCompare(result.batch[1].productName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - orderBy PRODUCTNAMETEXT DESC', context => {
                    return {
                        filterBy: {},
                        orderBy: [{column: PRODUCTNAMETEXT, direction: DESC}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true((result.batch[0].productName || '').localeCompare(result.batch[1].productName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.batch.fetch', 'fetch batch successfully - by name and status', context => {
                    return {
                        filterBy: {statusId: STATUSID1, batchName: BATCHNAME1},
                        orderBy: [{}],
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBatch(result.batch).error, null, 'return batch details');
                    assert.true(result.batch.every(batch => batch.batchName.indexOf(BATCHNAME1) > -1 && batch.statusId === STATUSID1), 'return correct batchName and statusId');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.batch.fetch', 'missing permission', context => {
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
