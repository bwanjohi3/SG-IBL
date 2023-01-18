import joi from 'joi-browser';

/** Joi API ref: https://github.com/hapijs/joi/blob/v9.2.0/lib/language.js */
let schema = joi.object().keys({
    embossedTypeId: joi.number().required().options({
        language: {
            key: '"Applicable For" ',
            number: {
                base: 'is required for all card products'
            },
            empty: {
                base: 'is required for all card products'
            }
        }
    }),
    name: joi.string().required().options({
        language: {
            key: '"Product Name" ',
            string: {
                base: 'is required for all card products'
            },
            empty: {
                base: 'is required for all card products'
            }
        }
    }),
    description: joi.string().required().options({
        language: {
            key: '"Product Description" ',
            string: {
                base: 'is required for all card products'
            }
        }
    }),
    startDate: joi.date().required().options({
        language: {
            key: '"Start Date" ',
            date: {
                base: 'is required for all card products'
            }
        }
    }),
    productAccountType: joi.array().sparse().min(1).required().options({
        language: {
            key: '"Account Type" ',
            array: {
                base: 'is required for all card products'
            }
        }
    }),
    productCustomerType: joi.array().sparse().min(1).required().options({
        language: {
            key: '"Customer Type" ',
            array: {
                base: 'is required for all card products'
            }
        }
    }),
    branchId: joi.number().required().options({
        language: {
            key: '"Organization Name" ',
            number: {
                base: 'is required for all card products'
            }
        }
    }),
    periodicCardFeeId: joi.number().required().options({
        language: {
            key: '"Apply periodic card fee" ',
            number: {
                base: 'is required for all card products'
            }
        }
    }),
    accountLinkLimit: joi.number().min(1).integer().required().options({
        language: {
            key: '"Account Link Limit" ',
            number: {
                base: 'must contain only numbers.'
            }
        }
    }),
    pinRetriesLimit: joi.number().min(1).max(25).integer().required().options({
        language: {
            key: '"PIN Retries Limit" ',
            number: {
                base: 'must contain only numbers.'
            }
        }
    }),
    pinRetriesDailyLimit: joi.number().min(1).max(joi.ref('pinRetriesLimit')).integer().required().options({
        language: {
            key: '"PIN Retries Daily Limit" ',
            number: {
                base: 'is required for all card products.'
            }
        }
    })
});
module.exports = {
    run: (objToValidate, shouldSkipPeriodicFee = false) => {
        let options = {};
        let schemaToValidate = schema;
        if (shouldSkipPeriodicFee) {
            schemaToValidate = schemaToValidate.optionalKeys('periodicCardFeeId');
        }
        return joi.validate(objToValidate, schemaToValidate, Object.assign({}, {
            allowUnknown: true,
            abortEarly: false
        }, options), (err, value) => {
            if (!err) {
                return {
                    isValid: true,
                    errors: {}
                };
            }
            let errors = err.details.reduce((errors, current) => {
                errors[current.path] = current.message;
                return errors || {};
            }, {});
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        });
    }
};
