ALTER PROCEDURE atm.[terminal.add]				 -- adds new atm
    @terminal atm.terminalTT READONLY, -- table with information about the new terminal
    @noResultSet BIT, -- a flag to show if result is expected
    @meta core.metaDataTT READONLY			 -- information for the user that makes the operation
AS
DECLARE @terminalId BIGINT
DECLARE @callParams XML
BEGIN TRY
    /*  permission.check will be added later when user modul is added into project */

    --  declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    --  exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    /*  permission.check will be added later when user modul is added into project */

    IF (SELECT COUNT(*) FROM @terminal) <> 1
        RAISERROR('atm.terminal.add.incorrectRowsInList', 16, 1);

    IF EXISTS (SELECT 1 FROM atm.terminal WHERE tmkkvv IN (SELECT tmkkvv FROM  @terminal))
        RAISERROR('atm.duplicateTmkkvv', 16, 1);

    IF EXISTS (SELECT 1 FROM atm.terminal WHERE terminalId IN (SELECT terminalId FROM  @terminal))
        RAISERROR('atm.duplicateTerminalId', 16, 1);

    IF EXISTS (SELECT 1 FROM @terminal WHERE len([address] + ISNULL([city], '') + ISNULL([state], '') + ISNULL([country], '')) > 40)    
        RAISERROR('atm.terminalAddressLimitExceeded', 16, 1);    

    BEGIN TRANSACTION

        EXEC core.[actor.add] @actorType = 'atm',
                                @actorId = @terminalId OUT,
                                @meta = @meta

        IF @terminalId IS NULL
            RAISERROR('atm.terminal.add.unsuccessfulAdd', 16, 1);

        INSERT INTO atm.terminal (actorId, luno, tmk, tmkkvv, name, customization, institutionCode, terminalId, [address], country, [state], city,
                                    identificationCode, merchantId, merchantType, tsn, cassette1Currency, cassette1Denomination, cassette2Currency, cassette2Denomination,
                                    cassette3Currency, cassette3Denomination, cassette4Currency, cassette4Denomination, tillAccount, feeAccount, commissionAccount, branchId)
        SELECT @terminalId, luno, tmk, tmkkvv, name, customization, institutionCode, terminalId, [address], country, [state], city,
                                    identificationCode, merchantId, merchantType, tsn, cassette1Currency, cassette1Denomination, cassette2Currency, cassette2Denomination,
                                    cassette3Currency, cassette3Denomination, cassette4Currency, cassette4Denomination, tillAccount, feeAccount, commissionAccount, branchId
        FROM @terminal

    COMMIT TRANSACTION

    IF ISNULL(@noResultSet, 0) = 0
        BEGIN
            SELECT 'terminal' AS resultSetName
            SELECT @terminalId AS terminalID
        END
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH