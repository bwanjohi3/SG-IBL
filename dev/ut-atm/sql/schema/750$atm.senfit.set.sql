CREATE PROCEDURE [atm].[senfit.set]
    @sensors atm.sensorTT READONLY,
    @fitness atm.fitnessTT READONLY,
    @supplyStatus atm.supplyStatusTT READONLY
AS
    EXEC atm.[sensor.set] @sensors = @sensors
    EXEC atm.[fitness.set] @fitness = @fitness
    EXEC atm.[supplyStatus.set] @supplyStatus = @supplyStatus
