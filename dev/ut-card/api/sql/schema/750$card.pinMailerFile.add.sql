ALTER PROCEDURE [card].[pinMailerFile.add]
    @pinMailerFile [card].pinMailerFileTT READONLY,
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

BEGIN TRY
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    IF (SELECT COUNT(*) FROM @pinMailerFile) <> 1
        RAISERROR('card.pinMailerFile.add.incorrectRowsInList', 16, 1);

    BEGIN TRANSACTION

        INSERT INTO [card].[pinMailerFile] ([name], [pinMailerFile], [pinLinkFile], [batchId], [count], [createdOn], [status], [udf])
        SELECT [name], [pinMailerFile], [pinLinkFile], [batchId], [count], getdate(), [status], [udf]
        FROM @pinMailerFile
    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
