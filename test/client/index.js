module.exports = {
    ports: [
        require('../../ui/rpc'),
        {
            id: 'db',
            createPort: require('ut-port-sql'),
            createTT: true,
            retry: false,
            imports: [
                'userTest',
                // 'coreTest',
                'ledgerTest',
                'customerTest',
                'auditTest'
            ]
        }
    ],
    modules: {
        userTest: require('ut-user/test'),
        // coreTest: require('ut-core/test'),
        ledgerTest: require('ut-ledger/test'),
        customerTest: require('ut-customer/test'),
        auditTest: require('ut-audit/test')
    }
};
