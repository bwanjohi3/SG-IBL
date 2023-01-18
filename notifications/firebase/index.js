'use strict';

var when = require('when');
var portFirebase = require('ut-port-firebase');
var alertErrors = require('ut-alert').errors;
var CronJob = require('../cron').CronJob;

/**
 * Pops an outbound message from the messages out and starts the sending notification chain.
 * If something rejects along the line, marks the message as failed.
 * @param {CronJob} cron
 * @return {Promise}
 */
const emptyNotification = function(cron) {
    var context = this;
    var getRecipientPushNotificationToken = (insertedRow) => {
        var recipient = JSON.parse(insertedRow.recipient);
        return this.bus.importMethod('user.device.get')({
            actorId: recipient.actorId,
            installationId: recipient.installationId
        }).then(userDeviceResult => {
            if (!userDeviceResult.device.length || userDeviceResult.device.length > 1) {
                throw alertErrors['alert.push.ambiguousResultForActorDevice']();
            }
            return userDeviceResult.device[0].pushNotificationToken;
        });
    };
    var prepareFirebaseMessage = (insertedRow) => (pushNotificationToken) => {
        return {
            id: insertedRow.id,
            content: insertedRow.content,
            pushNotificationToken
        };
    };
    var dispatchToFirebase = (fcmMessage) => {
        return this.bus.importMethod('firebase.fcm.send')(fcmMessage);
    };
    var handleSuccess = (message) => (sendResponse) => {
        return this.bus.importMethod('alert.push.notification.handleSuccess')({ message, sendResponse });
    };
    var handleFailure = (message) => (errorResponse) => {
        return this.bus.importMethod('alert.push.notification.handleFailure')({ message, errorResponse });
    };
    var parseResponse = (response) => {
        cron.setInterval(response.messages.length > 0 ? context.config.workInterval : context.config.idleInterval);
        return when.map(response.messages, (insertedRow) => {
            return getRecipientPushNotificationToken(insertedRow)
                .then(prepareFirebaseMessage(insertedRow))
                .then(dispatchToFirebase)
                .then(handleSuccess(insertedRow))
                .catch(handleFailure(insertedRow));
        });
    };
    var popMessage = () => {
        return this.bus.importMethod('alert.queueOut.pop')({
            port: 'firebase',
            count: 1
        });
    };
    return popMessage()
        .then(parseResponse)
        .catch((e) => {
            // @TODO error should be handled
            return e;
        });
};

const cronFirebase = {
    workInterval: 500,
    idleInterval: 10000,
    start: function() {
        this._cron = new CronJob(emptyNotification.bind(this), this.config.workInterval);
        this._cron.run();
    },
    stop: function() {
        this._cron && this._cron.stop();
    }
};

module.exports = Object.assign({}, portFirebase, cronFirebase);
