var create = require('ut-error').define;

var HSM = create('hsm');
var Send = create('send', HSM);
var Receive = create('receive', HSM);

module.exports = {
    hsm: function(errorCode) {
        let errorMsg = {code: errorCode};
        return new HSM(errorMsg);
    },
    send: function(cause) {
        return new Send(cause);
    },
    receive: function(cause) {
        return new Receive(cause);
    }
};
