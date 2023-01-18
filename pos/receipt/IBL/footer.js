'use strict';

const NOR = "\x1B\x21\x02";//CLEAR STYLE
const ALC = "\x1B\x61\x01";//CENTER

module.exports = (params, transfer) => {
    let footer = '';
    if (transfer.session.footer1 && transfer.session.footer1.trim().length > 0) {
        footer +=  ALC + transfer.session.footer1 + '\n';
    }
    if (transfer.session.footer2 && transfer.session.footer2.trim().length > 0) {
        footer +=  ALC + transfer.session.footer2 + '\n';
    }
    if (transfer.session.footer3 && transfer.session.footer3.trim().length > 0) {
        footer +=  ALC + transfer.session.footer3 + '\n';
    }
    if (footer) {
        return [`${ALC}${footer}${NOR}`][0].toString();
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