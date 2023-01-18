var dispatchToDB = /^(customer|loan|rule|transfer|ledger|agent|bulk|alert|card)\./;

module.exports = {
    id: 'script',
    createPort: require('ut-port-script'),
    logLevel: 'trace',
    imports: ['identity', 'permission', 'customer',  'rule', 'transfer', 'agent', 'ledger', 'alert'],
    exec: function(msg, $meta) {
        if ($meta.method && dispatchToDB.test($meta.method)) {
            return this.bus.importMethod('db/' + $meta.method)(msg, $meta);
        }
    }
};
