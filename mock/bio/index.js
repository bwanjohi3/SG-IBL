const joi = require('joi');

function responseError(error, details) {
    return {
        code: error.code || 404,
        message: error.message || 'Not found',
        type: error
    };
}

let bioRoutes = {
    '/fingerprint/add': {
        httpMethod: 'POST',
        validation: joi.object({
            id: joi.number().integer().required(),
            data: joi.object().keys({
                L1: joi.array().items(joi.string()),
                L2: joi.array().items(joi.string()),
                L3: joi.array().items(joi.string()),
                L4: joi.array().items(joi.string()),
                L5: joi.array().items(joi.string()),
                R1: joi.array().items(joi.string()),
                R2: joi.array().items(joi.string()),
                R3: joi.array().items(joi.string()),
                R4: joi.array().items(joi.string()),
                R5: joi.array().items(joi.string())
            }).required()
        }),
        handler: function({ request }) {
            // Adding bio data does not actually add anything (the user module handles records in the user.hash table)
            return {
                result: {
                    success: true
                }
            };
        }
    },
    '/fingerprint/delete': {
        httpMethod: 'POST',
        validation: joi.object({
            id: joi.number().integer().required()
        }),
        handler: function({ request }) {
            // Deleting bio data does not actually add anything (the user module handles records in the user.hash table)
            return {
                result: {
                    success: true
                }
            };
        }
    },
    '/fingerprint/check': {
        httpMethod: 'POST',
        validation: joi.object({
            id: joi.number().integer().required()
        }),
        handler: function({ request, bus }) {
            // Check if user has records of type bio in user.hash table, uses SP
            return bus.importMethod('user.hash.get')({ actorId: request.payload.id })
                .then(hashes => {
                    let hasBio = false;
                    let bioHashes = hashes['user.hash'].filter(hash => hash.type === 'bio');
                    if (bioHashes.length > 0) {
                        hasBio = true;
                    }

                    return {
                        result: {
                            hasBio: hasBio
                        }
                    };
                });
        }
    }
};

module.exports = {
    hapiRoutes: function(bus) {
        let hapiRoutes = [];
        Object.keys(bioRoutes).map((uri) => {
            hapiRoutes.push({
                method: bioRoutes[uri].httpMethod,
                path: uri,
                config: {auth: false},
                handler: function(request, reply) {
                    if (request.payload && typeof request.payload === 'object') {
                        request.body = request.payload;
                    } else {
                        try {
                            request.body = JSON.parse(request.payload) || {};
                        } catch (err) {
                            return reply(responseError({Message: `The input has an invalid format. ('badRequest')`})).code(400);
                        }
                    }
                    if (bioRoutes[uri].validation && joi.validate(request.body, bioRoutes[uri].validation).error) {
                        return reply(responseError({Message: `The input has an invalid format. ('badRequest')`})).code(400);
                    }
                    let response = bioRoutes[uri].handler({ request, bus });
                    let responseCode = response ? response.Code || 200 : 200;
                    reply(response).code(responseCode);
                }
            });
        });
        return hapiRoutes;
    }
};
