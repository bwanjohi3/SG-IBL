var joi = require('joi');

module.exports = {
    description: 'Get pos brandModel',
    tags: ['pos', 'brandModel', 'get'],
    params: joi.object().keys({
        brandModelId: joi.number()
    }),
    result: joi.object()
};
