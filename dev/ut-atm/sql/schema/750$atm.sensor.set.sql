CREATE PROCEDURE [atm].[sensor.set]
    @sensors atm.sensorTT READONLY
AS
    MERGE
        atm.sensor AS target
    USING
        @sensors AS source
    ON
        target.atmId = source.atmId
    WHEN MATCHED THEN
    UPDATE SET
        supervisorMode = source.supervisorMode,
        vibration = source.vibration,
        door = source.door,
        silentSignal = source.silentSignal,
        electronicsEnclosure = source.electronicsEnclosure,
        depositBin = source.depositBin,
        cardBin = source.cardBin,
        rejectBin = source.rejectBin,
        cassette1 = source.cassette1,
        cassette2 = source.cassette2,
        cassette3 = source.cassette3,
        cassette4 = source.cassette4,
        coinDispenser = source.coinDispenser,
        coinHopper1 = source.coinHopper1,
        coinHopper2 = source.coinHopper2,
        coinHopper3 = source.coinHopper3,
        coinHopper4 = source.coinHopper4,
        cpmPockets = source.cpmPockets
    WHEN NOT MATCHED BY target THEN
    INSERT
        (atmId,supervisorMode,vibration,door,silentSignal,electronicsEnclosure,depositBin,cardBin,rejectBin,cassette1,cassette2,cassette3,cassette4,coinDispenser,coinHopper1,coinHopper2,coinHopper3,coinHopper4,cpmPockets)
    VALUES
        (source.atmId,source.supervisorMode,source.vibration,source.door,source.silentSignal,source.electronicsEnclosure,source.depositBin,source.cardBin,source.rejectBin,source.cassette1,source.cassette2,source.cassette3,source.cassette4,source.coinDispenser,source.coinHopper1,source.coinHopper2,source.coinHopper3,source.coinHopper4,source.cpmPockets);
