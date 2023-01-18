var create = require('ut-error').define;

var PortBIO = create('PortBIO');
var WrongBioMethod = create('WrongBioMethod', PortBIO);
var HttpError = create('HttpError', PortBIO);
var MissingPayload = create('MissingPayload', PortBIO);
var WrongBioResponse = create('WrongBioResponse', PortBIO);
var FingerprintMismatch = create('FingerprintMismatch', PortBIO);
var WringBioResponseFormat = create('WringBioResponseFormat', WrongBioResponse);

module.exports = {
    bio: function(cause) {
        return new PortBIO(cause);
    },
    wrongBioMethod: function(params) {
        return new WrongBioMethod({message: 'Wrong Bio method', params: params});
    },
    httpError: function(params) {
        return new HttpError({message: 'BIO server is not responding', params: params});
    },
    missingPayload: function(params) {
        return new MissingPayload({message: 'Missing payload in BIO response', params: params});
    },
    wrongBioResponse: function(params) {
        return new WrongBioResponse({message: 'Wrong BIO response', params: params});
    },
    fingerprintMismatch: function(params) {
        return new FingerprintMismatch({message: 'Fingerprints mismatch', params: params});
    },
    wringBioResponseFormat: function(params) {
        return new WringBioResponseFormat({message: 'Wrong BIO response format', params: params});
    }
};
