ALTER PROCEDURE [card].[customer.search] -- fetch all customers with name as the passed
    @customerName nvarchar(500), --customer name  or customer number to to search for
    @productId int, -- the product for which to search customers according to the defined customer types for this product
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

SELECT 'customer' AS resultSetName

SELECT TOP 11 c.customerName, c.customerNumber, c.telMobile, c.customerType
FROM [integration].[vCustomer] c
join [card].productCustomerType pct on pct.customerTypeId = c.customerTypeId and pct.productId = @productId
where customerName like '%' + @customerName + '%'
    or customerNumber like @customerName + '%'
group by c.customerName, c.customerNumber, c.telMobile, c.customerType