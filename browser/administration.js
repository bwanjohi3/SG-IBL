require('ut-run').run({
    main: require('../desktop/administration.js'),
    config: require('./administration.dev.json'),
    method: 'debug'
});
