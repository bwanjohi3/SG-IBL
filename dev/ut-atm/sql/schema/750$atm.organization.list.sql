ALTER PROCEDURE [atm].[organization.list] -- lists all organizations
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
-- checks if the user has a right to make the operation
--declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
--exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
--if @return != 0
--BEGIN
--    RETURN 55555
--END

EXEC [customer].[organization.list] @meta