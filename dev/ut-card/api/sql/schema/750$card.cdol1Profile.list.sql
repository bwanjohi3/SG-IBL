ALTER PROCEDURE [card].[cdol1Profile.list] -- this SP gets all existing card Product in DB
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
    SET NOCOUNT ON

    DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    SELECT 'cdol1Profile' AS resultSetName
    SELECT
        [cdol1ProfileId] as [key]
        ,[cdol1ProfileName] as name
    FROM [card].[cdol1Profile]
