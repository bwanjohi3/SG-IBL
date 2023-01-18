ALTER procedure [card].[application.statusUpdateCreateBatch] -- executed when applications are marked and put to create a batch with them
   @application [card].applicationTT READONLY, --the applications that should be put in the batch
   @batch [card].batchTT READONLY, -- the information with applications
   @batchId INT OUT, -- the ID of the newly created batch
   @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

SET NOCOUNT ON
DECLARE @callParams XML
declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @batchName NVARCHAR (100)
DECLARE @branchId BIGINT, @branchIdCheck BIGINT
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @statusId tinyint
DECLARE @embossedTypeId tinyint =  (SELECT embossedTypeId FROM [card].[embossedType] et
                        join core.itemName itn on itn.itemNameId = et.itemNameId
                        join core.itemType it on it.itemTypeId = itn.itemTypeId
                        WHERE itemCode = 'Named' and it.alias = 'embossedType')

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    SELECT @branchId = min([object]), @branchIdCheck = max([object])
    FROM [core].[actorHierarchy]
    WHERE predicate = 'memberOf' AND subject = @userId

    IF @branchId != @branchIdCheck
        RAISERROR('card.application.statusUpdateCreateBatch.loggedUserWithMoreThanOneBranch', 16, 1);

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    IF @languageId is null
        SET @languageId = (SELECT [languageId] FROM [core].[language] WHERE [name] = 'English')

    SET @statusId = (SELECT top 1 statusId
    FROM [card].statusStartEnd
    WHERE module = 'Batch' AND startendFlag = 0)

    SET @batchName = (SELECT batchName FROM @batch)

    IF @batchName IS NULL
       BEGIN
            DECLARE @typeName NVARCHAR(100)
            DECLARE @batchDayCount NVARCHAR(100)
            DECLARE @today DATETIME2 (0) = DATEADD(day, DATEDIFF(day, 0, getdate()), 0) 

            SET @typeName = (SELECT ISNULL(itt.itemNameTranslation, t.name) AS typeName FROM  @batch b
                            -- JOIN [card].product p ON p.productId = b.productId
                            JOIN [card].type t ON t.typeId = b.typeId
                            LEFT JOIN [core].itemTranslation itt ON itt.itemNameId = t.itemNameId and itt.languageId = @languageId)

            SET @batchDayCount = ISNULL((SELECT count(cb.batchId) FROM [card].batch cb
                                    WHERE cb.embossedTypeId = @embossedTypeId and cb.createdOn >= @today and cb.createdOn < DATEADD (d, 1, @today)),0)

            SET @batchName = @typeName + '_' + CONVERT(VARCHAR(10), @today, 105) + '_' + @batchDayCount
       END

    INSERT INTO [card].[batch](batchName, statusId, embossedTypeId, targetBranchId, issuingBranchId, branchId, createdBy, createdOn, updatedBy, updatedOn, numberOfCards)
    SELECT @batchName, @statusId, @embossedTypeId, targetBranchId, issuingBranchId, @branchId, @userId, GETDATE(), @userId, GETDATE(),
            (select count(*) from @application)
    FROM @batch

    set @batchId = SCOPE_IDENTITY()

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
       IF  error_number() = 2627
          BEGIN
             RAISERROR('Batch name already exists', 16, 1);
          END
    END TRY
    BEGIN CATCH
       EXEC [core].[error]
    END CATCH
END CATCH