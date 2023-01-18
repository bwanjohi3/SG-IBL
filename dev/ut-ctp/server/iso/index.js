module.exports = [
    require('ut-ctp-payshield')(),
    require('ut-ctp-pan')(),
    require('ut-ctp-iso')(),
    {
        ports: [
            require('../../port/jsonRpcFlow'),
            require('../../port/httpServerCtp')
        ]
    }
];
