module.exports = {
    id: 'ui',
    createPort: require('ut-port-script'),
    logLevel: 'trace',
    namespace: ['mainUI'],
    imports: ['mainUI'],
    start() {
        this.bus.importMethod('mainUI.load')();
    }
};
