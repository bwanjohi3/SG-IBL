ALTER PROCEDURE pos.[brandModel.add] -- adds new pos brand model
    @brandModel pos.brandModelTT READONLY, -- table with information about the new terminal
    @noResultSet BIT, -- a flag to show if result is expected
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @brandModelId BIGINT
DECLARE @callParams XML
BEGIN TRY
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    IF (SELECT COUNT(*) FROM @brandModel) <> 1
        RAISERROR('pos.brandModel.add.incorrectRowsInList', 16, 1);

    BEGIN TRANSACTION

        INSERT INTO pos.brandModel (brand, [model], [description])
        SELECT brand, model, [description]
        FROM @brandModel

        SET @brandModelId = SCOPE_IDENTITY()
    COMMIT TRANSACTION

    IF ISNULL(@noResultSet, 0) = 0
        BEGIN
            SELECT 'brandModel' AS resultSetName
            SELECT @brandModelId AS brandModelId
        END
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
