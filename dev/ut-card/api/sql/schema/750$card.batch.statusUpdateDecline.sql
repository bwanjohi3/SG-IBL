create procedure [card].[batch.statusUpdateDecline] -- executed when batch for Named card is declined - reverts application status to previous card status and updates reason Id and comment from batch
    @batch [card].batchTT READONLY,-- the list with the batches
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    DECLARE @statusId INT = (SELECT statusId from card.status  where statusName='Declined')

    -- revert application status to previous
    update ap
    set ap.statusId = ap.previousStatusId,
        previousStatusId = ap.statusId,
        batchid = null,
        updatedBy = @userId,
       updatedOn = GETDATE()
    from @batch b
    join [card].[application] ap on ap.batchId = b.batchId

     -- update card status to Declined
    update c
    set statusId = @statusId,
        updatedBy = @userId,
       updatedOn = GETDATE()
    from @batch b
    join card.card c on c.batchId = b.batchId

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
 