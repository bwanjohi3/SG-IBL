ALTER PROCEDURE [atm].[terminal.fetch]
    @atmId int,
    @pageSize int = 25,
    @pageNumber int = 1
AS
SET NOCOUNT ON;

IF @atmId IS NULL
BEGIN
    IF OBJECT_ID('tempdb..#Terminals') IS NOT NULL
        DROP TABLE #Terminals

    ;WITH terminalsCTE AS
    (
        SELECT t.actorId,
            -- paging columns
            ROW_NUMBER() OVER (ORDER BY t.actorId) rowNum,
            COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
        FROM atm.terminal t
   )

   select actorId, tCTE.rowNum, tCTE.recordsTotal
   INTO #Terminals
   from terminalsCTE tCTE
   WHERE rowNum BETWEEN ((@pageNumber - 1) * @pageSize) + 1 AND @pageSize * (@pageNumber)

   SELECT 'terminals' as resultSetName

   select t.actorId as atmId, t.luno, t.tmk, t.tmkkvv, t.name, t.terminalId, t.merchantId, t.merchantType, t.[address], t.country, t.[state], t.city,
            t.institutionCode, t.identificationCode, t.tillAccount, t.feeAccount, t.customization, t.commissionAccount,
            CAST(t.cassette1Denomination AS varchar) cassette1Denomination, t.cassette1Currency,
            CAST(t.cassette2Denomination AS varchar) cassette2Denomination, t.cassette2Currency,
            CAST(t.cassette3Denomination AS varchar) cassette3Denomination, t.cassette3Currency,
            CAST(t.cassette4Denomination AS varchar) cassette4Denomination, t.cassette4Currency,
            s.[supervisorMode] as 'sensor.supervisorMode', s.[vibration] as 'sensor.vibration', s.[door] as 'sensor.door', s.[silentSignal] as 'sensor.silentSignal',
            s.[electronicsEnclosure] as 'sensor.electronicsEnclosure', s.[depositBin] as 'sensor.depositBin', s.[cardBin] as 'sensor.cardBin',
            s.[rejectBin] as 'sensor.rejectBin', s.[cassette1] as 'sensor.cassette1', s.[cassette2] as 'sensor.cassette2', s.[cassette3] as 'sensor.cassette3',
            s.[cassette4] as 'sensor.cassette4', s.[coinDispenser] as 'sensor.coinDispenser', s.[coinHopper1] as 'sensor.coinHopper1', s.[coinHopper2] as 'sensor.coinHopper2',
            s.[coinHopper3] as 'sensor.coinHopper3', s.[coinHopper4] as 'sensor.coinHopper4', s.[cpmPockets] as 'sensor.cpmPockets',
            f.[clock] as 'fitness.clock', f.[comms] as 'fitness.comms', f.[disk] as 'fitness.disk', f.[cardReader] as 'fitness.cardReader', f.[cashHandler] as 'fitness.cashHandler',
            f.[depository] as 'fitness.depository', f.[receiptPrinter] as 'fitness.receiptPrinter', f.[journalPrinter] as 'fitness.journalPrinter', f.[nightDepository] as 'fitness.nightDepository',
            f.[encryptor] as 'fitness.encryptor', f.[camera] as 'fitness.camera', f.[doorAccess] as 'fitness.doorAccess', f.[flexDisk] as 'fitness.flexDisk',
            f.[cassette1] as 'fitness.cassette1', f.[cassette2] as 'fitness.cassette2', f.[cassette3] as 'fitness.cassette3', f.[cassette4] as 'fitness.cassette4',
            f.[statementPrinter] as 'fitness.statementPrinter', f.[signageDisplay] as 'fitness.signageDisplay', f.[systemDisplay] as 'fitness.systemDisplay', f.[mediaEntry] as 'fitness.mediaEntry',
            f.[envelopeDispenser] as 'fitness.envelopeDispenser', f.[documentProcessing] as 'fitness.documentProcessing', f.[coinDispenser] as 'fitness.coinDispenser',
            f.[voiceGuidance] as 'fitness.voiceGuidance', f.[noteAcceptor] as 'fitness.noteAcceptor', f.[chequeProcessor] as 'fitness.chequeProcessor',
            ss.[cardReader] as 'supply.cardReader', ss.[depository] as 'supply.depository', ss.[receiptPrinter] as 'supply.receiptPrinter', ss.[journalPrinter] as 'supply.journalPrinter',
            ss.[rejectBin] as 'supply.rejectBin', ss.[cassette1] as 'supply.cassette1', ss.[cassette2] as 'supply.cassette2', ss.[cassette3] as 'supply.cassette3', ss.[cassette4] as 'supply.cassette4',
            sc.[notes1] as 'counter.notes1', sc.[notes2] as 'counter.notes2', sc.[notes3] as 'counter.notes3', sc.[notes4] as 'counter.notes4',
            sc.[rejected1] as 'counter.rejected1', sc.[rejected2] as 'counter.rejected2', sc.[rejected3] as 'counter.rejected3', sc.[rejected4] as 'counter.rejected4',
            sc.[dispensed1] as 'counter.dispensed1', sc.[dispensed2] as 'counter.dispensed2', sc.[dispensed3] as 'counter.dispensed3', sc.[dispensed4] as 'counter.dispensed4',
            sc.[last1] as 'counter.last1', sc.[last2] as 'counter.last2', sc.[last3] as 'counter.last3', sc.[last4] as 'counter.last4',
            sc.[captured] as 'counter.captured', sc.[transactionCount] as 'counter.transactionCount', sc.[transactionSerialNumber] as 'counter.transactionSerialNumber',
            co.actorId as branchId, co.organizationName,
            -- paging
            term.rowNum, term.recordsTotal
    FROM #Terminals term
    JOIN atm.terminal t on term.actorId = t.actorId
    LEFT JOIN atm.fitness f on f.atmId = t.actorId
    LEFT JOIN atm.sensor s on s.atmId = t.actorId
    LEFT JOIN atm.supplyStatus ss on ss.atmId = t.actorId
    LEFT JOIN atm.supplyCounters sc on sc.atmId = t.actorId
    LEFT JOIN customer.organization co on co.actorId = t.branchId


    SELECT 'pagination' AS resultSetName

    SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #Terminals

END
ELSE
BEGIN
    SELECT 'terminal' as resultSetName

    SELECT t.actorId as atmId, t.luno, t.tmk, t.tmkkvv, t.name, t.terminalId, t.merchantId, t.merchantType, t.[address], t.country, t.[state], t.city,
        t.institutionCode, t.identificationCode, t.tillAccount, t.feeAccount, t.customization, t.commissionAccount,
        CAST(t.cassette1Denomination AS varchar) cassette1Denomination, t.cassette1Currency,
        CAST(t.cassette2Denomination AS varchar) cassette2Denomination, t.cassette2Currency,
        CAST(t.cassette3Denomination AS varchar) cassette3Denomination, t.cassette3Currency,
        CAST(t.cassette4Denomination AS varchar) cassette4Denomination, t.cassette4Currency,
        s.[supervisorMode] as 'sensor.supervisorMode', s.[vibration] as 'sensor.vibration', s.[door] as 'sensor.door', s.[silentSignal] as 'sensor.silentSignal',
        s.[electronicsEnclosure] as 'sensor.electronicsEnclosure', s.[depositBin] as 'sensor.depositBin', s.[cardBin] as 'sensor.cardBin',
        s.[rejectBin] as 'sensor.rejectBin', s.[cassette1] as 'sensor.cassette1', s.[cassette2] as 'sensor.cassette2', s.[cassette3] as 'sensor.cassette3',
        s.[cassette4] as 'sensor.cassette4', s.[coinDispenser] as 'sensor.coinDispenser', s.[coinHopper1] as 'sensor.coinHopper1', s.[coinHopper2] as 'sensor.coinHopper2',
        s.[coinHopper3] as 'sensor.coinHopper3', s.[coinHopper4] as 'sensor.coinHopper4', s.[cpmPockets] as 'sensor.cpmPockets',
        f.[clock] as 'fitness.clock', f.[comms] as 'fitness.comms', f.[disk] as 'fitness.disk', f.[cardReader] as 'fitness.cardReader', f.[cashHandler] as 'fitness.cashHandler',
        f.[depository] as 'fitness.depository', f.[receiptPrinter] as 'fitness.receiptPrinter', f.[journalPrinter] as 'fitness.journalPrinter', f.[nightDepository] as 'fitness.nightDepository',
        f.[encryptor] as 'fitness.encryptor', f.[camera] as 'fitness.camera', f.[doorAccess] as 'fitness.doorAccess', f.[flexDisk] as 'fitness.flexDisk',
        f.[cassette1] as 'fitness.cassette1', f.[cassette2] as 'fitness.cassette2', f.[cassette3] as 'fitness.cassette3', f.[cassette4] as 'fitness.cassette4',
        f.[statementPrinter] as 'fitness.statementPrinter', f.[signageDisplay] as 'fitness.signageDisplay', f.[systemDisplay] as 'fitness.systemDisplay', f.[mediaEntry] as 'fitness.mediaEntry',
        f.[envelopeDispenser] as 'fitness.envelopeDispenser', f.[documentProcessing] as 'fitness.documentProcessing', f.[coinDispenser] as 'fitness.coinDispenser',
        f.[voiceGuidance] as 'fitness.voiceGuidance', f.[noteAcceptor] as 'fitness.noteAcceptor', f.[chequeProcessor] as 'fitness.chequeProcessor',
        ss.[cardReader] as 'supply.cardReader', ss.[depository] as 'supply.depository', ss.[receiptPrinter] as 'supply.receiptPrinter', ss.[journalPrinter] as 'supply.journalPrinter',
        ss.[rejectBin] as 'supply.rejectBin', ss.[cassette1] as 'supply.cassette1', ss.[cassette2] as 'supply.cassette2', ss.[cassette3] as 'supply.cassette3', ss.[cassette4] as 'supply.cassette4',
        sc.[notes1] as 'counter.notes1', sc.[notes2] as 'counter.notes2', sc.[notes3] as 'counter.notes3', sc.[notes4] as 'counter.notes4',
        sc.[rejected1] as 'counter.rejected1', sc.[rejected2] as 'counter.rejected2', sc.[rejected3] as 'counter.rejected3', sc.[rejected4] as 'counter.rejected4',
        sc.[dispensed1] as 'counter.dispensed1', sc.[dispensed2] as 'counter.dispensed2', sc.[dispensed3] as 'counter.dispensed3', sc.[dispensed4] as 'counter.dispensed4',
        sc.[last1] as 'counter.last1', sc.[last2] as 'counter.last2', sc.[last3] as 'counter.last3', sc.[last4] as 'counter.last4',
        sc.[captured] as 'counter.captured', sc.[transactionCount] as 'counter.transactionCount', sc.[transactionSerialNumber] as 'counter.transactionSerialNumber',
        co.actorId as branchId, co.organizationName
    FROM atm.terminal t
    LEFT JOIN atm.fitness f on f.atmId = t.actorId
    LEFT JOIN atm.sensor s on s.atmId = t.actorId
    LEFT JOIN atm.supplyStatus ss on ss.atmId = t.actorId
    LEFT JOIN atm.supplyCounters sc on sc.atmId = t.actorId
    LEFT JOIN customer.organization co on co.actorId = t.branchId
    WHERE t.actorId = @atmId
END