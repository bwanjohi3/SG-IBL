var test = require('ut-run/test');
var joi = require('joi');

const TMK = 'UF61471FD9BCEA1D5FE44AAB1C739789C';
// const TMKCOMPONENT1 = 'F701026E3846896DDCA17FE076D6A779';
// const TMKCOMPONENT2 = 'D9BCB93EAD8629AEA1FE201080A8513D';
// const TMKKVV = 'A57622';
// const TMKCLEAR = '2EBDBB5095C0A0C37D5F5FF0F67EF644';
const PVK = 'UA36C4DEE7A42CBAEE361BB2B4FD44B22';
// const PVKKVV = 'CEDA55';
const TPK = 'UC644B0D16C4CBCFE060DB197DAD8B911';
// const TPKCLEAR = '7C38A77FC791856B0E51F2681CC4FBE9';
// const PIN = '12345';
const CARD = '5859901234567890';
const PINBLOCK = 'A31118B71B2F9179';
const DECIMALISATION = '1237853406789594';
const OFFSET = '6598FFFFFFFF';
// const PINBLOCKCLEAR = '061233CF6FEDCBA9';
const MESSAGE = 'test message';
const ZMK = 'U41924C308EA66CE9D98E8EA4FE63D68B';
// const ZMKKVV = '22B25B';
// const ZMKCLEAR = 'C3F363335F18DB744147B1DE821B781D';
const ZPK = 'X34B784234DCDECCDFE877F5F853403EF';
const ZPKKVV = '1698BE';

test({
    type: 'integration',
    name: 'HSM',
    steps: function(test, bus, run) {
        run(test, bus, [{
            name: 'Ping',
            method: 'hsm.ping',
            params: () => { // todo find a better way for waiting for a connection
                return new Promise((resolve) => {
                    var connect = setTimeout(() => {
                        clearTimeout(connect);
                        resolve({});
                    }, 1000);
                });
            },
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    message: joi.string().valid('ping')
                })).error, null, 'HSM returns ping response');
            }
        },
        {
            name: 'Generate TPK',
            method: 'hsm.generateTpk',
            params: {
                tmk: TMK
            },
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    tpkLmk: joi.string().length(33),
                    tpkTmk: joi.string().length(33)
                })).error, null, 'HSM returns TPK under LMK and TMK');
            }
        },
        {
            name: 'Generate TAK',
            method: 'hsm.generateTak',
            params: {
                tmk: TMK
            },
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    takLmk: joi.string().length(33),
                    takTmk: joi.string().length(33)
                })).error, null, 'HSM returns TAK under LMK and TMK');
            }
        },
        {
            name: 'Generate MAC',
            method: 'hsm.generateMac',
            params: (context) => ({
                keyType: '003',
                key: context['Generate TAK'].takLmk,
                message: MESSAGE
            }),
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    mac: joi.string().length(8)
                })).error, null, 'HSM returns MAC of the message');
            }
        },
        {
            name: 'Verify MAC',
            method: 'hsm.verifyMac',
            params: (context) => ({
                keyType: '003',
                key: context['Generate TAK'].takLmk,
                message: MESSAGE,
                mac: context['Generate MAC'].mac
            }),
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    errorCode: joi.string().valid('00')
                })).error, null, 'HSM verifies MAC of the message and returns error code 0');
            }
        },
        {
            name: 'Generate PIN offset',
            method: 'hsm.pinOffset',
            params: (context) => ({
                keyType: '002',
                // tpk: context['Generate TPK'].tpkLmk,
                tpk: TPK,
                pvk: PVK,
                pinBlock: PINBLOCK,
                card: CARD,
                decimalisationTable: DECIMALISATION
            }),
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    offset: joi.string().valid(OFFSET)
                })).error, null, 'HSM generates PIN offset');
            }
        },
        {
            name: 'Import ZPK',
            method: 'hsm.importZpk',
            params: {
                zmk: ZMK,
                zpk: ZPK
            },
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    zpk: joi.string().length(33),
                    zpkkvv: joi.string().valid(ZPKKVV)
                })).error, null, 'HSM returns imported ZPK under LMK and correct key verification value');
            }
        },
        {
            name: 'Translate TPK ZPK',
            method: 'hsm.translateTpkZpk',
            params: (context) => ({
                sourceTpk: TPK,
                destinationZpk: context['Import ZPK'].zpk,
                maximumPinLength: '12',
                sourcePinBlock: PINBLOCK,
                sourcePinBlockFormat: '01',
                destinationPinBlockFormat: '01',
                card: CARD
            }),
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    pinBlock: joi.string().length(16)
                })).error, null, 'HSM returns PIN block under imported ZPK');
            }
        },
        {
            name: 'Derive PIN',
            method: 'hsm.derivePin',
            params: {
                pvk: PVK,
                offset: '0000FFFFFFFF',
                checkLength: '04',
                decimalisationTable: DECIMALISATION,
                card: CARD
            },
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    pin: joi.string()
                })).error, null, 'HSM returns PIN under LMK');
            }
        },
        {
            name: 'Print PIN',
            method: 'hsm.printPin',
            params: (context) => ({
                documentType: 'C',
                card: CARD,
                pin: context['Derive PIN'].pin,
                printFields: 'field1;field2;field3'
            }),
            result: (result, assert) => {
                assert.equals(joi.validate(result, joi.object({
                    errorCode: joi.string().valid('00')
                })).error, null, 'HSM returns error code 0');
            }
        }
        ]);
    }
});
