module.exports = {
    id: 'monitoring',
    createPort: require('ut-port-httpserver'),
    logLevel: 'trace',
    host: '127.0.0.1',
    connections: [{routes: {security: {xss: true}}}],
    validationPassThrough: true,
    imports: ['posMonitoring.httpServer.start'],
    appId: 'posMonitoring',
    identityNamespace: false
};
