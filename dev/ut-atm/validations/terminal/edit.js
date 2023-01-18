var joi = require('joi');

module.exports = {
    description: 'Edit atm terminal',
    tags: ['atm', 'terminal', 'edit'],
    params: joi.object({
        terminal: joi.array().items(joi.object({
            actorId: joi.number().integer(),
            luno: joi.string(),
            tmk: joi.string().regex(/U[0-F]{32}/g),
            tmkkvv: joi.string().regex(/[0-F]{6}/g),
            name: joi.string().min(3).max(50),
            customization: joi.string().min(1).max(50),
            institutionCode: joi.string().min(1).max(11),
            terminalId: joi.string().min(1).max(8),
            terminalName: joi.string().min(2).max(40),
            identificationCode: joi.string().min(2).max(15),
            merchantId: joi.string().min(1).max(50),
            merchantType: joi.string().min(1).max(4),
            tsn: joi.number().integer(),
            cassette1Currency: joi.string().min(3).max(3),
            cassette1Denomination: joi.number().integer(),
            cassette2Currency: joi.string().min(3).max(3),
            cassette2Denomination: joi.number().integer(),
            cassette3Currency: joi.string().min(3).max(3),
            cassette3Denomination: joi.number().integer(),
            cassette4Currency: joi.string().min(3).max(3),
            cassette4Denomination: joi.number().integer(),
            address: joi.string().min(1).max(40),
            city: joi.string().min(1).max(13),
            state: joi.string().min(1).max(2),
            country: joi.string().min(1).max(2),
            branchId: joi.string()
        }))
    }),
    result: joi.any()
};
