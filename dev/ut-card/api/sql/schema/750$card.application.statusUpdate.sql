ALTER PROCEDURE [card].[application.statusUpdate] -- the SP changes status of the application in DB
    @application [card].applicationTT READONLY,-- in this parameter the stored procedure receives all fields of application
    @account [card].applicationAccountTT READONLY,-- in this parameter the stored procedure receives all fields of accounts linked to new application
    @applicationActionId tinyint, --the performed action id
    @batch [card].batchTT READONLY,  --the batch details if the applications are added in a batch
    @document document.documentTT READONLY, -- receive the entered fields for new document
    @attachment document.attachmentTT READONLY, -- receive the entered fields for all attachements for new document
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS

DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @applicationFiltered [card].applicationTT

BEGIN TRY
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    if exists (select a.applicationId
            from @application app
            join [card].application a on app.applicationId = a.applicationId
            left join [card].statusAction sa on sa.fromStatusId = a.statusId and sa.actionId = @applicationActionId and module = 'Application'
            where sa.toStatusId is null
    )
    RAISERROR('card.application.statusUpdate.thisActionIsNotAllowedForApplicationsInThisStatus', 16, 1)

    if exists (select isnull(convert(bigint, sa.toStatusId), -1 * a.applicationId)
            from @application app
            join [card].application a on app.applicationId = a.applicationId
            left join [card].statusAction sa on sa.fromStatusId = a.statusId and sa.actionId = @applicationActionId and module = 'Application'
            group by isnull(convert(bigint, sa.toStatusId), -1 * a.applicationId) --, actionToPerform
            having count(distinct isnull(convert(bigint, sa.toStatusId), -1 * a.applicationId)) > 1
    )
    RAISERROR('card.application.statusUpdate.NotAllInTheSameTargetStatus', 16, 1)

    declare @ApplicationActionToPerform table(ApplicationId bigint, toStatusId tinyint, actionToPerform varchar(50), reasonId tinyint, comments nvarchar(1000), makerComments nvarchar(max), batchId bigint)

    insert into @ApplicationActionToPerform (ApplicationId, toStatusId, actionToPerform, reasonId, comments, makerComments, batchId)
    select c.applicationId, sa.toStatusId, isnull(sa.actionToPerform, ''), c.reasonId, c.comments, c.makerComments, c.batchId
    from @application c
    join [card].application a on c.applicationId = a.applicationId
    join [card].statusAction sa on sa.fromStatusId = a.statusId and sa.actionId = @applicationActionId and module = 'Application'

    BEGIN TRANSACTION

        -- first change the status of all passed applications, only if they are not for create batch, 
        update ap
        set ap.previousStatusId = case when actionToPerform != 'Update' then ap.statusId else ap.previousStatusId end,
            ap.batchId = case when actionToPerform = 'RemoveFromBatch' then null  when actionToPerform = 'AddToBatch' then a.batchId else ap.batchId end,
            ap.statusId = toStatusId,
            ap.reasonId = a.reasonId,
            ap.comments = a.comments,
            ap.makerComments = a.makerComments,
            ap.updatedBy = @userId,
            ap.updatedOn = GETDATE()
        from @ApplicationActionToPerform a
        join [card].[application] ap on a.applicationId = ap.applicationId
        where actionToPerform not in ('CreateBatch', 'Update') -- in order not make update twice, it is done later after the batch is created

        -- execute update procedures based on actions that needs to be performed
        if exists (select * from @ApplicationActionToPerform where actionToPerform = 'RemoveFromBatch')
        begin
           insert into @applicationFiltered (applicationId, customerId, customerNumber, customerName, holderName, targetBranchId, branchId, statusId, batchId, productId, createdBy, createdOn, updatedOn, updatedBy, personId, personNumber, personName, embossedTypeId, reasonId, comments, previousStatusId, issuingBranchId)
            select a.applicationId, a.customerId, a.customerNumber, a.customerName, a.holderName, a.targetBranchId, a.branchId, a.statusId, a.batchId, a.productId, a.createdBy, a.createdOn, a.updatedOn, a.updatedBy, a.personId, a.personNumber, a.personName, a.embossedTypeId, ca.reasonId, ca.comments, a.previousStatusId, a.issuingBranchId
            from @application a
            join @ApplicationActionToPerform ca on ca.applicationId = a.applicationId
            where ca.actionToPerform = 'RemoveFromBatch'

            exec [card].[application.statusUpdateRemoveFromBatch] @applicationFiltered, @meta

            delete from @applicationFiltered
        end

        if exists (select * from @ApplicationActionToPerform where actionToPerform = 'ApproveNoName')
        begin
           insert into @applicationFiltered (applicationId, customerId, customerNumber, customerName, holderName, targetBranchId, branchId, statusId, batchId, productId, createdBy, createdOn, updatedOn, updatedBy, personId, personNumber, personName, embossedTypeId, reasonId, comments, previousStatusId, issuingBranchId)
            select a.applicationId, a.customerId, a.customerNumber, a.customerName, a.holderName, a.targetBranchId, a.branchId, a.statusId, a.batchId, a.productId, a.createdBy, a.createdOn, a.updatedOn, a.updatedBy, a.personId, a.personNumber, a.personName, a.embossedTypeId, ca.reasonId, ca.comments, a.previousStatusId, a.issuingBranchId
            from @application a
            join @ApplicationActionToPerform ca on ca.applicationId = a.applicationId
            where ca.actionToPerform = 'ApproveNoName'

            exec [card].[application.statusUpdateApproveNoName] @applicationFiltered, @meta

            delete from @applicationFiltered
        end

        if exists (select * from @ApplicationActionToPerform where actionToPerform = 'AddToBatch')
        begin
           insert into @applicationFiltered
            select a.*
            from @application a
            join @ApplicationActionToPerform ca on ca.applicationId = a.applicationId
            where ca.actionToPerform = 'AddToBatch'

            exec [card].[application.statusUpdateAddToBatch] @applicationFiltered, @meta

            delete from @applicationFiltered
        end

        if exists (select * from @ApplicationActionToPerform where actionToPerform = 'CreateBatch')
        begin
            insert into @applicationFiltered
            select a.*
            from @application a
            join @ApplicationActionToPerform ca on ca.applicationId = a.applicationId
            where ca.actionToPerform = 'CreateBatch'

            declare @batchId int 
            exec [card].[application.statusUpdateCreateBatch] @applicationFiltered, @batch, @batchId OUT, @meta

            update ap
            set ap.previousStatusId = ap.statusId,
                ap.batchId = @batchId,
                ap.statusId = toStatusId,
                ap.reasonId = a.reasonId,
                ap.comments = a.comments,
                ap.makerComments = a.makerComments,
                ap.updatedBy = @userId,
                ap.updatedOn = GETDATE()
            from @ApplicationActionToPerform a
            join [card].[application] ap on a.applicationId = ap.applicationId
            where actionToPerform = 'CreateBatch' -- in order not make update twice, it is done later after the batch is created

            delete from @applicationFiltered
        end

        if exists (select * from @ApplicationActionToPerform where actionToPerform = 'Update')
        begin
            insert into @applicationFiltered(applicationId, targetBranchId, issuingBranchId, customerId, customerNumber, customerName, holderName,
                productId, personId, personNumber, personName, statusId, reasonId, comments, makerComments, typeId)
            select a.applicationId, a.targetBranchId, a.issuingBranchId, a.customerId, a.customerNumber, a.customerName, a.holderName,
                a.productId, a.personId, a.personNumber, a.personName, ca.toStatusId, ca.reasonId, ca.comments, ca.makerComments, a.typeId
            from @application a
            join @ApplicationActionToPerform ca on ca.applicationId = a.applicationId
            where ca.actionToPerform = 'Update'

            exec [card].[application.statusUpdateEdit] @applicationFiltered, @account, @document, @attachment, @meta

            delete from @applicationFiltered
        end

        if exists (select * from @ApplicationActionToPerform where actionToPerform = 'Decline')
        begin
            insert into @applicationFiltered
            select a.*
            from @application a
            join @ApplicationActionToPerform ca on ca.applicationId = a.applicationId
            where ca.actionToPerform = 'Decline'

            exec [card].[application.statusUpdateDecline] @applicationFiltered, @meta

            delete from @applicationFiltered
        end

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH