module.exports = {
    id: 'atmScript',
    createPort: require('ut-port-script'),
    logLevel: 'trace',
    log: {
        transform: {
            session: 'hide'
        }
    },
    imports: ['atm']
};
