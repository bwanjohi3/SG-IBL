const objectMap = {
    'card': 'card.card.panGet',
    'batch': 'card.batch.pansGet'
};

module.exports = {
    'request.send': function(msg, $meta, objectName) {
        if ((!msg.batch || !msg.batch.batchId) && (!msg.card || !msg.card.length)) {
            return msg;
        }
        var meta = {
            method: $meta.method,
            mtid: $meta.mtid,
            opcode: $meta.opcode
        };
        return this.super[objectMap[objectName]]({batchId: (msg.batch || {}).batchId, cards: msg.card}, $meta)
            .then((pans) => {
                if (pans.pans.length > 0) {
                    let pinMailerFormat = (pans.configuration && pans.configuration.length > 0 && pans.configuration.filter((value) => { return value.key === 'pinMailerFormatString'; }).pop().value) || this.bus.config.db.card.pinMailerFormat;
                    let maxFieldIndex = (pans.configuration && pans.configuration.length > 0 && pans.configuration.filter((value) => { return value.key === 'pinMailerMaxFieldIndex'; }).pop().value);
                    // TODO: throw error if those are not set !!!
                    return this.bus.importMethod('pan.generateAndPrintPin.list')({
                        pans: pans.pans,
                        pinLength: this.bus.config.db.card.pinLength,
                        pinMailerFormat: pinMailerFormat,
                        maxFieldIndex: maxFieldIndex
                    }, $meta)
                    .then((printedCards) => {
                        $meta.method = meta.method;
                        $meta.mtid = meta.mtid;
                        $meta.opcode = meta.opcode;
                        switch (objectName) {
                            case 'batch':
                                printedCards.forEach((value, index) => {
                                    Object.assign(value, {batchId: msg.batch.batchId});
                                });
                                break;
                            case 'card':
                                printedCards.forEach(function(value, index) {
                                    Object.assign(value, msg.card[index]);
                                });
                                break;
                            default:
                                break;
                        }
                        msg.card = printedCards;
                        return msg;
                    });
                }
                return msg;
            });
    }
};
