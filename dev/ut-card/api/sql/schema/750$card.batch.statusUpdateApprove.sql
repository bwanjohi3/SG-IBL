create procedure [card].[batch.statusUpdateApprove] -- executed when a batch is approved - sets the reason Id and the comments to NULL
    @batch [card].batchTT READONLY, -- the list with the batches
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update b
    set b.reasonId = null,
       b.comments = null
    from @batch ba
    join [card].[batch] b on ba.batchId = b.batchId

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
 