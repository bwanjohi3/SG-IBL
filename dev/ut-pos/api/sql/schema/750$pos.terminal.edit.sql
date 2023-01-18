ALTER PROCEDURE [pos].[terminal.edit] -- for update of pos
    @terminal [pos].terminalTT READONLY, -- table with updated terminal information
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
BEGIN TRY
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    IF EXISTS (
        SELECT 1 FROM pos.terminal t
        JOIN @terminal s ON s.terminalNumber = t.terminalNumber)
        RAISERROR('pos.duplicateTerminalNumber', 16, 1);
    
    IF EXISTS (
        SELECT 1 FROM pos.terminal t
        JOIN @terminal s ON s.terminalSerial = t.terminalSerial)
        RAISERROR('pos.duplicateTerminalSerial', 16, 1);

    UPDATE t
    SET t.terminalNumber = ISNULL(s.terminalNumber, t.terminalNumber),
        t.terminalSerial = ISNULL(s.terminalSerial , t.terminalSerial),
        t.[name] = ISNULL(s.[name] , t.[name]),
        t.merchantName = ISNULL(s.merchantName , t.merchantName),
        t.terminalBrandModelId = ISNULL(s.terminalBrandModelId , t.terminalBrandModelId),
        t.[location] = ISNULL(s.[location] , t.[location]),
        t.[adminPassword] = ISNULL(s.[adminPassword] , t.[adminPassword]),
        t.[description] = ISNULL(s.[description] , t.[description]),
        t.tmk = ISNULL(s.tmk , t.tmk),
        t.tmkkvv = ISNULL(s.tmkkvv , t.tmkkvv),
        t.dek = ISNULL(s.dek , t.dek),
        t.dekkvv = ISNULL(s.dekkvv , t.dekkvv),
        t.fTmk = ISNULL(s.fTmk , t.fTmk),
        t.fTmkKvv = ISNULL(s.fTmkKvv , t.fTmkKvv),
        t.kekDukpt = ISNULL(s.kekDukpt , t.kekDukpt),
        t.kekDukptKvv = ISNULL(s.kekDukptKvv , t.kekDukptKvv),
        t.active = ISNULL(s.active , t.active),
        t.newVersionId = ISNULL(s.newVersionId , t.newVersionId),
        t.currVersion = ISNULL(s.currVersion , t.currVersion),
        t.keyChainId = ISNULL(s.keyChainId, t.keyChainId),
        t.businessUnitId = ISNULL(s.businessUnitId, t.businessUnitId),
        t.header1 = ISNULL(s.header1, t.header1),
        t.header2 = ISNULL(s.header2, t.header2),
        t.header3 = ISNULL(s.header3, t.header3),
        t.header4 = ISNULL(s.header4, t.header4),
        t.footer1 = ISNULL(s.footer1, t.footer1),
        t.footer2 = ISNULL(s.footer2, t.footer2),
        t.footer3 = ISNULL(s.footer3, t.footer3)
    FROM [pos].[terminal] t
    JOIN @terminal s ON t.actorId = s.actorId
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
