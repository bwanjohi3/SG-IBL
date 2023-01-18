var reportHelpers = require('../../ui/administration/config/report/helpers').helpers;

module.exports = ({config}) => [{
    ports: [
        require('../../script'),
        require('../../db'),
        require('../../httpServer/administration.js')
    ],
    modules: {
        identity: require('ut-identity/ut-user'),
        alert: require('ut-alert'),
        db__sql_import: require('../../db/schema'),
        db_test_sql_import: require('../../test/schema')
    },
    validations: {
        identity: require('ut-identity/ut-user/validations')
    }
},
    require('ut-agent'),
    require('ut-atm/server/admin'),
    require('ut-transfer'),
    require('ut-card')({customerAccountSearch: 'card.account.search', config}),
    require('ut-core'),
    require('ut-rule'),
    require('ut-document'),
    require('ut-customer'),
    require('ut-user'),
    require('ut-ledger'),
    require('ut-bulk-payment'),
    require('ut-report')(reportHelpers),
    require('ut-port-ldap/customConnections'),
    require('../../notifications/email'),
    require('ut-audit')
];
