ALTER procedure [card].[batch.generatePinMail] -- this procedure sets for the cards that are passed that their pin mails are generated
   @card [card].cardTT READONLY, -- in this parameter the stored procedure receives all fields of cards
   @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update cc
    set isPinMailGenerated = 1,
        cc.generatedPinMails = isnull(cc.generatedPinMails, 0) + 1,
        cc.pinOffset = isnull(c.pinOffset, cc.pinOffset),
        cc.updatedBy = @userId,
        cc.updatedOn = GETDATE()
    from @card c
    join card.card cc on cc.cardId = c.cardId

    declare @generatedPinMails table (cardCount int, batchId int )

    insert into @generatedPinMails (cardCount, batchId)
    select count (distinct cc.cardId) as cardCount, c.batchId
    from @card c
    join card.card cc on cc.batchId = c.batchId
    where cc.isPinMailGenerated = 1
    group by c.batchId

    update b
    set generatedPinMails = g.cardCount,
        b.updatedBy = @userId,
        b.updatedOn = GETDATE()
    from @generatedPinMails g
    join card.batch b on b.batchId = g.batchId


    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
 