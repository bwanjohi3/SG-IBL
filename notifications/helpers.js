var when = require('when');
var CronJob = require('./cron/index.js');

var checkBound = function(port) {
    return port._isBound;
};

var keepAlive = function() {
    return this.bus.importMethod('sms.enquireLink')({});
};

function checkBoundAndThrow(port) {
    if (!port._isBound) {
        throw new Error('Not bound');
    }
    return true;
}

var acquireOutMessage = when.lift(function(port, count) {
    if (!isFinite(count) || count < 1) {
        count = 1;
    } else if (count !== parseInt(count)) {
        throw new TypeError('invalid.argument');
    }
    if (Array.isArray(port._awaitingMessages) && port._awaitingMessages.length > 0) {
        var result = port._awaitingMessages.splice(0, count);
        if (result.length < count) {
            return port.bus.importMethod('alert.queueOut.pop')({
                port: port.config.id,
                count: count - result.length
            }).then(function(data) {
                return result.concat(data);
            });
        }
    }
    return port.bus.importMethod('alert.queueOut.pop')({
        port: port.config.id,
        count: count
    });
});

function acquireInMessage(port) {
    return port.bus.importMethod('alert.queueIn.pop')({
        port: port.config.id
    });
}

var sendSms = function(port, message) {
    return port.bus.importMethod('sms.submitSm')({
        sourceAddr: 'IBBank',
        destinationAddr: message.recipient,
        shortMessage: message.content,
        id: message.id
    }).then(function(response) {
        if (response.commandStatus === 0) {
            return port.bus.importMethod('alert.queueOut.notifySuccess')({
                messageId: message.id
            });
        } else {
            return port.bus.importMethod('alert.queueOut.notifyFailure')({
                messageId: message.id,
                errorMessage: 'SMPP failed',
                errorCode: response.commandStatus
            });
        }
    }).catch(function(err) {
        return port.bus.importMethod('alert.queueOut.notifyFailure')({
            messageId: message.id,
            errorMessage: err.message,
            errorCode: err.code
        });
    });
};

function rerouteInMessage(port, res) {
    if (res && res.messages && Array.isArray(res.messages) && res.messages.length) {
        res.messages.map((message) => {
            if (~message.content.indexOf('balance')) {
                var actorId;
                return port.bus.importMethod('customer.get.byPhone')({phone: message.sender})
                    .then((res) => {
                        if (res.customersByPhone && Array.isArray(res.customersByPhone) && res.customersByPhone.length === 1) {
                            actorId = res.customersByPhone.pop().actorId;
                            return port.bus.importMethod('customer.cbs.activity')({}, {auth: {actorId}});
                        }
                        throw new Error('To many or to few customers returned');
                    })
                    .then((activity, $meta) => {
                        var balance = ((activity.balance && Array.isArray(activity.balance)) ? activity.balance : []).map((bal) => {
                            return `${bal.accountName}: ${bal.value}`;
                        });
                        if (balance.length > 0) {
                            return balance.join('\n');
                        }
                        throw new Error('No balance info');
                    })
                    .then((text) => (port.bus.importMethod('user.language.get')({actorId}, {auth: {actorId}}).then((lang) => ({text, language: lang.language}))))
                    .then((data) => {
                        if (!data.language || !data.language.iso2Code) {
                            throw new Error('No language found');
                        }
                        var sms = {
                            port: message.port.match('-in') !== null ? message.port.split('-')[0] : message.port,
                            template: 'customer.activity.balanceCheck',
                            recipient: message.sender,
                            createdBy: actorId,
                            priority: 1,
                            messageInId: message.id,
                            data: {
                                text: data.text
                            },
                            languageCode: (data.language && data.language.iso2Code) || 'en'
                        };
                        return port.bus.importMethod('alert.message.send')(sms, {auth: {actorId}}).then(() => ({messageId: message.id}));
                    })
                    .then((result) => {
                        return port.bus.importMethod('alert.queueIn.notifySuccess')({
                            messageId: result.messageId
                        });
                    });
            }
        });
    }
}

function emptyNotification(cron) {
    var self = this;
    if (!checkBound(self)) {
		console.log('not bound!!!!!!!!!!!');
        return;
    }else{
		console.log('bound!!!!!!!!!!!');
	}
    return self._jobEnquire.stop()
        .then(checkBoundAndThrow.bind(undefined, self))
       // .then(acquireInMessage.bind(undefined, self))
        //.then(rerouteInMessage.bind(undefined, self))
        .then(checkBoundAndThrow.bind(undefined, self))
        .then(function() {
            return acquireOutMessage(self, 1).then(function(response) {
                cron.setInterval(response.messages.length > 0 ? self.config.workInterval : self.config.idleInterval);
                if (!checkBound(self)) {
                    return void Array.prototype.push.apply(self._awaitingMessages, response);
                }
                return when.map(response.messages, function(message) {
                    if (!checkBound(self)) {
                        return void self._awaitingMessages.push(message);
                    }
                    return sendSms(self, message);
                });
            });
        })
        .catch(function(err) {
            return err;
        })
        .finally(function() {
            self._jobEnquire.start();
        });
}

module.exports = {
    rerouteInMessage: rerouteInMessage,
    acquireInMessage: acquireInMessage,
    checkBoundAndThrow: checkBoundAndThrow,
    deliverSmRequestReceive: function(msg, $meta) {
        if (msg.body && msg.body.shortMessage && (msg.body.shortMessage === 'balance')) {
            $meta.method = 'alert.queueIn.push';
            return {
                port: this.config.id,
                channel: 'sms',
                sender: msg.body.sourceAddr,
                content: msg.body.shortMessage,
                priority: 1
            };
        } else {
            $meta.mtid = 'discard';
            return {};
        }
    },
    deliverSmResponseSend: function(msg, $meta) {
        $meta.opcode = 'deliverSmResp';
        return {
            messageId: msg.inserted.pop().id
        };
    },
    emptyNotification: emptyNotification,
    start: function() {
        this._awaitingMessages = [];
        this._isIdle = true;
        if (!isFinite(this.config.workInterval) || this.config.workInterval < 0) {
            throw new TypeError('invalid.config'); // workInterval is required and must be a non-negative number.
        }
        if (!isFinite(this.config.idleInterval) || this.config.idleInterval < 0) {
            throw new TypeError('invalid.config'); // idleInterval is required and must be a non-negative number.
        }
        this._jobSms = new CronJob(emptyNotification.bind(this), this.config.workInterval);
        this._jobEnquire = new CronJob(keepAlive.bind(this), {
            interval: this.config.enquireInterval,
            startImmediately: true
        });
    },
    stop: function() {
        this._isBound = false;
        this._jobSms && this._jobSms.stop();
        this._jobEnquire && this._jobEnquire.stop();
    },
    send: function(msg, $meta) {
        return msg;
    },
    receive: function(msg) {
        return msg;
    },
    'disconnected.notification.receive': function() {
        this._isBound = false;
        this._jobSms && this._jobSms.stop();
        this._jobEnquire && this._jobEnquire.stop();
		this._isBound = true;
		this._jobSms.start();
    },
    'bindTransceiver.response.receive': function() {
        this._isBound = true;
        this._jobSms.start();

        return {};
    }
	,
    'connected.notification.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
        if ($meta.conId) {
            this.queues[$meta.conId] && this.queues[$meta.conId].add([{}, {opcode: 'bindTransceiver', mtid: 'request', callback: function() { return {}; }}]);
        } else {
            this.queue && this.queue.add([{}, {opcode: 'bindTransceiver', mtid: 'request', callback: function() { return {}; }}]);
        }
		this._isBound = true;
		this._jobSms.start();
        return {};
    }
	,
    'bindTransceiver.request.send': function(msg, $meta) {
        $meta.opcode = 'bindTransceiver';

        msg.systemId = this.config.systemId;
        msg.systemType = this.config.systemType;
        msg.password = this.config.password;
        msg.interfaceVersion = 4;
        msg.addrTon = 0;
        msg.addrNpi = 0;
        msg.addressRange = '';
		
		var bindMessage = {
                systemId: this.config.systemId,
                password: this.config.password,
                systemType: this.config.systemType,
                interfaceVersion: 4,
                addrTon: 0,
                addrNpi: 0,
                addressRange: ''
            }
        return bindMessage;
    }
};
