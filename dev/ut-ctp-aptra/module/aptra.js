var assign = require('lodash.assign');

module.exports = {
    transaction: function(msg, $meta) {
        $meta.mtid = 'discard';
        return this.bus.importMethod('pan.offset.get')({
            track2: msg.track2,
            track2EquivalentData: msg.emvTags && msg.emvTags.track2EquivalentData && msg.emvTags.track2EquivalentData.val,
            emvTags: msg.emvTags,
            pinKey: msg.session && msg.session.tpk,
            pinBlock: msg.pinBlock,
            pinBlockNew: msg.pinBlockNew,
            keyType: 'tpk'
        }).then(result => {
            delete msg.track2;
            delete msg.track2EquivalentData;
            delete msg.track3;
            let panSeqNum  = msg && msg.emvTags && msg.emvTags.panSeqNum && msg.emvTags.panSeqNum.val || '00';
            delete msg.emvTags;
            // delete msg.emvTagsRaw;
            result.pinBlock && (msg.pinBlock = result.pinBlock);
            result.hsmError && (msg.hsmError = result.hsmError);
            var fields = {
                source: $meta.source,
                conId: $meta.conId,
                pinOffset: result && result.offset,
                pinOffsetNew: result && result.offsetNew,
                pan: result.pan,
                isEmvCard: result.isEmvCard,
                track2: result.track2,
                track2EquivalentData: result.track2EquivalentData,
                emvTags: result.emvTags,
                panSeqenceNumber: panSeqNum,
                emvReceiptData: {
                    applicationIdentifierAIDTerminal: msg.emvTags && msg.emvTags.applicationIdentifierAIDTerminal && msg.emvTags.applicationIdentifierAIDTerminal.val,
                    applicationLabel: msg.emvTags && msg.emvTags.applicationLabel && msg.emvTags.applicationLabel.val
                },
                cipher: result.cipher,
                tpk: msg.session && msg.session.tpk,
                cardId: result.cardId,
                emvCryptogramVerifyData: result.emvCryptogramVerifyData,
                cardMasked: result.cardMasked
            };
            return assign(fields, msg);
        })
        .then(this.bus.importMethod('atm.transaction'));
    },
    unsolicitedStatus: function(msg, $meta) {
        $meta.mtid = 'discard';
        // this.bus.importMethod(msg.device === 'power' ? 'atm.load' : 'atm.alert')(assign({
        this.bus.importMethod('monitoring.publishAtmStatus')(assign({
            source: $meta.source,
            conId: $meta.conId,
            connected: true
        }, msg));
        this.bus.notification('atm.alert')(assign({
            source: $meta.source,
            conId: $meta.conId
        }, msg));
    },
    uploadEjData: function(msg, $meta) {
        $meta.mtid = 'discard';
        // $meta.method = 'ejAck';
        this.bus.notification('atm.journal')(assign({
            source: $meta.source,
            conId: $meta.conId
        }, msg));
    }
};
// todo handle server offline / timeout / error
