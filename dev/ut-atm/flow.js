const NOTES_MAX_COUNT = 40;
var assign = require('lodash.assign');
var formatDate = require('date-fns/format');
var errors = require('./errors');
var receipts = require('./receipts');
var cmsAPI = require('./cms');
var atmAPI = require('./atm');
var transferAPI = require('./transfer');
const { object } = require('joi');
var currencies = require('ut-transfer')().modules.currency;

const ISOTYPES = {
    current: '20',
    savings: '10'
};

const ISOPROCESSING = {
    sale: '00',
    withdraw: '01',
    deposit: '21',
    balance: '31',
    ministatement: '38',
    transfer: '40',
    topup: '41',
    bill: '50',
    transferOtp: '92',
    withdrawOtp: '93',
    changePin: '96',
    sms: 'SM'
};

function transferParams(params) {
    if([
        'withdrawExternalOwn',
        'balanceExternalOwn',
        'ministatementExternalOwn',
        'changePinExternalOwn',
        'withdrawExternalNi',
        'balanceExternalNi',
        'ministatementExternalNi',
        'changePinExternalNi'
    ].includes(params.txType)) {
        params.currency = params.currency ? params.currency : 'USD';
    } else {
        params.currency = params.currency ? params.currency : 'LRD';
    }
    var result = {
        // identification
        transferType: params.txType,
        acquirerCode: params.session.institutionCode,
        pinBlock: params.pinBlock,
        tpk: params.tpk,
        pinOffset: params.pinOffset,
        pinOffsetNew: params.pinOffsetNew,

        // participants
        channelId: params.session.atmId,
        channelType: 'atm',
        ordererId: params.ordererId,

        destinationType: 'actorId',

        cardId: params.cardId,
        sourceAccount: (params.accType === '' || params.accType === undefined)
            ? 'selected:1'
            : (params.accType && params.accType.length === 1)
                ? 'selected:' + params.accType
                : 'number:' + params.accType,

        // state
        expireSeconds: 90,
        reversed: false,

        // amounts
        amount: {
            transfer: currencies.cents(params.currency, params.amount)
        },

        // info
        description: 'atm ' + params.txType,
        mode: params.mode,
        abortAcquirer: params.abortAcquirer,
        panSeqenceNumber: params.panSeqenceNumber,
        udfAcquirer: {
            mti: 200,
            pan: params.pan,
            track2: params.track2,
            cipher: params.cipher,
            cardFlow: params.cardFlow,
            terminalId: params.session.terminalId,
            terminalName: params.session.terminalName,
            opcode: params.opcode.join(''),
            processingCode: ISOPROCESSING[params.txType] + (ISOTYPES[params.acctype1] || '00') + (ISOTYPES[params.acctype2] || '00'),
            merchantId: params.session.merchantId,
            merchantType: params.session.merchantType,
            identificationCode: params.session.identificationCode
        }
    };
    
    switch (params.txType) {

        case 'withdrawOtp':
            assign(result, {
                otp: params.bufferB,
                sourceAccount: 'merchant:cardless'
            });
            break;
        case 'transfer':
            params.bufferB = params.bufferB || '1';
            assign(result, {
                destinationAccount: params.bufferB,
                destinationType: (params.bufferB && params.bufferB.length === 1) ? 'cardId' : 'accountNumber',
                destinationTypeId: params.cardId
            });
            if (params.bufferC && params.bufferC.length === 1 &&
                params.bufferB && params.bufferB.length === 1 &&
                parseInt(params.bufferB) >= parseInt(params.bufferC)) { // source account was not shown in destination accounts list
                result.destinationAccount = (parseInt(params.bufferB) + 1);
            }
            if (params.bufferB == "" || params.bufferB=="1") {
                throw new Error('Destination account missing.');
            }
            break;
        case 'balance':
            delete result.issuerId;
            delete result.ledgerId;
            break;
        case 'chequebook':

            delete result.issuerId;
            delete result.ledgerId;
            result.issuerId = params.customization.chequebook['issuer'];
            result.ledgerId = params.customization.chequebook['ledger'];
            result.description = result.description + ' ' + params.chequepages;
            break;
        case 'transferAcq':
            params.bufferB = params.bufferB || '1';
            assign(result, {
                destinationAccount: params.bufferB,
                destinationType: "partnerId",
                destinationTypeId: "cbl",
                issuerId: 'cbl',
                ledgerId: 'cbl',
                pinOffset:'skip'
            });
            if (params.bufferC && params.bufferC.length === 1 &&
                params.bufferB && params.bufferB.length === 1 &&
                parseInt(params.bufferB) >= parseInt(params.bufferC)) { // source account was not shown in destination accounts list
                result.destinationAccount = (parseInt(params.bufferB) + 1);
            }
            result.udfAcquirer.emvTags = params.emvTagsRaw;
            break;
        case 'balanceAcq':
            delete result.issuerId;
            delete result.ledgerId;
            result.destinationType = "partnerId";
            result.destinationTypeId= "cbl";
            result.issuerId = 'cbl';
            result.ledgerId = 'cbl';
            result.pinOffset = 'skip';
            result.udfAcquirer.emvTags = params.emvTagsRaw;
            break;
        case 'withdraw':
            // if (params.cardFlow === 'externalOwn') {
            //     result.merchantId = params.customization.withdraw[params.merchant];
            //     result.issuerId = params.customization.withdrawExternalOwn['issuer'];
            //     result.ledgerId = params.customization.withdrawExternalOwn['ledger'];
            //     result.destinationType = "partnerId";
            //     result.destinationTypeId = params.customization.withdrawExternalOwn['issuer'];;
            //     // result.issuerId = 'cbl';
            //     // result.ledgerId = 'cbs';
            //     result.pinOffset = 'skip';
            //     result.udfAcquirer.emvTags = params.emvTagsRaw || params.emvTags;
            // } else {
                result.merchantId = params.customization.withdraw[params.merchant];
                result.issuerId = params.customization.withdraw['issuer'];
                result.ledgerId = params.customization.withdraw['ledger']; 
            // }

            break;
        case 'withdrawAcq':
            result.merchantId = params.customization.withdraw[params.merchant];
            result.issuerId = params.customization.withdrawAcq['issuer'];
            result.ledgerId = params.customization.withdrawAcq['ledger'];
            result.destinationType = "partnerId";
            result.destinationTypeId = "cbl";
            result.issuerId = 'cbl';
            result.ledgerId = 'cbs';
            result.pinOffset = 'skip';
            result.udfAcquirer.emvTags = params.emvTagsRaw;
            break;
        case 'withdrawExternalOwn':
        case 'withdrawExternalNi':              
            result.merchantId = params.customization.withdraw[params.merchant];
            result.issuerId = params.customization.withdrawExternalOwn['issuer'];
            result.ledgerId = params.customization.withdrawExternalOwn['ledger'];
            result.destinationType = "partnerId";
            result.destinationTypeId = "cbl";
            // result.issuerId = 'cbl';
            // result.ledgerId = 'cbs';
            result.pinOffset = 'skip';
            result.udfAcquirer.emvTags = params.emvTagsRaw || params.emvTags;
            break;
        case 'balanceExternalOwn':
        case 'balanceExternalNi':    
            delete result.issuerId;
            delete result.ledgerId;
            result.destinationType = "partnerId";
            result.destinationTypeId= "cbl";
            // result.issuerId = 'cbl';
            // result.ledgerId = 'cbl';
            result.pinOffset = 'skip';
            result.udfAcquirer.emvTags = params.emvTagsRaw || params.emvTags;
            break;    
            case 'ministatementExternalOwn':
            case 'ministatementExternalNi':
                    delete result.issuerId;
                delete result.ledgerId;
                result.destinationType = "partnerId";
                result.destinationTypeId= "cbl";
                // result.issuerId = 'cbl';
                // result.ledgerId = 'cbl';
                result.pinOffset = 'skip';
                result.udfAcquirer.emvTags = params.emvTagsRaw || params.emvTags;
                break;
        case 'changePinExternalOwn':
        case 'changePinExternalNi':
                params.currency='';
            result.pinOffset = 'skip';
            result.pinBlockNew = params.pinBlockNew;
            result.udfAcquirer.emvTags = params.emvTagsRaw || params.emvTags;
            break;
        case 'ministatement':
            delete result.issuerId;
            delete result.ledgerId;
            if (result.amount.transfer) {
                result.amount.transfer.amount = 0;
                result.amount.transfer.cents = 0;
            }
            break;
        case 'topup':
            result.merchantId = params.customization.topup[params.merchant];
            result.merchantInvoice = params.bufferB;
            result.destinationType = 'partnerId';
            result.destinationTypeId = result.merchantId;
            break;
        case 'sms':
            result.merchantId = params.customization.sms[params.merchant];
            result.merchantInvoice = params.bufferB;
            break;
        case 'bill':
            result.merchantId = params.customization.bill[params.merchant];
            result.merchantInvoice = params.bufferB;
            result.destinationType = 'partnerId';
            result.destinationTypeId = result.merchantId;
            break;
        case 'transferOtp':
            if (!params.customization.validWithdrawAmount(params.amount)) {
                throw errors.badWithdrawAmount();
            }
            assign(result, {
                destinationAccount: 'merchant:cardless'
            });
            break;
        case 'changePin':
            params.currency='';
            break;
    }

    var txAmount = currencies.cents(params.currency, params.amount);
    result.amount.transfer = txAmount;
    return Promise.resolve(result);
}

function currencyMapping(terminalInfo, currencies) {
    return terminalInfo.cassettes.reduce((prev, current, index) => {
        return prev + ((current.denomination && currencies[current.currency]) || 'FF') + (index + 1) + ('00000' + current.denomination).slice(-5);
    }, '04');
}

function inc(s, v) { // increment a 3 digit string
    var x = Number.parseInt(s);
    if (isNaN(x) || x < 0 || x > 999) {
        throw errors.expectedThreeDigitInteger(s);
    }
    return ('000' + (x + v)).slice(-3);
}

function screenUpdate(language, screen, image, transfer) { // todo language
    if (screen && image) {
        var update = image({ screen, transfer, language });
        return (typeof update === 'string') ? { screenUpdate: update } : update;
    } else {
        return {};
    }
}

function errorDisplay(debug, coordinates, errorPrint, errorCode) {
    if (!debug) {
        return '';
    }
    var result = '';
    if (errorPrint || errorCode) {
        result = '\u001b[00;B1;80m\u000f' + coordinates; // G@
        result = result + (errorPrint ? (errorPrint.toUpperCase() + '\u000d') : '');
        result = result + (errorCode ? ('ERROR CODE:' + errorCode.toUpperCase()) : '');
    }
    return result;
}

var stateUpdate = ({language, state, transfer}) => (typeof state === 'string') ? { nextState: state } : Array.isArray(state) ? { nextState: state[0] } : state({ language, transfer });

function nextState(language, state, screen, image, message, error, transfer, emvResponseTag) {
    return Object.assign({
        nextState: '',
        type1Notes: '00',
        type2Notes: '00',
        type3Notes: '00',
        type4Notes: '00',
        emvResponseTag: emvResponseTag || '00',
        sernum: '0000',
        'function': '5',
        screen: screen, // return screen for automation test purposes
        screenUpdate: '',
        screenMessage: (screen && image && message) || '',
        cardReturn: '0',
        message: message,
        error: error
    }, screenUpdate(language, screen, image, transfer), stateUpdate({ language, state, transfer }));
}

function calcNotes(params) {
    var amount = Number.parseInt(currencies.cents(params.currency, params.amount).amount, 10);
    if (amount <= 0 || isNaN(amount)) {
        throw errors.zeroAmount();
    }
    var notes = params.session.cassettes.reduce((current, cassette) => {
        //cassette.count = 500;//Remove this value once able to load notes.
        let checkCurrency = params.currency || 'USD';
        if (cassette.denomination > 0 && cassette.currency==checkCurrency) {
            current.validate -= Math.floor(current.remain / cassette.denomination) * cassette.denomination;
        }
        if (cassette.denomination > 0 && // cassette has denomination
            cassette.count > 0 && // cassette is not empty
            { noError: 1, routine: 1, warning: 1 }[cassette.fitness] && // cassette fitness is acceptable
             cassette.currency==checkCurrency && // Currency is supported by cassettes
            { good: 1, mediaLow: 1 }[cassette.supplies] // cassette supply status is acceptable
        ) {
            var give = Math.floor(current.remain / cassette.denomination);
            (give > cassette.count) && (give = cassette.count);
            current.remain -= give * cassette.denomination;
            current.dispense.push(give);
        } else {
            current.dispense.push(0);
        }
        return current;
    }, { dispense: [], remain: amount, validate: amount });

    if (notes.remain === 0) { // the amount can be fulfilled from the available denominations
        var total = notes.dispense.reduce((prev, current) => prev + current, 0);
        if (total > NOTES_MAX_COUNT) { // do not try to dispense large count of notes
            throw errors.notesOverflow();
        } else if (total <= 0) { // this should not happen, as amount was checked earlier
            throw errors.invalidAmount();
        } else { // return notes per cassette
            return notes.dispense.reduce((prev, current, index) => {
                prev['type' + (index + 1) + 'Notes'] = ('00' + current).slice(-2);
                return prev;
            }, {});
        }
    } else { // the amount can not be fulfilled with the available denominations
        if (notes.validate > 0) { // the amount can not be dispensed by the configured denominations
            throw errors.invalidAmount();
        } else { // all cassettes are empty
            throw errors.outOfNotes();
        }
    }
}

function validateTransfer(params) {
    if (params.hsmError) {
        params.abortAcquirer = errors.hsm(params.hsmError);
        return params;
    }
    try {
        ['withdraw', 'withdrawOtp', 'withdrawAcq', 'withdrawExternalOwn', 'withdrawExternalNi'].includes(params.txType) && calcNotes(params);
    } catch (e) {
        params.abortAcquirer = e;
    }
    return params;
}

function txReply(params, transfer) {
    // todo process fee, balance, fxrate
    var transferDetails = Object.assign({}, transfer, { style: 'transferNormal' });
    switch (params.txType) {
        case 'withdraw':
            let dispense = calcNotes(params);
            let printers = receipts.get(Object.assign({}, params, dispense), transfer, params.txType);
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_REQUEST_COUNTERS[0],
                params.customization.screens.SHOW_WITHDRAW,
                params.customization.images.SHOW_WITHDRAW,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails,
                    'function': 'A'
                }, dispense, printers);

        /*return assign(nextState(
        params.language,
        params.customization.states.TXSUCCESS_BALANCE,
        params.customization.screens.SHOW_BALANCE,
        params.customization.images.SHOW_BALANCE,
        undefined,
        undefined,
        transfer
    ), {
            sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
            transferId: transfer.transferId,
            transferDetails
        }, receipts.get(params, transfer, params.txType));*/
        case 'withdrawAcq':
            let dispenseAcq = calcNotes(params);
            let printersAcq = receipts.get(Object.assign({}, params, dispenseAcq), transfer, params.txType);
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_REQUEST_COUNTERS,
                params.customization.screens.SHOW_WITHDRAW,
                params.customization.images.SHOW_WITHDRAW,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails,
                    'function': 'A'
                }, dispenseAcq, printersAcq);
        case 'withdrawExternalOwn':
        case 'withdrawExternalNi':     
            let dispenseExternalOwn = calcNotes(params);
            let printersExternalOwn = receipts.get(Object.assign({}, params, dispenseExternalOwn), transfer, params.txType);
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_REQUEST_COUNTERS,
                params.customization.screens.SHOW_WITHDRAW,
                params.customization.images.SHOW_WITHDRAW,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails,
                    'function': 'A'
                }, dispenseExternalOwn, printersExternalOwn);
        case 'balanceExternalOwn':
        case 'balanceExternalNi':
                return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_BALANCE,
                params.customization.screens.SHOW_BALANCE,
                params.customization.images.SHOW_BALANCE,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'ministatementExternalOwn':
        case 'ministatementExternalNi':
                return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_MINISTATEMENT,
                params.customization.screens.SHOW_MINISTATEMENT,
                params.customization.images.SHOW_MINISTATEMENT,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.ministatement(params, transfer));
        case 'balanceAcq':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_BALANCE,
                params.customization.screens.SHOW_BALANCE,
                params.customization.images.SHOW_BALANCE,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'balance':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_BALANCE,
                params.customization.screens.SHOW_BALANCE,
                params.customization.images.SHOW_BALANCE,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'chequebook':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_CHEQUEBOOK,
                params.customization.screens.SHOW_CHEQUEBOOK,
                params.customization.images.SHOW_CHEQUEBOOK,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'ministatement':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_MINISTATEMENT,
                params.customization.screens.SHOW_MINISTATEMENT,
                params.customization.images.SHOW_MINISTATEMENT,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'transfer':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_CONFIRM_ANOTHER,
                params.customization.screens.SHOW_TRANSFER,
                params.customization.images.SHOW_TRANSFER,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'transferAcq':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_CONFIRM_ANOTHER,
                params.customization.screens.SHOW_TRANSFER,
                params.customization.images.SHOW_TRANSFER,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'topup':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_TOPUP,
                params.customization.screens.SHOW_TOPUP,
                params.customization.images.SHOW_TOPUP,
                undefined,
                undefined,
                transfer
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'bill':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_BILL
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'transferOtp':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_CONFIRM_ANOTHER
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'sms':
            return assign(nextState(
                params.language,
                (params.bufferB && params.bufferB.startsWith('5')) ? params.customization.states.SMS_PULL : params.customization.states.SMS_PUSH
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId
                }, receipts.get(params, transfer, params.txType));
		case 'changePinExternalOwn':
        case 'changePinExternalNi':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_PIN_CHANGED,
                
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId,
                    transferDetails
                }, receipts.get(params, transfer, params.txType));
        case 'changePin':
            return assign(nextState(
                params.language,
                params.customization.states.TXSUCCESS_PIN_CHANGED
            ), {
                    sernum: '1' + ('000' + transfer.transferIdAcquirer).slice(-3),
                    transferId: transfer.transferId
                }, receipts.get(params, transfer, params.txType));
    }
}

var operations = {
    checkPin: function (params, cms, transfer) {
        // todo check ltsd
        function cardError(image, capture, message) {
            var state = nextState(params.language, params.customization.states.ERR_CLOSE_WITH_MESSAGE, params.customization.screens.EMPTY, image, message);
            capture && (state.cardReturn = '1');
            return state;
        }
        return cms.checkCard(params)
            .then((result) => { 
                return nextState(params.language, params.customization.states.TRANSACTION_SWITCH) 
            })
            .catch((error) => {
                switch (error.type) {
                    case 'card.incorrectPin':
                        return nextState(params.language, params.customization.states.ERR_INCORRECT_PIN);
                    case 'card.unknown':
                        return cardError(params.customization.images.ERR_UNKNOWN_CARD_ACCOUNT);
                    case 'card.hot':
                        return cardError(params.customization.images.ERR_CARD_HOT);
                    case 'card.notActivated':
                        return cardError(params.customization.images.ERR_CARD_NOT_ACTIVATED);
                    case 'card.expired':
                        return cardError(params.customization.images.ERR_CARD_EXPIRED);
                    case 'card.inactive':
                        return cardError(params.customization.images.ERR_CARD_INACTIVE);
                    case 'card.forDestruction':
                        return cardError(params.customization.images.ERR_CARD_DESTRUCTION);
                    case 'card.invalidPinData':
                        return cardError(params.customization.images.ERR_CARD_INVALID_PIN_DATA);
                    case 'card.retryLimitExceeded':
                        return cardError(params.customization.images.ERR_CARD_EXCEED_RETRIES);
                    case 'card.retryDailyLimitExceeded':
                        return cardError(params.customization.images.ERR_CARD_EXCEED_DAILY_RETRIES);
                    default:
                        return cardError(params.customization.images.ERR_CARD_INVALID, 0, errorDisplay(params.debug, 'G@', error.message, error.type));
                }
            });
    },
    accountListTransfer: function (params, cms) {
        if (!(params.customization.accountsDisplay instanceof Function)) {
            throw errors.invalidCustomization('Missing accountsDisplay function');
        }
        return cms.listAccounts(params, params.bufferC - 1)
            .then(params.customization.accountsDisplay)
            .then(accounts => {
                if (accounts.count === 0) {
                    return nextState(params.language, params.customization.states.ERR_INVALID_ACCTYPE_DEST);
                } else if (accounts.count === 1) {
                    return nextState(params.language, params.paper ? params.customization.states.ENTER_TRANSFER_AMOUNT : params.customization.states.ENTER_TRANSFER_AMOUNT_NOPAPER);
                }
                return nextState(
                    params.language,
                    inc(params.paper ? params.customization.states.SELECT_ACCOUNT_TRANSFER : params.customization.states.SELECT_ACCOUNT_TRANSFER_NOPAPER, accounts.count - 1),
                    params.customization.screens.SELECT_ACCOUNT_TRANSFER,
                    params.customization.images.SELECT_ACCOUNT_TRANSFER,
                    accounts.display
                );
            });
    },
    accountList: function (params, cms) {
        if (!(params.customization.accountsDisplay instanceof Function)) {
            throw errors.invalidCustomization('Missing accountsDisplay function');
        }
        return cms.listAccounts(params)
            .then(params.customization.accountsDisplay)
            .then(accounts => {
                if (accounts.count === 0) {
                    return nextState(params.language, params.customization.states.ERR_INVALID_ACCTYPE);
                } else if (accounts.count === 1) {
                    // todo customized autoselection logic
                    // return operations.txSwitch(params);
                }
                switch (params.txType) {
                    case 'transfer': return nextState(
                        params.language,
                        inc(params.paper ? params.customization.states.SELECT_ACCOUNT_FROM : params.customization.states.SELECT_ACCOUNT_FROM_NOPAPER, accounts.count - 1),
                        params.customization.screens.SELECT_ACCOUNT_FROM,
                        params.customization.images.SELECT_ACCOUNT_FROM,
                        accounts.display
                    );
                    case 'withdraw': return nextState(
                        params.language,
                        inc(params.paper ? params.customization.states.SELECT_ACCOUNT : params.customization.states.SELECT_ACCOUNT_NOPAPER, accounts.count - 1),
                        params.customization.screens.SELECT_ACCOUNT,
                        params.customization.images.SELECT_ACCOUNT,
                        accounts.display
                    );
                    case 'topup': return nextState(
                        params.language,
                        inc(params.paper ? params.customization.states.SELECT_ACCOUNT_TOPUP : params.customization.states.SELECT_ACCOUNT_TOPUP_NOPAPER, accounts.count - 1),
                        params.customization.screens.SELECT_ACCOUNT,
                        params.customization.images.SELECT_ACCOUNT,
                        accounts.display
                    );
                    case 'sms': return nextState(
                        params.language,
                        inc(params.paper ? params.customization.states.SELECT_ACCOUNT_SMS : params.customization.states.SELECT_ACCOUNT_SMS_NOPAPER, accounts.count - 1),
                        params.customization.screens.SELECT_ACCOUNT,
                        params.customization.images.SELECT_ACCOUNT,
                        accounts.display
                    );
                    case 'balance': return nextState(
                        params.language,
                        inc(params.paper ? params.customization.states.SELECT_ACCOUNT_BALANCE : params.customization.states.SELECT_ACCOUNT_BALANCE, accounts.count - 1),
                        params.customization.screens.SELECT_ACCOUNT,
                        params.customization.images.SELECT_ACCOUNT,
                        accounts.display
                    );
                    case 'ministatement': return nextState(
                        params.language,
                        inc(params.paper ? params.customization.states.SELECT_ACCOUNT_STATEMENT : params.customization.states.SELECT_ACCOUNT_STATEMENT, accounts.count - 1),
                        params.customization.screens.SELECT_ACCOUNT,
                        params.customization.images.SELECT_ACCOUNT,
                        accounts.display
                    );
                }
                throw errors.badTransaction();
            });
    },
    txSwitch: function (params) {
        switch (params.txType) {
            case 'withdraw': return nextState(params.language, params.paper ? params.customization.states.WITHDRAW_PAPER : params.customization.states.WITHDRAW_NO_PAPER);
            case 'balance': return nextState(params.language, params.paper ? params.customization.states.BALANCE_PAPER : params.customization.states.BALANCE_NO_PAPER);
            case 'changePin': return nextState(params.language, params.paper ? params.customization.states.PIN_CHANGE_PAPER : params.customization.states.PIN_CHANGE_NO_PAPER);
            case 'ministatement': return nextState(params.language, params.customization.states.CONFIRM_RECEIPT_PRINT);
            case 'topup': return nextState(params.language, params.customization.states.SELECT_TOPUP);
            case 'transfer': return nextState(params.language, params.paper ? params.customization.states.TRANSFER_PAPER : params.customization.states.TRANSFER_NO_PAPER);
            case 'transferOtp': return nextState(params.language, params.customization.states.PRESET_TRANSER_ACCOUNT_LIST);
            case 'bill': return nextState(params.language, params.paper ? params.customization.states.SELECT_BILL : params.customization.states.ERR_NO_PAPER);
            case 'withdrawOtp': return nextState(params.language, params.paper ? params.customization.states.ENTER_AMOUNT_FORCE_RECEIPT : params.customization.states.ERR_NO_PAPER);
            default: {
                return nextState(
                    params && params.language,
                    params.customization.states.ERR_CLOSE_WITH_MESSAGE,
                    params.customization.states.ERR_CLOSE_WITH_MESSAGE,
                    params.customization.screens.EMPTY,
                    params.customization.images.ERR_TRANSACTION_CANCELLED,
                    errorDisplay(params.debug, 'K@', 'INVALID TRANSACTION TYPE')
                );
            }
        }
    },
    txPost: function (params, cms, transfer, atm) {
        //params.pinOffsetNew = '8a4850e0d67ed26f656410526f9a46ff';
        if (params.cardFlow === 'externalOwn' || params.cardFlow === 'externalNi') {
            let h2htransferDetails = {};
            return transferParams(validateTransfer(params))
            // .then(result => transfer.card(result, { auth: { actorId: params.session.atmId } }))
            .then(result => {
                if(result.abortAcquirer) {
                    return Promise.reject(result.abortAcquirer);
                } else {
                    Object.assign(h2htransferDetails,result);
                    return transfer.h2hTransaction(result)
                }
            })
            .then((result) => {
                if(result.iserror) {
                    return Promise.reject(result);
                }
                let res = txReply(params, result);
                res.h2htransferDetails = h2htransferDetails;
                // console.log(res);
                return res;
            })
            .catch((error) => {
                const res = processError(error, params);
                // console.log(res);
                return res;        
            });     
        } else {
        return transferParams(validateTransfer(params))
            .then(result => transfer.card(result, { auth: { actorId: params.session.atmId } }))
            .then(result => txReply(params, result))
            .catch(error => processError(error, params));
        }
    },
    txPostPaperCheck: function (params, cms, transfer, atm) {
        if (params.printReceipt && !params.paper) {
            switch (params.txType) {
                case 'withdraw': return nextState(params.language, params.customization.states.WITHDRAW_NO_PAPER);
                case 'balance': return nextState(params.language, params.customization.states.BALANCE_NO_PAPER);
                case 'changePin': return nextState(params.language, params.customization.states.PIN_CHANGE_NO_PAPER);
                case 'ministatement': return nextState(params.language, params.customization.states.CONFIRM_RECEIPT_PRINT);
                case 'topup': return nextState(params.language, params.customization.states.SELECT_TOPUP);
                case 'transfer': return nextState(params.language, params.customization.states.TRANSFER_NO_PAPER);
                case 'transferOtp': return nextState(params.language, params.customization.states.PRESET_TRANSER_ACCOUNT_LIST);
                case 'bill': return nextState(params.language, params.customization.states.ERR_NO_PAPER);
                case 'withdrawOtp': return nextState(params.language, params.customization.states.ERR_NO_PAPER);
                case 'chequebook': return nextState(params.language, params.customization.states.ERR_NO_PAPER);
                default: {
                    return nextState(
                        params && params.language,
                        params.customization.states.ERR_CLOSE_WITH_MESSAGE,
                        params.customization.states.ERR_CLOSE_WITH_MESSAGE,
                        params.customization.screens.EMPTY,
                        params.customization.images.ERR_TRANSACTION_CANCELLED,
                        errorDisplay(params.debug, 'K@', 'INVALID TRANSACTION TYPE')
                    );
                }
            }
        }
        return transferParams(validateTransfer(params))
            .then(result => transfer.card(result, { auth: { actorId: params.session.atmId } }))
            .then(result => txReply(params, result))
            .catch(error => processError(error, params));
    },
    enterAccount: function (params, cms) {
        // todo check ltsd
        return cms.accountHolder(params.bufferB).then(result => {
            if (result && result.holder) {
                switch (params.txType) {
                    case 'transferOtp':
                    case 'transfer': return nextState(params.language, params.customization.states.PRESET_ENTER_ACCOUNT);
                    default: return nextState(params.language, params.customization.states.PRESET_ENTER_ACCOUNT_BILL);
                }
            }
            return nextState(params.language, params.customization.states.ERR_INVALID_ACCOUNT_DEST);
        });
    },
    enterSecurityCode: function (params, cms, transfer) {
        // todo check ltsd
        if (transfer.securityCodeCurrency(params.bufferB)) {
            return nextState(params.language, params.customization.states.PRESET_TRANSACTION);
        } else {
            return nextState(params.language, params.customization.states.ERR_INVALID_SECURITY_CODE);
        }
    },
    tia: function (params, cms, transfer, atm) {
        // todo check ltsd
        return transferParams(validateTransfer(params))
            .then(transfer.card)
            .then(result => Object.assign(nextState(
                0,
                params.customization.states.TIA,
                params.customization.screens.EMPTY,
                params.customization.images.TIA,
                '\u000f@@\u001b(1TIA IN PROGRESS, PLEASE WAIT...'
            ), { tia: true }));
    },
    getCounters: function (params) {
        return assign({ requestCounters: true }, nextState(params.language, params.customization.states.TXSUCCESS_TAKE_CARD));
    }
};

function processOpCode(params) {

    switch (params.opcode.join('')) {
        case 'DDDDDDDD': return { operation: operations.tia, currency: 'GHS', txType: 'tia', mode: 'ATM tia' };
        case 'CCCCCCCC': return { operation: operations.getCounters, txType: 'counters' };
    }
    // map per buffer position, ABCDFGHI for button positions, X for fallback
    var buffer = params.customization.buffer({ operations, errors });
    buffer.default.paper = (
        params.session &&
        ['good', 'mediaLow', 'overfill'].includes(params.session.paperSupply) &&
        ['noError', 'routine', 'warning'].includes(params.session.hfReceipt)
    );
    //buffer.default.printReceipt = params.topOfReceipt == "1" ? true : buffer.default.printReceipt;
    return buffer.map.reduce((prev, current, index) => {
        var letter = params.opcode[index];
        if (/^[ABCDFGHI]$/.test(letter)) {
            var val = current[params.cardFlow + letter] || current[params.cardFlow + 'X'] || current[letter] || current['X'];
            if (typeof val === 'function') {
                throw val();
            } else if (val) {
                assign(prev, val);
            }
        }
        return prev;
    }, buffer.default);
}

var loadAccounts = (cms, params) => {
    return cms.checkCard(params);
}

var processOperation = (cms, transfer, atm) => (params) => {
    if (params && typeof params.operation === 'function') {
        return params.operation(params, cms, transfer, atm);
    } else {
        throw errors.badRequestType();
    }
};

function processError(e, params) {
    function errorCard(image, message, emvResponseTag) {
        //var state = nextState(params.language, params.customization.states.ERR_CLOSE_WITH_MESSAGE, params.customization.screens.EMPTY, image, message, e.print, undefined, '06');
        var state = nextState(params.language, params.customization.states.ERR_CLOSE_WITH_MESSAGE, params.customization.screens.EMPTY, image, "", e.print, undefined, '06');
		return state;
    }

    function transClose(image, message, emvResponseTag) {
		//var state = nextState(params.language, params.customization.states.ERR_TRANS_CLOSE_WITH_MESSAGE, params.customization.screens.EMPTY, image, message, e.print, undefined, '06');
        var state = nextState(params.language, params.customization.states.ERR_TRANS_CLOSE_WITH_MESSAGE, params.customization.screens.EMPTY, image, "", e.print, undefined, '06');
        return state;
    }
    var result;
    switch (e.type) {
        case 'atm.noAvailableAccounts':
            result = errorCard(params.customization.images.ERR_UNKNOWN_CARD_ACCOUNT, undefined, '06');
            break;
        case 'atm.noAvailableAccountsCurrency':
            result = errorCard(params.customization.images.ERR_UNKNOWN_CARD_ACCOUNT, undefined, '06');
            break;
        case 'atm.zeroAmount':
            result = nextState(params.language, params.customization.states.ERR_NOTES_ZERO_AMOUNT, undefined, undefined, e.print, undefined, '06');
            break;
        // case 'atm.outOfNotes':
        //     result = nextState(params.language, params.customization.states.ERR_OUT_OF_NOTES, undefined, undefined, e.print, undefined, '06');
        //     break;
        case 'atm.invalidAmount':
            result = nextState(params.language, params.customization.states.ERR_NOTES_INVALID_AMOUNT, undefined, undefined, e.print, undefined, '06');
            break;
        case 'transfer.insufficientFunds':
            if (params.txType !== 'balance') {
                result = nextState(params.language, params.customization.states.ERR_INSUFFICIENT_FUNDS, undefined, undefined, e.print, undefined, '06');
            }
            break;
        case 'transfer.invalidAccount':
            result = nextState(params.language, params.customization.states.ERR_INVALID_ACCOUNT_DEST, undefined, undefined, e.print, undefined, '06');
            break;
        case 'card.invalidNumber':
            result = nextState(params.language, params.customization.states.ERR_INVALID_NUMBER, undefined, undefined, e.print, undefined, '06');
            break;
        case 'card.incorrectPin':
            result = nextState(params.language, params.customization.states.ERR_INCORRECT_PIN, undefined, undefined, e.print, undefined, '06');
            break;
        case 'card.invalidTrack2':
            result = nextState(params.language, params.customization.states.ERR_INVALID_TRACK, undefined, undefined, e.print, undefined, '06');
            break;
        case 'card.unknown':
            result = errorCard(params.customization.images.ERR_UNKNOWN_CARD_ACCOUNT, undefined, '06');
            break;
        case 'card.hot':
            result = errorCard(params.customization.images.ERR_CARD_HOT, undefined, '06');
            break;
        case 'card.notActivated':
            result = errorCard(params.customization.images.ERR_CARD_NOT_ACTIVATED, undefined, '06');
            break;
        case 'card.expired':
            result = errorCard(params.customization.images.ERR_CARD_EXPIRED, undefined, '06');
            break;
        case 'card.inactive':
            result = errorCard(params.customization.images.ERR_CARD_INACTIVE, undefined, '06');
            break;
        case 'card.forDestruction':
            result = errorCard(params.customization.images.ERR_CARD_DESTRUCTION, undefined, '06');
            break;
        case 'card.invalidPinData':
            result = errorCard(params.customization.images.ERR_CARD_INVALID_PIN_DATA, undefined, '06');
            break;
        case 'card.retryLimitExceeded':
            result = errorCard(params.customization.images.ERR_CARD_EXCEED_RETRIES, undefined, '06');
            break;
        case 'card.retryDailyLimitExceeded':
            result = errorCard(params.customization.images.ERR_CARD_EXCEED_DAILY_RETRIES, undefined, '06');
            break;
        case 'rule.exceedMinLimitAmount':
            result = transClose(params.customization.images.ERR_TRANSACTION_CANCELLED, e.print, '06');
            result.emvResponseTag = '06';
            break;
        case 'rule.exceedMaxLimitAmount':
            result = transClose(params.customization.images.ERR_TRANSACTION_CANCELLED, e.print, '06');
            break;
        case 'rule.exceedDailyLimitAmount':
            result = transClose(params.customization.images.ERR_TRANSACTION_CANCELLED, e.print, '06');
            break;
        case 'rule.exceedDailyLimitCount':
            result = transClose(params.customization.images.ERR_TRANSACTION_CANCELLED, e.print, '06');
            break;
        case 'rule.exceedWeeklyLimitAmount':
            result = transClose(params.customization.images.ERR_TRANSACTION_CANCELLED, e.print, '06');
            break;
        case 'rule.exceedWeeklyLimitCount':
            result = transClose(params.customization.images.ERR_TRANSACTION_CANCELLED, e.print, '06');
            break;
        case 'rule.exceedMonthlyLimitAmount':
            result = transClose(params.customization.images.ERR_TRANSACTION_CANCELLED, e.print, '06');
            break;
        case 'rule.exceedMonthlyLimitCount':
            result = transClose(params.customization.images.ERR_TRANSACTION_CANCELLED, e.print, '06');
            break;
        default:
            // todo handle bad otp, bad cardless amount
            // todo handle txReply error like calc notes
            result = assign(
                nextState(
                    params && params.language,
                    params.customization.states.ERR_CLOSE_WITH_MESSAGE,
                    params.customization.screens.EMPTY,
                    params.customization.images.ERR_TRANSACTION_CANCELLED,
                    errorDisplay(params.debug, 'K@', e.message, e.type),
                    e.message,
                    undefined,
                    '06'
                ),
                (e.transferDetails ? { transferDetails: Object.assign({}, e.transferDetails, { alerts: e.message, style: 'transferError' }) } : {})
            );
            break;
    }

    result.emvCryptogramVerifyData = params.emvCryptogramVerifyData;
    result.isEmvCard = params.isEmvCard;
    return result;
};

var checkLastTransaction = transfer => params => {
    if (params.lastTransactionData && params.session) {
        return transfer.checkLastTransaction(assign({ channelId: params.session.atmId, confirm: params.txType === 'counters' }, params.lastTransactionData))
            .then(() => params);
    }
	return params;
};

function processTransaction(
    {cms, transfer, atm},
    {cardId, opcode, amount, pinOffset, pinOffsetNew, pinBlock, pinBlockNew, bufferB, bufferC, lastTransactionData, session, pan, cipher, track2, track2EquivalentData, emvReceiptData, tpk, hsmError, emvCryptogramVerifyData, isEmvCard, topOfReceipt, cardMasked, cardNumber,emvTags,emvTagsRaw,originalEmvTags, panSeqenceNumber},
    customization,
    debug) {
    var params = {
        cardId,
        opcode,
        amount,
        pinOffset,
        pinOffsetNew,
        pinBlock,
        pinBlockNew,
        bufferB,
        bufferC,
        lastTransactionData,
        session,
        pan,
        cipher,
        track2,
        track2EquivalentData,
        emvReceiptData,
        emvCryptogramVerifyData,
        isEmvCard,
        tpk,
        customization,
        debug,
        hsmError,
        topOfReceipt,
        cardMasked,
        cardNumber,
        emvTags,
        emvTagsRaw,
        originalEmvTags,
        panSeqenceNumber
    };
    var assignParams = (data) => assign(params, data);
    //check the opcode, if index 5/6 does not have a value, then it is account fetch request. It should be onus request. and not chequebook request
    //Should not be a pin change request
    if (params.opcode[7] == "A" && params.opcode[6] == " " && params.opcode[5] == " " &&
        params.opcode[4] == " " && params.opcode[3] == " " && params.opcode[2] == " " && params.opcode[1] == " " &&
        params.opcode[0] == " ") {
        return Promise.resolve({ cardId, hsmError })
            .then(cms.cardParams)
            .catch(error => {
                assignParams(processOpCode(assignParams({ cardFlow: 'own' }))); // acquire language
                throw error;
            })
            .then(assignParams)
            .then(processOpCode)
            .then(assignParams)
            .then(checkLastTransaction(transfer))
            .then(processOperation(cms, transfer, atm))
            .catch(error => processError(error, params));
    }
    else if (params.opcode[5] == " " && params.opcode[6] == " " && params.opcode[2] != "B" && params.opcode[2] != "D") { // !!! temporary solution change PIN change position on state/screen
        return cms.getAccountDetails(params).then((response) => {
            if (!Array.isArray(response)) {
                response = [response];
            }
            var filteredArr = [];
            response.forEach((res)=>{
                if (params.opcode[3] == 'A') {
                    if (res.currency == 'LRD' && res.sourceAccountNumber) {
                        return res.sourceAccountNumber;
                    }
                } else if (params.opcode[3] == 'B') {
                    if (res.currency == 'USD' && res.sourceAccountNumber) {
                        return res.sourceAccountNumber;
                    }
                }
            })
            //Faulty when using map, trying forEach instead
            var arr = response.map((res) => {
                if (params.opcode[3] == 'A') {
                    if (res.currency == 'LRD' && res.sourceAccountNumber) {
                        return res.sourceAccountNumber;
                    }
                } else if (params.opcode[3] == 'B') {
                    if (res.currency == 'USD' && res.sourceAccountNumber) {
                        return res.sourceAccountNumber;
                    }
                }

                return;
            })

            var arr = [];
            response.forEach((res)=>{
                if (params.opcode[3] == 'A') {
                    if (res.currency == 'LRD' && res.sourceAccountNumber) {
                        arr.push(res.sourceAccountNumber);
                    }
                } else if (params.opcode[3] == 'B') {
                    if (res.currency == 'USD' && res.sourceAccountNumber) {
                        arr.push(res.sourceAccountNumber);
                    }
                }
            });
            //Get the correct state
            var nextStateDerived = "";
            if (arr.length > 0 && arr[0] != undefined) {
                if (params.opcode[2] == 'H' || params.opcode[2] == 'G') {
                    nextStateDerived = params.customization.states.SUCCESS_GETACCOUNTS_BEMS;
                }
                else if (params.opcode[2] == 'A' && params.opcode[3] == 'B') {
                    nextStateDerived = params.customization.states.SUCCESS_GETACCOUNTS_TR;
                } else if (params.opcode[2] == 'I' && params.opcode[3] == 'B') {
                    nextStateDerived = params.customization.states.SUCCESS_GETACCOUNTS_WT;
                }else if (params.opcode[2] == 'A' && params.opcode[3] == 'A') {
                    nextStateDerived = params.customization.states.SUCCESS_GETACCOUNTS_TR_LD;
                } else if (params.opcode[2] == 'I' && params.opcode[3] == 'A') {
                    nextStateDerived = params.customization.states.SUCCESS_GETACCOUNTS_WT_LD;
                } else if (params.opcode[2] == 'F') {
                    nextStateDerived = params.customization.states.SUCCESS_GETACCOUNTS_TP;
                }
                else if (params.opcode[2] == 'C') {
                    nextStateDerived = params.customization.states.SUCCESS_GETACCOUNTS_BEMS;
                }else{
					nextStateDerived = params.customization.states.SUCCESS_GETACCOUNTS_BEMS;
				}

                return assign(nextState(
                    params.language,
                    nextStateDerived,
                    params.customization.screens.SHOW_ACCOUNTS,
                    params.customization.images.SHOW_ACCOUNTS,
                    undefined,
                    undefined,
                    arr
                ));
            } else {
                throw errors.noAccountsCurrency()
            }

        }).catch(error => processError(error, params));
    } else {
        return Promise.resolve({ cardId, hsmError })
            .then(cms.cardParams)
            .catch(error => {
                assignParams(processOpCode(assignParams({ cardFlow: 'own' }))); // acquire language
                throw error;
            })
            .then(assignParams)
            .then(processOpCode)
            .then(assignParams)
            .then(checkLastTransaction(transfer))
            .then(processOperation(cms, transfer, atm))
            .catch(error => processError(error, params));
    }

}

function queryTerminal(bus, msg, atm) {
    var send = (methodName, params) => result => {
        params = params || {};
        params.luno = msg.luno;
        params.conId = msg.conId;
        return bus.importMethod(msg.source + '.' + methodName)(params);
    };

    var supplyCountersReply;
    return send('goOutOfServiceTemp')()
        .then(send('sendSupplyCounters'))
        .then(counters => (supplyCountersReply = counters))
        .then(send('goInService'))
        .then(send('sendConfiguration'))
        .then(configurationReply => atm.senfitsup({
            sensors: [assign({ atmId: msg.session.atmId }, configurationReply.sensors)],
            fitness: [assign({ atmId: msg.session.atmId }, configurationReply.fitness)],
            supplyStatus: [assign({ atmId: msg.session.atmId }, configurationReply.supplyStatus)],
            supplyCounters: [assign({ atmId: msg.session.atmId }, supplyCountersReply)]
        }));
}

function tiaReply(bus, msg, atm, customization) {
    var send = (methodName, params) => result => {
        params = params || {};
        params.luno = msg.luno;
        params.conId = msg.conId;
        return bus.importMethod(msg.source + '.' + methodName)(params);
    };
    return send('goOutOfService')()
        .then(send('sendSupplyCounters'))
        .then(counters => {
            counters.printReceipt = true;
            counters.customization = customization;
            return send('transactionReply', assign({
                coordination: msg.coordination,
                timeVariantNumber: msg.timeVariantNumber,
                transactionRequestId: msg.transactionRequestId,
                sernum: msg.sernum
            }, nextState(
                0,
                customization.states.TIAEND
            ), receipts.get(counters, { localDateTime: formatDate(Date.now(), 'YYYYMMDDHHmmss') })), 'tia')();
        })
        .then(send('goInService'));
}

// function querySupplyConfig(bus, msg) {
//     var send = (methodName, params) => result => {
//         params = params || {};
//         params.luno = msg.luno;
//         params.conId = msg.conId;
//         return bus.importMethod(msg.source + '.' + methodName)(params);
//     };
//     return send('sendConfigurationSuplies')();
// }

function saveDeviceAlert(dbTransfer, msg) {
    function strip() {
        var result = assign({}, msg);
        delete result.session;
        return result;
    }

    msg.session && msg.session.transferId && dbTransfer.event({
        transferId: msg.session.transferId,
        type: 'atm.' + msg.device + 'Fault',
        source: 'acquirer',
        state: 'alert',
        message: msg.deviceStatusDescription,
        udfDetails: strip()
    });
}

var transactionReply = (bus, msg, customization, dbTransfer, atm) => transfer => {
    if (msg.source === 'test') {
        return transfer;
    }
    transfer.conId = msg.conId;
    transfer.luno = msg.luno;
    transfer.emvCryptogramVerifyData = msg.emvCryptogramVerifyData || transfer.emvCryptogramVerifyData;
    transfer.emvCryptogramVerifyDataNI = transfer && transfer.transferDetails && transfer.transferDetails.emvCryptogramVerifyDataNI || '';
    transfer.emvResponseCodeNI = transfer && transfer.transferDetails && transfer.transferDetails.emvResponseCodeNI || '';
    transfer.isEmvCard = msg.isEmvCard || transfer.isEmvCard;
    transfer.transactionRequestId = msg.transactionRequestId;
    if (!transfer.requestCounters) {
        transfer.session = { transferId: transfer.transferId || false };
    }
    var sourceReply;

    return Promise.resolve(transfer.transferId && dbTransfer.requestAcquirer({
        transferId: transfer.transferId,
        type: 'transfer.requestAcquirer',
        message: 'Transaction reply',
        details: {
            sernum: transfer.sernum,
            cardReturn: transfer.cardReturn,
            nextState: transfer.nextState,
            screen: transfer.screen,
            type1Notes: parseInt(transfer.type1Notes),
            type2Notes: parseInt(transfer.type2Notes),
            type3Notes: parseInt(transfer.type3Notes),
            type4Notes: parseInt(transfer.type4Notes)
        }
    }))
        .then(result => bus.importMethod(msg.source + '.transactionReply')(transfer))
        .then(result => (sourceReply = result))
        .then(result => {
            if (result.descriptor === 'transactionReady') {
            // if (result.descriptor === '???') { // simulate fault
                if(!transfer.transferId && 
                    transfer.h2htransferDetails && 
                    transfer.h2htransferDetails.udfAcquirer && 
                    transfer.h2htransferDetails.udfAcquirer.cardFlow === 'externalNi'){
                    const confirmation = Object.assign({},
                        transfer.h2htransferDetails, 
                        {transferId: transfer.transferDetails[11]},
                        {transferCurrency: transfer.h2htransferDetails.amount.transfer.currency}
                        )
                    return Promise.resolve(dbTransfer.tssConfirmMCExtNI(confirmation))
                    .then((result) => {
                        return false;
                    })
                    .catch(error => {
                        return error;
                    });
                } else {
                    return Promise.resolve(transfer.transferId && dbTransfer.confirmAcquirer({
                        transferId: transfer.transferId
                    })).then(() => true);
                }
            } else {
                delete result.session;
                result.diagnosticStatus = '0000';//result.diagnosticStatus.replace(/[\x1D]/g,'GS')
                result.tokens[6] = '0000';
                if(!transfer.transferId){
                    delete transfer.transferDetails[39];
                    delete transfer.transferDetails[55];
                    transfer.transferDetails.MTI = '0420';
                    transfer.transferDetails.mtid = '0420';
                    return Promise.resolve(dbTransfer.h2hReversal({
                        reversalSource: "ATM",
                        reversal: transfer.transferDetails
                    }))
                    .then((result) => {
                        return true;
                    })
                    .catch(error => {
                        return error;
                    });
                }
                else return Promise.resolve(transfer.transferId && dbTransfer.failAcquirer({
                    transferId: transfer.transferId,
                    type: 'atm.' + result.device + 'Fault',
                    message: result.deviceStatusDescription,
                    details: result
                })).then(() => bus.importMethod(msg.source + '.transactionReply')(
                    assign({
                        conId: msg.conId,
                        luno: msg.luno,
                        coordination: msg.coordination,
                        transactionRequestId: result.transactionRequestId,
                        timeVariantNumber: result.timeVariantNumber
                    }, nextState(0, customization.states.ERR_CLOSE_WITH_MESSAGE, customization.screens.TXDENIED_TAKE_CARD))
                )).then(() => false)
                .catch(error => {
                    console.log('TXReplyError');
                    console.log(error);
                    return error;
                });
            }
        })
        .then(() => transfer.requestCounters && queryTerminal(bus, msg, atm))
        .then(() => transfer.tia && tiaReply(bus, msg, atm, customization))
        .then(() => sourceReply);
};

var assignCoordination = msg => transaction => assign({
    luno: msg.luno,
    coordination: msg.coordination,
    timeVariantNumber: msg.timeVariantNumber
}, transaction);

var infoLog = log => result => {
    log.info && log.info(result);
    return result;
};

var errorLog = log => result => {
    log.error && log.error(result);
    return result;
};

module.exports = getCustomization => {
    var customizations = {};
    var api = {};
    return {
        start: function () {
            api = {
                cms: cmsAPI(this.bus),
                transfer: transferAPI(this.bus),
                atm: atmAPI(this.bus)
            };
        },
        terminalFetch: function (msg) {
            return this.bus.importMethod('db/atm.terminal.fetch')(msg);
        },
        remoteCommand: function ({opcode, conId, atmId, terminalId, params}) {
            switch (opcode) {
                case 'goOutOfService':
                    return this.bus.importMethod('db/atm.offline.set')({ atmId })
                        .then(() => this.bus.importMethod('ncr.goOutOfService')({ conId }));
                case 'goInService':
                    return this.bus.importMethod('db/atm.offline.unset')({ atmId })
                        .then(() => this.bus.importMethod('ncr.goInService')({ conId }));
                case 'refreshKeys':
                    return this.bus.importMethod('db/atm.terminal.info[0]')({ terminalId })
                        .then(({tmk, luno, offline}) => this.bus.importMethod('ncr.goOutOfService')({ conId })
                            .then(() => this.bus.importMethod('ncr.keyChangeTak')({ conId, tmk, luno }))
                            .then(() => this.bus.importMethod('ncr.keyChangeTpk')({ conId, tmk, luno }))
                            .then(() => offline ? {} : this.bus.importMethod('ncr.goInService')({ conId }))
                            .catch(error => {
                                offline || this.bus.importMethod('ncr.goInService')({ conId });
                                throw error;
                            })
                        );
                case 'recoverDevice':
                    return this.bus.importMethod('atmAgent.recoverDevice')({ method: opcode, terminalId: terminalId, params: params });
                case 'restartMachine':
                    return this.bus.importMethod('atmAgent.restartMachine')({ method: opcode, terminalId: terminalId });
                default:
                    throw errors.badRequestType();
            }
        },
        transaction: function (msg) {
            if (!msg || !msg.session) {
                errorLog(this.log)(msg);
                return {};
            }
            if (msg.amount) {
                msg.amount = msg.amount.indexOf('.') != -1 ? msg.amount : msg.amount + '.00';
            }

            customizations[msg.session.customization] = customizations[msg.session.customization] || getCustomization(msg.session.customization);
            
            return Promise.resolve(processTransaction(api, msg, customizations[msg.session.customization], this.config && this.config.debug))
                .then(assignCoordination(msg))
                .then(transactionReply(this.bus, msg, customizations[msg.session.customization], api.transfer, api.atm))
                .then(infoLog(this.log))
                .catch(errorLog(this.log));
        },
        alert: function (msg, $meta) {
            $meta.mtid = 'discard';
            if (msg.session) {
                api.atm.alert(msg);
                switch (msg.device) {
                    case 'sensors':
                        (msg.session.loaded) && (msg.deviceStatus === '20') && queryTerminal(this.bus, msg, api.atm);
                        break;
                    case 'cardReader':
                    case 'cashHandler': saveDeviceAlert(api.transfer, msg);
                        break;
                }
            }
        },
        journal: function ({conId, journalData, source, session}, $meta) {
            $meta.mtid = 'discard';
            if (session && session.terminalId) {
                let now = new Date();
                let filename = `${session.terminalId}-${now.toISOString().substring(0, 10)}.txt`;
                this.bus.importMethod('journal.send')({
                    filename: filename,
                    data: journalData
                });
                return this.bus.notification(source + '.ejAck')({
                    lastChar: journalData.substr(24, 6),
                    conId: conId
                });
            }
        },
        load: function (msg) {
            var bus = this.bus;
            var terminalInfo;

            function send(methodName, params) {
                params = params || {};
                params.luno = terminalInfo && terminalInfo.luno;
                params.conId = msg.conId;
                if (customization && customization.flowMessages){ //&& customization.flowMessages[methodName]) {
                    params = customization.flowMessages[methodName](params);
                }
                if (params) {
                    return bus.importMethod(msg.source + '.' + methodName)(params);
                }
            }

            function notify(methodName, params) {
                params = params || {};
                params.luno = terminalInfo && terminalInfo.luno;
                params.conId = msg.conId;
                return bus.notification(msg.source + '.' + methodName)(params);
            }

            function screenLoad(screens) {
                return next => send('screenDataLoad', {
                    screenData: screens.join('\u001c')
                });
            }

            function stateLoad(states) {
                return next => send('stateTableLoad', {
                    stateTable: states.join('\u001c')
                });
            }

            function sendParts(items, size, sender) {
                var result = Promise.resolve(true);
                var rest = items.slice();
                while (rest.length) {
                    result = result.then(sender(rest.splice(0, size)));
                }
                return result;
            }

            var configId;
            var customization;

            function saveTerminalData(configurationReply) {
                return api.atm.senfit({
                    sensors: [assign({ atmId: terminalInfo.atmId }, configurationReply.sensors)],
                    fitness: [assign({ atmId: terminalInfo.atmId }, configurationReply.fitness)],
                    supplyStatus: [assign({ atmId: terminalInfo.atmId }, configurationReply.supplyStatus)]
                });
            }

            function saveSupplyCounters(supplyCountersReply) {
                return api.atm.supplyCounters({
                    supplyCounters: [assign({ atmId: terminalInfo.atmId }, supplyCountersReply)]
                });
            }

            return send('goOutOfService')
                .then(result => send('keyReadKvv'))
                .then(result => api.atm.terminalInfo(result.masterKvv, this.config.mock))
                .then(result => {
                    terminalInfo = result;
                    terminalInfo.customization = terminalInfo.customization || 'default';
                    customizations[terminalInfo.customization] = customization = getCustomization(terminalInfo.customization);
                    return result;
                })
                .then(result => send('keyChangeTak', {
                    tmk: terminalInfo.tmk
                }))
                .then(res => {
                    return res;
                })
                .then(result => send('keyChangeTpk', {
                    tmk: terminalInfo.tmk,
                    session: {
                        atmId: terminalInfo.atmId,
                        terminalId: terminalInfo.terminalId,
                        terminalName: terminalInfo.terminalName,
                        merchantId: terminalInfo.merchantId,
                        merchantType: terminalInfo.merchantType,
                        institutionCode: terminalInfo.institutionCode,
                        identificationCode: terminalInfo.identificationCode,
                        customization: terminalInfo.customization
                    }
                }))
                .then(result => send('currencyMappingLoad', {
                    currencyMappingData: currencyMapping(terminalInfo, customization.currencies),
                    cassettes: terminalInfo.cassettes,
                    session: {
                        cassettes: terminalInfo.cassettes
                    }
                }))
                .then(result => send('sendConfigurationId'))
                .then(result => {
                    configId = result.configId;
					configId=500;
                    return result;
                })
                .then(result => (configId !== customization.id) && send('paramsLoadEnhanced', {
                    options: customization.options.join(''),
                    timers: customization.timers.join(''),
                    newLuno: terminalInfo.luno.substr(0, 3)
                }))
                .then(result => (configId !== customization.id) && sendParts(customization.screenData, 20, screenLoad))
                .then(result => (configId !== customization.id) && sendParts(customization.stateData, 30, stateLoad))
                .then(result => (configId !== customization.id) && send('fitDataLoad', {
                    fitData: customization.fit.join('\u001c')
                }))
                .then(result => (configId !== customization.id) && customization.emvCurrency && send('emvCurrency', {
                    data: customization.emvCurrency
                }))
                .then(result => (configId !== customization.id) && customization.emvTransaction && send('emvTransaction', {
                    data: customization.emvTransaction
                }))
                .then(result => (configId !== customization.id) && customization.emvLanguage && send('emvLanguage', {
                    data: customization.emvLanguage
                }))
                .then(result => (configId !== customization.id) && customization.emvTerminal && send('emvTerminal', {
                    data: customization.emvTerminal
                }))
                .then(result => (configId !== customization.id) && customization.emvApplication && send('emvApplication', {
                    data: customization.emvApplication.join('\u001d')
                }))
                .then(result => (configId !== customization.id) && send('configIdLoad', {
                    configId: customization.id.substring(0, 4)
                }))
                .then(result => send('dateTimeLoad', {
                    dateTime: formatDate(Date.now(), 'YYMMDDHHmmss')
                }))
                .then(result => send('sendConfiguration'))
                .then(saveTerminalData.bind(this))
                .then(result => send('sendConfigurationHardware'))
                .then(result => send('sendConfigurationSuplies'))
                .then(result => send('sendConfigurationFitness'))
                .then(result => send('sendConfigurationSensor'))
                .then(result => send('sendConfigurationRelease'))
                .then(result => send('sendConfigurationOptionDigits'))
                // .then(result => send('sendConfigurationDepositDefinition'))
                .then(result => send('sendSupplyCounters'))
                .then(saveSupplyCounters.bind(this))
                .then(result => send(terminalInfo.offline ? 'goOutOfService' : 'goInService', { session: { loaded: true } }))
                .then(result => customization.ejOptions && customization.ejTimer && notify('ejOptions', {
                    options: customization.ejOptions.join(''),
                    timer: customization.ejTimer.join('')
                }))
                .then(result => {
                    // this.log.info && this.log.info(result);
                    return terminalInfo;
                })
                .catch((err) => {
                    this.log.error && this.log.error(err);
                    return Promise.reject(err);
                });
        }
    };
};

// todo card lookup timeout
// todo tx post timeout
// todo request_terminal_status
// todo check req/res counters and disconnect
// todo supervisor keys audit
// ut-log escape <!
// record cms.checkCard errors in db
