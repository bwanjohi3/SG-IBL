var joi = require('joi');

module.exports = {
    description: 'Add new POS Application',
    tags: ['pos', 'apllication', 'add'],
    params:  joi.any(),
    result: joi.any()
};
/*params: joi.object().keys({
    application: joi.object().keys({
        name: joi.string().min(1).max(50).required(),
        version: joi.string().min(1).max(20).required(),
        description: joi.string(),
        datePublished: joi.any()
    })
}),*/