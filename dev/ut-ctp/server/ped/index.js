module.exports = [
    require('ut-ctp-payshield')(),
    require('ut-ctp-ped')(),
    {
        ports: [
            require('../../port/jsonRpcFlow'),
            require('../../port/httpServerCtp')
        ]
    }
];
