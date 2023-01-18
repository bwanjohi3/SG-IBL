/*declare @product [card].productTT, @meta core.metaDataTT,  @productAccountType [card].productAccountTypeTT, @productCustomerType [card].productCustomerTypeTT

declare @sa bigint = (select actorId from [user].[hash] where identifier = 'sa' and type = 'password')
insert into @meta ([auth.actorId], method, languageId) values (@sa, '', 1)

declare @productName nvarchar(100)
declare @binid int, @embossedTypeId tinyint
declare @ownershipTypeId bigint = (select ownershipTypeId from [card].ownershipType ot 
                                        join core.itemName itn on itn.itemNameId = ownershipTypeId
                                        join core.itemType it on it.itemTypeId = itn.itemTypeId
                                        where itn.itemCode = 'own' and it.alias = 'ownership' )

declare @branchId bigint = (select actorId from customer.organization where organizationName = 'Software Group')
DECLARE @itemNameID BIGINT
DECLARE @issuerId nvarchar(20) = 'cbs'

insert into @productAccountType (accountTypeId)
select distinct accountTypeId
from [integration].vAccountType

insert into @productCustomerType(customerTypeId)
SELECT distinct [customerTypeId] FROM [integration].[vCustomer]

IF @branchId IS NOT NULL
BEGIN
    set @productName= 'Product 11'
    set @binid= (select top 1 binId from [card].bin order by binId asc)
    set @embossedTypeId = (select top 1 embossedTypeId from [card].embossedType order by embossedTypeId ASC)    

    insert into @product (name, description, startDate, endDate, embossedTypeId, 
                createdBy, createdOn, updatedBy, updatedOn, isActive, periodicCardFeeId, branchId,
                accountLinkLimit, pinRetriesLimit, pinRetriesDailyLimit)
    select  @productName, 'Product Test','02-02-2017', NULL, @embossedTypeId,
            @sa, '12-12-2016', @sa, '12-12-2016', 1, 1, @branchId,
             5, 3, 3

    if not exists (select * from [card].product where name = @productName)
        exec [card].[product.add] @product = @product, @productAccountType = @productAccountType, @productCustomerType = @productCustomerType, @meta = @meta

    delete from @product
    set @productName  = 'Product 21'
    set @binid= (select top 1 binId from [card].bin order by binId desc)
    set @embossedTypeId = (select top 1 embossedTypeId from [card].embossedType order by embossedTypeId desc)     

    insert into @product (name, description, startDate, endDate, embossedTypeId,  
                 createdBy, createdOn, updatedBy, updatedOn, isActive, periodicCardFeeId, branchId,
                 accountLinkLimit, pinRetriesLimit, pinRetriesDailyLimit)
    select @productName, 'Product Test 2','02-02-2017', NULL, @embossedTypeId,
            @sa, '10-01-2016', @sa, '10-01-2016', 1, 1, @branchId,
           5, 5, 3

    if not exists (select * from [card].product where name = @productName)
        exec [card].[product.add] @product = @product, @productAccountType = @productAccountType, @productCustomerType = @productCustomerType, @meta = @meta
END
*/