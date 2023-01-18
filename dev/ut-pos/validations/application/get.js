var joi = require('joi');

module.exports = {
    description: 'Get Pos Application',
    tags: ['pos', 'app', 'get'],
    params: joi.object().keys({
        appId: joi.number()
    }),
    result: joi.object()
};
