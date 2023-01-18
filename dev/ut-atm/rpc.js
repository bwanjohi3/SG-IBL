module.exports = {
    id: 'ncr',
    createPort: require('ut-port-jsonrpc'),
    url: 'http://localhost:8006',
    namespace: ['ncr', 'atmAgent'],
    method: 'post'
};
