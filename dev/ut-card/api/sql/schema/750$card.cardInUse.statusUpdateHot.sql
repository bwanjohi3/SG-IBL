CREATE procedure [card].[cardInUse.statusUpdateHot] -- this procedure updates card status to HOT
    @card [card].cardTT READONLY, -- card details
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

BEGIN TRY
    exec @return = [user].[permission.check] @actionId = @actionID, @objectId = null, @meta = @meta

   DECLARE @status TINYINT  = (select statusId from card.status where statusName = 'Completed')

    update [card].[application]
    set statusId = @status
    from @card c
    join [card].[card] cc on c.cardId = cc.cardId
    join [card].[application] ca on ca.applicationId = cc.applicationId

     EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
    