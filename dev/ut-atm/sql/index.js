var path = require('path');

var { handleExportResponse } = require('ut-report/assets/script/common');

function firstRow(result) {
    return result && result[0] && result[0][0];
}

module.exports = {
    schema: [{path: path.join(__dirname, 'schema'), linkSP: true}],
    'card.params.response.receive': firstRow,
    'card.check.response.receive': firstRow,
    //'card.getAccounts.response.receive': firstRow,
    'account.holder.response.receive': firstRow,
    'account.list.response.receive': firstRow,
    'cashPosition.response.receive': function(msg, $meta) {
        if ($meta.fileConfig) {
            return handleExportResponse(msg, $meta);
        }

        return msg;
    }
};
