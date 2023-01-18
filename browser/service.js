require('ut-run').run({
    main: require('../desktop/service.js'),
    config: require('./service.dev.json'),
    method: 'debug'
});
