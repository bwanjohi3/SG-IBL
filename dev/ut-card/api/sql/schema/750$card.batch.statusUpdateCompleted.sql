ALTER procedure [card].[batch.statusUpdateCompleted] -- the procedure updates the passed cards statuses to Accepted, not passed cards are set to Declined and respective applications are excluded from the batch and set to Approved
    @batch [card].batchTT READONLY, -- the list with the batches
    @cardsCurrentBranchId BIGINT = NULL, -- the cards' current branch ID when completing batch
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @acceptedId tinyint = (select statusId from card.status where statusName = 'Accepted')
DECLARE @declinedId tinyint = (select statusId from card.status where statusName = 'Declined')


BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    -- update cards in card.card table in status Accepted
    -- update cards' currentBranchId
    update cc
    set cc.previousStatusId = cc.statusId,
       cc.statusId = @acceptedId,
       cc.updatedBy = @userId,
       cc.updatedOn = getdate(),
       cc.currentBranchId = ISNULL(@cardsCurrentBranchId, cc.currentBranchId)
    from card.card cc
    join @batch b on cc.batchid = b.batchid

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
 