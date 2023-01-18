'use strict';
const tls = require('tls');
const {readFileSync} = require('fs');
const {terminalId, brand, key, cert, remotePort, remoteHost} = require('./config.json');

const commands = {
    getTerminalId: () => ({terminalId}),
    idle: () => ({})
};

switch (brand) {
    case 'diebold':
        Object.assign(commands, require('./diebold.js'));
        break;
}

(function connect() {
    const options = {
        rejectUnauthorized: false,
        key: readFileSync(key, 'utf8'),
        cert: readFileSync(cert, 'utf8')
    };
    const socket = tls.connect(remotePort, remoteHost, options);

    socket.on('data', data => {
        const request = JSON.parse(data.slice(2).toString());
        let response = {
            jsonrpc: '2.0',
            method: request.method,
            id: request.id
        };
        try {
            response.result = commands[request.method](request.params);
        } catch (error) {
            response.error = {
                message: error.message,
                code: error.code,
                errorMessage: error.errorMessage,
                errorStack: error.errorStack
            };
        }
        response = JSON.stringify(response);
        const lenBuffer = Buffer.allocUnsafe(2);
        lenBuffer.writeInt16BE(response.length);
        const responseBuffer = new Buffer(response, 'utf8');
        socket.write(Buffer.concat([lenBuffer, responseBuffer]));
    });

    socket.on('error', e => console.log(e)); // eslint-disable-line
    socket.on('close', () => setTimeout(connect, 2000));
})();
