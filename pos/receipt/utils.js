'use strict';
const THOUSANDS = /\B(?=(\d{3})+(?!\d))/g;

function getFormattedMonth(num) {
    let parsedNum = parseInt(num) - 1;
    let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[parsedNum];
}
module.exports = {
    formatDateTime: date => {
        return (date && `${date.substr(6, 2)}-${getFormattedMonth(date.substr(4, 2))}-${date.substr(0, 4)} ${date.substr(8, 2)}:${date.substr(10, 2)}:${date.substr(12, 2)}`) || '';
    },
    serNum: transfer => ('0000' + (transfer.transferIdAcquirer || '')).slice(-4),
    trace: transfer => `000000${transfer.issuerId === 'bancnet' ? transfer.issuerSerialNumber : transfer.transferId}`.slice(-6),
    formatAmount: amount => {
        if (amount == null || amount.amount == null) {
            return '';
        } else if (amount.scale) {
            var parts = amount.amount.toString().split('.');
            parts[0] = parts[0].replace(THOUSANDS, ',');
            return parts.join('.');
        } else {
            return amount.amount.toString().replace(THOUSANDS, ',');
        }
    },
    getPaddedStringWithSpaces: (currentValue, maxAllowedString) => {
        let maxStringLength = maxAllowedString.length;
        currentValue = currentValue ? currentValue.toString() : '';
        if (maxStringLength > currentValue.length) {
            let result = currentValue + ' '.repeat(maxStringLength - currentValue.length);
            return result;
        }
        return currentValue;
    },
    rightAlign: (value, len) => ' '.repeat(Math.max(len - value.length, 0)) + value
};
