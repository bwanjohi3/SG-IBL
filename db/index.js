module.exports = {
    id: 'db',
    createPort: require('ut-port-sql'),
    createTT: true,
    retry: false,
    imports: [
        'core',
        'db/customer',
        'document',
        'user',
        'db/transfer',
        'db/atm',
        'db/pos',
        'db/aml',
        'card',
        'policy',
        'alert',
        'db/rule',
        'alert',
        'db/agent',
        'db/ledger',
        'mirrors',
        'bulk',
        'db__sql_import',
        // test && 'userTest',
        // test && 'ledgerTest',
        // test && 'customerTest',
        // test && 'auditTest',
        // test && 'db_test_sql_import',
        'externalAudit' // this should be imported at last
    ]
    //.filter(value => value)
    ,
    extendedAuthorization: {
        headerKey: 'x-extended-authorization',
        transportEncoding: 'base64',
        encryption: {
            keyLength: 32,
            algorithm: 'aes-256-ctr',
            encoding: 'base64'
        },
        totp: {
            step: 30,
            window: 2,
            encoding: 'base64'
        },
        uuid: {
            expirationSeconds: 60
        }
    }
}
//);
