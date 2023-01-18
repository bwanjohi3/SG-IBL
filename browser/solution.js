require('ut-run').run({
    main: require('../desktop/solution.js'),
    config: require('./solution.dev.json'),
    method: 'debug'
});
