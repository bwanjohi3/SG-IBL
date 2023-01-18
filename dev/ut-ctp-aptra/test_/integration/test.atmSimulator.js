var test = require('ut-run/test');
var joi = require('joi');

function validateReply(state, notes, error, image) {
    return joi.object({
        type: joi.string().valid('4'),
        luno: joi.string().valid('001'),
        timeVariantNumber: joi.string().valid('xxx'),
        nextState: joi.string().length(3).valid(state),
        notes: joi.string().length(8).valid(notes),
        function: joi.string().length(1),
        screen: joi.alternatives().try(joi.string().length(3), joi.string().valid('')),
        screenUpdate: image ? joi.string().regex(new RegExp('UTSwitchNBV_' + image + '\\.BMP')) : joi.string().allow(''),
        coordination: joi.string().length(1),
        cardReturn: joi.string().valid('0', '1'),
        printer: joi.string().length(1),
        printerData: joi.string().allow(''),
        session: joi.object(),
        sernum: joi.string().length(4),
        tokens: joi.array()
    });
}

function expect(state, notes, error, image) {
    return (result, assert) => {
        assert.equals(joi.validate(result, validateReply(state, notes, error, image)).error, null, 'Expected state:' + state + ' notes:' + notes + (image ? (' image:' +
            image) : ''));
    };
}

function operation(card, operationCode, amount, bufferB) {
    return {
        messageClass: '1',
        messageSubclass: '1',
        luno: '001',
        timeVariantNumber: 'xxx',
        trtfMcn: 'yy',
        track2: `;${card}=15122011143857589`,
        track3: '',
        operationCode,
        amountEntry: amount || '00000000',
        pin: '1234',
        bufferB: bufferB || '',
        bufferC: ''
    };
}

function step(card, operationCode, amount, bufferB, result, name) {
    return {
        name,
        method: 'atmSimulator.transaction',
        params: operation(card, operationCode, amount, bufferB),
        result: result
    };
}

test({
    type: 'integration',
    name: 'ATM',
    client: require('../client'),
    clientConfig: require('../client/test'),
    steps: function(test, bus, run, ports) {
        run(test, bus, [{
            name: 'Ready',
            params: () => ports[0].isReady,
            result: () => {}
        },
            step('6361607200001101', 'D   B  A', '00000000', null, expect('007', '00000000', '00', null), 'checkpin'),
            step('636160000unknown', 'D   B  A', '00000000', null, expect('050', '00000000', '00', '050'), 'unknown card'),
            step('6361600000000hot', 'D   B  A', '00000000', null, expect('050', '00000000', '00', '051'), 'suspicious card'),
            step('6361600notactive', 'D   B  A', '00000000', null, expect('050', '00000000', '00', '052'), 'card not activated'),
            step('636160000expired', 'D   B  A', '00000000', null, expect('050', '00000000', '00', '058'), 'card expired'),
            step('636160deactivate', 'D   B  A', '00000000', null, expect('050', '00000000', '00', '054'), 'card deactivated'),
            step('63616000destruct', 'D   B  A', '00000000', null, expect('050', '00000000', '00', '051'), 'card for destruction'),
            step('636160000retries', 'D   B  A', '00000000', null, expect('050', '00000000', '00', '059'), 'pin retries exceeded'),
            step('636160000pindata', 'D   B  A', '00000000', null, expect('050', '00000000', '00', '056'), 'missing pin data'),
            // step('6361607200001101', '  I BC B', '00000000', null, expect('035', '00000000', '00', null), 'account list, invalid'),
            step('6361607200001101', '  A BD B', '00000000', null, expect('095', '00000000', '00', null), 'account list, withdraw'),
            step('6361607200001101', '  B BD B', '00000000', null, expect('121', '00000000', '00', null), 'account list, transfer'),
            step('6361607200001101', '  I BD B', '00000000', null, expect('099', '00000000', '00', null), 'account list, airtime'),
            // step('6361607200001101', '  H BD B', '00000000', null, expect('030', '00000000', '00', null), 'account list, balance'),
            // step('6361607200001101', '  GHBD B', '00000000', null, expect('045', '00000000', '00', null), 'account list, bill'),
            // step('6361607200001101', '  GIBD B', '00000000', null, expect('030', '00000000', '00', null), 'account list, mini statement'),
            // step('6361607200001101', '  A BD B', '00000000', null, expect('050', '00000000', '00', '062'), 'account list, invalid'),
            // step('6361607200001101', '  GABD B', '00000000', null, expect('050', '00000000', '00', '062'), 'account list, invalid other'),
            step('6361607200001101', '  I BD C', '00000000', null, expect('025', '00000000', '00', null), 'account selected, withdraw'),
            step('6361607200001101', '  H BD C', '00000000', null, expect('030', '00000000', '00', null), 'account selected, balance'),
            step('6361607200001101', '  GFBD C', '00000000', null, expect('047', '00000000', '00', null), 'account selected, airtime'),
            step('6361607200001101', '  GGBD C', '00000000', null, expect('046', '00000000', '00', null), 'account selected, transfer'),
            step('6361607200001101', '  GHBD C', '00000000', null, expect('045', '00000000', '00', null), 'account selected, bill'),
            step('6361607200001101', '  GIBD C', '00000000', null, expect('030', '00000000', '00', null), 'account selected, mini statement'),
            step('6361607200001101', ' FH BD D', '00000000', null, expect('055', '00000000', '00', null), 'balance'),
            step('6361607200001101', ' FGIBD D', '00000000', null, expect('056', '00000000', '00', null), 'mini statement'),
            step('6361607200001101', ' FI BD D', '00050000', null, expect('078', '00010000', '00', null), 'withdraw'),
            step('9999990000000000', ' FI BC D', '00050000', '36179415', expect('031', '00010000', '00', null), 'withdraw cardless'),
            step('9999990000000000', ' FI BC D', '00050001', '63328343', expect('050', '00000000', '00', '062'), 'withdraw cardless'),
            step('6361607200001101', ' FGFBDHD', '00001000', null, expect('072', '00000000', '00', null), 'topup Airtel'),
            step('6361607200001101', ' FGFBDID', '00001000', null, expect('050', '00000000', '99', null, 'MNO:Error while generating voucher'), 'topup TNM'),
            step('6361607200001101', ' FGFBDBD', '00010000', null, expect('050', '00000000', '99', null, 'ATM:Unrecognized topup company'), 'topup Access'),
            step('6361607200001101', ' FGFBDAD', '00010000', null, expect('050', '00000000', '99', null, 'ATM:Unrecognized topup company'), 'topup MTL'),
            step('6361607200001101', ' FGHBDAD', '00050000', null, expect('057', '00000000', '00', null), 'bill NRWB'),
            step('6361607200001101', ' FGHBDBD', '00050000', null, expect('050', '00000000', '99', null, 'ATM:Unrecognized bill payment company'), 'bill ESCOM'),
            step('6361607200001101', ' FGHBDGD', '00050000', null, expect('050', '00000000', '99', null, 'ATM:Unrecognized bill payment company'), 'bill CRWB'),
            step('6361607200001101', ' FGHBDHD', '00050000', null, expect('050', '00000000', '99', null, 'ATM:Unrecognized bill payment company'), 'bill DSTV'),
            step('6361607200001101', ' FGHBDID', '00050000', null, expect('050', '00000000', '99', null, 'ATM:Unrecognized bill payment company'), 'bill SRWB'),
            step('6361607200001101', ' FGGBCDD', '00050000', null, expect('035', '00000000', '00', null), 'transfer savings to current'),
            step('6361607200001101', ' FGGBDCD', '00050000', null, expect('035', '00000000', '00', null), 'transfer current to savings'),
            step('6361607200001101', ' FGGBDBD', '00050000', '1041270774115', expect('057', '00000000', '00', null), 'transfer current to other'),
            step('6361607200001101', ' FGBBDDD', '00050000', null, expect('057', '00000000', '00', null), 'transfer savings to cash')
        ]);
    }
});
