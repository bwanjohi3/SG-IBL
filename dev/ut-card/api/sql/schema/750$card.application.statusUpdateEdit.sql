ALTER procedure [card].[application.statusUpdateEdit] -- this procedure updates the change in application
    @application card.applicationTT READONLY, -- the list with the application
    @account [card].applicationAccountTT READONLY,-- in this parameter the stored procedure receives all fields of accounts linked to new application
    @document document.documentTT READONLY, -- receive the entered fields for new document
    @attachment document.attachmentTT READONLY, -- receive the entered fields for all attachements for new document
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @applicationId bigint
DECLARE @disableIntegrationChecks BIT = ISNULL((SELECT [value] FROM [core].[configuration] WHERE [key] = N'card.application.disableIntegrationChecks'), 0)

DECLARE @productId BIGINT = (SELECT TOP 1 productId from @application)
DECLARE @accountLinkLimit TINYINT = (SELECT ISNULL(accountLinkLimit, 0) FROM [card].[product] WHERE productId = @productId)
DECLARE @accountLinkCount INT = (SELECT COUNT(*) FROM @account)

if @accountLinkCount > @accountLinkLimit
    RAISERROR('card.application.statusUpdateEdit.accountLinkLimitExceed', 16, 1)

BEGIN TRY
    exec @return = [user].[permission.check] @actionId = @actionID, @objectId = null, @meta = @meta

    if @disableIntegrationChecks = 0 and exists (select a.accountNumber
               from @account a
               left join [integration].[vAccount] ac on ac.accountNumber = a.accountNumber
               left join @application  aa on aa.customerNumber = ac.customerNumber
               where aa.customerNumber is null)
        RAISERROR('card.application.statusUpdateEdit.submittedAccountsAreNotAtThatCustomer', 16, 1)

    if @disableIntegrationChecks = 0 and exists (select * from @application  a
                left join [integration].[vCustomer] c on c.customerNumber = a.customerNumber and c.personNumber = a.personNumber
                where c.customerNumber is null  )
        RAISERROR('card.application.statusUpdateEdit.submittedPersonIsNotForThatCustomer', 16, 1)

    if exists (select accountNumber from @account group by accountNumber having count (*)>1   )
        RAISERROR('card.application.statusUpdateEdit.submittedAccountNumbersAreDuplicate', 16, 1)

    if exists (select accountOrder
                from
                (
                    select accountOrder, ROW_NUMBER() OVER (ORDER BY accountOrder) as RowNum
                    from @account
                ) as a
                where accountOrder != RowNum )
        RAISERROR('card.application.statusUpdateEdit.submittedAccountOrdersAreNotCorrect', 16, 1)


    if not exists (select * from @account where isPrimary = 1) or
        exists (select count (isPrimary)
                from @account
                where isPrimary=1
                group by currency, isPrimary
                having count (isPrimary) <> 1 )
        RAISERROR('card.application.statusUpdateEdit.thereShouldBeExactlyOnePrimaryAccount', 16, 1)

     if  (select  count (1) from @application) <> 1
        RAISERROR('card.application.statusUpdateEdit.moreApplicationId', 16, 1)

    set @applicationId = (select applicationId from @application)
     if  (select count (1) from @account where applicationId <> @applicationId) <> 0

        RAISERROR('card.application.statusUpdateEdit.checkForSameApplicationId', 16, 1)


    ;MERGE into [card].[applicationAccount] as t
    using
    (
        select applicationAccountId, applicationId, accountId, isPrimary, accountNumber, accountTypeName, currency, accountOrder, accountLinkId
        from @account
    ) s on s.applicationAccountId = t.applicationAccountId
    WHEN MATCHED THEN
        UPDATE
        set t.accountOrder = s.accountOrder,
            t.isPrimary = s.isPrimary,
            t.accountLinkId = s.accountLinkId,
            t.updatedBy = @userID,
            t.updatedOn = getDate()
    WHEN NOT MATCHED BY TARGET THEN
        insert (applicationId, accountId, isPrimary, accountNumber, accountTypeName, currency, accountOrder, accountLinkId, createdBy, createdOn)
        values(s.applicationId, s.accountId, isPrimary, accountNumber, accountTypeName, currency, accountOrder, accountLinkId, @userId, getDate())
    WHEN NOT MATCHED BY SOURCE and t.applicationId in (select applicationId from @application) THEN
        Delete;

   update a
   set targetBranchId = ap.targetBranchId,
       issuingBranchId = ap.issuingBranchId,        
        customerId = ap.customerId,
        customerNumber = ap.customerNumber,
        customerName = ap.customerName,
        holderName = ap.holderName,
        productId = ap.productId,
        typeId = ap.typeId,
        personId = ap.personId,
        personNumber = ap.personNumber,
        personName = ap.personName,
        statusId = ap.statusId,
        reasonId = ap.reasonId,
        comments = ap.comments,
        makerComments = ap.makerComments,
        updatedBy = @userId,
        updatedOn = GETDATE()

   from card.application a
   join @application ap on ap.applicationId = a.applicationId

   set @applicationId = (select  distinct applicationId from @application )
   exec [card].[documentApplication.edit]  @applicationId = @applicationId,
                                           @document = @document,
                                           @attachment = @attachment,
                                           @meta = @meta

     EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
