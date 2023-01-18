/* eslint no-process-env: 0 */
module.exports = {
    server: require('../../server/admin/automation.js'),
    serverConfig: require('../../server/admin/' + (process.env.UT_ENV || 'test')),
    client: require('../client'),
    clientConfig: require('../client/' + (process.env.UT_ENV || 'test'))
};
