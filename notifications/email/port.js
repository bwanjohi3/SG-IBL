'use strict';

var when = require('when');
var CronJob = require('../cron').CronJob;
var crypt;
var UtCrypt = require('ut-core/crypt');

function getCrypt(cryptKey) {
    if (!crypt) {
        crypt = new UtCrypt({cryptParams: {password: cryptKey}});
    }
    return crypt;
}

var emptyNotification = function(cron) {
    var self = this;
    return self.bus.importMethod('alert.queueOut.pop')({
        port: this.config.id,
        count: 1
    }).then(function(response) {
        cron.setInterval(response.messages.length > 0 ? self.config.workInterval : self.config.idleInterval);
        return when.map(response.messages, function(message) {
            message.content = JSON.parse(message.content);
            return self.bus.importMethod('email.exec')({
                to: message.recipient,
                subject: message.content.subject,
                html: message.content.html,
                text: message.content.text
            }).then(function(response) {
                return self.bus.importMethod('alert.queueOut.notifySuccess')({
                    messageId: message.id,
                    refId: response.messageId
                });
            }).catch(function(err) {
                return self.bus.importMethod('alert.queueOut.notifyFailure')({
                    messageId: message.id,
                    errorMessage: err.message,
                    errorCode: err.code
                });
            });
        });
    });
};

module.exports = {
    id: 'email',
    createPort: require('ut-port-mail'),
    logLevel: 'trace',
    workInterval: 5000,
    idleInterval: 60000,
    start: function() {
        getCrypt(this.bus.config.masterCryptKey);
        this._cron = new CronJob(emptyNotification.bind(this), this.config.workInterval);
        this._cron.run();
    },
    stop: function() {
        this._cron && this._cron.stop();
    },
    send: function(msg, $meta) {
        return this.bus.importMethod('customer.smtpConfiguration.get')({
            customerEmail: msg.to
        }, $meta)
            .then(result => {
                var password = crypt.decrypt(result.serverInfo.password, JSON.parse(result.serverInfo.cryptArgs));
                var service = result.serverAttributes.find(attribute => {
                    return attribute.attributeName === 'service';
                });
                return {
                    service: service ? service.value : null,
                    host: result.serverInfo.hostNameIp,
                    port: result.serverInfo.port,
                    auth: {
                        user: result.serverInfo.userName,
                        pass: password
                    },
                    from: 'SG Standard',
                    to: msg.to,
                    subject: msg.subject,
                    text: msg.text,
                    html: msg.html
                };
            })
            .catch(error => {
                throw error;
            });
    },
    'hooks': {
        'testConnection.request.send': function(msg, $meta) {
            return {
                service: msg.service,
                host: msg.url,
                port: msg.port,
                secure: msg.secure,
                auth: {
                    user: msg.username,
                    pass: msg.password
                },
                from: msg.username,
                to: msg.username,
                subject: 'Test connection',
                text: 'Test connection',
                html: '<b>Test connection</b>'
            };
        },
        'testConnection.response.receive': function(msg, $meta) {
            if (msg.messageId) {
                return { success: true };
            } else {
                return { success: false };
            }
        }
    }
};
