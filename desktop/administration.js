module.exports = {
    ports: [
        require('../ui/rpc'),
        require('../ui')
    ],
    modules: {
        'mainUI': require('../ui/administration/app.js')
    }
};
