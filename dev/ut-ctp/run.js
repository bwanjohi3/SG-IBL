module.exports = ({type, env, app}) => {
    switch (type) {
        case 'iso':
            return require('ut-run').run({
                main: require('./server/iso'),
                method: 'debug',
                env,
                app
            }, module.parent);
        case 'pos':
            return require('ut-run').run({
                main: require('./server/pos'),
                method: 'debug',
                env,
                app
            }, module.parent);
        case 'ncr':
            return require('ut-run').run({
                main: require('./server/ncr'),
                method: 'debug',
                env,
                app
            }, module.parent);
        case 'pan':
            return require('ut-run').run({
                main: require('./server/pan'),
                method: 'debug',
                env,
                app
            }, module.parent);
        case 'ped':
            return require('ut-run').run({
                main: require('./server/ped'),
                method: 'debug',
                env,
                app
            }, module.parent);
        default:
            return require('ut-run').run({
                main: require('./server'),
                method: 'debug',
                env,
                app
            }, module.parent);
    }
};
