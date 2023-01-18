var joi = require('joi');

module.exports = {
    description: 'Edit BrandModel',
    tags: ['pos', 'brandModel', 'edit'],
    params: joi.object().keys({
        brandModel: joi.object().keys({
            brandModelId: joi.number().integer().required(),
            brand: joi.string().min(1).max(50),
            model: joi.string().min(1).max(50),
            description: joi.string()
        })
    }),
    result: joi.any()
};
