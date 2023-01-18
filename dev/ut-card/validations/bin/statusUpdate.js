var joi = require('joi');

module.exports = {
    description: 'status card bin update',
    notes: ['status card bin update'],
    tags: ['card', 'bin', 'statusUpdate'],
    params: joi.object({
        bin: joi.array().items(
            joi.object({
                binId: joi.number().min(1).required(),
                isActive: joi.boolean().allow(0, 1, '0', '1').required()
            }).required()
        ).min(1).required()
    }),
    result: joi.any()
};
