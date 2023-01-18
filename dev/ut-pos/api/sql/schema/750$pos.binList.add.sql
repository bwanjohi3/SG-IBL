ALTER PROCEDURE pos.[binList.add] -- adds new pos application
    @binList pos.binListTT READONLY, -- table with information about the new terminal
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

BEGIN TRY
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    IF (SELECT COUNT(*) FROM @binList) <> 1
        RAISERROR('pos.binList.add.incorrectRowsInList', 16, 1);

    BEGIN TRANSACTION

        INSERT INTO pos.binList ([transaction], [binId], [productId])
        SELECT [transaction], [binId], [productId]
        FROM @binList


    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
