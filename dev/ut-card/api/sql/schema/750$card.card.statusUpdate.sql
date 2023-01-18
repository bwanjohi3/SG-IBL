ALTER PROCEDURE [card].[card.statusUpdate] -- the SP changes status of the cards in DB
    @card [card].cardTT READONLY,-- in this parameter the stored procedure receives all fields of cards
    @account [card].cardAccountTT READONLY,-- in this parameter the stored procedure receives all fields of accounts linked to cards
    @cardActionId tinyint, --the performed action id
    @batch [card].batchTT READONLY,  --the batch details if the applications are added in a batch
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @noResultSet bit = 0 -- this is the flag about the waited result
AS
DECLARE @callParams XML

declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
if @return != 0
BEGIN
    RETURN 55555
END


DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

DECLARE @cardFiltered [card].cardTT

DECLARE @actionName varchar(50) = (select actionName from [card].[action] where actionId = @cardActionId)

declare @cardActionToPerform table(cardId bigint, toStatusId tinyint, actionToPerform varchar(50), permission varchar(255), reasonId tinyint, comments nvarchar(1000))


BEGIN TRY
    if exists (select cc.cardId
                from @card cc
                join [card].[card] c on cc.cardId = c.cardId
                left join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @cardActionId and module = 'card'
                where sa.toStatusId is null)
            RAISERROR('card.card.statusUpdate.thisActionIsNotAllowedForCardsInThisStatus', 16, 1)

    if @actionName != 'RejectDestruction'
    BEGIN
       if exists
          (select isnull(convert(bigint, sa.toStatusId), -1 * c.cardId)
             from @card c
             left join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @cardActionId and module = 'card'
             group by isnull(convert(bigint, sa.toStatusId), -1 * c.cardId) --, actionToPerform
             having count(distinct isnull(convert(bigint, sa.toStatusId), -1 * c.cardId)) > 1
          )
             RAISERROR('card.card.statusUpdate.notAllInTheSameTargetStatus', 16, 1)


       insert into @cardActionToPerform(cardId, toStatusId, actionToPerform, permission, reasonId, comments)
       select c.cardId, sa.toStatusId, isnull(sa.actionToPerform, ''), sa.permission, c.reasonId, c.comments
       from @card c
       join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @cardActionId and module = 'card'
    END
    ELSE
    BEGIN
        insert into @cardActionToPerform(cardId, toStatusId, actionToPerform, permission, reasonId, comments)
        select c.cardId, cc.previousStatusId, isnull(sa.actionToPerform, ''), permission, c.reasonId, c.comments
        from @card c
        join [card].[card] cc on cc.cardId = c.cardId
        join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @cardActionId and module = 'card'
    END

    if EXISTS(select *
                from @cardActionToPerform cap
                outer apply [user].allowedActions(@userId, permission, NULL, NULL) uaa
                where uaa.actionId is null)
        RAISERROR('card.card.statusUpdate.securityViolation', 16, 1)


    BEGIN TRANSACTION

        -- first change the status of all passed applications
        update cp
        set cp.previousStatusId = case when actionToPerform != 'GeneratePIN' then cp.statusId else cp.previousStatusId end,
            cp.statusId = toStatusId,
            cp.updatedBy = @userId,
            cp.reasonId = c.reasonId,
            cp.comments = c.comments,
            cp.updatedOn = GETDATE(),
            --
            cp.currentBranchId = case when actionToPerform in ('ChangeCurrentBranch', 'AllocateAndChangeBranch') then cp.targetBranchId else cp.currentBranchId end,
            cp.acceptanceDate = case when actionToPerform = 'ApproveCardAcceptance' then getdate() else cp.acceptanceDate end,
            cp.targetBranchId = case when actionToPerform in ('Allocate', 'AllocateAndChangeBranch') then ca.targetBranchId else cp.targetBranchId end
        from @cardActionToPerform c
        join [card].[card] cp on cp.cardId = c.cardId
        join @card ca on ca.cardId = c.cardId 
        where actionToPerform != 'GeneratePIN'
        
        if exists (select * from @cardActionToPerform where actionToPerform = 'GeneratePIN')
        begin
            exec [card].[batch.generatePinMail]  @card, @meta
        end

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
