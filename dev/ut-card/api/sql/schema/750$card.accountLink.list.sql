CREATE PROCEDURE [card].[accountLink.list] -- this SP returns all account links that are possible to be selected
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

SELECT 'accountLink' as resultSetName

SELECT accountLinkId, itn.itemName as [name], itn.itemCode as code
FROM [card].accountLink al
JOIN core.itemName itn on itn.itemNameId = al.itemNameId
