var joi = require('joi');

module.exports = {
    description: 'Add new Brand&Model',
    tags: ['pos', 'brandModel', 'add'],
    params: joi.object().keys({
        brandModel: joi.object().keys({
            brand: joi.string().min(1).max(50).required(),
            model: joi.string().min(1).max(50).required(),
            description: joi.string()
        })
    }),
    result: joi.any()
};
