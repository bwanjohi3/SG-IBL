'use strict';
// var joi = require('joi');

module.exports = {
    description: 'Download embosser file',
    notes: ['get embosser file'],
    tags: ['card', 'batch', 'download', 'file', 'get'],
    isRpc: false,
    disableXsrf: true,
    httpMethod: 'GET',
    route: '/rpc/batch/download/{batchId}'
};
