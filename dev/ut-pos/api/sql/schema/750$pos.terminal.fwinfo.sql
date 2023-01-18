ALTER PROCEDURE pos.[terminal.fwinfo] -- get pos info
    @terminalSerial VARCHAR(50), -- table with information about the new terminal
    @terminalNumber VARCHAR(50), -- table with information about the new terminal
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

BEGIN TRY

    IF @terminalSerial IS NULL AND @terminalNumber IS NULL
        RAISERROR('pos.missingInput', 16, 1);


    SELECT
            it.actorId posId,
            it.[name],
            it.currVersion,
            pap.name,
            pap.version,
            pap.firmwarePath,
            'pos' AS profileName
    FROM pos.terminal it
    LEFT JOIN [transfer].[partner] tp ON tp.actorId = it.actorId
    LEFT JOIN pos.application pap ON it.newVersionId = pap.appId
    WHERE (@terminalSerial IS NULL OR terminalSerial = @terminalSerial) 
        AND (@terminalNumber IS NULL OR terminalNumber = @terminalNumber)

END TRY
BEGIN CATCH
    RETURN 5555
END CATCH
