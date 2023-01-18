'use strict';
//const {formatDateTime, formatAmount, rightAlign, trace} = require('./utils');

module.exports =  {
    withdraw: require('./IBL/withdraw'),
    balance: require('./IBL/balance'),
    deposit: require('./IBL/deposit'),
    ministatement: require('./IBL/ministatement'),
    sale: require('./IBL/sale'),
    transfer: require('./IBL/transfer'),
    transferOtp: require('./IBL/transfer'),
    tranReport: require('./IBL/tranReport')
    //topup: require('./IBL/topup'),
    //bill: require('./IBL/bill'),
    //transferOtp: require('./IBL/transferOtp'),
    ///withdrawOtp: require('./IBL/withdrawOtp'),
    //changePin: require('./IBL/changePin'),
    //checkbook: require('./IBL/checkbook'),
    //error: require('./IBL/error'),
    //tia: require('./IBL/tia'),
    //journal: require('./IBL/journal'),
    //receipt: text => `${text}\u000c`
};
