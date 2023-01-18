CREATE PROCEDURE [atm].[fitness.set]
    @fitness atm.fitnessTT READONLY
AS
    MERGE
        atm.fitness AS target
    USING
        @fitness AS source
    ON
        target.atmId = source.atmId
    WHEN MATCHED THEN
    UPDATE SET
        clock = source.clock,
        comms = source.comms,
        [disk] = source.[disk],
        cardReader = source.cardReader,
        cashHandler = source.cashHandler,
        depository = source.depository,
        receiptPrinter = source.receiptPrinter,
        journalPrinter = source.journalPrinter,
        nightDepository = source.nightDepository,
        encryptor = source.encryptor,
        camera = source.camera,
        doorAccess = source.doorAccess,
        flexDisk = source.flexDisk,
        cassette1 = source.cassette1,
        cassette2 = source.cassette2,
        cassette3 = source.cassette3,
        cassette4 = source.cassette4,
        statementPrinter = source.statementPrinter,
        signageDisplay = source.signageDisplay,
        systemDisplay = source.systemDisplay,
        mediaEntry = source.mediaEntry,
        envelopeDispenser = source.envelopeDispenser,
        documentProcessing = source.documentProcessing,
        coinDispenser = source.coinDispenser,
        voiceGuidance = source.voiceGuidance,
        noteAcceptor = source.noteAcceptor,
        chequeProcessor = source.chequeProcessor
    WHEN NOT MATCHED BY target THEN
    INSERT
        (atmId,clock,comms,[disk],cardReader,cashHandler,depository,receiptPrinter,journalPrinter,nightDepository,encryptor,camera,doorAccess,flexDisk,cassette1,cassette2,cassette3,cassette4,statementPrinter,signageDisplay,systemDisplay,mediaEntry,envelopeDispenser,documentProcessing,coinDispenser,voiceGuidance,noteAcceptor,chequeProcessor)
    VALUES
        (source.atmId,source.clock,source.comms,source.[disk],source.cardReader,source.cashHandler,source.depository,source.receiptPrinter,source.journalPrinter,source.nightDepository,source.encryptor,source.camera,source.doorAccess,source.flexDisk,source.cassette1,source.cassette2,source.cassette3,source.cassette4,source.statementPrinter,source.signageDisplay,source.systemDisplay,source.mediaEntry,source.envelopeDispenser,source.documentProcessing,source.coinDispenser,source.voiceGuidance,source.noteAcceptor,source.chequeProcessor);
