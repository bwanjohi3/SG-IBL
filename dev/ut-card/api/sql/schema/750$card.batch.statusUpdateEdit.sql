ALTER procedure [card].[batch.statusUpdateEdit] -- this procedure updates the fields of the batch
    @batch [card].batchTT READONLY,-- the list with the batches
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update ba
    SET [batchName] = b.batchName
        ,numberOfCards = isnull(b.numberOfCards, ba.numberOfCards)
        ,[typeId] = b.typeId
        ,[targetBranchId] = b.targetBranchId
        ,issuingBranchId = b.issuingBranchId
        ,statusId = b.statusId
        ,reasonId = b.reasonId
        ,comments = b.comments
        ,updatedBy = @userId
        ,updatedOn = GETDATE()
    from @batch b
    join [card].[batch] ba on b.batchId = ba.batchId

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
