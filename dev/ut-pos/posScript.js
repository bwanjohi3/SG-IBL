'use strict';
const {currency} = require('ut-transfer')().modules;
let utRuleError = require('ut-rule')().modules.errors;
utRuleError['exceedMinLimitAmount'] = utRuleError['exceedMinAmount'];
utRuleError['exceedMaxLimitAmount'] = utRuleError['exceedMaxAmount'];
// importMethod ('xxx', {fallback: msg => {}})

function trim(s) {
    return (typeof s === 'string') ? s.trim() : s;
}

const transactionCodes = {
    'sale': '00',
    'withdraw': '01',
    'deposit': '21',
    'balance': '31',
    'ministatement': '38',
    'transfer': '40',
    'transferOtp': '42',
    'bill': '84',
    'checkbook': '91',
    'statement': '92',
    'accountlist': '99'
};


const fromIso200 = (msg) => {
    return {
        pan: msg.pan,
        amount: {transfer: currency.cents(msg[49], msg[5], 1)},
        localDateTime:  `${new Date().getFullYear()}${trim(msg[13])}${trim(msg[12])}`,
        currency: currency.alphabetic(trim(msg[49]))
    };
};
const toIso200 = (msg) => {
    return msg;
};
const fromIsoGetAccount = ({cardId}) => {
    return {cardId};
};
const toIsoGetAccount = ({msg, accounts}) => {
    return msg;
};

// TODO - transfer flow aftter issuer port response. BH**
// Reversal flows.
function execExternal(msg, $meta, operation) {
    return this.bus.importMethod(`${msg.profileName}/posScript.200.fromISO`)(msg)
    .then((transfer) => {
        return this.bus.importMethod('db/pos.binList.get')({binId: msg.binId}, {auth: {actorId: msg.session.channelId}})
            .then(res => {
                transfer.sourceCardProductId = res.binList && res.binList[0] && res.binList[0].productId;
                return this.bus.importMethod('transfer.rule.validate')(
                    transfer,
                    {auth: {actorId: msg.session.channelId}}
                )
            })
    })
    .then((res) => {
        res.bdk =  msg.session.bdk;
        res.ksn = msg.session.ksn;
        res.ksnDescriptor = msg.session.ksnDescriptor;
        return this.bus.importMethod('db/iso.terminal.info[0]')({institutionCode: 999991})
            .then(info => {
                let lastZpk = new Date(info.lastzpk);
                let now = new Date();
                let dif = now.setHours(now.getHours() + 3) - lastZpk;
                // change zpk after 24h
                if (dif > (24 * 60 * 60 * 1000)) {
                    return this.bus.importMethod('h2h/transfer.key.exchange')({})
                        .then(({zpk}) => {
                            res.zpk = zpk;
                            return res;
                        })
                        .catch(e => {
                            throw(e);
                        });
                }
                res.zpk = info.zpk;
                return res;
            });
    })
    .then((transfer) => {
        transfer.abortAcquirer = transfer.abortAcquirer || msg.abortAcquirer;
        return transfer;
    })
    .then(transfer =>
        this.bus.importMethod(operation)(
            transfer,
            {auth: {actorId: msg.session.channelId}}
        )
        .catch(error => {
            if(operation === 'transfer.push.reverse' && error.type === 'transfer.invalidTransferId' )
            { 
                transfer.operation = 'reverse';
                return transfer;
            } else { 
                transfer = error.transferDetails || transfer;
                delete error.transferDetails;
                transfer.error = error;
                return transfer;
            }
        })
        .then(transfer => {
            if (transfer.message && transfer.print && transfer.type) {
                transfer.error = Object.assign({}, transfer);
            }
            transfer.udfAcquirer = transfer.udfAcquirer || {};
            transfer.udfAcquirer.mti = Number(msg.mtid.substring(1, 4)) + 10;
            
            return transfer;
        }).then(res => Object.assign(msg, res))
        .then(this.bus.importMethod(`${msg.profileName}/posScript.200.toISO`, {fallback: toIso200}))
    )
    .catch(error => { // shouldn't happen
        this.log.error && this.log.error(error);
        return Object.assign(msg, {
            mtid: `0${Number(msg.mtid) + 10}`.slice(-4),
            39: '96'
        });
    });
}

function exec(msg, $meta, operation) {
    return this.bus.importMethod(`${msg.profileName}/posScript.200.fromISO`)(msg)
    .then((transfer) => {
        return this.bus.importMethod('transfer.rule.validate')(
            transfer,
            {auth: {actorId: msg.session.channelId}}
        )
    })
    .then((transfer) => {
        transfer.abortAcquirer = transfer.abortAcquirer || msg.abortAcquirer;
        return transfer;
    })
    .then(transfer =>
        this.bus.importMethod(operation)(
            transfer,
            {auth: {actorId: msg.session.channelId}}
        )
        .catch(error => {
            if(operation === 'transfer.push.reverse' && error.type === 'transfer.invalidTransferId' )
            { 
                transfer.operation = 'reverse';
                return transfer;
            } else { 
                transfer = error.transferDetails || transfer;
                delete error.transferDetails;
                transfer.error = error;
                return transfer;
            }
        })
        .then(transfer => {
            transfer.udfAcquirer = transfer.udfAcquirer || {};
            transfer.udfAcquirer.mti = Number(msg.mtid.substring(1, 4)) + 10;
            
            return transfer;
        }).then(res => Object.assign(msg, res))
        .then(this.bus.importMethod(`${msg.profileName}/posScript.200.toISO`, {fallback: toIso200}))
    )
    .catch(error => { // shouldn't happen
        this.log.error && this.log.error(error);
        return Object.assign(msg, {
            mtid: `0${Number(msg.mtid) + 10}`.slice(-4),
            39: '96'
        });
    });
}

function transaction(msg, $meta) {
    if(msg.flow === 'externalOwn') {
        return execExternal.call(this, msg, $meta, `${msg.issuerId}/transfer.push.execute`);
    }
    return exec.call(this, msg, $meta, 'transfer.card.execute');
}

function reversal(msg, $meta) {
    if(msg.flow === 'externalOwn') {
        return execExternal.call(this, msg, $meta, `${msg.issuerId}/transfer.push.reverse`);
    }
    return exec.call(this, msg, $meta, 'transfer.push.reverse');
}

function parameters(msg, $meta) {
    msg[39] = 99;
    return msg;
}

function getAccounts(msg, $meta) {
    let cur = currency.alphabetic(trim(msg[49]));
    return this.bus.importMethod(`${msg.profileName}/posScript.getAccounts.fromISO`)(msg)
    .then(({cardId}) => this.bus.importMethod('db/pos.account.list')({cardId, currency: cur}))
    .then(({accounts}) => {
        msg.session.accounts = accounts || ' ';
        return msg;
    })
    .then(this.bus.importMethod(`${msg.profileName}/posScript.getAccounts.toISO`));
}

function handleQuery(msg, $meta) {
    let data = msg[63].split(',');
    let operation = Object.keys(transactionCodes).reduce((tc,v) => {
        Object.assign(tc,{[transactionCodes[v]]: v});
        return tc;
    }, {})[data[0]];
    let sourceCardProductId = data[1];
    return this.bus.importMethod('rule.decision.lookup')({
        operation,
        sourceCardProductId,
        currency: currency.alphabetic(msg[49]),
        amount: parseInt(msg[4] || 0) / 100
    })
    .then((result) => {
        msg.session.sourceCardProductId = sourceCardProductId;
        msg[39] = '00';
        msg[63] = ('0'.repeat(12) + (result.amount.acquirerFee * 100)).slice(-12) +
            ('0'.repeat(12) + (result.amount.issuerFee * 100)).slice(-12) +
            ('0'.repeat(12) + (result.amount.commission * 100)).slice(-12);

        return msg;
    })
    .catch(e => {
        console.log(this);
        let errorType = e.cause && e.cause.type && e.cause.type.split('.')[1];
        msg[39] = '96';
        msg[62] = (utRuleError[errorType] && utRuleError[errorType]().print) || 'Unknown error!' + e.cause && e.cause.type;
        return msg;
    });

}

function load({terminalSerial, terminalNumber}) {
    return Promise.all([
        this.bus.importMethod('db/pos.terminal.info')({terminalSerial, terminalNumber}),
        this.bus.importMethod('db/pos.binList.fetch')({})
    ])
    .then(([{terminalInfo, keyInfo}, {binList = []}]) =>
        {
            return   {terminalInfo, keyInfo, binList};
        })
    .catch(e => {
        throw e;
    });
}

function fwinfo({terminalSerial, terminalNumber}) {
    return this.bus.importMethod('db/pos.terminal.fwinfo')({terminalSerial, terminalNumber})
    .then(result =>
        {
            return   result;
        });
}

function generateKsn({ksi, terminalNumber, counter = '0'}) {
    // KSN Pattern : Padding[4] + KSI[6] + terminalNumberHex[5]
    // Padding: FFFF
    // KSI[6]: Key Set Identifier - fro different BDK
    // terminalNumberHex[5]: this field is always even so it multiplied by 2 and convert to hex max val 524287 as hex 7FFFF
    // For the key generation KSN also have a counter for every transaction. Counter len is 5 hex char and last bit of terminalNumberHex.
    
    let counterHex = parseInt(counter).toString(16).slice(-6).toUpperCase();
    let plus1bit = counterHex.length >= 6 ? 1 : 0;
    counterHex = ("0000" + counterHex).slice(-5);
    let terminalNumberHex = (2 * parseInt(terminalNumber) + plus1bit).toString(16).toUpperCase();
    terminalNumberHex = ("0000" + terminalNumberHex).slice(-5);
    return `FFFF${ksi}${terminalNumberHex}${counterHex}`;
}


function error(msg, $meta) {
    this.log.error && this.log.error(msg.abortAcquirer);
    let {errorCode = '', method = ''} = msg.abortAcquirer;
    msg[39] = msg[39] || '06';
    if(errorCode === 'payshield.01' && method === 'payshield.verifyOffsetIbmDukpt') {
        msg[39] = '55';
    } else if(errorCode === 'payshield.01' && method === 'payshield.generateArqc4') {
        msg[39] = '89';
    } else if(errorCode === 'card.unknown') {
        msg[39] = '14';
    }
    return msg;
 }


function keyChange(msg, $meta) {
    delete msg[62];
    msg[39] = '99';
    if (msg.error) {
        msg[62] = msg.error;
        return Object.assign({}, msg, {mtid: `${msg.mtid[0]}810`});
    } else {
        if (msg.session.keyManageType === 2) {
            msg[48] = msg.tpk;
        }
        let posNewVersion =  Number(msg.session.newVersion.split('.').join(''));
        let posDeviceVersion = Number( msg.session.posVersion.split('.').join(''));
        let posCurentVersion = Number( msg.session.curentVersion.split('.').join(''));
        //msg.session.newVersion//:"01.01.00"
        //msg.session.posVersion//:"01.00.04"
        //transactionCodes
        let binList = msg.session.binList.map(b => {
            const transaction = JSON.parse(b.transaction).map(({key}) => transactionCodes[key])
                .filter(t => t).join('');
            return ('00000000' + parseInt(b.startBin).toString(16)).slice(-8) +
                ('00000000' + parseInt(b.endBin).toString(16)).slice(-8) +
                ('00000000' + parseInt(transaction.length / 2).toString(16)).slice(-8) +
                transaction +
                ('00000000' + parseInt(b.productId).toString(16)).slice(-8);
        });
        
        if(posNewVersion > posDeviceVersion) {  
            msg[63] = `{"adminPassword": ${msg.session.adminPassword} , "merchantPassword": ${msg.session.merchantPassword}}, "binList" : ${binList.join('')} , "alarm": { "id": 1 , "type": "onetime" , "action": "swupdate_dialog" , "DateTime": "imediately" , "active": "yes"}`;
            msg[39] = '00';
            return Object.assign({}, msg, {mtid: `${msg.mtid[0]}810`});
        } else if (posCurentVersion === posDeviceVersion) {
            let now = new Date();
            let serverDate = '';
            if(msg[13] !== ('0' + (1 + now.getMonth()) + now.getDate()).slice(-4)){
                let dt =  now.getFullYear().toString().slice(-2)
                    + ('0' + (1 + now.getMonth())).slice(-2)
                    + ('0' +now.getDate()).slice(-2)
                    + ('0' +now.getHours()).slice(-2)
                    + ('0' +now.getMinutes()).slice(-2)
                    + ('0' +now.getSeconds()).slice(-2);
                serverDate = `, "serverDateTime": ${dt} `;
        
            }
            
            msg[63] = `{"adminPassword": ${msg.session.adminPassword} , "merchantPassword": ${msg.session.merchantPassword}, "binList" : ${binList.join('')} ${serverDate}}`;
            msg[39] = '00';
            return Object.assign({}, msg, {mtid: `${msg.mtid[0]}810`});
        } else {
            msg[63] = `{"adminPassword": ${msg.session.adminPassword} , "merchantPassword": ${msg.session.merchantPassword}, "binList" : ${binList.join('')}}`;
            msg[39] = '00';
            return this.bus
            .importMethod('db/pos.terminal.edit')({
                terminal: {
                    actorId: msg.session.channelId,
                    currVersion: msg.session.posVersion
                }
            }, {auth: {actorId: msg.session.channelId}})
            .then(result => {
                return Object.assign({}, msg, {mtid: `${msg.mtid[0]}810`}); 
            }).catch((e) => {
                msg[39] = '99';
                return msg;
            });        
        }
    }  
}

function getTransactionReport(msg, $meta) {

    let formatDate = dateYYMMDD => {
        let year = '20' + dateYYMMDD.substring(0,2);
        let month = dateYYMMDD.substring(2,4);
        let day = dateYYMMDD.substring(4,6);

        return year + '-' + month + '-' + day;
    }

    msg[39] = '99';
    let params = {startDate: formatDate(msg.startDate) , endDate: formatDate(msg.endDate), channelId: msg.session.channelId}
    return this.bus
        .importMethod('transfer.report.byChannelId')(params , {auth: {actorId: msg.session.channelId}})
        .then(result => {
            
            msg.detailTranReport = result.detailTranReport;
            msg.summaryTranReport = result.summaryTranReport;  
            return Object.assign({}, msg, {mtid: `${msg.mtid[0]}810`}); 
        })
        .then(msg => {
            return this.bus.importMethod(`${msg.profileName}/posScript.getTransactionReport.toISO`)(msg);  
        })
        .catch((e) => {
            msg[39] = '99';
            return msg;
        });
}

module.exports = {
    id: 'posScript',
    createPort: require('ut-port-script'),
    logLevel: 'trace',
    findMethod: true,
    'posScript.drain': function(params) {
        return this.bus.notification('transfer.idle.execute')(params);
    },
    'posScript.getAccounts':getAccounts,
    'posScript.handleQuery':handleQuery,
    'posScript.0200': transaction,
    'posScript.0100': transaction,
    'posScript.0420': reversal,
    'posScript.0800': parameters,
    'posScript.error': error,
    'posScript.load': load,
    'posScript.fwinfo': fwinfo,
    'posScript.generateKsn': generateKsn,
    'posScript.keyChange': keyChange,
    'posScript.transactionReport': getTransactionReport,
    'posScript.firstInit': function(msg, $meta) {
        msg[39] = '99';
        delete msg[62];
        return this.bus
            .importMethod('db/pos.terminal.edit')({
                terminal: {
                    actorId: msg.session.channelId,
                   // terminalSerial: msg.session.terminalSerial,
                    fTmk: msg.session.fTmk,
                    fTmkKvv: msg.session.fTmkKvv,
                    kekDukpt: msg.session.kekDukptLmk,
                    kekDukptKvv: msg.session.kekDukptKvv,
                    keyManageType: msg.session.keyManageType,
                    tmk: msg.session.tmkLmk,
                    tmkkvv: msg.session.tmkKvk
                }
            }, {auth: {actorId: msg.session.channelId}})
            .then(result => {
               /* msg.session.ksn = msg.session.ksn || msg.session.test.ksn;
                msg.session.kekDukpt =  msg.session.kekDukpt ||  msg.session.test.kekDukpt;
                msg.session.kekDukptKvv = msg.session.kekDukptKvv || msg.session.test.kekDukptKvv;
                msg.session.keyDukpt = msg.session.keyDukpt || msg.session.test.keyDukpt;
                msg.session.keyDukptKvv = msg.session.keyDukptKvv || msg.session.test.keyDukptKvv;*/
                msg[39] = '00';
                if (msg.session.keyManageType === 3) {
                    msg[48] = msg.session.keyManageType + msg.session.kekDukpt.slice(1) + msg.session.kekDukptKvv + msg.session.keyDukpt.slice(1) + msg.session.ksn + msg.session.keyDukptKvv; // DUKPT KEYS
                } else {
                    msg[48] = msg.session.keyManageType + msg.session.tmkKekZmk.slice(1) + msg.session.tmkKekKvk + msg.session.tmkZmk.slice(1) + msg.session.tmkKvk; // MASTER-SESSION KEY
                }
                
                return Object.assign({}, msg, {mtid: `${msg.mtid[0]}810`}); 
            }).catch((e) => {
                msg[39] = '99';
                return msg;
            });;

        
    }
};
