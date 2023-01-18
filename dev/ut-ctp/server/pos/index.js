module.exports = [
    require('ut-ctp-payshield')(),
    require('ut-ctp-pan')(),
    require('ut-ctp-pos')(),
    {
        ports: [
            require('../../port/jsonRpcFlow'),
            require('../../port/httpServerCtp')
        ]
    }
];
