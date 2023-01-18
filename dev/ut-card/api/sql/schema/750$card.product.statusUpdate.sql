CREATE PROCEDURE [card].[product.statusUpdate]  -- edits card product status Active/Inactive
    @product [card].productTT READONLY, -- the edited product information
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @callParams XML
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta) -- the id of the user that makes the operation

BEGIN TRY

    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

     UPDATE p
       SET p.updatedBy = @userId,
          p.updatedOn = getdate(),
          p.isActive  =  s.isActive
        FROM [card].product p
        INNER JOIN @product s ON p.productId = s.productId


    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH