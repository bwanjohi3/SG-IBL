CREATE PROCEDURE [atm].[senfitsup.set]
    @sensors atm.sensorTT READONLY,
    @fitness atm.fitnessTT READONLY,
    @supplyStatus atm.supplyStatusTT READONLY,
    @supplyCounters atm.supplyCountersTT READONLY
AS
    EXEC atm.[sensor.set] @sensors = @sensors
    EXEC atm.[fitness.set] @fitness = @fitness
    EXEC atm.[supplyStatus.set] @supplyStatus = @supplyStatus
    EXEC atm.[supplyCounters.set] @supplyCounters = @supplyCounters
