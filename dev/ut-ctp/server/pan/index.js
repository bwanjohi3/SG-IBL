module.exports = [
    require('ut-ctp-payshield')(),
    require('ut-ctp-pan')(),
    {
        ports: [
            require('../../port/httpServerCtp')
        ]
    }
];
