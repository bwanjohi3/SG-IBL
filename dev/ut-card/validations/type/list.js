var joi = require('joi');

module.exports = {
    description: 'list card products',
    notes: ['list card products'],
    tags: ['card', 'products', 'list'],
    params: joi.object({
        isActive: joi.number().min(0).max(1),
        isValid: joi.number().min(0).max(1),
        embossedTypeId: joi.number().min(0).max(5).allow(null),
        ownershipTypeId: joi.number().allow(null)
    }),
    result: joi.any()
};
