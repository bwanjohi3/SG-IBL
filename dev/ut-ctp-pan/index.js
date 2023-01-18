module.exports = () => ({
    ports: [
        require('./port/script')
    ],
    modules: {
        pan: require('./module/pan')
    },
    validations: {
        pan: require('./validation')
    }
});
