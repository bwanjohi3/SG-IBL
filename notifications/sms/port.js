'use strict';

var helpers = require('../helpers');

module.exports = {
    id: 'sms',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    namespace: ['sms'],
    format: {
        size: '32/integer',
        codec: require('ut-codec-smpp'),
        sizeAdjust: 4
    },
    listen: false,
    enquireInterval: 5000,
    workInterval: 5000,
    idleInterval: 15000,
    start: helpers.start,
    stop: helpers.stop,
    send: helpers.send,
    receive: helpers.receive,
    'disconnected.notification.receive': helpers['disconnected.notification.receive'],
    'bindTransceiver.response.receive': helpers['bindTransceiver.response.receive'],
    'connected.notification.receive': helpers['connected.notification.receive'],
    'bindTransceiver.request.send': helpers['bindTransceiver.request.send'],
    'deliverSm.request.receive': helpers.deliverSmRequestReceive,
    'deliverSm.response.send': helpers.deliverSmResponseSend,
    'submitSm.request.send': function(msg) {
        var data = {};
        data.serviceType = '';
        data.sourceAddrTon = 5;
        data.sourceAddrNpi = 0;
        data.destAddrTon = msg.destinationAddr.startsWith('+')?1:0;
        data.destAddrNpi = 1;
        data.esmClass = 0;
        data.protocolId = 0;
        data.priorityFlag = 0;
        data.scheduleDeliveryTime = '';
        data.validityPeriod = '';
        data.registeredDelivery = 1;
        data.replaceIfPresentFlag = 0;
        data.dataCoding = 3;
        data.smDefaultMsgId = 0;
        data.sourceAddr = msg.sourceAddr;
        data.destinationAddr = msg.destinationAddr;
        data.shortMessage = msg.shortMessage;
        data.tlvs = {
            user_message_reference: msg.id
        };
        return data;
    }
};
