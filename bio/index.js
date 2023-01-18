var errors = require('./errors');
var helpers = require('./helpers');

var buildParams = function(msg, method) {
    var params = {};

    if (method === 'bio.add') {
        params = {
            id: msg.id,
            data: msg.data
        };
    } else if (method === 'bio.check') {
        params = {
            id: msg.actorId
        };
    } else if (method === 'bio.deletebiodata') {
        params = {
            id: msg.id
        };
    }

    return params;
};

module.exports = {
    id: 'bio',
    createPort: require('ut-port-http'),
    namespace: ['bio'],
    raw: {
        strictSSL: false,
        json: true
    },
    headers: {
        'Content-Type': 'application/json'
    },
    parseResponse: false,
    method: 'POST',
    send: function(msg, $meta) {
        var uri = this.config.uriMap[$meta.method];
        if (!uri) {
            throw errors.wrongBioMethod({
                method: $meta.method
            });
        }
        return {
            uri,
            payload: buildParams(msg, $meta.method)
        };
    },
    receive: function(msg, $meta) {
        if ($meta.mtid === 'error') {
            throw errors.httpError({
                msg: msg
            });
        } else if (!msg.payload) {
            throw errors.missingPayload({
                msg: msg
            });
        } else {
            if (msg.payload.error) {
                throw errors.bio(msg.payload.error);
            } else if (msg.payload.result) {
                return helpers.parseResponse({method: $meta.method, payload: msg.payload.result});
            } else {
                throw errors.wrongBioResponseFormat({
                    payload: msg.payload
                });
            }
        }
    }
};
