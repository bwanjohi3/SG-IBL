var joi = require('joi');

module.exports = {
    description: 'Fetch pos terminals',
    tags: ['pos', 'terminal', 'fetch'],
    params: joi.any(),
    /*params: joi.object().keys({
        terminalId: joi.any(),
        filterBy: joi.object(),
        orderBy: joi.object(),
        paging: joi.object()}),*/
    result: joi.object()
};
