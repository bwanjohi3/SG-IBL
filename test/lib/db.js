/* eslint no-process-env: 0 */
module.exports = {
    server: require('../../server/db/'),
    serverConfig: require('../../server/db/' + (process.env.UT_ENV || 'test')),
    client: require('../client')({login: true}),
    clientConfig: require('../client/' + (process.env.UT_ENV || 'test'))
};
