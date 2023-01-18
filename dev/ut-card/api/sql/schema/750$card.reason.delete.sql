ALTER PROCEDURE [card].[reason.delete] -- this SP deletes reason(s)
    @reason core.arrayNumberList READONLY, --the action ids for which this reason is valid
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
   AS

     DECLARE @callParams XML
    DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)

BEGIN TRY

    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
       RETURN 55555
    END

    BEGIN TRANSACTION
        UPDATE r
       SET r.[name] = [name] + ' deleted ' + convert(varchar(20),CURRENT_TIMESTAMP, 113),
           r.isDeleted = 1,
          r.updatedBy = @userId,
          r.updatedOn = getdate(),
          r.isActive  = 0
        FROM [card].reason r
        INNER JOIN @reason s ON r.reasonId = [value]


       UPDATE itn
       set itn.itemName = itn.itemName + ' deleted ' + convert(varchar(20),CURRENT_TIMESTAMP, 113)
       FROM core.itemName itn
       JOIN [card].reason r ON r.itemNameId = itn.itemNameId
        INNER JOIN @reason s ON r.reasonId = [value]


       DELETE ra
       FROM [card].reasonAction ra
       join @reason r on ra.reasonId = r.[value]

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH