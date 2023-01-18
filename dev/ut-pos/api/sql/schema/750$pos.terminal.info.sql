ALTER PROCEDURE pos.[terminal.info] -- get pos info
    @terminalSerial VARCHAR(50), -- table with information about the new terminal
    @terminalNumber VARCHAR(50), -- table with information about the new terminal
    @noResultSet BIT, -- a flag to show if result is expected
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

BEGIN TRY

    IF @terminalSerial IS NULL AND @terminalNumber IS NULL
        RAISERROR('pos.missingInput', 16, 1);

    IF OBJECT_ID('tempdb..#terminal') IS NOT NULL
        DROP TABLE #terminal

    SELECT *
    INTO #terminal
    FROM
    (
        SELECT
            it.actorId posId,
            it.tmk,
            it.tmkkvv,
            it.dek,
            it.dekkvv,
            it.[name],
            it.merchantName,
            it.keyChainId,
            pkc.keyChainTypeID, -- Fix Key:1  Master-Session:2 Dukpt:3     
            it.fTmk,
            it.kekDukpt,
            it.tillAccount,
            it.feeAccount,
            it.adminPassword,
            it.merchantPassword,
            it.currVersion,
            pap.version as newVersion,
            it.testPosData,
            tp.settlementDate,
            it.header1,
            it.header2,
            it.header3,
            it.header4,
            it.footer1,
            it.footer2,
            it.footer3,
            it.location,
            cou.name as countryName,
            cou.countryCode,
            co.organizationName,
            'pos' AS profileName
        FROM pos.terminal it
        JOIN pos.keyChain pkc ON pkc.keyChainId = it.keyChainId
        LEFT JOIN [transfer].[partner] tp ON tp.actorId = it.actorId
        LEFT JOIN customer.organization co ON co.actorId = it.businessUnitId
        LEFT JOIN customer.country cou ON cou.countryId = co.countryId
        LEFT JOIN pos.application pap ON it.newVersionId = pap.appId
        WHERE (@terminalSerial IS NULL OR terminalSerial = @terminalSerial) 
            AND (@terminalNumber IS NULL OR terminalNumber = @terminalNumber)
    ) a

    SELECT 'terminalInfo' AS resultSetName

    SELECT *
    FROM #terminal

    SELECT 'keyInfo' AS resultSetName

    SELECT [keyChainItemId], pkci.[keyChainId], pkci.[keyChainItemTypeId], pkcit.name AS itemTtypeName, [value], [checkValue]
    FROM [pos].[keyChainItem] pkci
    JOIN #terminal t ON t.keyChainId = pkci.keyChainId
    JOIN [pos].[keyChainItemType] pkcit ON pkcit.keyChainItemTypeId = pkci.keyChainItemTypeId

END TRY
BEGIN CATCH
    RETURN 5555
END CATCH
