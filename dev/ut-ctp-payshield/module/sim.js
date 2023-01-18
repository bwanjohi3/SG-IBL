var payshield = require('./prod');
var assign = require('lodash.assign');

function pinData(card) {
    return card.substring(0, 10) + 'N' + card.substring(card.length - 1);
}

function account(card) {
    return card.substring(card.length - 13, card.length - 1);
}

module.exports = assign({}, payshield, {
    pinOffset: function({keyType, tpk, pvk, pinBlock, card, decimalisationTable}) {
        var promise = keyType && keyType === '001' ? this.bus.importMethod('payshield.translateZpkLmk')({
            sourceZpk: tpk,
            sourcePinBlock: pinBlock,
            sourcePinBlockFormat: '01',
            account: account(card)
        }) : this.bus.importMethod('payshield.translateTpkLmk')({
            sourceTpk: tpk,
            sourcePinBlock: pinBlock,
            sourcePinBlockFormat: '01',
            account: account(card)
        });
        return promise.then(translated => {
            var pinAsString = new Buffer(translated.pin).toString();
            return this.bus.importMethod('payshield.generateOffsetIbmLmk')({
                pvk: pvk,
                pvkLength: pvk.length,
                pin: pinAsString,
                pinBlockFormat: '01',
                maximumPinLength: '12',
                checkLength: '04',
                account: account(card),
                decimalisationTable: decimalisationTable,
                pinValidationData: pinData(card),
                cryptedPinLength: pinAsString.length
            }).then((response) => ({
                offset: response.offset
            }));
        });
    }
});
