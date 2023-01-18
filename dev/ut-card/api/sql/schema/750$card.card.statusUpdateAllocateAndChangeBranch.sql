create procedure [card].[card.statusUpdateAllocateAndChangeBranch] -- this SP changes the current and target branch ids when cards are allocated successfully
   @card [card].cardTT READONLY, -- the list with the cards
   @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update cc
    set cc.targetBranchId = c.targetBranchId,
        cc.currentBranchId = c.targetBranchId
    from @card c
    join [card].[card] cc on c.cardId = cc.cardId

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH