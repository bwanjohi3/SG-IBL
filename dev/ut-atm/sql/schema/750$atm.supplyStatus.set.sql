CREATE PROCEDURE [atm].[supplyStatus.set]
    @supplyStatus atm.supplyStatusTT READONLY
AS
    MERGE
        atm.supplyStatus AS target
    USING
        @supplyStatus AS source
    ON
        target.atmId = source.atmId
    WHEN MATCHED THEN
    UPDATE SET
	    cardReader = source.cardReader,
	    depository = source.depository,
	    receiptPrinter = source.receiptPrinter,
	    journalPrinter = source.journalPrinter,
	    rejectBin = source.rejectBin,
	    cassette1 = source.cassette1,
	    cassette2 = source.cassette2,
	    cassette3 = source.cassette3,
	    cassette4 = source.cassette4
    WHEN NOT MATCHED BY target THEN
    INSERT
        (atmId,cardReader, depository, receiptPrinter, journalPrinter, rejectBin, cassette1, cassette2, cassette3, cassette4)
    VALUES
        (source.atmId, source.cardReader, source.depository, source.receiptPrinter, source.journalPrinter, source.rejectBin, source.cassette1, source.cassette2, source.cassette3, source.cassette4);
