ALTER PROCEDURE [pos].[binList.edit] -- for update of pos application
    @binList [pos].binListTT READONLY, -- table with updated terminal information
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
    SET t.[transaction] = ISNULL(s.[transaction], t.[transaction]),
        t.[binId] = ISNULL(s.[binId] , t.[binId]),
        t.[productId] = ISNULL(s.[productId] , t.[productId])
    FROM [pos].[binList] t
    JOIN @binList s ON t.binListId = s.binListId
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
