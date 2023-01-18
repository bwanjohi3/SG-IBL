ALTER PROCEDURE [card].[batch.statusUpdate] -- the SP changes status of the Batch in DB
    @batch [card].batchTT READONLY,-- in this parameter the stored procedure receives all fields of Batch
    @batchActionId tinyint, --the performed action id
    @card [card].cardTT READONLY, -- list of cards (used only when generate pin mails)
    @cardsCurrentBranchId BIGINT = NULL, -- the cards' current branch ID when completing batch
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @batchFiltered [card].batchTT
DECLARE @actionName varchar(50) = (select actionName from [card].[action] where actionId = @batchActionId)

BEGIN TRY
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    if exists (select bb.batchId
            from @batch bb
            join [card].batch b on bb.batchId = b.batchId
            left join [card].statusAction sa on sa.fromStatusId = b.statusId and sa.actionId = @batchActionId and module = 'Batch'
            where sa.toStatusId is null)
        RAISERROR('card.batch.statusUpdate.thisActionIsNotAllowedForBatchesInThisStatus', 16, 1)
    
    if not exists (select batchId from @batch b)
        RAISERROR('card.batch.statusUpdate.NotSelectedAnyBatch', 16, 1)

    if exists (select isnull(convert(bigint, sa.toStatusId), -1 * b.BatchId)
                from @Batch b
                left join [card].statusAction sa on sa.fromStatusId = b.statusId and sa.actionId = @BatchActionId and module = 'Batch'
                group by isnull(convert(bigint, sa.toStatusId), -1 * b.BatchId) --, actionToPerform
                having count(distinct isnull(convert(bigint, sa.toStatusId), -1 * b.BatchId)) > 1)
        RAISERROR('card.Batch.statusUpdate.NotAllInTheSameTargetStatus', 16, 1)


    declare @BatchActionToPerform table(BatchId bigint, toStatusId tinyint, actionToPerform varchar(50), reasonId tinyint, comments nvarchar(1000))

    insert into @BatchActionToPerform (BatchId, toStatusId, actionToPerform, reasonId, comments)
    select c.BatchId, sa.toStatusId, isnull(sa.actionToPerform, ''), reasonId, comments
    from @Batch c
    join [card].statusAction sa on sa.fromStatusId = c.statusId and sa.actionId = @BatchActionId and module = 'Batch'

    BEGIN TRANSACTION

        -- first change the status of all passed Batches except for the case that are special
        update b
        set b.previousStatusId = b.statusId,
            b.statusId = toStatusId,
            b.reasonId = ba.reasonId,
            b.comments = ba.comments,
            b.updatedBy = @userId,
            b.updatedOn = GETDATE()
        from @BatchActionToPerform ba
        join [card].[Batch] b on ba.BatchId = b.BatchId
        where ba.actionToPerform not in ('SentToProduction', 'Update', 'GeneratePIN', 'Download')
        -- execute update procedures based on actions that need to be performed


        if exists (select * from @BatchActionToPerform where actionToPerform = 'DeclineBatch')
        begin
            insert into @BatchFiltered
            select b.*
            from @Batch b
            join @BatchActionToPerform ba on ba.BatchId = b.BatchId
            where ba.actionToPerform = 'DeclineBatch'

            exec [card].[batch.statusUpdateDecline] @BatchFiltered, @meta

            delete from @BatchFiltered
        end

        if exists (select * from @BatchActionToPerform where actionToPerform = 'GeneratePIN')
        begin
            exec [card].[batch.generatePinMail]  @card, @meta
        end

        if exists (select * from @BatchActionToPerform where actionToPerform = 'Download')
        begin
            insert into @BatchFiltered
            select b.*
            from @Batch b
            join @BatchActionToPerform ba on ba.BatchId = b.BatchId
            where ba.actionToPerform = 'Download'

            exec [card].[batch.download]  @BatchFiltered, @meta

        end

        if exists (select * from @BatchActionToPerform where actionToPerform = 'SentToProduction')
        begin
            insert into @BatchFiltered
            select b.*
            from @Batch b
            join @BatchActionToPerform ba on ba.BatchId = b.BatchId
            where ba.actionToPerform = 'SentToProduction'

            declare @areAllCardsGenerated bit

            exec [card].[batch.statusUpdateSendToProduction] @BatchFiltered, @areAllCardsGenerated OUT, @meta

            update b
            set b.previousStatusId = b.statusId,
                b.statusId = toStatusId,
                b.reasonId = ba.reasonId,
                b.comments = ba.comments,
                b.updatedBy = @userId,
                b.updatedOn = GETDATE(),
                b.sentOn = GETDATE(),
                b.areAllCardsGenerated = @areAllCardsGenerated
            from @BatchActionToPerform ba
            join [card].[Batch] b on ba.BatchId = b.BatchId
            where ba.actionToPerform = 'SentToProduction'

            delete from @BatchFiltered
        end

        if exists (select * from @BatchActionToPerform where actionToPerform = 'BatchComplete')
        begin
            insert into @BatchFiltered
            select b.*
            from @Batch b
            join @BatchActionToPerform ba on ba.BatchId = b.BatchId
            where ba.actionToPerform = 'BatchComplete'

            exec [card].[batch.statusUpdateCompleted] @BatchFiltered, @cardsCurrentBranchId, @meta

            delete from @BatchFiltered
        end

        if exists (select * from @BatchActionToPerform where actionToPerform = 'Update')
        begin
            insert into @BatchFiltered(batchId, batchName, numberOfCards, typeId, targetBranchId, reasonId, comments, issuingBranchId, statusId)
            select b.batchId, b.batchName, numberOfCards, typeId, targetBranchId, ba.reasonId, ba.comments, b.issuingBranchId, ba.toStatusId
            from @Batch b
            join @BatchActionToPerform ba on ba.BatchId = b.BatchId
            where ba.actionToPerform = 'Update'

            exec [card].[batch.statusUpdateEdit] @BatchFiltered, @meta

            delete from @BatchFiltered
        end

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH