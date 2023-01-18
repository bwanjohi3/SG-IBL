ALTER PROCEDURE [pos].[application.statusUpdate] -- for update of pos application
    @app [pos].applicationTT READONLY, -- table with updated terminal information
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
    SET t.isEnabled = s.isEnabled
    FROM [pos].[application] t
    JOIN @app s ON t.appId = s.appId
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION 

    EXEC core.error
    RETURN 55555
END CATCH
