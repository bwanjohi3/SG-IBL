var joi = require('joi');

module.exports = {
    description: 'create card type',
    notes: ['create card type'],
    tags: ['card', 'type', 'create'],
    params: joi.object().keys({
        type: joi.array().items({
            ownershipTypeName: joi.string().allow(['own', 'external']).required(),
            ownershipTypeId: joi.number().min(1).required(),
            name: joi.string().max(100).required(),
            description: joi.string().allow('', null).optional(),
            cardBrandId: joi.when('ownershipTypeName', {is: 'own', then: joi.number().min(1).required()}),
            cardNumberConstructionId: joi.when('ownershipTypeName', {is: 'own', then: joi.number().min(1).required()}),
            termMonth: joi.when('ownershipTypeName', {is: 'own', then: joi.number().min(1).required()}),
            cvk: joi.when('ownershipTypeName', {is: 'own', then: joi.string().regex(/^U[a-f0-9]{32}$/i).allow(null)}),
            pvk: joi.when('ownershipTypeName', {is: 'own', then: joi.string().regex(/^U[a-f0-9]{32}$/i).allow(null)}),
            cryptogramMethodIndex: joi.when('ownershipTypeName', {is: 'own', then: joi.number().min(0).required()}),
            cryptogramMethodName: joi.when('ownershipTypeName', {is: 'own', then: joi.string().allow('KQ', 'KW').required()}),
            schemeId: joi
                .when('ownershipTypeName', {is: 'own',
                    then: joi
                        .when('cryptogramMethodName', {is: 'KQ', then: joi.number().allow(0, 1, 2).required()})
                        .when('cryptogramMethodName', {is: 'KW', then: joi.number().allow(0, 1, 2, 3).required()})
                }),
            mkac: joi.when('ownershipTypeName', {is: 'own', then: joi.string().regex(/^U[a-f0-9]{32}$/i).allow(null)}),
            ivac: joi.when('ownershipTypeName', {is: 'own', then: joi.string().regex(/^[a-f0-9]{32}$/i).required()}),
            cdol1ProfileId: joi.when('ownershipTypeName', {is: 'own', then: joi.number().min(1).required()}),
            applicationInterchangeProfile: joi.when('ownershipTypeName', {is: 'own', then: joi.string().regex(/^[a-f0-9]{4}$/i).required()}),
            decimalisation: joi.when('ownershipTypeName', {is: 'own', then: joi.string().regex(/^[a-f0-9]{16}$/).required()}),
            cipher: joi.when('ownershipTypeName', {is: 'own', then: joi.string().allow(['aes128', 'aes192', 'aes256', 'des3', 'blowfish']).required()}),
            cvv1: joi.when('ownershipTypeName', {is: 'own', then: joi.boolean().allow([0, 1, '0', '1']).required()}),
            cvv2: joi.when('ownershipTypeName', {is: 'own', then: joi.boolean().allow([0, 1, '0', '1']).required()}),
            icvv: joi.when('ownershipTypeName', {is: 'own', then: joi.boolean().allow([0, 1, '0', '1']).required()}),
            serviceCode1: joi.when('ownershipTypeName', {is: 'own', then: joi.number().allow([1, 2, 5, 6, 7, 9]).required()}),
            serviceCode2: joi.when('ownershipTypeName', {is: 'own', then: joi.number().allow([0, 2, 4]).required()}),
            serviceCode3: joi.when('ownershipTypeName', {is: 'own', then: joi.number().allow([0, 1, 2, 3, 4, 5, 6, 7]).required()}),
            issuerId: joi.string().min(1).required(),
            generateControlDigit: joi.when('ownershipTypeName', {is: 'own', then: joi.boolean().allow([0, 1, '0', '1']).required()}),

            emvRequestTags: joi.when('ownershipTypeName', {is: 'external', then: joi.string().required()}),
            emvResponseTags: joi.when('ownershipTypeName', {is: 'external', then: joi.string().required()}),

            // branchId: joi.number().required(),
            isActive: joi.boolean().allow(0, 1, '0', '1').required()
        }).required(),
        binId: joi.array().items(
            joi.number().min(1).required()
        ).min(1).required()
    }),
    result: joi.any()
};
