ALTER PROCEDURE [pos].[brandModel.edit] -- for update of pos brand model
    @brandModel [pos].brandModelTT READONLY, -- table with updated terminal information
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
    SET t.brand = ISNULL(s.brand, t.brand),
        t.model = ISNULL(s.model , t.model),
        t.[description] = ISNULL(s.[description] , t.[description])

    FROM [pos].[brandModel] t
    JOIN @brandModel s ON t.brandModelId = s.brandModelId
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
