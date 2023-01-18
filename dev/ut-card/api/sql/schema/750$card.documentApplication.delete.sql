CREATE PROCEDURE  [card].[documentApplication.delete]  -- delete document and attachments
    @document document.documentTT READONLY, -- receive the entered fields for new document
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @callParams XML
DECLARE @result document.attachmentTT,
        @tranCounter INT
DECLARE @documentResult TABLE (documentId BIGINT, docSystemId BIGINT)

BEGIN TRY
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

        BEGIN TRANSACTION

    --1. Delete associated document(s) from the respective application(s)
    DELETE da
    FROM card.documentApplication da
    JOIN @document dd ON da.documentId = dd.documentId

    --2. Mark core document as 'deleted'
    UPDATE dd
    SET dd.statusId = 'deleted'
    FROM document.document AS dd
    JOIN @document AS ld ON dd.documentId = ld.DocumentId

    IF @TranCounter = 0

        COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
