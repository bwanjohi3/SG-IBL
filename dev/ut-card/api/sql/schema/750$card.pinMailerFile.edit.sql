ALTER PROCEDURE [card].[pinMailerFile.edit]
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

    UPDATE t
    SET t.[name] = ISNULL(s.[name], t.[name]),
        t.[batchId] = ISNULL(s.[batchId] , t.[batchId]),
        t.[count] = ISNULL(s.[count] , t.[count]),
        t.[status] = ISNULL(s.[status] , t.[status]),
        t.[udf] = ISNULL(s.[udf] , t.[udf])
    FROM [card].[pinMailerFile] t
    JOIN @pinMailerFile s ON t.id = s.id
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
