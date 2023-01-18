module.exports = {
    init: function(bus) {
        switch (bus && bus.config && bus.config.hsm && bus.config.hsm.mode) {
            case 'sim': Object.assign(module.exports, require('./sim'));
                break;
            case 'mock': Object.assign(module.exports, require('./mock'));
                break;
            default: Object.assign(module.exports, require('./prod')(bus.config));
                break;
        }
    }
};
