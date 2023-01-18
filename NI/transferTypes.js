const types = {
    '110': 'sale',
    '010': 'withdraw',
    '020': 'deposit',
    '030': 'balance', // ATM
    '115': 'withdraw',//'cashadvance',
    '117': 'balance', // POS
    '138': 'ministatement',//POS
    '071': 'ministatement',//ATM
    '081': 'changePin',
    '040': 'transfer', // ATM
    '137': 'transfer', // POS
    '050': 'bill',
    '070': 'statement'
};
const codes = {
    'salePOS': '110',
    'withdrawExternalOwnATM': '010',
    'balanceExternalOwnATM': '030',
    'ministatementExternalOwnATM': '071',
    'changePinExternalOwnATM':'081',
    'withdrawExternalNiATM': '010',
    'balanceExternalNiATM': '030',
    'ministatementExternalNiATM': '071',
    'changePinExternalNiATM':'081',
    'withdrawPOS': '115',
    'depositATM': '020',
    'depositPOS': '020',
    'balanceATM': '030',
    'balancePOS': '117',
    'ministatementATM': '071',
    'ministatementPOS': '138',
    'transferATM': '040',
    'transferPOS': '137',
    'bill': '050',
    'statement': '070'
};

const typesNI2SG  = {
    '110': '00',
    '010': '01',
    '020': '21',
    '030': '30', 
    '115': '01',
    '117': '30',
    '138': '38',
    '071': '38',
    '081': '96',
    '040': '40',
    '137': '40',
    '050': '84',
    '070': '92'
};

module.exports = {types, codes, typesNI2SG};
