var tranferHelpers = require('ut-transfer/reports/helpers');
var cardHelpers = require('ut-card/reports/helpers');
var atmHelpers = require('ut-atm/reports/helpers');
var auditHelpers = require('ut-audit/reports');
module.exports = {
    helpers: Object.assign({},
        cardHelpers,
        tranferHelpers,
        atmHelpers,
        auditHelpers
    )
};
