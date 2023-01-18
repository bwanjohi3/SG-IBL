'use strict';
const assign = require('lodash.assign');

function keyDecimal(key) {
    return key.slice(-32).match(/.{2}/g).map(x => ('000' + Number.parseInt(x, 16)).slice(-3)).join('');
}

function mac(msg, $meta, context) {
    return this.bus.importMethod('hsm.generateMac')({
        message: this.codec.encode(msg, {
            opcode: $meta.opcode
        }, {
            transactionRequestId: context.transactionRequestId,
            transactionReplyTime: context.transactionReplyTime
        }).toString(),
        keyType: 'TAK',
        key: context.session.tak
    }).then((result) => {
        msg.mac = result.mac;
        return msg;
    });
}

function verifyMac(msg, $meta, context) {
    return this.bus.importMethod('hsm.verifyMac')({
        message: msg.raw,
        keyType: '003',
        key: context.session.tak,
        mac: msg.mac
    });
}

module.exports = {
    id: 'ncr',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    log: {
        transform: {
            session: 'hide',
            screenData: 'hide',
            stateTable: 'hide'
        }
    },
    port: 5001,
    listen: true,
    disconnectTimeout: 30,
    
    queue: {
        idle: 60000
    },
    idleSend: 60000,
    idleReceive: 130000,
    format: {
        size: '16/integer',
        codec: require('ut-codec-ndc')
    },
    verifyMac: true,
    receive: function(msg, $meta, context) {
        return Promise.resolve(msg)
            .then(() => {
                if (this.config.verifyMac && msg.session && msg.raw && msg.mac && ['solicitedStatus', 'aptra.transaction'].includes($meta.method)) {
                    return verifyMac
                        .call(this, msg, $meta, context)
                        .then(() => {
                            delete msg.raw;
                            delete msg.mac;

                            return msg;
                        })
                        .catch(error => {
                            this.disconnect(error);
                        });
                }

                return msg;
            })
            .then(msg => {
                const monitoringStatus = {
                    session: context.session,
                    connected: true,
                    conId: context.conId
                };
                
                if ($meta.mtid === 'response' && context.session) {
                    switch ($meta.opcode) {
                        case 'goInService':
                            context.session.inService = true;
                            break;
                        case 'goOutOfService':
                        case 'goOutOfServiceTemp':
                            context.session.inService = false;
                            break;
                    }
                    if (msg.statusType === 'configuration') {
                        Object.assign(monitoringStatus, msg);
                        context.session.paperSupply = msg.supplyStatus.receiptPrinter;
                        context.session.hfReceipt = msg.fitness.receiptPrinter;
                    } else if (['fitness', 'sensor', 'supplies', 'suppliesStatus', 'supplyCounters'].includes(msg.statusType)) {
                        Object.assign(monitoringStatus, msg);
                    }
                }
                this.bus.importMethod('monitoring.publishAtmStatus')(monitoringStatus);
                $meta.source = this.config.id;

                return msg;
            });
    },
    'idle.notification.receive': function(msg, $meta, ctx) {
        ctx.session && ctx.session.loaded && this.queues[$meta.conId].push([{}, {
            mtid: 'request',
            opcode: 'sendConfiguration',
            callback: msg => msg
        }]);
        $meta.mtid = 'discard';
    },
    'disconnected.notification.receive': function(msg, $meta, ctx) {
        $meta.mtid = 'discard';
        this.bus.importMethod('monitoring.publishAtmStatus')({
            session: ctx.session,
            connected: false
        });
    },
    'connected.notification.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
        return this.bus.importMethod('atm.load')({ // ut-atm/flow.js:load
            source: this.config.id,
            conId: $meta.conId
        }, {
            retry: 5000,
            timeout: Date.now() + 1000 * this.config.disconnectTimeout
        })
        .catch(error => this.disconnect(error));
    },
    'idleSend.event.receive': function(msg, $meta, ctx) {
        if (ctx.session && ctx.session.loaded) {
            $meta.dispatch = () => [{}, {
                mtid: 'request',
                method: 'sendConfiguration',
                opcode: 'sendConfiguration',
                dispatch: () => false
            }];
        }
    },
    'disconnected.event.receive': function(msg, $meta, ctx) {
        ctx && ctx.session && this.bus.importMethod('monitoring.publishAtmStatus')({
            session: ctx.session,
            connected: false
        });
    },
    'connected.event.receive': function(msg, $meta) {
        return this.bus.importMethod('atm.load')({ // ut-atm/flow.js:load
            source: this.config.id,
            conId: $meta.conId
        }, {
            retry: 5000,
            timeout: Date.now() + 1000 * this.config.disconnectTimeout
        })
        .then(() => false)
        .catch(error => this.disconnect(error));
    },
    'stateTableLoad.request.send': mac,
    'transactionReply.request.send': function(msg, $meta, ctx) {
        if (msg.transferDetails) {
            this.bus.importMethod('monitoring.publishAtmTransfer')({
                session: ctx.session,
                transfer: {
                    txId: msg.transferDetails.transferId,
                    cardNumber: msg.transferDetails.cardNumber,
                    transactionTime: msg.transferDetails.transferDateTime,
                    debitAccount: msg.transferDetails.sourceAccount,
                    creditAccount: msg.transferDetails.destinationAccount,
                    description: msg.transferDetails.description,
                    amount: msg.transferDetails.transferAmount,
                    reversed: msg.transferDetails.reversed,
                    cardProductName: msg.transferDetails.cardProductName,
                    deviceId: ctx.session && ctx.session.terminalId,
                    deviceLocation: ctx.session && ctx.session.terminalName,
                    responseCode: msg.transferDetails.responseCode, // ?
                    style: msg.transferDetails.style, // ?
                    additionalInfo: '', // ?
                    alerts: msg.transferDetails.alerts, // ?
                    merchant: '', // ?
                    reversalCode: '', // ?
                    currency: msg.transferDetails.transferCurrency,
                    // cardFlow: msg.transferDetails.udfAcquirer.cardFlow,
                    issuerId: msg.transferDetails.issuerId
                }
            });
        }

        return Promise
        .resolve(msg.emvCryptogramVerifyData)
            .then((emvCryptogramVerifyData) => {
                var emvResponseCode = msg.emvResponseCodeNI ? msg.emvResponseCodeNI : msg.emvResponseTag || '00';
                var emvResponseCodeHex = Buffer.from(emvResponseCode).toString('hex');
                delete msg.emvResponseTag;
                // BZV add Issuer scripts here
                if(msg.emvCryptogramVerifyDataNI) {
                    const emvTags = Object.assign(
                        {},
                        {authorisationResponseCode: {
                            val: emvResponseCodeHex, 
                            idx: 2}
                        },
                        {issuerAuthenticationData: {
                            idx: 1,
                            val: msg.emvCryptogramVerifyDataNI.val.toUpperCase()} // invalid card number
                        },
                        // {issuerAuthenticationData: {
                        //     idx: 1,
                        //     val: msg.emvCryptogramVerifyDataNI.val.toUpperCase() + 
                        //     emvResponseCodeHex} // invalid card number
                        // },

                        msg.transferDetails && msg.transferDetails.emvTags && msg.transferDetails.emvTags.issuerScriptTemplate1 ? {issuerScriptTemplate1: msg.transferDetails.emvTags.issuerScriptTemplate1} : null,
                        msg.transferDetails && msg.transferDetails.emvTags && msg.transferDetails.emvTags.issuerScriptTemplate2 ? {issuerScriptTemplate2: msg.transferDetails.emvTags.issuerScriptTemplate2} : null
                    )
                    if(
                        msg &&
                        msg.transferDetails &&
                        msg.transferDetails.emvTags &&
                        msg.transferDetails.emvTags.issuerScriptTemplate1 &&
                        msg.transferDetails.emvTags.issuerScriptTemplate1.val ) {
                        msg.transferDetails.emvTags.issuerScriptTemplate1.val = msg.transferDetails.emvTags.issuerScriptTemplate1.val.toUpperCase();
                    }
                    if(
                        msg &&
                        msg.transferDetails &&
                        msg.transferDetails.emvTags &&
                        msg.transferDetails.emvTags.issuerScriptTemplate2 &&
                        msg.transferDetails.emvTags.issuerScriptTemplate2.val &&
                        msg.transferDetails.emvTags.issuerScriptTemplate2.val ) {
                        msg.transferDetails.emvTags.issuerScriptTemplate2.val = msg.transferDetails.emvTags.issuerScriptTemplate2.val.toUpperCase();
                    }
                    // if(
                    //     msg &&
                    //     msg.transferDetails &&
                    //     msg.transferDetails.emvTags &&
                    //     msg.transferDetails.emvTags.issuerScriptTemplate1 &&
                    //     msg.transferDetails.emvTags.issuerScriptTemplate1.val &&
                    //     msg.transferDetails.emvTags.issuerScriptTemplate1.val.issuerScriptCommand &&
                    //     msg.transferDetails.emvTags.issuerScriptTemplate1.val.issuerScriptCommand.val ) {
                    //     msg.transferDetails.emvTags.issuerScriptTemplate1.val.issuerScriptCommand.val = msg.transferDetails.emvTags.issuerScriptTemplate1.val.issuerScriptCommand.val.toUpperCase();
                    // }
                    // if(
                    //     msg &&
                    //     msg.transferDetails &&
                    //     msg.transferDetails.emvTags &&
                    //     msg.transferDetails.emvTags.issuerScriptTemplate2 &&
                    //     msg.transferDetails.emvTags.issuerScriptTemplate2.val &&
                    //     msg.transferDetails.emvTags.issuerScriptTemplate2.val.issuerScriptCommand &&
                    //     msg.transferDetails.emvTags.issuerScriptTemplate2.val.issuerScriptCommand.val ) {
                    //     msg.transferDetails.emvTags.issuerScriptTemplate2.val.issuerScriptCommand.val = msg.transferDetails.emvTags.issuerScriptTemplate2.val.issuerScriptCommand.val.toUpperCase();
                    // }
                    console.log(emvTags);
                    return Object.assign(
                        {},
                        {emvTags},
                        msg
                    );
                    // return Object.assign({emvTags: {
                    //     authorisationResponseCode: {val: emvResponseCodeHex, idx: 1},
                    //     issuerAuthenticationData: {
                    //         idx: 0,
                    //         val: msg.emvCryptogramVerifyDataNI.val.toUpperCase() + // arpc
                    //         emvResponseCodeHex // invalid card number
                    //     }
                    // }}, msg);
                }
                else if (msg.emvCryptogramVerifyData) {
                    return this.bus.importMethod('pan.emvResponse.get')({
                        emvCryptogramVerifyData,
                        emvResponseTag: emvResponseCode
                    })
                    .then((emv) => {
                        delete msg.emvCryptogramVerifyData;
                        return Object.assign({emvTags: {
                            authorisationResponseCode: {val: emvResponseCodeHex, idx: 1},
                            issuerAuthenticationData: {
                                idx: 0,
                                val: emv.arpc + // arpc
                                emvResponseCodeHex
                            }
                        }}, msg);
                    });
                } else if (msg.isEmvCard) {
                    emvResponseCodeHex = Buffer.from('00').toString('hex');
                    return Object.assign({emvTags: {
                        authorisationResponseCode: {val: emvResponseCodeHex, idx: 1},
                        issuerAuthenticationData: {
                            idx: 0,
                            val: '0000000000000000'
                        }
                    }}, msg);

                    // BZV why 14
                    // emvResponseCodeHex = Buffer.from('14').toString('hex');
                    // return Object.assign({emvTags: {
                    //     authorisationResponseCode: {val: emvResponseCodeHex, idx: 1},
                    //     issuerAuthenticationData: {
                    //         idx: 0,
                    //         val: '0000000000000000' + // arpc
                    //         emvResponseCodeHex // invalid card number
                    //     }
                    // }}, msg);
                }
                return msg;
            })
            .then((r) => (mac.call(this, r, $meta, ctx)));
    },
    'currencyMappingLoad.request.send': mac,
    'fitDataLoad.request.send': mac,
    'emvCurrency.request.send': mac,
    'emvTransaction.request.send': mac,
    'emvLanguage.request.send': mac,
    'emvTerminal.request.send': mac,
    'emvApplication.request.send': mac,
    'keyChangeTak.request.send': function(msg, $meta) {
        // debugger;
            let mode = 1; // Under ZMK
            let keyTypeTmk = 'TAK';
            let keyScheme = 'U';
            let zmkTmkFlag = 1; // Under TMK
            let keyZmkTmk = msg.tmk;
            let keyScheme1 = 'X';
            return this.bus.importMethod('hsm.generateKeyTmk')({mode, keyType: keyTypeTmk, keyScheme, zmkTmkFlag, tmk: keyZmkTmk, keyScheme1})
            .then((result) => {
                // debugger;
                let rest = String.fromCharCode.apply(null, result.rest.data);
                let takTmk = rest.slice(0, -6);
                let takLmk = result.keyA32;
                return {
                tak: takLmk,
                key: '030' + keyDecimal(takTmk),
                session: assign({tak: takLmk}, msg.session)
            }
        })
        .catch(error => {
            console.log(error);
        })
    },
    'keyChangeTpk.request.send': function(msg, $meta) {
        this.bus.importMethod('monitoring.publishAtmStatus')({
            session: msg.session,
            connected: true
        });
        let mode = 1; // Under ZMK
        let keyTypeTmk = 'TPK';
        let keyScheme = 'U';
        let zmkTmkFlag = 1; // Under TMK
        let keyZmkTmk = msg.tmk;
        let keyScheme1 = 'X';
        return this.bus.importMethod('hsm.generateKeyTmk')({mode, keyType: keyTypeTmk, keyScheme, zmkTmkFlag, tmk: keyZmkTmk, keyScheme1})
        .then((result) => {
            let rest = String.fromCharCode.apply(null, result.rest.data);
            let tpkKcv = rest.slice(-6);
            let tpkTmk = rest.slice(0, -6);
            let tpkLmk = result.keyA32;
            return {
            tpk: tpkLmk,
            key: '030' + keyDecimal(tpkTmk),
            session: assign({tpk: tpkLmk}, msg.session)
        }});
    }
};
// todo handle connected error
