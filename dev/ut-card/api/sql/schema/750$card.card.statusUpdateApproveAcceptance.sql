create procedure [card].[card.statusUpdateApproveAcceptance] -- executed when cards are accepted - updates acceptanceDate date
   @card [card].cardTT READONLY, -- the list with the cards
   @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update cc
    set cc.acceptanceDate = getdate(),
        cc.updatedBy = @userId,
        cc.updatedOn = getdate()
    from @card c
    join [card].[card] cc on c.cardId = cc.cardId

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH