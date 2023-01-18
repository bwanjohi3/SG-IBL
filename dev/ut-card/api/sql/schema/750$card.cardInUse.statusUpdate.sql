ALTER PROCEDURE [card].[cardInUse.statusUpdate] -- the SP changes status of the cards in DB
    @card [card].cardTT READONLY,-- in this parameter the stored procedure receives all fields of cards
    @account [card].cardAccountTT READONLY,-- in this parameter the stored procedure receives all fields of accounts linked to cards
    @cardActionId tinyint, --the performed action id
    @document document.documentTT READONLY, -- receive the entered fields for new document
    @attachment document.attachmentTT READONLY, -- receive the entered fields for all attachements for new document
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
                left join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @cardActionId and module = 'CardInUse'
                where sa.toStatusId is null)
            RAISERROR('card.cardInUse.statusUpdate.thisActionIsNotAllowedForCardsInThisStatus', 16, 1)

    if @actionName NOT IN  ('RejectDestruction', 'RejectActivation')
    BEGIN
        if exists
        (select isnull(convert(bigint, sa.toStatusId), -1 * c.cardId)
            from @card c
            left join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @cardActionId and module = 'CardInUse'
            group by isnull(convert(bigint, sa.toStatusId), -1 * c.cardId) --, actionToPerform
            having count(distinct isnull(convert(bigint, sa.toStatusId), -1 * c.cardId)) > 1
        )
            RAISERROR('card.cardInUse.statusUpdate.notAllInTheSameTargetStatus', 16, 1)


        insert into @cardActionToPerform(cardId, toStatusId, actionToPerform, permission, reasonId, comments)
        select c.cardId, sa.toStatusId, isnull(sa.actionToPerform, ''), sa.permission, c.reasonId, c.comments
        from @card c
        join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @cardActionId and module = 'CardInUse'
    END
    ELSE
    BEGIN
        insert into @cardActionToPerform(cardId, toStatusId, actionToPerform, permission, reasonId, comments)
        select c.cardId, cc.previousStatusId, isnull(sa.actionToPerform, ''), permission, c.reasonId, c.comments
        from @card c
        join [card].[card] cc on cc.cardId = c.cardId
        join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @cardActionId and module = 'CardInUse'
    END

    if EXISTS(select *
                from @cardActionToPerform cap
                outer apply [user].allowedActions(@userId, permission, null, NULL) uaa
                where uaa.actionId is null)
        RAISERROR('card.cardInUse.statusUpdate.securityViolation', 16, 1)

    BEGIN TRANSACTION
        -- first change the status of all passed applications
        update cp
            set cp.previousStatusId = case when actionToPerform not in  ('GeneratePIN', 'Update','ResetPINRetries') then cp.statusId else cp.previousStatusId end,
            cp.statusId = toStatusId,
            cp.reasonId = c.reasonId,
            cp.comments = c.comments,
            cp.updatedBy = @userId,
            cp.updatedOn = GETDATE(),
            ---
            pinRetries = case when actionToPerform = 'ResetPINRetries' then 0 else cp.pinRetries end,
            pinRetriesDaily = case when actionToPerform = 'ResetPINRetries' then 0 else cp.pinRetriesDaily end,
            pinRetriesLastInvalid = case when actionToPerform = 'ResetPINRetries' then NULL else cp.pinRetriesLastInvalid end,

            activationDate = case when actionToPerform = 'Activate' then GETDATE() else cp.activationDate end,
            activatedBy = case when actionToPerform = 'Activate' then @userId else cp.activatedBy end
        from @cardActionToPerform c
        join [card].[card] cp on cp.cardId = c.cardId
        where actionToPerform != 'GeneratePIN'


        --now if some extra work needs to be done for the specific action
        if exists (select * from @cardActionToPerform where actionToPerform = 'RejectActivation')
        begin
            insert into @cardFiltered
            select c.*
            from @card c
            join @cardActionToPerform ca on ca.cardId = c.cardId
            where ca.actionToPerform = 'RejectActivation'

            exec [card].[cardInUse.statusUpdateRejectActivation] @cardFiltered, @meta

            delete from @cardFiltered
        end

        if exists (select * from @cardActionToPerform where actionToPerform = 'GeneratePIN')
        begin
            exec [card].[batch.generatePinMail]  @card, @meta
        end

        if exists (select * from @cardActionToPerform where actionToPerform = 'Update')
        begin
            insert into @cardFiltered
            select c.*
            from @card c
            join @cardActionToPerform ca on ca.cardId = c.cardId
            where ca.actionToPerform = 'Update'

            exec [card].[cardInUse.statusUpdateEdit] @cardFiltered, @account, @document, @attachment, @meta

            delete from @cardFiltered
        end

        if exists (select * from @cardActionToPerform where actionToPerform = 'Activate')
        begin
            insert into @cardFiltered
            select c.*
            from @card c
            join @cardActionToPerform ca on ca.cardId = c.cardId
            where ca.actionToPerform = 'Activate'

            exec [card].[cardInUse.statusUpdateApproveActivate] @cardFiltered, @meta

            delete from @cardFiltered
        end

        if exists (select * from @cardActionToPerform where actionToPerform = 'Hot')
        begin
            insert into @cardFiltered
            select c.*
            from @card c
            join @cardActionToPerform ca on ca.cardId = c.cardId
            where ca.actionToPerform = 'Hot'

            exec [card].[cardInUse.statusUpdateHot] @cardFiltered, @meta

            delete from @cardFiltered
        end

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
