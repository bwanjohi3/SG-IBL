
module.exports = {
    id: 'scheduler',
    createPort: require('ut-port-schedule'),
    logLevel: 'trace',
    listen: false,
    workInterval: 3000,
    idleInterval: 30000,
    extLoad: {
    },
    jobsList: {
        'customer.referralExpire': {
            opcode: 'request',
            pattern: '0 0 0 * * *',
            lastRun: null
        }
    },
    start: function() {
    },
    stop: function() {
    },
    send: function(msg, $meta) {
        return msg;
    },
    receive: function(msg, $meta) {
        return msg;
    },
    'customer.referralExpire.notification.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
        return this.bus.importMethod('customer.referral.expired')({}).then(function() {
            return msg;
        }).catch(function(err) {
            throw err;
        });
    },
      'tss.notification.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
        return this.bus.importMethod('tss')({}).then(function(response) {  
            return response;
        }).catch(function(err) {
            throw err;
        });
    }
};
