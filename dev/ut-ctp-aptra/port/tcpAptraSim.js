var pinCrypto = require('../module/crypto');

function solicitedOk(msg, $meta) {
    $meta.mtid = 'discard';
    this.queue.add([{statusDescriptor: '9'}, {mtid: 'response', opcode: 'solicitedStatus'}]);
    ($meta.method === 'aptra.goInService') && this.resolveReady(true);
}

function solicitedB(msg, $meta) { // todo simulate device fails and alerts
    // $meta.mtid = 'discard';
    this.queue.add([{statusDescriptor: 'B'}, {mtid: 'response', opcode: 'solicitedStatus'}]);
    // this.queue.add([{deviceIdentifierAndStatus: 'D1', errorSeverity: '0', diagnosticStatus: '00', suppliesStatus: '0'}, {mtid: 'response', opcode: 'unsolicitedStatus'}]); // card retract
    // this.queue.add([{deviceIdentifierAndStatus: 'E500000000', errorSeverity: '00000', diagnosticStatus: '00', suppliesStatus: '11111'}, {mtid: 'response', opcode: 'unsolicitedStatus'}]); // cash retract
    // this.queue.add([{deviceIdentifierAndStatus: 'P20', errorSeverity: '', diagnosticStatus: '', suppliesStatus: ''}, {mtid: 'response', opcode: 'unsolicitedStatus'}]); // supervisor mode exit
    // this.queue.add([{deviceIdentifierAndStatus: 'P1000000010111', errorSeverity: '', diagnosticStatus: '', suppliesStatus: ''}, {mtid: 'response', opcode: 'unsolicitedStatus'}]); // cassette out
    // this.queue.add([{deviceIdentifierAndStatus: 'H2', errorSeverity: '0', diagnosticStatus: '', suppliesStatus: '0'}, {mtid: 'response', opcode: 'unsolicitedStatus'}]); // journal printer
    // this.queue.add([{deviceIdentifierAndStatus: 'G2', errorSeverity: '0', diagnosticStatus: '', suppliesStatus: '0'}, {mtid: 'response', opcode: 'unsolicitedStatus'}]); // receipt printer
    // this.queue.add([{deviceIdentifierAndStatus: 'L1', errorSeverity: '0', diagnosticStatus: '004C', suppliesStatus: ''}, {mtid: 'response', opcode: 'unsolicitedStatus'}]); // encryptor
    // this.queue.add([{deviceIdentifierAndStatus: 'Z', errorSeverity: '0', diagnosticStatus: '', suppliesStatus: ''}, {mtid: 'response', opcode: 'unsolicitedStatus'}]); // other device fault
    return msg;
}

// simulator
// tmk 2EBDBB5095C0A0C37D5F5FF0F67EF644

// nbv
// component1 5426735220B519E3AEF43725C1C49854
// component2 AB4C799B0183F48C6B8C1AEAAD738CFB
// tmk FF6A0AC92136ED6FC5782DCF6CB714AF B1042E

function encryptor(id, tpk) {
    function enc(msg, $meta) {
        $meta.mtid = 'discard';
        this.queue.add([{informationIdentifier: id, encryptorInformation: 'atmsim'}, {mtid: 'response', opcode: 'encryptorIniData'}]);
        if (tpk) {
            this.tpk = pinCrypto.decrypt3des('FF6A0AC92136ED6FC5782DCF6CB714AF',
                msg.tokens[4].substring(3).match(/.{3}/g).map(x => ('00' + Number.parseInt(x).toString(16).toUpperCase()).slice(-2)).join(''));
        }
    }

    return enc;
}

function counters(msg, $meta) {
    $meta.mtid = 'discard';
    this.queue.add([{statusDescriptor: 'F', statusInformation1: '2000000000000010000100001000010000000000000000000000000000000000000000000000000000000000000000000'}, {mtid: 'response', opcode: 'solicitedStatus'}]);
}

function configuration(msg, $meta) {
    $meta.mtid = 'discard';
    this.queue.add([{statusDescriptor: 'F', statusInformation1: '19999', statusInformation2: '000000000000000000000000000000000000', statusInformation4: '1111111111111111111'}, {mtid: 'response', opcode: 'solicitedStatus'}]);
}

module.exports = {
    id: 'atmSimulator',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    port: 5000,
    host: 'localhost',
    listen: false,
    format: {
        size: '16/integer',
        codec: require('ut-codec-ndc')
    },
    'connected.notification.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
    },
    start: function() {
        this.isReady = new Promise((resolve, reject) => {
            this.resolveReady = resolve;
            this.rejectReady = reject;
        });
    },
    'alert.request.send': function(msg, $meta) {
        $meta.opcode = 'unsolicitedStatus';
        $meta.mtid = 'request';
        return {deviceIdentifierAndStatus: 'D1', errorSeverity: '0', diagnosticStatus: '00', suppliesStatus: '0'};
    },
    'aptra.ejOptions.notification.receive': (msg, $meta) => {
        $meta.mtid = 'discard';
    },
    'aptra.goOutOfService.request.receive': solicitedOk,
    'aptra.currencyMappingLoad.request.receive': solicitedOk,
    'aptra.paramsLoadEnhanced.request.receive': solicitedOk,
    'aptra.screenDataLoad.request.receive': solicitedOk,
    'aptra.stateTableLoad.request.receive': solicitedOk,
    'aptra.fitDataLoad.request.receive': solicitedOk,
    'aptra.configIdLoad.request.receive': solicitedOk,
    'aptra.dateTimeLoad.request.receive': solicitedOk,
    'aptra.sendConfiguration.request.receive': configuration,
    'aptra.sendConfigurationHardware.request.receive': solicitedOk,
    'aptra.sendConfigurationSuplies.request.receive': solicitedOk,
    'aptra.sendConfigurationFitness.request.receive': solicitedOk,
    'aptra.sendConfigurationSensor.request.receive': solicitedOk,
    'aptra.sendConfigurationRelease.request.receive': solicitedOk,
    'aptra.sendConfigurationOptionDigits.request.receive': solicitedOk,
    'aptra.sendConfigurationDepositDefinition.request.receive': solicitedOk,
    'aptra.emvCurrency.request.receive': solicitedOk,
    'aptra.emvTransaction.request.receive': solicitedOk,
    'aptra.emvLanguage.request.receive': solicitedOk,
    'aptra.emvTerminal.request.receive': solicitedOk,
    'aptra.emvApplication.request.receive': solicitedOk,
    'aptra.sendSupplyCounters.request.receive': counters,
    'aptra.goInService.request.receive': solicitedOk,
    'aptra.sendConfigurationId.request.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
        this.queue.add([{
            statusDescriptor: 'F',
            statusInformation1: '60001'
        }, {
            mtid: 'response',
            opcode: 'solicitedStatus'
        }]);
    },
    'aptra.keyReadKvv.request.receive': encryptor(4),
    'aptra.keyChangeTak.request.receive': encryptor(3),
    'aptra.keyChangeTpk.request.receive': encryptor(3, true),
    'aptra.transactionReply.response.receive': solicitedB,
    'transaction.request.send': function(msg, $meta) {
        $meta.method = 'transaction';
        var card = msg.track2 && msg.track2.match(/^;(\d{0,19})=/);
        if (card) {
            msg.pinBlock = pinCrypto.encryptPin(msg.pin, card[1], this.tpk);
            if (msg.newPin) {
                msg.data = msg.data + '\u001cU' + pinCrypto.encryptPin(msg.newPin, card[1], this.tpk);
            }
        }
        return msg;
    }
};
