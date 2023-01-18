ALTER PROCEDURE  [card].[documentApplication.add]  -- this SP adds documents and attachments to applications
    @document document.documentTT READONLY, -- receive the entered fields for new document
    @attachment document.attachmentTT READONLY, -- receive the entered fields for all attachements for new document
    @applicationId int,
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
     IF @TranCounter = 0
        BEGIN TRANSACTION

       INSERT INTO @documentResult
       EXEC [document].[document.add]
            @document = @document,
            @attachment = @attachment,
            @meta = @meta,
            @noResultSet = 0

    INSERT INTO [card].[documentApplication] (applicationId, DocumentId)
    SELECT @applicationId, d.documentId
    FROM @documentResult AS d

    IF @TranCounter = 0
        COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
