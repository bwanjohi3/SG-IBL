/* global config */
/* eslint-disable no-console,no-alert */
'use strict';
var app = window.app = window.app || {};

(function() {
    var atmStatusQueue = [];
    var atmLastUpdated = {};

    var atmsLoaded = false;
    var terminals = app.terminals = {};
    var terminalsArray = app.terminalsArray = [];

    if (window.WebSocket !== undefined) {
        createAtmStatusSocket();
        createAtmTransferSocket();
    } else {
        window.alert('Your browser does not support WebSocket');
    }

    // Api
    app.net = {
        sendCommand: sendCommand,
        ajax: ajax
    };

    // Helpers
    function sendCommand(command, callback) {
        var terminal = terminals[command.atmId];
        var params = {
            conId: terminal.conId,
            opcode: command.type,
            atmId: command.atmId,
            terminalId: terminal.terminalId
        };

        ajax(
            'http://' + config.monitoringSocketAddress + '/remoteCommand',
            params,
            function(r) { callback(r.responseText); }, // Done
            function(r) { callback('request timeout'); } // Timeout
        );
    }

    function updateInactiveStatus() {
        function update(connections) {
            terminalsArray.forEach(function(terminal) {
                var oldStatus = terminal.connected;
                /* connected values
                    1. undefined (connectionUnknown) - status is not received yet
                    2. true (connected) - status is received and terminal is connected
                    3. false (notConnected) - status is received and terminal is disconnected
                */
                var connected;
                if (!connections) {
                    // We were unable to receive connections
                    // Rely on last status update to detect whether terminal is connected
                    if (atmLastUpdated[terminal.atmId]) {
                        connected = true;
                    } else {
                        connected = undefined;
                    }
                } else {
                    if (connections[terminal.terminalId] && !atmLastUpdated[terminal.atmId]) {
                        // We have connection but no status is received
                        // Assume connection is unknown
                        connected = undefined;
                    } else if (!connections[terminal.terminalId]) {
                        // We don't have connection - it is definitely offline
                        connected = false;
                    } else {
                        connected = true;
                    }
                }
                terminal.update({connected: connected});
                if (oldStatus !== terminal.connected) {
                    app.tableManager.updateTerminal(terminal);
                }
            });
            atmLastUpdated = {};
        }

        ajax(
            'http://' + config.monitoringSocketAddress + '/connections',
            null,
            function done(result) {
                var connections = JSON.parse(result.responseText);
                update(connections.reduce(function(result, conn) {
                    result[conn.terminalId] = conn;
                    return result;
                }, {}));
            },
            function timeout() {
                update();
            }
        );
    }

    function handleSocketConnectionError(closeCode, closeReason) {
        if (closeCode < 4000) { // Firefox/Edge workaround
            closeCode = Number(closeReason);
        }
        document.getElementById('login').style.display = 'inline-block';
        switch (closeCode) {
            case 4401:
                document.querySelector('#login h4').textContent = 'Please log in';
                document.querySelector('#login #login-modal-btn').style.display = 'inline-block';
                document.querySelector('#login #logout-modal-btn').style.display = 'none';
                return true;
            case 4403:
                document.querySelector('#login h4').textContent = 'You do not have permissions to view this page';
                document.querySelector('#login #logout-modal-btn').style.display = 'inline-block';
                document.querySelector('#login #login-modal-btn').style.display = 'none';
                return true;
            default:
                document.querySelector('#login h4').textContent = 'Connection error';
                document.querySelector('#login #logout-modal-btn').style.display = 'inline-block';
                document.querySelector('#login #login-modal-btn').style.display = 'none';
                return false;
        }
    }

    function processStatusMessage(event) {
        document.getElementById('login').style.display = 'none';
        var status = JSON.parse(event.data);
        var terminal = terminals[(status && status.session && status.session.atmId)];
        if (terminal) {
            atmLastUpdated[status.session.atmId] = status.connected !== false;
            if (!atmsLoaded) {
                atmStatusQueue.push(status);
            } else {
                terminal.update(status);
                app.tableManager.updateTerminal(terminal);
                app.tableManager.updateCounters(terminal);
            }
        }
    }

    function createAtmStatusSocket() {
        var xsrfToken = '';
        if (typeof (config) !== 'undefined' && config && config.xsrfToken) {
            xsrfToken = config.xsrfToken;
        }
        var atmStatusWs = new window.WebSocket('ws://' + config.monitoringSocketAddress + '/atmStatus?xsrf=' + xsrfToken);
        var timeoutRef = setInterval(updateInactiveStatus, 120000);

        atmStatusWs.onmessage = processStatusMessage;
        atmStatusWs.onopen = loadAtms;
        atmStatusWs.onclose = function(event) {
            if (!handleSocketConnectionError(event.code, event.reason)) {
                atmStatusWs.onmessage = null;
                atmStatusWs.onclose = null;
                atmStatusWs.onopen = null;
                atmsLoaded = false;
                clearInterval(timeoutRef);
                setTimeout(createAtmStatusSocket, 2000);
            }
        };
    }

    function createAtmTransferSocket() {
        var xsrfToken = '';
        if (typeof (config) !== 'undefined' && config && config.xsrfToken) {
            xsrfToken = config.xsrfToken;
        }
        var atmTransferWs = new window.WebSocket('ws://' + config.monitoringSocketAddress + '/atmTransfer?xsrf=' + xsrfToken);
        atmTransferWs.onmessage = function(event) {
            var pushData = JSON.parse(event.data);
            pushData.transfer && app.tableManager.pushTransfer(pushData.transfer);
            document.getElementById('login').style.display = 'none';
        };
        atmTransferWs.onclose = function(event) {
            if (!handleSocketConnectionError(event.code, event.reason)) {
                atmTransferWs.onmessage = null;
                atmTransferWs.onclose = null;
                setTimeout(createAtmTransferSocket, 2000);
            }
        };
    }

    function ajax(url, postData, callback, timeout) {
        var XMLHttpFactories = [
            function() { return new window.XMLHttpRequest(); },
            function() { return new window.ActiveXObject('Msxml2.XMLHTTP'); },
            function() { return new window.ActiveXObject('Msxml3.XMLHTTP'); },
            function() { return new window.ActiveXObject('Microsoft.XMLHTTP'); }
        ];
        var xmlhttp;
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            } catch (e) {
                continue;
            }
            break;
        }
        if (!xmlhttp) {
            return;
        }

        var method = postData ? 'POST' : 'GET';
        xmlhttp.open(method, url, true);
        if (postData) {
            xmlhttp.setRequestHeader('Content-type', 'application/json');
        }
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState !== 4) {
                return;
            }
            if (xmlhttp.status !== 200 && xmlhttp.status !== 304) {
                return;
            }
            if (xmlhttp.status === 401) {
                handleSocketConnectionError(4401);
            }
            callback && callback(xmlhttp);
        };
        if (xmlhttp.readyState === 4) {
            return;
        }
        xmlhttp.ontimeout = timeout;
        xmlhttp.timeout = 60 * 1000;
        xmlhttp.withCredentials = true;
        xmlhttp.send(JSON.stringify(postData));
    };

    function loadAtms() {
        ajax('http://' + config.monitoringSocketAddress + '/terminals', null, function(xmlhttp) {
            var result = JSON.parse(xmlhttp.responseText);
            terminalsArray = app.terminalsArray = [];
            var connections = result.connections.reduce(function(connections, connection) {
                connections[connection.atmId] = connection;
                return connections;
            }, {});
            var deviceStatuses = result.statusDescriptions.reduce(function(deviceStatuses, status) {
                deviceStatuses[status[0]] = status[1];
                return deviceStatuses;
            }, {});
            result.terminals.forEach(function(terminalData) {
                Object.assign(terminalData, connections[terminalData.atmId]);
                terminalData.connected = terminalData.atmId in connections;
                terminalData.deviceStatusDescription = deviceStatuses[terminalData.atmId];
                var terminal = new app.Terminal(terminalData);
                terminals[terminal.atmId] = terminal;
                terminalsArray.push(terminal);
            });
            app.tableManager.init(terminalsArray, result.transfers.reverse());
            while (atmStatusQueue.length) {
                var status = atmStatusQueue.shift();
                status.session && status.session.atmId &&
                terminals[status.session.atmId] &&
                terminals[status.session.atmId].update(status) &&
                app.tableManager.updateTerminal(terminals[status.session.atmId]);
            }
            atmsLoaded = true;
            document.getElementById('login').style.display = 'none';
        });
    };
})();
