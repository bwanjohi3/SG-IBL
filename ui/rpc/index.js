var JsonRcpPort = require('ut-port-jsonrpc');
// Second instance is used to get the default send method from jsonrcp port, instead of copy/paste it
// Defining the send method in the port fully overrides the original method and there is now way to get access to the original implementation
var jsonRcpPortInstance = new JsonRcpPort();

module.exports = {
    id: 'backend',
    createPort: JsonRcpPort,
    namespace: [
        'core',
        'document',
        'customer',
        'permission',
        'user',
        'card',
        'ledger',
        'policy',
        'bio',
        'identity',
        'rule',
        'mirrors',
        'transfer',
        'bulk',
        'agent',
        'alert',
        'db/rule',
        'db/transfer',
        'db/atm',
        'db/pos',
        'aml',
        'db/agent',
        'externalAudit',
        'history'
    ],
    send: function(msg, $meta) {
        var formattedMessage = jsonRcpPortInstance.config.send.apply(this, arguments);

        if ($meta.method === 'bio.scan') {
            var win = window || global.window || {location: {protocol: 'http:'}};
            Object.assign(
                formattedMessage,
                this.config['bio.scan'][win.location.protocol],
                {payload: this.config['bio.scan'].payload}
            );
        }

        return formattedMessage;
    }
};
