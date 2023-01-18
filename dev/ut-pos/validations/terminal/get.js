var joi = require('joi');

module.exports = {
    description: 'Get pos terminals',
    tags: ['pos', 'terminal', 'get'],
    params: joi.any(),
    /*params: joi.object().keys({
        terminalId: joi.any(),
        filterBy: joi.object(),
        orderBy: joi.object(),
        paging: joi.object()}),*/
    result: joi.object()
};
