ALTER PROCEDURE pos.[application.add] -- adds new pos application
    @application pos.applicationTT READONLY, -- table with information about the new terminal
    @noResultSet BIT, -- a flag to show if result is expected
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @appId BIGINT
DECLARE @callParams XML
BEGIN TRY
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    IF (SELECT COUNT(*) FROM @application) <> 1
        RAISERROR('pos.application.add.incorrectRowsInList', 16, 1);

    BEGIN TRANSACTION

        INSERT INTO pos.application ([name], [description], [version], [datePublished], [firmwarePath])
        SELECT [name], [description], [version], [datePublished], [firmwarePath]
        FROM @application

        SET @appId = SCOPE_IDENTITY()

    COMMIT TRANSACTION
    IF ISNULL(@noResultSet, 0) = 0
        BEGIN
            SELECT 'app' AS resultSetName
            SELECT @appId AS appId
        END
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
