# ut-port-console

'ut-port-console' is a module aimed to provide logs monitoring web interface for UT5 implementations.
'ut-port-console' works in cooperation with 'ut-log' (see 'ut-log' docs for more info).
In order the two modules to be successfully bundled together a 'soketStream' stream/transport should be enabled for the 'ut-log' instance in a way that it creates a socket client which binds to console's host and port.
The following code can be used for bundling the ut-log module with the ut-port-console interface:

```js
var utLog = require('ut-log');
var utPortConsole = require('ut-port-console');
var SocketStream = require('ut-log/socketStream');
var consoleHost = '127.0.0.1';
var consolePort = '30001';
// ut-log
var utLogConfig = {
    type: 'bunyan',
    streams: [
        {
            level: 'trace',
            stream: new SocketStream({
                host: consoleHost,
                port: consolePort,
                objectMode: true
            }),
            type: 'raw'
        }
    ]
};
var logFactory = new utLog(utLogConfig);
var log = logFactory.createLog('info', {name: 'a', context: 'b'});
//ut-port-console
var consoleInstance = new utPortConsole();
consoleInstance.config.host = consoleHost;
consoleInstance.config.port = consolePort;
consoleInstance.init();
consoleInstance.start();
```

Then each message the logFactory instance logs will be sent to the console client through a websocket connection simultaneously.

i.e.

```js
log.info('test');
```

will stream the message 'test' to the console.

## Storing logs to LevelDB

'ut-log' and 'ut-port-console' can be configured in a way to share a common LevelDB database which can be used for storing and querying log messages. For this purpose a 'LevelDBStream' stream/transport should be added to the logger which share a common database instance with the console port.
The following code demonstrates how that could be achieved:

```js
var utLog = require('ut-log');
var level = require('level');
var utPortConsole = require('ut-port-console');
var SocketStream = require('ut-log/socketStream');
var LevelDBStream = require('ut-log/leveldbStream');
var consoleHost = '127.0.0.1';
var consolePort = '30001';
var logsDB = level('./logs');
// ut-log
var utLogConfig = {
    type: 'bunyan',
    streams: [
        {
            level: 'trace',
            stream: new SocketStream({
                host: consoleHost,
                port: consolePort,
                objectMode: true
            }),
            type: 'raw'
        },
        {
            level: 'trace',
            stream: new LevelDBStream(logsDB),
            type: 'raw'
        }
    ]
};
var logFactory = new utLog(utLogConfig);
var log = logFactory.createLog('info', {name: 'a', context: 'b'});
//ut-port-console
var consoleInstance = new utPortConsole();
consoleInstance.config.host = consoleHost;
consoleInstance.config.port = consolePort;
consoleInstance.db = logsDB;
consoleInstance.init();
consoleInstance.start();
```

Then each message the logFactory instance logs will be sent to the console client through a websocket connection and will be stored in './logs' leveldb database simultaneously.

i.e.

```js
log.info('leveldb test')
```

will stream the message 'leveldb test' to the console and will store it to the db.