'use strict';
var app = window.app = window.app || {};

(function() {
    app.Terminal = Terminal;

    function parseSensor(value) {
        if (value === undefined || value === null) return;
        return value ? '' : 'out';
    }

    function parseSensorActive(value) {
        if (value === undefined || value === null) return;
        return value ? 'active' : '';
    }

    function Terminal(terminal) {
        if (!(this instanceof Terminal)) {
            return new Terminal(terminal);
        }
        this.atmId = terminal.atmId;
        this.luno = terminal.luno;
        this.conId = terminal.conId;
        this.deviceLocation = terminal.terminalName;
        this.terminalId = terminal.terminalId;
        this.connected = terminal.connected ? 'connected' : 'notConnected';
        this.inService = terminal.inService ? 'inService' : 'outOfService';
        this.deviceStatusDescription = terminal.deviceStatusDescription || {};
        this.sensors = {
            supervisor: parseSensorActive(terminal['sensor.supervisorMode']),
            safeDoor: parseSensorActive(terminal['sensor.door']),
            topDoor: parseSensorActive(terminal['sensor.electronicsEnclosure']),
            c1: parseSensor(terminal['sensor.cassette1']),
            c2: parseSensor(terminal['sensor.cassette2']),
            c3: parseSensor(terminal['sensor.cassette3']),
            c4: parseSensor(terminal['sensor.cassette4']),
            rj: parseSensor(terminal['sensor.rejectBin'])
        };
        this.fitness = {
            cardReader: terminal['fitness.cardReader'],
            encryptor: terminal['fitness.encryptor'],
            cashHandler: terminal['fitness.cashHandler'],
            receiptPrinter: terminal['fitness.receiptPrinter'],
            c1: terminal['fitness.cassette1'],
            c2: terminal['fitness.cassette2'],
            c3: terminal['fitness.cassette3'],
            c4: terminal['fitness.cassette4']
        };
        this.supplies = {
            c1: terminal['supply.cassette1'],
            c2: terminal['supply.cassette2'],
            c3: terminal['supply.cassette3'],
            c4: terminal['supply.cassette4'],
            rj: terminal['supply.rejectBin'],
            paper: terminal['supply.receiptPrinter'],
            ej: terminal['supply.journalPrinter']
        };
        this.counters = {
            transactionCount: terminal['counter.transactionCount'],
            notes1: terminal['counter.notes1'],
            notes2: terminal['counter.notes2'],
            notes3: terminal['counter.notes3'],
            notes4: terminal['counter.notes4'],
            rejected1: terminal['counter.rejected1'],
            rejected2: terminal['counter.rejected2'],
            rejected3: terminal['counter.rejected3'],
            rejected4: terminal['counter.rejected4'],
            dispensed1: terminal['counter.dispensed1'],
            dispensed2: terminal['counter.dispensed2'],
            dispensed3: terminal['counter.dispensed3'],
            dispensed4: terminal['counter.dispensed4'],
            last1: terminal['counter.last1'],
            last2: terminal['counter.last2'],
            last3: terminal['counter.last3'],
            last4: terminal['counter.last4'],
            captured: terminal['counter.captured']
        };
    };

    Terminal.prototype.update = function update(status) {
        if (status.session) {
            this.inService = status.session.inService && status.connected ? 'inService' : 'outOfService';
        }
        if (status.connected === true && status.conId) {
            this.conId = status.conId;
        }
        if (status.device && status.deviceStatusDescription) {
            this.deviceStatusDescription[status.device] = status.deviceStatusDescription;
        }
        // Solicited status
        switch (status.statusType) {
            case 'configuration':
                this.sensors.supervisor = parseSensorActive(status.sensors.supervisorMode);
                this.sensors.vibration = parseSensorActive(status.sensors.vibration);
                this.sensors.safeDoor = parseSensorActive(status.sensors.door);
                this.sensors.silentSignal = parseSensorActive(status.sensors.silentSignal);
                this.sensors.topDoor = parseSensorActive(status.sensors.electronicsEnclosure);
                this.sensors.depositBin = parseSensorActive(status.sensors.depositBin);
                this.sensors.cardBin = parseSensorActive(status.sensors.cardBin);
                this.sensors.rj = parseSensor(status.sensors.rejectBin);
                this.sensors.c1 = parseSensor(status.sensors.cassette1);
                this.sensors.c2 = parseSensor(status.sensors.cassette2);
                this.sensors.c3 = parseSensor(status.sensors.cassette3);
                this.sensors.c4 = parseSensor(status.sensors.cassette4);
                this.fitness.cardReader = status.fitness.cardReader;
                this.fitness.encryptor = status.fitness.encryptor;
                this.fitness.cashHandler = status.fitness.cashHandler;
                this.fitness.receiptPrinter = status.fitness.receiptPrinter;
                this.fitness.c1 = status.fitness.cassette1;
                this.fitness.c2 = status.fitness.cassette2;
                this.fitness.c3 = status.fitness.cassette3;
                this.fitness.c4 = status.fitness.cassette4;
                this.supplies.rj = status.supplyStatus.rejectBin;
                this.supplies.c1 = status.supplyStatus.cassette1;
                this.supplies.c2 = status.supplyStatus.cassette2;
                this.supplies.c3 = status.supplyStatus.cassette3;
                this.supplies.c4 = status.supplyStatus.cassette4;
                this.supplies.ej = status.supplyStatus.journalPrinter;
                this.supplies.paper = status.supplyStatus.receiptPrinter;
                this.connected = 'connected';
                break;
            case 'fitness':
                this.fitness.clock = status.fitnessStatus.clock[0];
                this.fitness.power = status.fitnessStatus.power[0];
                this.fitness.cardReader = status.fitnessStatus.cardReader[0];
                this.fitness.receiptPrinter = status.fitnessStatus.receiptPrinter[0];
                this.fitness.journalPrinter = status.fitnessStatus.journalPrinter[0];
                this.fitness.encryptor = status.fitnessStatus.encryptor[0];
                this.fitness.cashHandler = status.fitnessStatus.cashHandler[0];
                this.fitness.c1 = status.fitnessStatus.cashHandler[1];
                this.fitness.c2 = status.fitnessStatus.cashHandler[2];
                this.fitness.c3 = status.fitnessStatus.cashHandler[3];
                this.fitness.c4 = status.fitnessStatus.cashHandler[4];
                this.connected = 'connected';
                break;
            case 'sensor':
                this.sensors.supervisor = parseSensorActive(status.supervisorMode);
                this.sensors.vibration = parseSensorActive(status.vibration);
                this.sensors.safeDoor = parseSensorActive(status.door);
                this.sensors.silentSignal = parseSensorActive(status.silentSignal);
                this.sensors.topDoor = parseSensorActive(status.electronicsEnclosure);
                this.sensors.depositBin = parseSensorActive(status.depositBin);
                this.sensors.cardBin = parseSensorActive(status.cardBin);
                this.sensors.rj = parseSensor(status.rejectBin);
                this.sensors.c1 = parseSensor(status.cassette1);
                this.sensors.c2 = parseSensor(status.cassette2);
                this.sensors.c3 = parseSensor(status.cassette3);
                this.sensors.c4 = parseSensor(status.cassette4);
                this.sensors.coinDispenser = parseSensorActive(status.coinDispenser);
                this.sensors.coinHopper1 = parseSensorActive(status.coinHopper1);
                this.sensors.coinHopper2 = parseSensorActive(status.coinHopper2);
                this.sensors.coinHopper3 = parseSensorActive(status.coinHopper3);
                this.sensors.coinHopper4 = parseSensorActive(status.coinHopper4);
                this.sensors.cpmPockets = parseSensorActive(status.cpmPockets);
                this.connected = 'connected';
                break;
            case 'supplies':
            case 'suppliesStatus':
                this.supplies.rj = status.suppliesStatus.cashHandler[0];
                this.supplies.c1 = status.suppliesStatus.cashHandler[1];
                this.supplies.c2 = status.suppliesStatus.cashHandler[2];
                this.supplies.c3 = status.suppliesStatus.cashHandler[3];
                this.supplies.c4 = status.suppliesStatus.cashHandler[4];
                this.supplies.ej = status.suppliesStatus.journalPrinter[0];
                this.supplies.paper = status.suppliesStatus.receiptPrinter[0];
                this.connected = 'connected';
                break;
            case 'supplyCounters':
                this.counters.transactionCount = status.transactionCount;
                this.counters.notes1 = status.notes1;
                this.counters.notes2 = status.notes2;
                this.counters.notes3 = status.notes3;
                this.counters.notes4 = status.notes4;
                this.counters.rejected1 = status.rejected1;
                this.counters.rejected2 = status.rejected2;
                this.counters.rejected3 = status.rejected3;
                this.counters.rejected4 = status.rejected4;
                this.counters.dispensed1 = status.dispensed1;
                this.counters.dispensed2 = status.dispensed2;
                this.counters.dispensed3 = status.dispensed3;
                this.counters.dispensed4 = status.dispensed4;
                this.counters.last1 = status.last1;
                this.counters.last2 = status.last2;
                this.counters.last3 = status.last3;
                this.counters.last4 = status.last4;
                this.counters.captured = status.captured;
                this.connected = 'connected';
                break;
            default:
                this.connected = status.connected === undefined ? 'connectionUnknown'
                    : status.connected === true ? 'connected' : 'notConnected';
                break;
        }
        // Unsolicited status
        switch (status.device) {
            case 'cashHandler':
            case 'receiptPrinter':
            case 'cardReader':
            case 'pinPad':
                this.deviceStatusDescription[status.device] = status.deviceStatusDescription;
                this.connected = 'connected';
                this.fitness[status.device] = status.severities[0];
                break;
            case 'sensors':
                this.deviceStatusDescription[status.device] = status.deviceStatusDescription;
                this.connected = 'connected';
                Object.assign(this.sensors, {
                    supervisor: parseSensorActive(status.supervisorMode),
                    safeDoor: parseSensorActive(status.door),
                    topDoor: parseSensorActive(status.electronicsEnclosure),
                    c1: parseSensor(status.cassette1),
                    c2: parseSensor(status.cassette2),
                    c3: parseSensor(status.cassette3),
                    c4: parseSensor(status.cassette4),
                    rj: parseSensor(status.rejectBin)
                });
                break;
        }
    };
})();
