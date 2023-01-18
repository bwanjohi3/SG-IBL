ALTER PROCEDURE pos.[terminal.add] -- adds new pos
    @terminal pos.terminalTT READONLY, -- table with information about the new terminal
    @noResultSet BIT, -- a flag to show if result is expected
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @terminalId BIGINT
DECLARE @callParams XML
BEGIN TRY
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    IF (SELECT COUNT(*) FROM @terminal) <> 1
        RAISERROR('pos.multipleUnsupported', 16, 1);

    /* IF EXISTS (SELECT 1 FROM pos.terminal WHERE tmkkvv IN (SELECT tmkkvv FROM @terminal))
        RAISERROR('pos.duplicateTmkkvv', 16, 1);
    */

    IF EXISTS (
        SELECT 1 FROM pos.terminal t
        JOIN @terminal s ON s.terminalNumber = t.terminalNumber)
        RAISERROR('pos.duplicateTerminalNumber', 16, 1);

    BEGIN TRANSACTION
        EXEC core.[actor.add]
            @actorType = 'pos',
            @actorId = @terminalId OUT,
            @meta = @meta

        IF @terminalId IS NULL
            RAISERROR('pos.unsuccessfulAdd', 16, 1);

        INSERT INTO pos.terminal ([actorId], [terminalNumber], [terminalSerial], [name], [tsn], [merchantName], [terminalBrandModelId], [location], 
            [description], [currVersion], [newVersionId], [keyChainId], [tmk], [tmkkvv], [dek], [dekkvv], [fTmk], [fTmkKvv],
            [kekDukpt], [kekDukptKvv], [tillAccount], [feeAccount], [commissionAccount], [active], [adminPassword], [merchantPassword], [testPosData],
            businessUnitId, header1, header2, header3, header4, footer1, footer2, footer3)
        SELECT @terminalId, [terminalNumber], [terminalSerial], [name], [tsn], [merchantName], [terminalBrandModelId], [location],
            [description], [currVersion], [newVersionId], [keyChainId], [tmk], [tmkkvv], [dek], [dekkvv], [fTmk], [fTmkKvv], 
            [kekDukpt], [kekDukptKvv], [tillAccount], [feeAccount], [commissionAccount], [active], [adminPassword], [merchantPassword], [testPosData],
            businessUnitId, header1, header2, header3, header4, footer1, footer2, footer3
        FROM @terminal

        DECLARE @roleId BIGINT = (SELECT [value] FROM [core].[configuration] WHERE [key] = 'roleIdForPOS')
        IF @roleId IS NOT NULL
        BEGIN
            INSERT INTO core.actorHierarchy(subject, predicate, object, isDefault)
            VALUES(@terminalId, 'role', @roleId, 1)
        END
        ELSE
        BEGIN
            RAISERROR('pos.terminalMissingRole', 16, 1);
        END    

    COMMIT TRANSACTION

    IF ISNULL(@noResultSet, 0) = 0
        BEGIN
            SELECT 'terminalId' AS resultSetName
            SELECT @terminalId AS terminalId
        END
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
