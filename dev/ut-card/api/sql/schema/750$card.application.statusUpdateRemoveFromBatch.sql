create procedure [card].[application.statusUpdateRemoveFromBatch]  -- executed when the application is removed from batch - sets the batch ID to NULL in application
    @application [card].applicationTT READONLY,-- the list with the applications
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update b
    set b.numberOfCards = numberOfCards - number
    from
    (
        select a.batchId, count(a.applicationId) as number
        from @application a
        group by batchId
    ) a
    join [card].[batch] b on a.batchId = b.batchId    

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH