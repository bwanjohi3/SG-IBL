CREATE PROCEDURE  [card].[documentCard.get]  -- --this SP returns details for the documents linked to the card
     @cardId bigint, -- id of the card
     @documentId bigint, -- id of the document linked to the card
     @meta core.metaDataTT READONLY  -- information for the user that makes the operation

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

        SELECT 'Document' AS resultSetName

    SELECT
        d.cardId,
        d.documentId,
        dd.DocumentTypeId,
        dd.documentTypeId,
        dd.documentNumber,
        dd.[description],
        dd.createdDate,
        a.attachmentId,
        a.contentType,
        a.extension,
        a.[filename],
        a.hash,
        a.attachmentSizeId
    FROM [card].[documentCard] AS d
        JOIN document.document AS dd ON d.DocumentId = dd.documentId
        JOIN document.attachment AS a ON a.documentId = dd.documentId
    WHERE
        ISNULL(@cardId, cardId) = cardId AND ISNULL(@documentId, d.documentId) = d.documentId


    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
