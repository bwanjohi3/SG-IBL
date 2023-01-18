module.exports = {
    id: 'monitoring',
    createPort: require('ut-port-httpserver'),
    logLevel: 'trace',
    host: '127.0.0.1',
    port: 8007,
    validationPassThrough: true,
    imports: ['monitoring'],
    appId: 'monitoring',
    identityNamespace: false
};
