var path = require('path');
var reportHelpers = require('../../ui/administration/config/report/helpers').helpers;

module.exports = ({config}) => [{
    ports: [
        require('../../script'),
        require('../../db'),
        require('../../bio'),
        require('../../scheduler'),
        require('../../httpServer/service.js'),
        require('../../notifications/firebase'),
        require('ut-mirrors/port')
    ],
    modules: {
        template: require('ut-template'),
        utfront: require('ut-front')({main: '../../browser', from: __dirname, configPath: path.resolve(__dirname, '../../config')}),
        frontend: require('ut-front-react'),
        documentHTTP: require('ut-document/http'),
        identity: require('ut-identity/ut-user'),
        permission: require('ut-permission/ut-user'),
        userHTTP: require('ut-user/routes/http'),
        alert: require('ut-alert'),
        atm: require('ut-atm'),
        db__sql_import: require('../../db/schema'),
        mirrors: require('ut-mirrors'),
        mirrorsHTTP: require('ut-mirrors/routes')
    },
    validations: {
        identity: require('ut-identity/ut-user/validations'),
        'user.bio': require('ut-user/validations/bio'),
        mirrors: require('ut-mirrors/validations')
    }
},
    require('ut-atm/server/admin')(),
    require('ut-transfer')(),
    require('ut-card')({customerAccountSearch: 'card.account.search', config}),
    require('ut-core')(),
    require('ut-document')(),
    require('ut-customer')(),
    require('ut-user')(),
    require('ut-ledger')(),
    require('ut-bulk-payment')(),
    require('ut-report')(reportHelpers),
    require('../../notifications/email'),
    require('ut-audit')()
];
