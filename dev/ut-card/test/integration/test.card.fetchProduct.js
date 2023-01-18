var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var cardJoiValidation = require('ut-test/lib/joiValidations/card');
var userConstants = require('ut-test/lib/constants/user').constants();
var cardConstants = require('ut-test/lib/constants/card').constants();
var userMethods = require('ut-test/lib/methods/user');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var userParams = require('ut-test/lib/requestParams/user');
var cardMethods = require('ut-test/lib/methods/card');
const PRODUCTNAME = 'fp' + cardConstants.PRODUCTNAME;
const USERNAME = 'fp' + userConstants.USERNAME;
const STARTDATE = commonFunc.getFormattedDate(Date.now());
const ENDDATE = commonFunc.getFormattedDate(Date.now() + 1000 * 60 * 60 * 24);
const PAGESIZE = cardConstants.PAGESIZE;
const PAGENUMBER = cardConstants.PAGENUMBER;
const PERMISSION = 'card.product.fetch';
const ASC = cardConstants.ASC;
const DESC = cardConstants.DESC;
const TEST1 = cardConstants.TEST1;
const NAME = cardConstants.NAME;
const STARTDATETEXT = cardConstants.STARTDATETEXT;
const ENDDATETEXT = cardConstants.ENDDATETEXT;
const TYPENAME = cardConstants.TYPENAME;
const BIN = cardConstants.BIN;
const CARDNUMBERCONSTRUCTION = cardConstants.CARDNUMBERCONSTRUCTION;
const ACTIVESTATUS = cardConstants.ACTIVESTATUS;
const ISACTIVE1 = cardConstants.ISACTIVE1;
const INVALIDISACTIVE = cardConstants.INVALIDISACTIVE;
var stdPolicy;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'fetch product',
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
                cardMethods.addCardProduct('add product successfully', (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME, true),
                cardMethods.addCardProduct('add product to make it inactive', (context) => {
                    return {
                        embossedTypeId: context['get all embossed types'].embossedType[0].embossedTypeId,
                        periodicCardFeeId: context['get periodic card fees'].periodicCardFee[0].periodicCardFeeId,
                        branchId: context['get admin details'].memberOF[0].object,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                }, PRODUCTNAME + 1, true),
                cardMethods.editCardProduct('edit product successfully', (context) => {
                    return {
                        productId: context['add product successfully'].cardProduct[0].productId,
                        accountTypeId: context['list account types'][0][0].accountTypeId,
                        customerTypeId: context['list customer types'][0][0].customerTypeId
                    };
                },
                STARTDATE, ENDDATE, 0),
                cardMethods.fetchCardProduct('fetch all card products successfully', (context) => {}),
                cardMethods.fetchCardProduct('fetch card product successfully - false isActive', (context) => {}, 0),
                cardMethods.fetchCardProduct('fetch card product successfully - true isActive', (context) => {}, 1),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - invalid isActive', (context) => {
                    return {
                        filterBy: {isActive: INVALIDISACTIVE},
                        orderBy: {},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be boolean');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - empty string isActive', (context) => {
                    return {
                        filterBy: {isActive: ''},
                        orderBy: {},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'isActive must be boolean');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - productName', (context) => {
                    return {
                        filterBy: {productName: context['add product to make it inactive'].cardProduct[0].name},
                        orderBy: {},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(result.product.every(product => product.name.indexOf(PRODUCTNAME + 1) > -1), 'return correct product names');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - empty string productName', (context) => {
                    return {
                        filterBy: {productName: ''},
                        orderBy: {},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'productName is not allowed to be empty');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy column name ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: NAME, direction: ASC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderString(result.product, 'name', 1), 'return results in asc order by name');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy column name DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: NAME, direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderString(result.product, 'name', 0), 'return results in desc order by name');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - orderBy missing column name', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderDate(result.product, 'updatedOn', 0), 'return results in desc order by name (default)');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - orderBy non existing column', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: TEST1, direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderDate(result.product, 'updatedOn', 0), 'return results in desc order by name (default)');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - orderBy empty string column', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: '', direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'column is not allowed to be empty');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - orderBy empty string direction', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: NAME, direction: ''},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'direction is not allowed to be empty');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - orderBy invalid direction', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: NAME, direction: TEST1},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'direction must be one of asc, desc, ASC, DESC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - orderBy missing direction', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: NAME},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(commonFunc.compareOrderString(result.product, 'updatedOn', 0), 'return results in desc order by name (default)');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - orderBy non-existing direction', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: NAME, direction: TEST1},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, null, (error, assert) => {
                    assert.equals(error.type, 'PortHTTP', 'direction must be one of asc, desc, ASC, DESC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy startDate ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: STARTDATETEXT, direction: ASC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(new Date(result.product[0].startDate) <= new Date(result.product[1].startDate), 'return results in ASC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy startDate DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: STARTDATETEXT, direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(new Date(result.product[0].startDate) >= new Date(result.product[1].startDate), 'return results in DESC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy endDate ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: ENDDATETEXT, direction: ASC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(new Date(result.product[0].endDate) <= new Date(result.product[1].endDate), 'return results in ASC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy endDate DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: ENDDATETEXT, direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(new Date(result.product[0].endDate) >= new Date(result.product[1].endDate), 'return results in DESC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy typeName ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: TYPENAME, direction: ASC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true((result.product[0].typeName || '').localeCompare(result.product[1].typeName || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy typeName DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: TYPENAME, direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true((result.product[0].typeName || '').localeCompare(result.product[1].typeName || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy bin ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: BIN.toString(), direction: ASC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(parseInt(result.product[0].bin || 0) <= parseInt(result.product[1].bin || 0), 'return results in ASC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy bin DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: BIN, direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(parseInt(result.product[0].bin || 0) >= parseInt(result.product[1].bin || 0), 'return results in DESC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy cardNumberConstruction ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: CARDNUMBERCONSTRUCTION, direction: ASC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true((result.product[0].cardNumberConstruction || '').localeCompare(result.product[1].cardNumberConstruction || '') <= 0, 'return results in ASC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy cardNumberConstruction DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: CARDNUMBERCONSTRUCTION, direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true((result.product[0].cardNumberConstruction || '').localeCompare(result.product[1].cardNumberConstruction || '') >= 0, 'return results in DESC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy activeStatus ASC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: ACTIVESTATUS, direction: ASC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(result.product[0].isActive <= result.product[1].isActive, 'return results in ASC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - orderBy activeStatus DESC', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {column: ACTIVESTATUS, direction: DESC},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(result.product[0].isActive >= result.product[1].isActive, 'return results in DESC');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - missing filterBy', (context) => {
                    return {
                        // filterBy: {},
                        orderBy: {},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - missing orderBy', (context) => {
                    return {
                        filterBy: {},
                        // orderBy: {}
                        paging: {pageSize: PAGESIZE, pageNumber: PAGENUMBER}
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - missing paging', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {}
                        // paging: {pageSize: PAGESIZE, pageNumber: PAGENUMBER}
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - no params', (context) => {
                    return {
                        // filterBy: {},
                        // orderBy: {}
                        // paging: {pageSize: PAGESIZE, pageNumber: PAGENUMBER}
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - missing pageSize', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {},
                        paging: {
                            // pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product unsuccessfully - missing pageNumber', (context) => {
                    return {
                        filterBy: {},
                        orderBy: {},
                        paging: {
                            pageSize: PAGESIZE
                            // pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                }),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully - by status and name', (context) => {
                    return {
                        filterBy: {productName: context['add product to make it inactive'].cardProduct[0].name, isActive: false},
                        orderBy: {},
                        paging: {
                            pageSize: PAGESIZE,
                            pageNumber: PAGENUMBER
                        }
                    };
                }, (result, assert) => {
                    assert.equals(cardJoiValidation.validateFetchProduct(result.product).error, null, 'return all card products');
                    assert.true(result.product.every(product => product.name.indexOf(PRODUCTNAME + 1) > -1), 'return correct product names');
                    assert.true(result.product.every(product => product.isActive === false), 'return correct product isActive');
                }),

                // userMethods.logout('logout admin user', context => context.login['identity.check'].sessionId),
                userMethods.login('login first user', USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                commonFunc.createStep('card.product.fetch', 'fetch card product successfully', (context) => {
                    return {
                        filterBy: {isActive: ISACTIVE1},
                        orderBy: {},
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
