var joi = require('joi');

module.exports = {
    description: 'create card product',
    notes: ['create card product'],
    tags: ['card', 'product', 'create'],
    params: joi.object({
        product: joi.object({
            embossedTypeId: joi.number().required(),
            name: joi.string().max(70).required(),
            description: joi.string().required(),
            startDate: joi.string().required(),
            endDate: joi.string().allow(null),
            periodicCardFeeId: joi.number().optional(),
            isActive: joi.boolean().allow(0, 1, '0', '1'),
            branchId: joi.number().required(),
            accountLinkLimit: joi.number().required(),
            pinRetriesLimit: joi.number().integer().min(1).max(25).required(),
            pinRetriesDailyLimit: joi.number().integer().min(1).max(joi.ref('pinRetriesLimit')).required()
        }),
        productAccountType: joi.array().items(
            joi.object().keys({
                accountTypeId: joi.number().required()
            })
        ).sparse().min(1).required(),
        productCustomerType: joi.array().items(
            joi.object().keys({
                customerTypeId: joi.number().required()
            })
        ).sparse().min(1).required()
    }),
    result: joi.any()
};
