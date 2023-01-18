CREATE PROCEDURE [atm].[supplyCounters.set]
    @supplyCounters atm.supplyCountersTT READONLY
AS
    MERGE
        atm.supplyCounters AS target
    USING
        @supplyCounters AS source
    ON
        target.atmId = source.atmId
    WHEN MATCHED THEN
    UPDATE SET
        notes1 = source.notes1,
        notes2 = source.notes2,
        notes3 = source.notes3,
        notes4 = source.notes4,
        rejected1 = source.rejected1,
        rejected2 = source.rejected2,
        rejected3 = source.rejected3,
        rejected4 = source.rejected4,
        dispensed1 = source.dispensed1,
        dispensed2 = source.dispensed2,
        dispensed3 = source.dispensed3,
        dispensed4 = source.dispensed4,
        last1 = source.last1,
        last2 = source.last2,
        last3 = source.last3,
        last4 = source.last4,
        captured = source.captured,
        transactionCount = source.transactionCount,
        transactionSerialNumber = source.transactionSerialNumber
    WHEN NOT MATCHED BY target THEN
    INSERT
        (atmId,notes1,notes2,notes3,notes4,rejected1,rejected2,rejected3,rejected4,dispensed1,dispensed2,dispensed3,dispensed4,last1,last2,last3,last4,captured,transactionCount,transactionSerialNumber)
    VALUES
        (source.atmId,source.notes1,source.notes2,source.notes3,source.notes4,source.rejected1,source.rejected2,source.rejected3,source.rejected4,source.dispensed1,source.dispensed2,source.dispensed3,source.dispensed4,source.last1,source.last2,source.last3,source.last4,source.captured,source.transactionCount,source.transactionSerialNumber);
