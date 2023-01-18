/* global config */
'use strict';
var app = window.app = window.app || {};

(function() {
    var BTN_COMMAND_ACTIVE = 'btn btn-default btn-xs commandBtn commandInProcess';
    var BTN_COMMAND_INACTIVE = 'btn btn-default btn-xs commandBtn';
    var atmStatusTableBody = document.getElementById('atmStatusTableBody');
    var atmTransfersTableBody = document.getElementById('atmTransfersTableBody');
    var supplyCountersModal = document.getElementById('supplyCounters');
    var atmTableRows = {};
    var countersWindowOwner;
    var filters = {
        connected: undefined,
        type: undefined,
        value: undefined,
        matcher: undefined,
        transferFlow: /./,
        transferAcquirer: /./,
        transferIssuer: /./
    };
    // atm table pagination
    var terminalsPageSize = 25;
    var terminalsPageNumber = 1;
    var filteredTerminals = [];

    /*
        Public API
    */
    app.tableManager = {
        init: init,
        updateTerminal: updateTerminal,
        pushTransfer: pushTransfer,
        updateCounters: function(terminal) {
            // Update only if window is opened and is owned by current terminal
            countersWindowOwner === terminal.atmId && showSupplyCounters(terminal);
        }
    };

    /*
        Event listeners
    */

    // Terminals table buttons event listener
    document.addEventListener('click', function(e) {
        var type = e.target.dataset.type;
        var atmId = e.target.dataset.atmId;
        var terminal = app.terminals[atmId];
        if (type === 'showCounters') {
            return showSupplyCounters(terminal);
        }
        if (['goInService', 'goOutOfService', 'refreshKeys', 'restartMachine'].includes(type)) {
            if (terminal.commandInProgress) {
                return;
            }
            terminal.commandInProgress = type;
            e.target.className = BTN_COMMAND_ACTIVE;
            app.net.sendCommand(e.target.dataset, function(error) {
                if (error) {
                    document.getElementById('alertText').textContent = error;
                    document.getElementById('alert').className = 'alert alert-dismissible alert-danger';
                } else {
                    document.getElementById('alert').className = 'alert alert-dismissible alert-success';
                    switch (type) {
                        case 'goInService':
                            document.getElementById('alertText').textContent = 'Terminal ' + terminal.terminalId + ' is online';
                            break;
                        case 'goOutOfService':
                            document.getElementById('alertText').textContent = 'Terminal ' + terminal.terminalId + ' is offline';
                            break;
                        case 'refreshKeys':
                            document.getElementById('alertText').textContent = 'Terminal ' + terminal.terminalId + ' BKey updated';
                            break;
                        case 'restartMachine':
                            document.getElementById('alertText').textContent = 'Terminal ' + terminal.terminalId + ' restart initiated';
                            break;
                    }
                }
                document.getElementById('alert').style.display = 'block';
                terminal.commandInProgress = null;
                document.querySelector('#atmStatusTableBody tr td button[data-atm-id="' + atmId + '"][data-type="' + type + '"]').className = BTN_COMMAND_INACTIVE;
            });
        }
    });

    // Alert close
    document.getElementById('closeAlert').addEventListener('click', function() {
        document.getElementById('alert').style.display = 'none';
    });

    // Terminal filter event listener
    document.getElementById('atmFilterInput').addEventListener('input', function(e) {
        filters.type = document.getElementById('atmFilterType').value;
        filters.matcher = new RegExp(e.target.value, 'i');
        filters.value = e.target.value;
        filterTerminals();
    });

    // If user clicks enter prevent the form submit
    document.getElementById('atmfilter').onsubmit = function(e) { e.preventDefault(); };

    // Connection filter radio buttons events
    document.getElementById('connectedRadio').onclick =
    document.getElementById('disconnectedRadio').onclick =
    document.getElementById('allRadio').onclick =
    document.getElementById('unknownRadio').onclick = function(e) {
        var value = e.target.value;
        filters.connected = value === '0' ? 'connected'
            : value === '1' ? 'notConnected'
            : value === '2' ? 'connectionUnknown' : undefined;
        filterTerminals();
    };

    // Transfer filter
    document.getElementById('transferFilter').addEventListener('input', function(e) {
        filters[e.target.name] = new RegExp(e.target.value, 'i');
        filterTransfers();
    });

    // Terminal records per page
    document.getElementById('atmPageSize').addEventListener('input', function(e) {
        terminalsPageSize = e.target.value;
        renderTerminalsTable(filteredTerminals);
    });

    // fixed table header
    var scrollableTables = document.getElementsByClassName('scrollable-table-wrap');
    [].forEach.call(scrollableTables, function(el) {
        el.addEventListener('scroll', function(e) {
            var translate = `translate(0, ${this.scrollTop}px)`;
            this.querySelector('thead').style.transform = translate;
        });
    });

    /*
        Supply counters modal
    */
    document.getElementById('countersClose').addEventListener('click', function() {
        supplyCountersModal.style.display = 'none';
        countersWindowOwner = undefined;
    });

    function replaceIfNoValue(value, replace) {
        return value === undefined || value === null || isNaN(value) ? replace : value;
    }

    function NaNIf(value, matcher) {
        return value === matcher ? NaN : value;
    }

    function showSupplyCounters(terminal) {
        countersWindowOwner = terminal.atmId;
        document.getElementById('countersTitle').textContent = 'Terminal ' + terminal.terminalId;
        document.getElementById('transactions').textContent = 'Transactions: ' + replaceIfNoValue(terminal.counters.transactionCount, 'N/A');
        document.getElementById('cardscaptured').textContent = 'Cards captured: ' + replaceIfNoValue(terminal.counters.captured, 'N/A');
        ['top', 'second', 'third', 'bottom'].map(function(cassette, i) {
            document.getElementById(cassette + 'loaded').textContent = replaceIfNoValue(
                NaNIf(terminal.counters['notes' + (i + 1)], null) +
                NaNIf(terminal.counters['rejected' + (i + 1)], null) +
                NaNIf(terminal.counters['dispensed' + (i + 1)], null), 'N/A'
            );
            document.getElementById(cassette + 'notes').textContent = replaceIfNoValue(terminal.counters['notes' + (i + 1)], 'N/A');
            document.getElementById(cassette + 'rejected').textContent = replaceIfNoValue(terminal.counters['rejected' + (i + 1)], 'N/A');
            document.getElementById(cassette + 'dispensed').textContent = replaceIfNoValue(terminal.counters['dispensed' + (i + 1)], 'N/A');
        });
        supplyCountersModal.style.display = 'block';
    }

    /*
        ATM & Transfers tables
    */
    function init(terminals, transfers) {
        filteredTerminals = terminals;
        renderTerminalsTable(terminals);
        renderTransfersTable(transfers);
    }

    function renderTerminalsTable(terminals = []) {
        var pageSize = terminals.length;
        // validate page size
        if (terminalsPageSize !== '*' && terminalsPageSize > 0 && terminalsPageSize < terminals.length) {
            pageSize = parseInt(terminalsPageSize);
        }
        // total pages
        var terminalsPageCount = Math.floor((terminals.length - 1) / pageSize) + 1;
        // validate page number
        if (terminalsPageNumber < 1) {
            terminalsPageNumber = 1;
        } else if (terminalsPageNumber > terminalsPageCount) {
            terminalsPageNumber = terminalsPageCount;
        }

        cleanTable(atmStatusTableBody);
        var atmRows = document.createDocumentFragment();
        for (var i = ((terminalsPageNumber - 1) * pageSize); i < (pageSize * terminalsPageNumber) && i < terminals.length; i++) {
            var terminal = terminals[i];
            var atmTRow = atmTableRows[terminal.atmId] = createAtmStatusRow(terminal);
            atmRows.appendChild(atmTRow);
        }
        atmStatusTableBody.appendChild(atmRows);

        renderTerminalPagination(terminals, terminalsPageCount);
    }

    function renderTerminalPagination(terminals, terminalsPageCount) {
        var getPageLink = function(pageIndex, displayValue, activePage, disabled = false) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            if (activePage) {
                li.className = 'active';
            }
            a.value = pageIndex;
            a.innerHTML = displayValue;
            a.href = '#';
            li.appendChild(a);

            !disabled && li.addEventListener('click', function(e) {
                terminalsPageNumber = e.target.value;
                renderTerminalsTable(terminals);
            });

            return li;
        };

        var paginationElement = document.getElementById('atmPageNumber');

        if (!terminals.length || terminalsPageCount <= 1) {
            paginationElement.className = 'hide';
        } else {
            paginationElement.className = 'pagination pagination-sm';
            paginationElement.innerHTML = '';

            // previous page link
            paginationElement.appendChild(getPageLink(terminalsPageNumber - 1, '<', false));
            var index;
            var pageLinks = [];

            if (terminalsPageCount <= 9) { // 1 - 9
                for (index = 1; index <= terminalsPageCount; index++) {
                    pageLinks.push(getPageLink(index, index, index === terminalsPageNumber));
                }
            } else {
                if (terminalsPageNumber - 4 <= 0 || (terminalsPageNumber - 4 > 0 && terminalsPageNumber <= 5)) { // 1 2 3 4 5 6 7 .. 10
                    var rightElements = 7;
                    for (index = 1; index <= terminalsPageNumber; index++) {
                        pageLinks.push(getPageLink(index, index, index === terminalsPageNumber));
                        rightElements -= 1;
                    }
                    for (index = terminalsPageNumber + 1; index <= rightElements + terminalsPageNumber; index++) {
                        pageLinks.push(getPageLink(index, index, index === terminalsPageNumber));
                    }
                    pageLinks.push(getPageLink(0, '...', false, true));
                    pageLinks.push(getPageLink(terminalsPageCount, terminalsPageCount, terminalsPageCount === terminalsPageNumber));
                } else if (terminalsPageCount - terminalsPageNumber <= 4) { // 1 .. 4 5 6 7 8 9 10
                    var leftElements = 7;
                    for (index = terminalsPageCount; index >= terminalsPageNumber; index--) {
                        pageLinks.push(getPageLink(index, index, index === terminalsPageNumber));
                        leftElements -= 1;
                    }
                    for (index = terminalsPageNumber - 1; index >= terminalsPageNumber - leftElements; index--) {
                        pageLinks.push(getPageLink(index, index, index === terminalsPageNumber));
                    }
                    pageLinks.push(getPageLink(0, '...', false, true));
                    pageLinks.push(getPageLink(1, 1, terminalsPageNumber === 1));

                    pageLinks.reverse();
                } else { // 1 ... 8 9 10 11 12 ... 16
                    pageLinks.push(getPageLink(1, 1, terminalsPageNumber === 1));
                    pageLinks.push(getPageLink(0, '...', false, true));

                    for (index = terminalsPageNumber - 2; index <= terminalsPageNumber + 2; index++) {
                        pageLinks.push(getPageLink(index, index, index === terminalsPageNumber));
                    }

                    pageLinks.push(getPageLink(0, '...', false, true));
                    pageLinks.push(getPageLink(terminalsPageCount, terminalsPageCount, terminalsPageCount === terminalsPageNumber));
                }
            }
            pageLinks.forEach(function(l) {
                paginationElement.appendChild(l);
            });
            // next page link
            paginationElement.appendChild(getPageLink(terminalsPageNumber + 1, '>', false));
        }
    }

    function renderTransfersTable(transfers) {
        if (transfers && transfers.length) {
            cleanTable(atmTransfersTableBody);
            var transferRows = document.createDocumentFragment();
            for (var j = 0; j < transfers.length; j++) {
                var transferRow = createAtmTransferRow(transfers[j]);
                transferRows.appendChild(transferRow);
            }
            atmTransfersTableBody.appendChild(transferRows);
        }
    }

    function updateTerminal(terminal) {
        window.app.hideTooltip();
        var oldRow = atmTableRows[terminal.atmId];
        var newRow = createAtmStatusRow(terminal);
        atmTableRows[terminal.atmId] = newRow;
        filterTerminal(terminal);
        if (oldRow) {
            atmStatusTableBody.replaceChild(newRow, oldRow);
        } else {
            atmStatusTableBody.appendChild(newRow);
        }
    }

    function pushTransfer(transfer) {
        var transferRow = createAtmTransferRow(transfer);
        filterTransfer(transferRow);
        atmTransfersTableBody.insertBefore(transferRow, atmTransfersTableBody.firstChild);
        if (atmTransfersTableBody.children.length >= (config && config.txListSize)) {
            atmTransfersTableBody.removeChild(atmTransfersTableBody.lastChild);
        }
    }

    function cleanTable(tableBody) {
        window.app.hideTooltip();
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
    }

    function filterTerminals() {
        filteredTerminals = [];

        for (var i = 0; i < app.terminalsArray.length; i++) {
            filterTerminal(app.terminalsArray[i]) && filteredTerminals.push(app.terminalsArray[i]);
        }
        // return to first page
        terminalsPageNumber = 1;
        renderTerminalsTable(filteredTerminals);
    }

    function filterTransfers() {
        var transferRows = document.querySelectorAll('#atmTransfersTableBody tr');
        for (var i = 0; i < transferRows.length; i++) filterTransfer(transferRows[i]);
    }

    function filterTransfer(tableRow) {
        var filtersMatched = 0;
        filtersMatched += tableRow.dataset.cardFlow.match(filters.transferFlow) ? 1 : 0;
        filtersMatched += tableRow.dataset.issuerId.match(filters.transferIssuer) ? 1 : 0;
        filtersMatched += tableRow.dataset.deviceId.match(filters.transferAcquirer) ? 1 : 0;
        if (filtersMatched < 3) {
            tableRow.style.display = 'none';
        } else {
            tableRow.style.display = 'table-row';
        }
    }

    function filterTerminal(terminal) {
        var filtersMatched = 0;
        if (!filters.connected || terminal.connected === filters.connected) {
            filtersMatched++;
        }
        if (!filters.value) {
            filtersMatched++;
        } else {
            switch (filters.type) {
                case '0':
                    filtersMatched += terminal.luno.match(filters.matcher) ? 1 : 0;
                    break;
                case '1':
                    filtersMatched += terminal.deviceLocation.match(filters.matcher) ? 1 : 0;
                    break;
                case '2':
                    filtersMatched += terminal.terminalId.match(filters.matcher) ? 1 : 0;
                    break;
            }
        }
        return filtersMatched < 2 ? 0 : 1;
    }

    function createButton(text, data, className) {
        var btn = document.createElement('button');
        btn.className = className || 'btn btn-default btn-xs';
        btn.textContent = text;
        Object.assign(btn.dataset, data);
        var tableCell = document.createElement('td');
        tableCell.appendChild(btn);
        return tableCell;
    }

    function createImageCell(value, imgPrefix, tooltip, tooltipAddition) {
        var tableCell = document.createElement('td');
        var img = document.createElement('img');
        value && (img.src = '/monitoring/img/' + imgPrefix + '-' + value + '.png');
        img.className = 'status-icon';
        tableCell.appendChild(img);
        if (tooltip) {
            var text = tooltip[value] || '';
            if (text && tooltipAddition) {
                text += ' (' + tooltipAddition + ')';
            }
            img.dataset.tooltipText = tableCell.dataset.tooltipText = text;
        }
        return tableCell;
    }

    function createTextCell(value) {
        var tableCell = document.createElement('td');
        tableCell.textContent = value;
        return tableCell;
    }

    function createAtmStatusRow(status) {
        var cols = [
            createTextCell(status.luno),
            createTextCell(status.deviceLocation),
            createTextCell(status.terminalId),
            createImageCell(status.connected, 'status', app.connectedMap),
            createImageCell(status.inService, 'status', app.inServiceMap),

            createImageCell(status.sensors.supervisor, 'sensor', app.supervisorMap),
            createImageCell(status.sensors.safeDoor, 'sensor', app.doorMap),
            createImageCell(status.sensors.topDoor, 'sensor', app.doorMap),
            createImageCell(status.sensors.c1, 'sensor', app.cassetteMap),
            createImageCell(status.sensors.c2, 'sensor', app.cassetteMap),
            createImageCell(status.sensors.c3, 'sensor', app.cassetteMap),
            createImageCell(status.sensors.c4, 'sensor', app.cassetteMap),
            createImageCell(status.sensors.rj, 'sensor', app.cassetteMap),

            createImageCell(status.fitness.cardReader, 'hf', app.fitnessMap, status.deviceStatusDescription.cardReader),
            createImageCell(status.fitness.encryptor, 'hf', app.fitnessMap, status.deviceStatusDescription.encryptor),
            createImageCell(status.fitness.cashHandler, 'hf', app.fitnessMap, status.deviceStatusDescription.cashHandler),
            createImageCell(status.fitness.receiptPrinter, 'hf', app.fitnessMap, status.deviceStatusDescription.receiptPrinter),
            createImageCell(status.fitness.c1, 'hf', app.fitnessMap),
            createImageCell(status.fitness.c2, 'hf', app.fitnessMap),
            createImageCell(status.fitness.c3, 'hf', app.fitnessMap),
            createImageCell(status.fitness.c4, 'hf', app.fitnessMap),

            createImageCell(status.supplies.c1, 'supply', app.supplyMap),
            createImageCell(status.supplies.c2, 'supply', app.supplyMap),
            createImageCell(status.supplies.c3, 'supply', app.supplyMap),
            createImageCell(status.supplies.c4, 'supply', app.supplyMap),
            createImageCell(status.supplies.rj, 'supply', app.supplyMap),
            createImageCell(status.supplies.paper, 'supply', app.supplyMap),

            createTextCell(status.counters.notes1),
            createTextCell(status.counters.notes2),
            createTextCell(status.counters.notes3),
            createTextCell(status.counters.notes4),
            createTextCell(status.counters.captured),

            createButton('counters', {atmId: status.atmId, type: 'showCounters'}),
            createButton('online', {
                atmId: status.atmId,
                type: 'goInService'
            }, status.commandInProgress === 'goInService' ? BTN_COMMAND_ACTIVE : BTN_COMMAND_INACTIVE),
            createButton('offline', {
                atmId: status.atmId,
                type: 'goOutOfService'
            }, status.commandInProgress === 'goOutOfService' ? BTN_COMMAND_ACTIVE : BTN_COMMAND_INACTIVE),
            createButton('bkey', {
                atmId: status.atmId,
                type: 'refreshKeys'
            }, status.commandInProgress === 'refreshKeys' ? BTN_COMMAND_ACTIVE : BTN_COMMAND_INACTIVE),
            createButton('reset', {
                atmId: status.atmId,
                type: 'restartMachine'
            }, status.commandInProgress === 'restartMachine' ? BTN_COMMAND_ACTIVE : BTN_COMMAND_INACTIVE)
        ];
        var row = document.createElement('tr');
        for (var i = 0; i < cols.length; i++) {
            row.appendChild(cols[i]);
        }
        return row;
    }

    function createAtmTransferRow(transfer) {
        var cols = [
            createTextCell(transfer.txId),
            createTextCell(transfer.cardNumber),
            createTextCell(transfer.transactionTime),
            createTextCell(transfer.debitAccount),
            createTextCell(transfer.creditAccount),
            createTextCell(transfer.description),
            createTextCell(transfer.amount),
            createTextCell(transfer.deviceId),
            createTextCell(transfer.issuerId),
            createTextCell(transfer.responseCode),
            createTextCell(transfer.additionalInfo),
            createTextCell(transfer.deviceLocation),
            createTextCell(transfer.cardProductName),
            createTextCell(transfer.merchant),
            createTextCell(transfer.reversalCode),
            createTextCell(transfer.currency),
            createTextCell(transfer.alerts)
        ];
        var row = document.createElement('tr');
        Object.assign(row.dataset, {
            cardFlow: transfer.cardFlow,
            deviceId: transfer.deviceId,
            issuerId: transfer.issuerId
        });
        row.className = transfer.style;
        for (var i = 0; i < cols.length; i++) {
            row.appendChild(cols[i]);
        }
        return row;
    }
})();
