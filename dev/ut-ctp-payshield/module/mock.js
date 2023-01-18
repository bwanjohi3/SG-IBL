module.exports = {
    ping: () => ({message: 'ping'}),
    generateTpk: () => ({
        tpkTmk: 'X8DAFC7B0881397F0FB51AB427F261FAE',
        tpkLmk: 'U55659B305EEB82FBF94D3B17176ABA5F'
    }),
    generateTak: () => ({
        takTmk: 'X8DAFC7B0881397F0FB51AB427F261FAE',
        takLmk: 'U55659B305EEB82FBF94D3B17176ABA5F'
    }),
    generateMac: () => ({
        mac: '5EA3153A'
    }),
    verifyMac: () => ({
        errorCode: '00'
    }),
    importZpk: () => ({
        zpk: 'U8463435FC4B4DAA0C49025272C29B12C'
    }),
    translateTpkZpk: () => ({
        pinBlock: 'A31118B71B2F9179'
    }),
    derivePin: () => ({
        pin: '12345'
    }),
    printPin: () => ({
        errorCode: '00'
    }),
    pinOffset: function({pinBlock, card}) {
        if (pinBlock === 'A31118B71B2F9179' && card === '5859901234567890') {
            return {
                offset: '6598FFFFFFFF'
            };
        } else {
            return {
                offset: 'invalid'
            };
        }
    }
};
