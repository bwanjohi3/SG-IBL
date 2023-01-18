// http://192.168.132.74:8180/ACCU_TWS_EE/services
// http://192.168.132.74:8180/ACCU_TWS_EE/services?wsdl
// http://192.168.50.54:9080/ACCU_TWS_EE/services
'use strict';


module.exports = {
    id: 'tssrest',
    createPort: require('ut-port-http'),
    method: 'GET',
    logLevel: 'trace',
    namespace: ['tssrest/customers'],
    parseResponse: false,
    url: "http://192.168.77.3:5007",
    queue: {
        idle: 60000
    },
    'idle.notification.receive': function (msg, $meta) {
        this.bus.notification('transfer.idle.execute')({ issuerPort: 'tss/transfer' });
        $meta.mtid = 'discard';
    },
    start: function () {
    },
    'cms.request.send':function(msg){
//        debugger;
        return msg;
    },
    'cms.response.receive':function(msg){
 //       debugger;
        return msg.payload;
    }
};
