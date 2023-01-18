module.exports = {
    id: 'flow',
    createPort: require('ut-port-jsonrpc'),
    url: 'http://localhost:8005',
    namespace: ['atm', 'isoScript', 'pedScript', 'posScript', 'db/card'],
    method: 'post'
};
