'use strict';
function print(params, transfer, type) {
    let receipts = params.customization.receipts;
    let receiptTemplate = receipts[type];
    let receiptData = receipts.receipt;
    let journalTemplate = receipts.journal;
    let result = {
        printers: [{
            printer: '1',
            printerData: journalTemplate ? journalTemplate(transfer.transferId, transfer.transferIdAcquirer) : `TRN# ${transfer.transferId} SQN# ${('0000' + transfer.transferIdAcquirer).slice(-4)}`
        }]
    };
    if (params.printReceipt) {
        if (receiptTemplate) {
            result.printers.push({
                printer: '2',
                printerData: receiptData ? receiptData(receiptTemplate(params, transfer)) : `\u001b[000p\u001b[040q\u001b(I${receiptTemplate(params, transfer)}\u000c`
            });
        } else {
            result.printers.push({
                printer: '2',
                printerData: `\u001b[000p\u001b[040q\u001b(IReceipt for: ${type} not implemented\u000c`
            });
        }
    }
    return result;
}

module.exports = {
    journal: (params, transfer) => print(Object.assign({}, params, {printReceipt: false}), transfer),
    withdraw: (params, transfer) => print(params, transfer, 'withdraw'),
    balance: (params, transfer) => print(params, transfer, 'balance'),
    ministatement: (params, transfer) => print(params, transfer, 'ministatement'),
    topup: (params, transfer) => print(params, transfer, 'topup'),
    transfer: (params, transfer) => print(params, transfer, 'transfer'),
    transferOtp: (params, transfer) => print(params, transfer, 'transferOtp'),
    bill: (params, transfer) => print(params, transfer, 'bill'),
    withdrawOtp: (params, transfer) => print(params, transfer, 'withdrawOtp'),
    error: (params, transfer) => print(params, transfer, 'error'),
    tia: (params, transfer) => print(params, transfer, 'tia'),
    changePin: (params, transfer) => print(params, transfer, 'changePin'),
    get: print
};
