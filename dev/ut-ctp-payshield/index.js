module.exports = () => ({
    ports: [
        require('./port/tcpPayshield'),
        require('./port/scriptHsm')
    ],
    modules: {
        hsm: require('./module/payshield')
    }
});
