module.exports = [{
    ports: [
        require('../../script'),
        require('../../dbAtm'),
        require('../../tss'),
        require('../../cbl'),
        require('../../pos/posScript'),
        require('../../tssrest'),
        require('../../NI/DHI'),
        require('../../NI/H2H')

        //require('../../test/client/mambu-mock')
    ],
    modules: {
        'db/integration': require('../../dbAtm/integration')
    },
    validations: {
        'db/atm': require('ut-atm/validations/index.js')
    }
},
    require('ut-core')(),
    require('ut-transfer')(),
    require('ut-rule')(),
    require('ut-atm')(require('../../atm/customization')),
    require('ut-ped'),
    require('ut-pos'),
    require('ut-iso'),
    require('ut-ctp-payshield'),
    require('ut-alert')
];
