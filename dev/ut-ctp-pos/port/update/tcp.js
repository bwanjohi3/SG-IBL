'use strict';
var fs = require('fs');
const path = require('path');

const readFile = (filename, offset, length, position) => {
    let fn = filename;//path.join(__dirname, filename);

    return (new Promise((resolve, reject) => fs.open(fn, 'r', (err, fd) => {
        if (err) {
            return reject(err);
        }
        resolve(fd);
    })))
        .then((fd) => new Promise((resolve, reject) => fs.read(fd, Buffer.alloc(length, 0), offset, length, position, (err, bytesRead, buffer) => {
            if (err) {
                return reject(err);
            }
            resolve(buffer);
        })));
};

const fileInfo = (filename) => {
    let fn = filename;//path.join(__dirname, filename);

    return (new Promise((resolve, reject) => fs.stat(fn, (err, fd) => {
        if (err) {
            return reject(err);
        }
        resolve(fd);
    })));
};

module.exports = {
    id: 'update',
    createPort: require('ut-port-tcp'),
    logLevel: 'trace',
    port: '14002',
    listen: true,
    disconnectTimeout: 30,
    timeout: 55000,
    ssl: false,
    format: {
        size: '16/integer',
        codec: require('ut-codec-string')
    },
    start: function() {

    },
    connRouter: function() {
        return this.conCount;
    },
    'disconnected.notification.receive': function(msg, $meta, ctx) {
        return msg;
    },
    'connected.notification.receive': function(CONNECT, $meta, context) {
        $meta.mtid = 'discard';
        context.session = {};
        context.session.cnt = 0;
        context.session.fileSize = 0;
        // context.session.packSize = 1024;
        context.session.packSize = 2048;
        context.session.inProgres = 0;
        context.session.totalPacks = 0;
        context.session.currentPack = -1;
        context.session.termId = '';
        context.session.termSn = '';
        // context.session.fileName = "test.BIN";
        //context.session.fileName = 'C:\\ProgramData\\SoftwareGroup\\UnderTree\\iblatmpos\\uploads\\1532069146034_AP_S.BIN';//'AP_S.BIN';
        // context.session.fileName = "testfile.txt";
        return CONNECT;
    },
    receive: function(msg, $meta, context) {
        $meta.method = 'update.send';       
         let initData = msg.split(',');
         if(initData[0]==='INIT') {
            context.session.termId = initData[1];
            context.session.termSn = initData[2];
         }

        const getTerminalInfo = () => {
            return Promise.resolve()
            .then(() => {
                if (context.session.terminalInfo) {
                    return context.session.terminalInfo;
                }
                return this.bus.importMethod('posScript.fwinfo')({terminalNumber: `${context.session.termId}`})
                .then(terminalInfo => (context.session.terminalInfo = terminalInfo && terminalInfo));
            }); 
        }

       //return this.bus.importMethod('posScript.fwinfo')({terminalNumber: '101011'})
       return getTerminalInfo()
             .then((terminalInfo) => {
                
                 if (context.session.inProgres === 0) {
                    context.session.inProgres = 1;
                    //return fileInfo(context.session.fileName)//(terminalInfo.firmwarePath)
                    return fileInfo(terminalInfo.firmwarePath)
                        .then((res) => {
                            context.session.fileSize = res.size;
                            if ((res.size % context.session.packSize) !== 0) {
                                context.session.totalPacks = parseInt(res.size / context.session.packSize) + 1;
                            } else {
                                context.session.totalPacks = parseInt(res.size / context.session.packSize);
                            }
    
                            let totalPacks = (`0000${context.session.totalPacks}`).slice(-4);
                            return `EXPECT${totalPacks}`;
                            // return readFile(context.session.fileName, 0, context.session.packSize, context.session.currentPack * context.session.packSize);
                        })
                        .then((b) => b.toString('hex'))
                        .catch((res) => {
                            return res;
                        });
                } else {
                    context.session.currentPack = context.session.currentPack + 1;
        
                    if (context.session.currentPack !== context.session.totalPacks - 1) {
                        return readFile(terminalInfo.firmwarePath, 0, context.session.packSize, context.session.currentPack * context.session.packSize)
                            // .then((b) => b.toString('hex'));
                            .then((b) => b)
                            .catch(e =>{
                                return e;
                            });
                    } else {
                        let lastPackSize = (context.session.fileSize % context.session.packSize) ? (context.session.fileSize % context.session.packSize) : (context.session.packSize);
                        let positionInFile = context.session.currentPack * context.session.packSize;
                        return readFile(terminalInfo.firmwarePath, 0, lastPackSize, positionInFile)
                            // .then((b) => b.toString('hex'));
                            .then((b) => b)
                            .catch(e =>{
                                return e;
                            });
                    }
                }
        }).catch(e => {
            return e;
        });

    },
    send: function(msg, $meta, context) {
        return msg;
        // return 'I was here!';
    }
};
