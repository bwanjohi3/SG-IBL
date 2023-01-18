module.exports = [
    require('ut-ctp-payshield')(),
    require('ut-ctp-pan')(),
    require('ut-ctp-aptra')(),
    {
        ports: [
            require('../../port/jsonRpcFlow'),
            require('../../port/httpServerCtp')
        ]
    }
];
