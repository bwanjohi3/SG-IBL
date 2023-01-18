CREATE PROCEDURE [card].[accountType.list] -- this SP returns all account types that are possible to be selected
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
if @return != 0
BEGIN
    RETURN 55555
END


select [accountTypeId], [accountTypeName]
from  [integration].[vAccountType]
where accountTypeId <= 9999
