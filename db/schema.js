var path = require('path');

module.exports = {
    schema: [
        {path: path.join(__dirname, 'schema'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-agent'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-atm'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-pos'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-aml'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-card'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-ledger'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-mirrors'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-rule'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-core'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-transfer'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-mobile'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-customer'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-user'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-bulk-payment'), linkSP: true},
        {path: path.join(__dirname, 'schema/ut-indexes'), linkSP: false},
        {path: path.join(__dirname, 'schema/ut-audit'), linkSP: true} // audit should be placed at end
    ]
};
