ALTER PROCEDURE [card].[customerType.list] -- this SP returns all customer type
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
if @return != 0
BEGIN
    RETURN 55555
END

select customerTypeNumber as customerTypeId, customerType as name, customerType as description, customerTypeId as code
from [integration].[vCustomerType]