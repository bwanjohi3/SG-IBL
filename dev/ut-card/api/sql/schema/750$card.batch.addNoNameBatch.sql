ALTER procedure [card].[batch.addNoNameBatch] -- creates a batch for no named cards
   @batch [card].batchTT READONLY, -- the list of batch properties
   @meta core.metaDataTT READONLY, -- information for the user that makes the operation
   @noResultSet bit = 0 -- this is the flag about the waited result
AS

SET NOCOUNT ON
DECLARE @callParams XML

DECLARE @batchId int
DECLARE @batchName NVARCHAR (100)
DECLARE @branchId BIGINT, @branchIdCheck BIGINT
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @statusId tinyint
DECLARE @embossedTypeId tinyint =  (SELECT embossedTypeId FROM [card].[embossedType] et
                        join core.itemName itn on itn.itemNameId = et.itemNameId
                        join core.itemType it on it.itemTypeId = itn.itemTypeId
                        WHERE itemCode = 'noNamed' and it.alias = 'embossedType')
DECLARE @resultBatch [card].batchTT
DECLARE @isAutogenerated bit = 0

BEGIN TRY
    DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    IF @languageId is null
        SET @languageId = (SELECT [languageId] FROM [core].[language] WHERE [name] = 'English')

    SELECT @branchId = min([object]), @branchIdCheck = max([object])
    FROM [core].[actorHierarchy]
    WHERE predicate = 'memberOf' AND subject = @userId

    IF @branchId != @branchIdCheck
        RAISERROR('card.batch.addNoNameBatch.loggedUserWithMoreThanOneBranch', 16, 1);

    SET @statusId = (SELECT top 1 statusId
    FROM [card].statusStartEnd
    WHERE module = 'Batch' AND startendFlag = 0)

    SET @batchName = (SELECT batchName FROM @batch)

    IF @batchName IS NULL
       BEGIN
           DECLARE @typeName NVARCHAR(100)
           DECLARE @batchDayCount NVARCHAR(100)
           DECLARE @issuingBranch NVARCHAR(50)
           DECLARE @today DATETIME2 (0) = DATEADD(day, DATEDIFF(day, 0, getdate()), 0)  select @today

           SET @typeName = (SELECT ISNULL(itt.itemNameTranslation,t.name) AS productName FROM @batch b
                           JOIN [card].[type] t ON t.typeId = b.typeId
                           LEFT JOIN [core].itemTranslation itt ON itt.itemNameId = t.itemNameId and itt.languageId = @languageId)

           SET @batchDayCount = ISNULL((SELECT count(cb.batchId) FROM [card].batch cb
                                   JOIN @batch b ON cb.issuingBranchId = b.issuingBranchId
                                   WHERE cb.embossedTypeId = @embossedTypeId and cb.createdOn >= @today and cb.createdOn < DATEADD (d, 1, @today)),0)

           SET @issuingBranch = ISNULL ((SELECT [code] FROM [customer].[organization] o
                                      JOIN @batch b ON o.actorId = b.issuingBranchId),(SELECT issuingBranchId FROM @batch))

           SET @batchName = @typeName + '_' + @issuingBranch + '_' + CONVERT(VARCHAR(10), @today, 105) + '_' + @batchDayCount

           SET @isAutogenerated =1
       END

    INSERT INTO [card].[batch](batchName, statusId, embossedTypeId, numberOfCards, typeId, targetBranchId, issuingBranchId, branchId, createdBy, createdOn, updatedBy, updatedOn)
    OUTPUT inserted.batchId, inserted.batchName, inserted.statusId, inserted.embossedTypeId, inserted.numberOfCards, inserted.typeId, inserted.targetBranchId, inserted.issuingBranchId, 
           inserted.branchId, inserted.createdBy, inserted.createdOn, inserted.updatedBy, inserted.updatedOn    
    into @resultBatch (batchId, batchName, statusId, embossedTypeId, numberOfCards, typeId, targetBranchId, issuingBranchId, branchId, createdBy, createdOn, updatedBy, updatedOn)
    select @batchName, @statusId, @embossedTypeId, numberOfCards, typeId, targetBranchId, issuingBranchId, @branchId, @userId, GETDATE(), @userId, GETDATE()
    FROM @batch

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'batch' AS resultSetName
        SELECT *, @isAutogenerated as isAutogenerated
        FROM  @resultBatch
    END

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION

    IF error_number() not in (547, 2627)
        BEGIN
            EXEC [core].[error]
        END
    ELSE
    BEGIN TRY
        IF error_number() = 547
            BEGIN
                IF error_message() like '%BranchId%'
                BEGIN
                    RAISERROR('Branch does not exists', 16, 1);
                END
                ELSE
                IF error_message() like '%TypeId%'
                BEGIN
                    RAISERROR('Card type does not exists', 16, 1);
                END
            END
        ELSE
        IF error_number() = 2627
            BEGIN
                RAISERROR('Batch name already exists', 16, 1);
            END
    END TRY
    BEGIN CATCH
        EXEC [core].[error]
    END CATCH
END CATCH
