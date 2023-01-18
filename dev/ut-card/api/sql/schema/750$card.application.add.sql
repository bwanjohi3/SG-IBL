ALTER PROCEDURE [card].[application.add] -- the SP add new application in DB
    @application [card].applicationTT READONLY,-- in this parameter the stored procedure receives all fields of application
    @account [card].applicationAccountTT READONLY,-- in this parameter the stored procedure receives all fields of accounts linked to new application
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation,
    @noResultSet bit = 0, -- this is the flag about the waited result

     @document document.documentTT READONLY, -- receive the entered fields for new document
     @attachment document.attachmentTT READONLY, -- receive the entered fields for all attachements for new document
     @documentApplication card.documentApplicationTT READONLY     --a table that holds information which document to which loan application is related
AS
SET NOCOUNT ON

DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @applicationId INT, @branchId BIGINT, @branchIdCheck BIGINT
DECLARE @resultApplication [card].applicationTT
DECLARE @resultAccount [card].applicationAccountTT
DECLARE @statusId tinyint
DECLARE @disableIntegrationChecks bit = isnull((SELECT [value] FROM [core].[configuration] WHERE [key] = N'card.application.disableIntegrationChecks'), 0)
DECLARE @embossedTypeId tinyint = (SELECT embossedTypeId FROM [card].[embossedType] et
                        join core.itemName itn on itn.itemNameId = et.itemNameId
                        join core.itemType it on it.itemTypeId = itn.itemTypeId
                        WHERE itemCode = 'Named' and it.alias = 'embossedType')

DECLARE @productId BIGINT = (SELECT TOP 1 productId from @application)
DECLARE @accountLinkLimit TINYINT = (SELECT ISNULL(accountLinkLimit, 0) FROM [card].[product] WHERE productId = @productId)
DECLARE @accountLinkCount INT = (SELECT COUNT(*) FROM @account)

SET @noResultSet = ISNULL(@noResultSet, 0)
BEGIN TRY
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta


    --------------------------
    if @accountLinkCount > @accountLinkLimit
        RAISERROR('card.application.add.accountLinkLimitExceed', 16, 1)

    if @disableIntegrationChecks = 0 and exists (select a.accountNumber
               from @account a
               left join [integration].[vAccount] ac on ac.accountNumber = a.accountNumber
               left join @application  aa on aa.customerNumber = ac.customerNumber
               where aa.customerNumber is null) 
        RAISERROR('card.application.add.submittedAccountsAreNotAtThatCustomer', 16, 1)

    if @disableIntegrationChecks = 0 and exists (select * from @application  a
                left join [integration].[vCustomer] c on c.customerNumber = a.customerNumber and c.personNumber = a.personNumber
                where c.customerNumber is null  )
        RAISERROR('card.application.add.submittedPersonIsNotForThatCustomer', 16, 1)

    if exists (select accountNumber from @account group by accountNumber having count (*) > 1   )
        RAISERROR('card.application.add.submittedAccountNumbersAreDuplicate', 16, 1)

    if exists (select accountOrder
                from
                (
                    select accountOrder, ROW_NUMBER() OVER (ORDER BY accountOrder) as RowNum
                    from @account
                ) as a
                where accountOrder != RowNum )
        RAISERROR('card.application.add.submittedAccountOrdersAreNotCorrect', 16, 1)


    if not exists (select * from @account where isPrimary = 1) or
        exists (select count (isPrimary)
                from @account
                where isPrimary=1
                group by currency, isPrimary
                having count (isPrimary) <> 1 )
        RAISERROR('card.application.add.thereShouldBeExactlyOnePrimaryAccount', 16, 1)


    --------------------------

    SELECT @branchId = min([object]), @branchIdCheck = max([object])
    FROM [core].[actorHierarchy]
    WHERE predicate = 'memberOf' AND subject = @userId

    IF @branchId != @branchIdCheck
        RAISERROR('card.application.add.loggedUserWithMoreThanOneBranch', 16, 1);
    
    SET @statusId = (SELECT top 1 statusId
        FROM [card].statusStartEnd
        WHERE module = 'Application' AND startendFlag = 0)

    BEGIN TRANSACTION
        INSERT INTO [card].[application](customerId, customerNumber, customerName, holderName, targetBranchId, branchId, statusId, productId,
                                         createdBy, createdOn, updatedBy, updatedOn, personId, personNumber, personName, embossedTypeId, issuingBranchId, 
                                         makerComments, typeId)
        OUTPUT INSERTED.applicationId, INSERTED.customerId, INSERTED.customerNumber, INSERTED.customerName, INSERTED.holderName, INSERTED.targetBranchId, INSERTED.branchId, 
               INSERTED.statusId, INSERTED.productId, INSERTED.createdBy, INSERTED.createdOn, INSERTED.updatedBy, INSERTED.updatedOn, 
               INSERTED.personId, INSERTED.personNumber, INSERTED.personName, INSERTED.embossedTypeId, INSERTED.issuingBranchId, INSERTED.makerComments, 
               INSERTED.typeId       
        INTO @resultApplication (applicationId, customerId, customerNumber, customerName, holderName, targetBranchId, branchId, statusId, productId,
                                 createdBy, createdOn, updatedBy, updatedOn, personId, personNumber, personName, embossedTypeId, issuingBranchId, 
                                 makerComments, typeId)
        SELECT customerId, customerNumber, customerName, holderName, targetBranchId, @branchId, @statusId, productId,
               @userId, GETDATE(), @userId, GETDATE(), personId, personNumber, personName, @embossedTypeId, issuingBranchId, makerComments, typeId
        FROM  @application

        SET @applicationId = ( SELECT applicationId FROM @resultApplication )

        INSERT INTO [card].applicationAccount(applicationId, accountId, isPrimary,
            createdBy, createdOn, accountNumber, accountTypeName, currency, accountOrder, accountLinkId)
        OUTPUT INSERTED.* INTO @resultAccount
        SELECT @applicationId, aa.accountId, aa.isPrimary,
            @userId, GETDATE() , aa.accountNumber, aa.accountTypeName, aa.currency, aa.accountOrder, aa.accountLinkId
        FROM @account aa


        exec [card].[documentApplication.add]
                @document = @document,
                @attachment = @attachment,
                @applicationId = @applicationId,
                @meta = @meta


    COMMIT TRANSACTION;

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'cardApplication' AS resultSetName
        SELECT * FROM  @resultApplication

        SELECT 'cardApplicationAccount' AS resultSetName
        SELECT * FROM  @resultAccount
    END

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
