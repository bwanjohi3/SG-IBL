var joi = require('joi');

var validateError = error => {
    if (error instanceof RegExp) {
        return joi.string().regex(error);
    } else if (error instanceof String) {
        return joi.string().valid(error);
    } else {
        return joi.string().valid('');
    }
};

module.exports = (customization) => {
    function validateReply(state, notes, error, image) {
        return joi.object({
            type: joi.string().valid('4'),
            luno: joi.string().valid('001'),
            timeVariantNumber: joi.string().valid('xxx'),
            nextState: joi.string().length(3).valid(state),
            notes: joi.string().length(8).valid(notes),
            function: joi.string().length(1),
            screen: joi.alternatives().try(joi.string().length(3), joi.string().valid('')),
            screenUpdate: image ? joi.string().regex(new RegExp(customization.mediaPath + image + '\\.BMP' + (error ? '[^]*ERROR CODE:' + error.toUpperCase().replace('.', '\\.') + '$' : ''))) : validateError(error),
            coordination: joi.string().length(1),
            cardReturn: joi.string().valid('0', '1'),
            printer: joi.string().length(1),
            printerData: joi.string().allow(''),
            session: joi.object(),
            sernum: joi.string().length(4),
            tokens: joi.array(),
            error: error ? joi.string().valid(error) : null
        });
    }

    function operation(card, opcode, amount, option) {
        return {
            messageClass: '1',
            messageSubclass: '1',
            luno: '001',
            timeVariantNumber: 'xxx',
            trtfMcn: 'yy',
            track2: `;${card}=15122011143857589`,
            track3: '',
            operationCode: opcode,
            amountEntry: amount || '00000000',
            pin: {
                revertPin: '1234'
            }[option] || '0000',
            newPin: {
                changePin: '1234',
                revertPin: '0000'
            }[option],
            bufferB: {
                'pull': '555',
                'push': '444',
                'own': '1',
                'autoselect': '',
                'prepaidPhone': 'prepaid',
                'failedPhone': 'failed',
                'timeoutPhone': 'timeout',
                'contractPhone': 'contract'
            }[option] || '',
            bufferC: {
                'own': '1',
                'autoselect': '1',
                'prepaidPhone': '1',
                'failedPhone': '1',
                'timeoutPhone': '1',
                'contractPhone': '1',
                'decline': 'decline',
                'insufficient': 'insufficient',
                'incorrect': 'incorrect',
                'unknown': 'unknown',
                'invalid': 'invalid'
            }[option] || '',
            data: '20001100001000020000300004',
            session: {
                customization: customization.name,
                cassettes: [{
                    currency: customization.currency[0][0],
                    count: 0,
                    supplies: 'good',
                    fitness: 'noError',
                    denomination: customization.currency[0][1]
                }, {
                    currency: customization.currency[1][0],
                    count: {
                        out: 0
                    }[option] || 100,
                    supplies: 'good',
                    fitness: 'noError',
                    denomination: customization.currency[1][1]
                }, {
                    currency: customization.currency[2][0],
                    count: 0,
                    supplies: 'good',
                    fitness: 'noError',
                    denomination: customization.currency[2][1]
                }, {
                    currency: customization.currency[3][0],
                    count: {
                        out: 3
                    }[option] || 100,
                    supplies: 'good',
                    fitness: 'noError',
                    denomination: customization.currency[3][1]
                }]
            },
            source: 'test'
        };
    }

    function step(card, operationCode, amount, option, result, name) {
        return {
            name,
            method: 'atmSimulator.transaction',
            params: operation(card, operationCode, amount, option),
            result: result
        };
    }

    function expect(state, notes, error, image) {
        return (result, assert) => {
            assert.equals(joi.validate(result, validateReply(state, notes, error, image)).error, null, 'Expected state:' + state + ' notes:' + notes +
                (error ? (' error:' + error) : '') +
                (image ? (' image:' + image) : ''));
        };
    }

    return {
        step,
        expect
    };
};
