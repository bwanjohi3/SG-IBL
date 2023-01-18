let pansDataGenFlag = 0;
module.exports = (config) => ({
    id: 'pan',
    queue: {
        // idle: 60000 * 10
        idle: 20000
    },
    requestTimeout: (config.db.card.dataGenCheckLimit || 100) * 1500,
    createPort: require('ut-port-jsonrpc'),
    url: 'http://localhost:8006',
    namespace: ['pan'],
    method: 'post',
    'idle.notification.receive': function(msg, $meta) {
        $meta.mtid = 'discard';
        if (pansDataGenFlag !== 0) {
            return {};
        }

        pansDataGenFlag = 1;
        // get pan list
        return this.bus.importMethod('card.dataGen.check')({limit: this.bus.config.db.card.dataGenCheckLimit || 100}, {})
            .then((result) => {
                if (result && result.pans && result.pans.length > 0) {
                    return new Promise((resolve, reject) => {
                        // get pan list
                        this.queue.push([result.pans, {
                            mtid: 'request',
                            method: 'pan.generateCvv.list',
                            callback: (msg, $meta) => {
                                if ((msg instanceof Error)) {
                                    return reject(msg);
                                }
                                resolve(msg);
                            }
                        }]);
                    })
                    .then((panData) => (this.bus.importMethod('card.dataGen.put')({panData})))
                    .catch(() => (0));
                }
                return 0;
            })
            .then(() => (pansDataGenFlag = 0));
    }
});
