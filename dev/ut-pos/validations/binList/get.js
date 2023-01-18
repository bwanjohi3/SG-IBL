var joi = require('joi');

module.exports = {
    description: 'Get Pos binList',
    tags: ['pos', 'binList', 'get'],
    params: joi.object().keys({
        binListId: joi.number()
    }),
    result: joi.object()
};
