module.exports = [
    require('ut-ctp-payshield')(),
    require('ut-ctp-pan')(),
    require('ut-ctp-iso')(),
    require('ut-ctp-aptra')(),
    require('ut-ctp-ped')(),
    require('ut-ctp-pos')(),

    {
        ports: [
            require('./port/jsonRpcFlow'),
            require('./port/httpServerCtp')
        ]
    }
];
