CREATE PROCEDURE  [card].[documentApplication.edit]  -- edit document and attachments
    @applicationId bigint, --a table that holds information which document to which application is related
    @document document.documentTT READONLY, -- receive the entered fields for new document
    @attachment document.attachmentTT READONLY, -- receive the entered fields for all attachements for new document
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
DECLARE @callParams XML
DECLARE @result document.attachmentTT,
        @tranCounter INT = @@TRANCOUNT
DECLARE @documentResult TABLE (documentId BIGINT, docSystemId BIGINT, statusId varchar(20))

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

    ;MERGE into [document].[document] as dd
    using
    (
        select [documentId], [description], DocumentTypeId, statusid
        from @document
    ) d on dd.documentId=d.documentId
    WHEN MATCHED THEN
        UPDATE
        set dd.[description] = d.[description],
            dd.DocumentTypeId = d.DocumentTypeId
    WHEN NOT MATCHED BY TARGET THEN
        insert (documentTypeId, statusId, description, createdDate)
        values(documentTypeId, isnull(statusId, 'approved'), description, getDate())
    when not matched by source and dd.documentId in (select documentId from [card].documentApplication where applicationId = @applicationId ) then
        update set [statusId] = 'deleted'
    OUTPUT INSERTED.documentId, d.documentId, inserted.statusid INTO @documentResult(documentId, docSystemId, statusid);


       ;merge into [document].attachment as a
    using
    (
        select attachmentId, contentType, extension, filename, hash, a.documentId, attachmentSizeId, page, dr.documentId as newDocumentId, dr.statusid
        from @attachment a
        join @documentResult dr on dr.docSystemId = a.documentid
    ) as att
    on a.attachmentId = att.attachmentId
    when matched then
        update set contentType = att.contentType,
                   extension = att.extension,
                   filename = att.filename,
                   hash = att.hash,
                   attachmentSizeId = att.attachmentSizeId,
                   page = att.page,
                   documentId = att.newDocumentId
    when not matched by target then
        insert (contentType, extension, filename, hash, documentId, attachmentSizeId, page)
        values (contentType, extension, filename, hash, newDocumentId, attachmentSizeId, page)
      when not matched by source and a.documentid in (select documentid from @documentResult) then
        Delete;


    ;merge into [card].documentApplication da
    using
    (
        select * from @documentResult
    ) as dr on da.applicationId = @applicationId and da.documentId = dr.documentId
    when matched and dr.statusid = 'deleted' then
        delete
    when not matched by target and  dr.statusid != 'deleted' then
        insert  (applicationId, DocumentId)
        values (@applicationId, dr.documentId);


    IF @TranCounter = 0
        COMMIT TRANSACTION


    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 and  @TranCounter = 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
