ALTER PROCEDURE [card].[noNameApplication.add] -- this SP creates a no name application
    @application [card].applicationTT READONLY,-- in this parameter the stored procedure receives all fields of application
    @account [card].applicationAccountTT READONLY,-- in this parameter the stored procedure receives all fields of accounts linked to new application
    @cardId bigint, -- id of the card that will be assigned to the customer
    @document document.documentTT READONLY, -- receive the entered fields for new document
    @attachment document.attachmentTT READONLY, -- receive the entered fields for all attachements for new document
    @documentApplication card.documentApplicationTT READONLY,     --a table that holds information which document to which loan application is related
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation,
    @noResultSet bit = 0 -- this is the flag about the waited result
AS
DECLARE @callParams XML = ( SELECT (SELECT * from @application rows FOR XML AUTO, TYPE) [application], (SELECT * from @account rows FOR XML AUTO, TYPE) [account], @cardId [cardId], (SELECT * from @document rows FOR XML AUTO, TYPE) [document], (SELECT * from @attachment rows FOR XML AUTO, TYPE) [attachment], (SELECT * from @documentApplication rows FOR XML AUTO, TYPE) [documentApplication], (SELECT * from @meta rows FOR XML AUTO, TYPE) [meta], @noResultSet [noResultSet] FOR XML RAW('params'),TYPE)
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    DECLARE @applicationId INT, @branchId BIGINT, @branchIdCheck BIGINT
    DECLARE @resultApplication [card].applicationTT
    DECLARE @resultAccount [card].applicationAccountTT
    DECLARE @statusId tinyint
    DECLARE @disableIntegrationChecks bit = isnull((SELECT [value] FROM [core].[configuration] WHERE [key] = N'card.application.disableIntegrationChecks'), 0)
    DECLARE @embossedTypeId tinyint = (SELECT embossedTypeId FROM [card].[embossedType] et
                                        join core.itemName itn on itn.itemNameId = et.itemNameId
                                        join core.itemType it on it.itemTypeId = itn.itemTypeId
                                        WHERE itemCode = 'noNamed' and it.alias = 'embossedType')
    DECLARE @cardStatusId tinyint

    SET @noResultSet = ISNULL(@noResultSet, 0)
BEGIN TRY
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END


if @disableIntegrationChecks = 0 and exists
        (select ac.customerNumber
           from @account a
           join [integration].[vAccount] ac on ac.accountNumber = a.accountNumber
           left join  @application  aa on aa.customerNumber = ac.customerNumber
           where aa.customerNumber is null)
    RAISERROR('card.noNameApplication.add.submittedAccountsAreNotAtThatCustomer', 16, 1)

if @disableIntegrationChecks = 0 and exists
        (select * from @application  a
        left join [integration].[vCustomer] c on c.customerNumber = a.customerNumber and c.personNumber = a.personNumber
        where c.customerNumber is null  )
    RAISERROR('card.noNameApplication.add.submittedPersonAreNotAtThatCustomer', 16, 1)

if exists (select accountNumber from @account group by accountNumber having count (*)>1   )
    RAISERROR('card.noNameApplication.add.submittedAccountIsDuplicate', 16, 1)

if exists (select accountOrder from @account group by accountOrder having count (*)>1   )
    RAISERROR('card.noNameApplication.add.submittedAccountOrderIsDuplicate', 16, 1)

if exists
        (select count (isPrimary)  from @account
        where isPrimary=1
        group by currency, isPrimary
        having count (isPrimary)<>1 )
    RAISERROR('card.noNameApplication.add.thereShouldBeExactlyOnePrimaryAccount', 16, 1)

    SELECT @branchId = min([object]), @branchIdCheck = max([object])
    FROM [core].[actorHierarchy]
    WHERE predicate = 'memberOf' AND subject = @userId

    IF @branchId != @branchIdCheck
        RAISERROR('card.application.add.loggedUserWithMoreThanOneBranch', 16, 1);

   SET @statusId = (SELECT top 1 statusId
        FROM [card].statusStartEnd
        WHERE module = 'Application' AND startendFlag = 0)

   BEGIN TRANSACTION
        INSERT INTO [card].[application](customerId, customerNumber, customerName,holderName, branchId, issuingBranchId, statusId, productId, typeId,
                                         createdBy, createdOn, updatedBy, updatedOn, personId, personNumber, personName, embossedTypeId,
                                         makerComments)
        OUTPUT INSERTED.applicationId, INSERTED.customerId, INSERTED.customerNumber, INSERTED.customerName,INSERTED.holderName, INSERTED.branchId, INSERTED.issuingBranchId, 
               INSERTED.statusId, INSERTED.productId, INSERTED.typeId, INSERTED.createdBy, INSERTED.createdOn, INSERTED.updatedBy, INSERTED.updatedOn,
               INSERTED.personId, INSERTED.personNumber, INSERTED.personName, INSERTED.embossedTypeId, INSERTED.makerComments
        INTO @resultApplication (applicationId, customerId, customerNumber, customerName,holderName, branchId, issuingBranchId, statusId, productId, typeId,
                                 createdBy, createdOn, updatedBy, updatedOn, personId, personNumber, personName, embossedTypeId, 
                                 makerComments)
        SELECT customerId, customerNumber, customerName, holderName,(select currentBranchId from [card].[card] where cardId = @cardId), @branchId, 
               @statusId, productId, typeId, @userId, GETDATE(), @userId, GETDATE(), personId, personNumber, personName, @embossedTypeId, makerComments
        FROM  @application

        SET @applicationId = ( SELECT applicationId FROM @resultApplication )

        SET @cardStatusId = ( SELECT statusId FROM [card].[status] WHERE statusName ='PendingActivation')

        UPDATE [card].[card]
        SET applicationId = @applicationId,
            customerId =  ( SELECT customerId FROM @resultApplication ),
            customerNumber =  ( SELECT customerNumber FROM @resultApplication ),
            customerName =  ( SELECT customerName FROM @resultApplication ),
            personId =  ( SELECT personId FROM @resultApplication ),
            personNumber =  ( SELECT personNumber FROM @resultApplication ),
            personName =  ( SELECT personName FROM @resultApplication ),
			cardHolderName = ( SELECT holderName FROM @resultApplication ),
            statusId = @cardStatusId,
            updatedBy = @userId,
            updatedOn = GETDATE(),
            embossedTypeId = @embossedTypeId,
            productId = ( SELECT productId FROM @resultApplication )
        WHERE cardId = @cardId

        INSERT INTO [card].applicationAccount(applicationId, accountId, isPrimary, createdBy, createdOn, 
                                                accountNumber, accountTypeName, currency, accountOrder, accountLinkId)
        OUTPUT INSERTED.* INTO @resultAccount
        SELECT @applicationId, aa.accountId, aa.isPrimary, @userId, GETDATE(), 
                    aa.accountNumber, aa.accountTypeName, aa.currency , aa.accountOrder, aa.accountLinkId
        FROM @account aa


        INSERT INTO [card].cardAccount(cardId, accountId, isPrimary,
            createdBy, createdOn, accountNumber, accountTypeName, currency, accountOrder, accountLinkId)
        SELECT @cardId, aa.accountId, aa.isPrimary,
            @userId, GETDATE(), aa.accountNumber, aa.accountTypeName, aa.currency , aa.accountOrder, aa.accountLinkId
        FROM @account aa


        exec [card].[documentApplication.add]
             @document = @document,
             @attachment = @attachment,
             @applicationId = @applicationId,
             @meta = @meta

        insert into card.documentCard (cardId, documentId)
        select @cardId, documentId 
        from [card].documentApplication
        where applicationId = @applicationId

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
DECLARE @CORE_ERROR_FILE_146 sysname='f:\JoboStuff\IBL\Implementation2\ibl_impl_standard\dev\ut-card\api\sql\schema/750$card.noNameApplication.add.sql' DECLARE @CORE_ERROR_LINE_146 int='147' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_146, @fileLine=@CORE_ERROR_LINE_146, @params = @callParams
END CATCH