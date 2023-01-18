var joi = require('joi');

module.exports = {
    description: 'Add atm terminal',
    tags: ['atm', 'terminal', 'Add'],
    params: joi.object({
        terminal: joi.array().items(joi.object({
            luno: joi.string().required(),
            tmk: joi.string().regex(/U[0-F]{32}/g).required(),
            tmkkvv: joi.string().regex(/[0-F]{6}/g).required(),
            name: joi.string().min(3).max(50).required(),
            customization: joi.string().min(1).max(50),
            institutionCode: joi.string().min(1).max(11),
            terminalId: joi.string().min(1).max(8).required(),
            terminalName: joi.string().min(2).max(40).required(),
            identificationCode: joi.string().min(2).max(15).required(),
            merchantId: joi.string().min(1).max(50),
            merchantType: joi.string().min(1).max(4).required(),
            tsn: joi.number().integer(),
            cassette1Currency: joi.string().min(3).max(3).required(),
            cassette1Denomination: joi.number().integer().required(),
            cassette2Currency: joi.string().min(3).max(3).required(),
            cassette2Denomination: joi.number().integer().required(),
            cassette3Currency: joi.string().min(3).max(3).required(),
            cassette3Denomination: joi.number().integer().required(),
            cassette4Currency: joi.string().min(3).max(3).required(),
            cassette4Denomination: joi.number().integer().required(),
            address: joi.string().min(1).required(),
            city: joi.string().min(1).max(13),
            state: joi.string().min(1).max(2),
            country: joi.string().min(1).max(2),
            branchId: joi.string()
        }))
    }),
    result: joi.any()
};
