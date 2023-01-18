module.exports = {
    id: 'db',
    createPort: require('ut-port-sql'),
    createTT: true,
    retry: false,
    linkSP: [
        'atm',
        'ped',
        'iso',
        'core',
        'rule',
        'pos',
        'transfer',
        'card.info.get',
        'alert.queueOut.push'
    ],
    imports: [
        'db/transfer',
        'db/atm',
        'db/rule',
        'db/ped',
        'db/iso',
        'db/core',
        'db/pos',
        'db/integration',
        'db/card',
        'db/alert'
    ],
    namespace: [
        'db/transfer',
        'db/atm',
        'db/rule',
        'db/ped',
        'db/pos',
        'db/iso',
        'db/core',
        'db/integration',
        'db/card',
        'db/alert'
    ]
};
