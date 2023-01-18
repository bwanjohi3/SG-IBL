var path = require('path');

module.exports = {
    start: function() {
        this.registerRequestHandler([{
            method: 'GET',
            path: '/s/card/{page*}',
            config: {auth: false},
            handler: {
                directory: {
                    path: path.join(__dirname, '../ui/assets'),
                    listing: false,
                    index: false,
                    lookupCompressed: true
                }
            }
        }]);
    }
};
