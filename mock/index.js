var bio = require('./bio');

module.exports = {
    bio: function(config) {
        return {
            id: 'bioMockServer',
            createPort: require('ut-port-httpserver'),
            logLevel: 'trace',
            port: config.mock.port,
            start: function() {
                let bioRoutes = bio.hapiRoutes(this.bus);
                this.registerRequestHandler(bioRoutes);
            }
        };
    }
};
