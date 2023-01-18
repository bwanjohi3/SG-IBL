var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var userConstants = require('ut-test/lib/constants/user').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
var stdPolicy;
const ASC = cardConstants.ASC;
const DESC = cardConstants.DESC;
const USERNAME = 'fbin' + userConstants.USERNAME;
const BINDESCRIPTION = cardConstants.RANDOMBINDESCRIPTION;
const DESCRIPTIONTEXT = cardConstants.DESCRIPTIONTEXT;
const ACTIVESTATUS = cardConstants.ACTIVESTATUS;
const BINIDTEXT = cardConstants.BINIDTEXT;
const TEST1 = cardConstants.TEST1;
const BINTEXT = cardConstants.BIN;
const PERMISSION = 'card.bin.fetch';
const RANDOMBIN = parseInt('32' + commonFunc.generateRandomFixedInteger(4));
const TYPEOWN = 'own';

var typeIdOwn;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'add bin',
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
                        object: context['get admin details']['memberOF'][0].object,
                        policyId: stdPolicy,
                        roles: [context['add role successfully'].role[0].actorId],
                        defaultRoleId: context['add role successfully'].role[0].actorId
                    };
                }, USERNAME),
                userMethods.approveUser('approve first user', context => context['add new user'].person.actorId),
                commonFunc.createStep('card.ownershipType.fetch', 'fetch card ownershipType', context => {
                    return {};
                }, (result, assert) => {
                    var ownershipType1 = result.ownershipType.find((ownershipType) => ownershipType.itemCode === TYPEOWN);
                    typeIdOwn = ownershipType1.ownershipTypeId;
                    assert.equals(cardJoiValidation.validateFetchOwnershipType(result.ownershipType[0]).error, null, 'return ownership types');
                }),
                cardMethods.addBin('add bin', context => {
                    return {
                        description: BINDESCRIPTION,
                        ownershipTypeId: typeIdOwn
                    };
                }, RANDOMBIN),
                cardMethods.addBin('add second bin', context => {
                    return {
                        description: BINDESCRIPTION + 2,
                        ownershipTypeId: typeIdOwn
                    };
                }, RANDOMBIN + 1),
                cardMethods.statusUpdateBin('status update bin - change isActive to false', context => {
                    return {
                        binId: context['add second bin'].cardBin[0].binId
                    };
                }, false),
                cardMethods.fetchBin('fetch bin', context => {
                    return {};
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - successfully with all params', context => {
                    return {
                        filterBy: {},
                        orderBy: [{}],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - filterBy isActive', context => {
                    return {
                        filterBy: {
                            isActive: 1
                        },
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(result.bin.every(bin => bin.isActive === true), 'return all reasons for this module');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - filterBy isActive', context => {
                    return {
                        filterBy: {
                            isActive: 0
                        },
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(result.bin.every(bin => bin.isActive === false), 'return all reasons for this module');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - invalid number isActive', context => {
                    return {
                        filterBy: {
                            isActive: 3
                        },
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return isActive must be boolean');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - string isActive', context => {
                    return {
                        filterBy: {
                            isActive: TEST1
                        },
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return isActive must be boolean');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - emptyString isActive', context => {
                    return {
                        filterBy: {
                            isActive: ''
                        },
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'return isActive must be boolean');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy missing column', context => {
                    return {
                        orderBy: [{
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderDate(result.bin, 'updatedOn', 0), 'return results in DESC order by updatedOn (default)');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy missing direction', context => {
                    return {
                        orderBy: [{
                            column: BINTEXT
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderDate(result.bin, 'updatedOn', 0), 'return results in DESC order by updatedOn (default)');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - invalid text column', context => {
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
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderDate(result.bin, 'updatedOn', 0), 'return results in DESC order by updatedOn (default)');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - empty string column', context => {
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
                commonFunc.createStep('card.bin.fetch', 'fetch bin - number column', context => {
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
                commonFunc.createStep('card.bin.fetch', 'fetch bin - null column', context => {
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
                commonFunc.createStep('card.bin.fetch', 'fetch bin - string direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: BINTEXT,
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
                commonFunc.createStep('card.bin.fetch', 'fetch bin - empty string direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: BINTEXT,
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
                commonFunc.createStep('card.bin.fetch', 'fetch bin - number direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: BINTEXT,
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
                commonFunc.createStep('card.bin.fetch', 'fetch bin - null direction', context => {
                    return {
                        filterBy: {},
                        orderBy: [{
                            column: BINTEXT,
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
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy bin ASC', context => {
                    return {
                        orderBy: [{
                            column: BINTEXT,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderNumber(result.bin, BINTEXT, 1), 'return results in ASC order by bin');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy bin DESC', context => {
                    return {
                        orderBy: [{
                            column: BINTEXT,
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderNumber(result.bin, BINTEXT, 0), 'return results in DESC order by bin');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy description ASC', context => {
                    return {
                        orderBy: [{
                            column: DESCRIPTIONTEXT,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderString(result.bin, DESCRIPTIONTEXT, 1), 'return results in ASC order by bin');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy description DESC', context => {
                    return {
                        orderBy: [{
                            column: DESCRIPTIONTEXT,
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderString(result.bin, DESCRIPTIONTEXT, 0), 'return results in DESC order by bin');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy isActive ASC', context => {
                    return {
                        orderBy: [{
                            column: ACTIVESTATUS,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(result.bin[0].isActive <= result.bin[1].isActive, 'return results in ASC order by isActive');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy isActive DESC', context => {
                    return {
                        orderBy: [{
                            column: ACTIVESTATUS,
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(result.bin[0].isActive >= result.bin[1].isActive, 'return results in DESC order by isActive');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy binId ASC', context => {
                    return {
                        orderBy: [{
                            column: BINIDTEXT,
                            direction: ASC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderNumber(result.bin, BINIDTEXT, 1), 'return results in ASC order by bin');
                }),
                commonFunc.createStep('card.bin.fetch', 'fetch bin - orderBy binId DESC', context => {
                    return {
                        orderBy: [{
                            column: BINIDTEXT,
                            direction: DESC
                        }],
                        paging: {
                            pageSize: cardConstants.PAGESIZE,
                            pageNumber: cardConstants.PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchBin(result.bin).error, null, 'return bins');
                    assert.true(commonFunc.compareOrderNumber(result.bin, BINIDTEXT, 0), 'return results in DESC order by bin');
                }),
                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.bin.fetch', 'missing permission', context => {
                    return {};
                }, null,
                (error, assert) => {
                    assert.true(error.message.indexOf(PERMISSION) > -1, 'Missing permissions for ' + PERMISSION);
                }),
                userMethods.logout('logout first user', context => context['login first user']['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
