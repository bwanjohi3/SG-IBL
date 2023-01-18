'use strict';

const NOR = "\x1B\x21\x02";//CLEAR STYLE
const BOL = "\x1B\x21\x08";//BOLD
const ALC = "\x1B\x61\x01";//CENTER

module.exports = (params, transfer) => {
    let header = ALC +'------------------------------\n' + BOL + ALC +  transfer.session.terminalName + NOR + '\n' + ALC + '------------------------------\n';
    if (transfer.session.header1 && transfer.session.header1.trim().length > 0) {
        header += ALC + transfer.session.header1 + '\n';
    }
    if (transfer.session.header2 && transfer.session.header2.trim().length > 0) {
        header += ALC + transfer.session.header2 + '\n';
    }
    if (transfer.session.header3 && transfer.session.header3.trim().length > 0) {
        header += ALC + transfer.session.header3 + '\n';
    }
    if (transfer.session.header4 && transfer.session.header4.trim().length > 0) {
        header += ALC + transfer.session.header4 + '\n';
    }
    if (header) {
        return [`${header}${NOR}`][0].toString();
    } else {
        return '';
    }
}

/*return [
    `${UTF8P}${BOL}ячоШ !:)${NOR}
    TerminalID: ${transfer.udfAcquirer.terminalId}
    Merchant Name
    ${BOL}AuthCode${NOR}
    DateTime: ${formatDateTime(transfer.localDateTime)}
    Account Number: ${Array(transfer.sourceAccount.length - 3).join("*") + transfer.sourceAccount.substr(-3)}
    RNN: 1333
    Balance: ${transfer.balance.available.amount} ${transfer.balance.available.currency}
    ${BOL}BALANCE INQUERY${NOR} \n\n\n\n\n\n\n
    `][0].toString();
    }*/