import joi from 'joi-browser';

let schemaCommon = joi.object().keys({
    ownershipTypeId: joi.number().required().options({
        language: {
            key: '"Ownership" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    name: joi.string().required().options({
        language: {
            key: '"Card Type Name" ',
            string: {
                base: 'is required for all card types'
            }
        }
    }),
    description: joi.string().max(1000).allow('', null).optional().options({
        language: {
            key: '"Card Type Description" ',
            string: {
                base: 'should contain no more than 1000 characters'
            }
        }
    })
});

let schemaOwn = joi.object().keys({
    ownershipTypeId: joi.number().min(1).required().options({
        language: {
            key: '"Ownership" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    name: joi.string().required().options({
        language: {
            key: '"Card Type Name" ',
            string: {
                base: 'is required for all card types'
            }
        }
    }),
    description: joi.string().max(1000).allow('', null).optional().options({
        language: {
            key: '"Card Type Description" ',
            string: {
                base: 'should contain no more than 1000 characters'
            }
        }
    }),
    binId: joi.array().items(
        joi.object()
    ).min(1).required().options({
        language: {
            key: '"BIN" ',
            array: {
                base: 'is required for all card types'
            }
        }
    }),
    cardBrandId: joi.number().min(1).required().options({
        language: {
            key: '"Card Brand" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    cardNumberConstructionId: joi.number().min(1).required().options({
        language: {
            key: '"Card Number Construction" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    // branchId: joi.number().required().options({
    //     language: {
    //         key: '"Organization Name" ',
    //         number: {
    //             base: 'is required for all card types'
    //         }
    //     }
    // }),
    termMonth: joi.number().integer().min(1).required().options({
        language: {
            key: '"Term (in Month)" ',
            number: {
                base: 'should be an integer greater than 0 and is required for all card types'
            }
        }
    }),
    cvk: joi.string().regex(/^U[a-f0-9]{32}$/i).allow(null).options({
        language: {
            key: '"CVK" ',
            string: {
                regex: {
                    base: 'must begin with "U" and contain 32 characters (a-f, 0-9)'
                }
            }
        }
    }),
    pvk: joi.string().regex(/^U[a-f0-9]{32}$/i).allow(null).options({
        language: {
            key: '"PVK" ',
            string: {
                regex: {
                    base: 'must begin with "U" and contain 32 characters (a-f, 0-9)'
                }
            }
        }
    }),
    cryptogramMethodIndex: joi.number().min(0).required().options({
        language: {
            key: '"Cryptogram Method" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    mkac: joi.string().regex(/^U[a-f0-9]{32}$/i).allow(null).options({
        language: {
            key: '"MK-AC" ',
            string: {
                regex: {
                    base: 'must begin with "U" and contain 32 characters (a-f, 0-9)'
                }
            }
        }
    }),
    ivac: joi.string().regex(/^[a-f0-9]{32}$/i).required().options({
        language: {
            key: '"IV-AC" ',
            string: {
                base: 'is required for all card types',
                regex: {
                    base: 'must contain 32 characters (a-f, 0-9)'
                }
            }
        }
    }),
    cdol1ProfileId: joi.number().min(1).required().options({
        language: {
            key: '"CDOL1 Profile" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    applicationInterchangeProfile: joi.string().regex(/^[a-f0-9]{4}$/i).required().options({
        language: {
            key: '"Application Interchange Profile" ',
            string: {
                base: 'is required for all card types',
                regex: {
                    base: 'must contain 4 characters (a-f, 0-9)'
                }
            }
        }
    }),
    decimalisation: joi.string().regex(/^[a-f0-9]{16}$/).required().options({
        language: {
            key: '"Decimalisation" ',
            string: {
                regex: {
                    base: 'must contain 16 digits'
                },
                base: 'is required for all card types'
            }
        }
    }),
    cipher: joi.string().required().options({
        language: {
            key: '"Cipher" ',
            string: {
                base: 'is required for all card types'
            }
        }
    }),
    serviceCode1: joi.number().valid(1, 2, 5, 6, 7, 9).required().options({
        language: {
            key: '"Service Code First Digit" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    serviceCode2: joi.number().valid(0, 2, 4).required().options({
        language: {
            key: '"Service Code Second Digit" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    serviceCode3: joi.number().valid(0, 1, 2, 3, 4, 5, 6, 7).required().options({
        language: {
            key: '"Service Code Third Digit" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    issuerId: joi.string().required().options({
        language: {
            key: '"Issuer Type" ',
            string: {
                base: 'is required for all card types'
            }
        }
    })
});

let schemaExternal = joi.object().keys({
    ownershipTypeId: joi.number().required().options({
        language: {
            key: '"Type Ownership" ',
            number: {
                base: 'is required for all card types'
            }
        }
    }),
    name: joi.string().required().options({
        language: {
            key: '"Type Name" ',
            string: {
                base: 'is required for all card types'
            }
        }
    }),
    description: joi.string().max(1000).allow('', null).optional().options({
        language: {
            key: '"Card Type Description" ',
            string: {
                base: 'should contain no more than 1000 characters'
            }
        }
    }),
    issuerId: joi.string().required().options({
        language: {
            key: '"Issuer Type" ',
            string: {
                base: 'is required for all card types'
            }
        }
    }),
    binId: joi.array().items(
        joi.object()
    ).min(1).required().options({
        language: {
            key: '"BIN" ',
            array: {
                base: 'is required for all card types'
            }
        }
    })
    // emvRequestTags
    // emvResponseTags
});

/** Joi API ref: https://github.com/hapijs/joi/blob/v9.2.0/lib/language.js */

module.exports = {
    run: (objToValidate, schema) => {
        let options = {};
        let schemaToValidate;
        switch (schema) {
            case 'own':
                schemaToValidate = schemaOwn;
                break;
            case 'external':
                schemaToValidate = schemaExternal;
                break;
            case 'common':
                schemaToValidate = schemaCommon;
                break;
            default:
                break;
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
