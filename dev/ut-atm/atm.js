var errors = require('./errors');
var alerts = require('./alerts');

module.exports = (bus) => ({
    terminalInfo: (kvv, mock) => {
        if (mock) {
            return Promise.resolve({
                tmk: 'UA7866F970C9EA431C2DED3BE718650BB',
                // tmk: 'UF61471FD9BCEA1D5FE44AAB1C739789C',
                atmId: '1001', // todo remove hardcoded value
                terminalId: '01',
                customization: 'nbv',
                terminalName: 'name-1',
                merchantId: 'merchant-123',
                merchantType: 'merchant-type',
                institutionCode: 'acquirer-1',
                identificationCode: 'idcode-1',
                luno: '001',
                cassettes: [
                    {currency: 'GHS', denomination: 5},
                    {currency: 'GHS', denomination: 10},
                    {currency: 'GHS', denomination: 20},
                    {currency: 'GHS', denomination: 50}
                ]
            });
        }
        return bus.importMethod('db/atm.terminal.info')({tmkkvv: kvv})
            .then(x => {
                if (x.length === 1 && x[0].length === 1) {
                    var result = x[0][0];
                    result.cassettes = [{
                        currency: result.cassette1Currency,
                        denomination: result.cassette1Denomination
                    }, {
                        currency: result.cassette2Currency,
                        denomination: result.cassette2Denomination
                    }, {
                        currency: result.cassette3Currency,
                        denomination: result.cassette3Denomination
                    }, {
                        currency: result.cassette4Currency,
                        denomination: result.cassette4Denomination
                    }];
                    return result;
                } else {
                    throw errors.terminalNotFound();
                }
            });
    },
    alert: function(msg) {
        // TODO: configure from & to and add atm location in subject
        var alertTemplate = alerts[msg.device] || alerts['other'];
        var alertText = alertTemplate(msg);
        var alertSubjectSuffix = {
            cashHandler: 'cash handler alert',
            cardReader: 'card reader alert',
            receiptPrinter: 'receipt printer alert',
            journalPrinter: 'journal printer alert',
            encryptor: 'PIN pad alert',
            sensors: 'sensor alert'
        }[msg.device];
        return bus.importMethod('email.send')({
            from: 'godfreykarunda@gmail.com',
            subject: `${msg.session.terminalId} ${alertSubjectSuffix || 'device fault alert'}`,
            // to: msg.session.email, // todo get email from database
            to: 'godfreykarunda@gmail.com',
            html: alertText
        })
        .catch(() => false);
    },
    nextId: function(msg) {
        return bus.importMethod('db/atm.terminal.nextId')({atmId: msg.channelId})
            .then(result => {
                if (!result || !result[0] || !result[0][0] || !result[0][0].tsn) {
                    throw errors.nextId();
                }
                msg.transferIdAcquirer = result[0][0].tsn;
                return msg;
            });
    },
    senfit: bus.importMethod('db/atm.senfit.set'),
    senfitsup: bus.importMethod('db/atm.senfitsup.set'),
    supplyCounters: bus.importMethod('db/atm.supplyCounters.set')
});
