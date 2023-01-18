const types = {
    '00': 'sale',
    '01': 'withdraw',
    '21': 'deposit',
    '30': 'balance', // ATM
    '31': 'balance', // POS
    '38': 'ministatement',//POS
    '40': 'transfer', // INTRA
    '40': 'transfer', // INTRA
    '42': 'transferOtp', // INTRA
    '44': 'transfer', // INTER
    '84': 'bill',
    '91': 'checkbook',
    '92': 'statement',
    '99': 'accountlist'
};
const codes = {
    'sale': '00',
    'withdraw': '01',
    'deposit': '21',
    'balance': '30',
    'ministatement': '38',
    'transfer': '40',
    'transferOtp': '42',
    'bill': '84',
    'checkbook': '91',
    'statement': '92',
    'accountlist': '99'
};
module.exports = {types, codes};
