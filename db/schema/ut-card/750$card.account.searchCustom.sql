ALTER PROCEDURE [card].[account.searchCustom] -- fetch all accounts by customer number as the passed
    @customerNumber nvarchar(10), --customer number for which to search
    @personNumber nvarchar(10), -- person number for which to search
    @productId int, -- for which product will be returned - each product defines possible account types
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

SET NOCOUNT ON
--checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

SELECT 'account' AS resultSetName

SELECT a.accountNumber, a.accountTypeName, a.availableBalance, a.currency, a.customerNumber, methodOfOperationId
FROM [integration].[vAccount] a
left join [card].productAccountType pat on pat.accountTypeId = a.accountTypeId and pat.productId = @productId
where customerNumber = @customerNumber
    and (@productId is null or pat.productAccountTypeId is not null)

SELECT 'accountLink' AS resultSetName

SELECT accountLinkId, itn.itemName as [name], itn.itemCode as code
FROM [card].accountLink al
JOIN core.itemName itn on itn.itemNameId = al.itemNameId
