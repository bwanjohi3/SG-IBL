ALTER PROCEDURE [pos].[application.edit] -- for update of pos application
    @application [pos].applicationTT READONLY, -- table with updated terminal information
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
        t.[version] = ISNULL(s.[version] , t.[version]),        
        t.[description] = ISNULL(s.[description] , t.[description]),
        t.[datePublished] = ISNULL(s.[datePublished] , t.[datePublished]),
        t.[firmwarePath] = ISNULL(s.[firmwarePath] , t.[firmwarePath])
    FROM [pos].[application] t
    JOIN @application s ON t.appId = s.appId
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
