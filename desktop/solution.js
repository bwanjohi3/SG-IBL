module.exports = {
    ports: [
        require('../ui/rpc'),
        require('../ui')
    ],
    modules: {
        'mainUI': require('../ui/solution/app.js')
    }
};
