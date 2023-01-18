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
const ASC = cardConstants.ASC;
const DESC = cardConstants.DESC;
const REASONNAMETEXT = cardConstants.REASONNAMETEXT;
const MODULETEXT = cardConstants.MODULETEXT;
const ACTIONNAMETEXT = cardConstants.ACTIONNAMETEXT;
const ISACTIVE = cardConstants.ACTIVESTATUS;
const ORGNAME = customerConstants.ORGNAME;
const APPLICATIONTEXT = cardConstants.APPLICATIONTEXT;
const BATCHTEXT = cardConstants.BATCHTEXT;
const REASONNAME = cardConstants.PRODUCTNAME;
const TEST1 = cardConstants.TEST1;
const USERNAME = 'fr' + userConstants.USERNAME;
const PERMISSION = 'card.reason.fetch';
var stdPolicy, actionId, actionId2, varModule, itemDescription;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'fetch card reason',
        server: opt.server,
        serverConfig: opt.serverConfig,
        client: opt.client,
        clientConfig: opt.clientConfig,
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
                cardMethods.fetchBin('get all bins', context => {
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
                commonFunc.createStep('card.moduleAction.list', 'list module actions', context => {
                    return {};
                }, (result, assert) => {
                    actionId = result.Application[0].actionId;
                    itemDescription = result.Application[0].itemDescriptionTranslation;
                    actionId2 = result.Batch[0].actionId;
                    varModule = Object.keys(result)[0];
                    assert.equals(cardJoiValidation.validateListModuleAction(result.Application).error, null, 'return module action list');
                }),
                cardMethods.addCardReason('add reason successfully', (context) => {
                    return {
                        action: [actionId]
                    };
                }, 1, APPLICATIONTEXT, REASONNAME),
                cardMethods.fetchReason('fetch reason', (context) => {
                    return {};
                }),
                cardMethods.addCardReason('add second reason successfully', (context) => {
                    return {
                        action: [actionId2]
                    };
                }, 0, BATCHTEXT, REASONNAME + 1),
                cardMethods.fetchReason('fetch reasons', (context) => {
                    return {};
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - missing filterBy', context => {
                    return {
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - missing orderBy', context => {
                    return {
                        filterBy: {
                            module: varModule
                        },
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - missing paging', context => {
                    return {
                        filterBy: {
                            module: varModule
                        },
                        orderBy: []
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - missing pageSize', context => {
                    return {
                        filterBy: {
                            module: varModule
                        },
                        orderBy: [],
                        paging: {
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'pageSize is required');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - missing page number', context => {
                    return {
                        filterBy: {
                            module: varModule
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'pageNumber is required');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - filter by module', context => {
                    return {
                        filterBy: {
                            module: varModule
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(result.cardReason.every(cardReason => cardReason.module === varModule), 'return all reasons for this module');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - invalid text module', context => {
                    return {
                        filterBy: {
                            module: TEST1
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.same(result.cardReason, [], 'return empty array');
                    assert.same(result.pagination, [], 'return empty array');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - empty string module', context => {
                    return {
                        filterBy: {
                            module: ''
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'module length must be at least 1 characters long');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - number for module', context => {
                    return {
                        filterBy: {
                            module: 0
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'module must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - null module', context => {
                    return {
                        filterBy: {
                            module: null
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'module must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - filter by actionId', context => {
                    return {
                        filterBy: {
                            actionId: actionId
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(result.cardReason.every(cardReason => cardReason.actionName.indexOf(itemDescription) > -1), 'return reasons with this actionId');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - invalid text actionId', context => {
                    return {
                        filterBy: {
                            actionId: TEST1
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'actionId must be a number');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - empty string actionId', context => {
                    return {
                        filterBy: {
                            actionId: ''
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'actionId must be a number');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - number for actionId', context => {
                    return {
                        filterBy: {
                            actionId: 0
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'actionId must be larger than or equal to 1');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - null actionId', context => {
                    return {
                        filterBy: {
                            actionId: null
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'actionId must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - filter by actionId', context => {
                    return {
                        filterBy: {
                            isActive: 1
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(result.cardReason.every(cardReason => cardReason.isActive === true), 'return all Active reasons');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - invalid isActive', context => {
                    return {
                        filterBy: {
                            isActive: 3
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be a boolean');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - string isActive', context => {
                    return {
                        filterBy: {
                            isActive: ''
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be a boolean');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - empty string isActive', context => {
                    return {
                        filterBy: {
                            isActive: ''
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be a boolean');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - filter by actionId', context => {
                    return {
                        filterBy: {
                            reasonName: REASONNAME
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(result.cardReason.every(cardReason => cardReason.reasonName.indexOf(REASONNAME) > -1), 'return reasons with this name');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - number reasonName', context => {
                    return {
                        filterBy: {
                            reasonName: 0
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'reasonName must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - empty string reasonName', context => {
                    return {
                        filterBy: {
                            reasonName: ''
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'reasonName is not allowed to be empty');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - null reasonName', context => {
                    return {
                        filterBy: {
                            reasonName: null
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'reasonName must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy missing direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: REASONNAMETEXT
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderDate(result.cardReason, 'updatedOn', 0), 'return results in DESC order by updatedOn (default)');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy missing column', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderDate(result.cardReason, 'updatedOn', 0), 'return results in DESC order by updatedOn (default)');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - invalid text column', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: TEST1,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderDate(result.cardReason, 'updatedOn', 0), 'return results in DESC order by updatedOn (default)');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - empty string column', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: '',
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'column is not allowed to be empty');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - number column', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: 0,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'column must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - null column', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: null,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'column must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - string direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: REASONNAMETEXT,
                            direction: TEST1
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'direction must be one of ASC, DESC');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - empty string direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: REASONNAMETEXT,
                            direction: ''
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'direction is not allowed to be empty');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - number direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: REASONNAMETEXT,
                            direction: 0
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'direction must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - null direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: REASONNAMETEXT,
                            direction: null
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'direction must be a string');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy ASC reasonName', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: REASONNAMETEXT,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderString(result.cardReason, REASONNAMETEXT, 1), 'return results in ASC order by reasonName');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy DESC reasonName', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: REASONNAMETEXT,
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderString(result.cardReason, REASONNAMETEXT, 0), 'return results in DESC order by reasonName');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy ASC module', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: MODULETEXT,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderString(result.cardReason, MODULETEXT, 1), 'return results in ASC order by module');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy DESC module', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: MODULETEXT,
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderString(result.cardReason, MODULETEXT, 0), 'return results in DESC order by module');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy ASC actionName', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: ACTIONNAMETEXT,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderString(result.cardReason, ACTIONNAMETEXT, 1), 'return results in ASC order by actionName');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy DESC actionName', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: ACTIONNAMETEXT,
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(commonFunc.compareOrderString(result.cardReason, ACTIONNAMETEXT, 0), 'return results in DESC order by actionName');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy ASC isActive', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: ISACTIVE,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(result.cardReason[0].isActive <= result.cardReason[1].isActive, 'return results in ASC order by isActive');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - orderBy DESC isActive', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: ISACTIVE,
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(result.cardReason[0].isActive >= result.cardReason[1].isActive, 'return results in DESC order by isActive');
                }),
                commonFunc.createStep('card.reason.fetch', 'fetch reason - filter by two params', context => {
                    return {
                        filterBy: {
                            actionId: actionId,
                            isActive: 1
                        },
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchReason(result.cardReason).error, null, 'return all cardReasons');
                    assert.true(result.cardReason.every(cardReason => cardReason.actionName.indexOf(itemDescription) > -1), 'return reasons with this actionId');
                    assert.true(result.cardReason.every(cardReason => cardReason.isActive === true), 'return isActive true for all');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.reason.fetch', 'missing permissions', (context) => {
                    return {
                        filterBy: {},
                        orderBy: [],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
