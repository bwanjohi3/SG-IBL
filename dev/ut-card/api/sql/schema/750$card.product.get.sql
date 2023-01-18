ALTER PROCEDURE [card].[product.get] -- this SP gets existing card Product in DB
    @productId int, -- this SP gets the information about reason
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS

declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
if @return != 0
begin
    RETURN 55555
END

select 'accountType' AS resultSetName

select ac.accountTypeId, ac.accountTypeName
from  [card].[productAccountType] pa
join [integration].[vAccountType] ac on ac.accountTypeId = pa.accountTypeId
where pa.productId = @productId


select 'customerType' AS resultSetName

select pc.customerTypeId, customerType as customerTypeName
from [card].[productCustomerType] pc
join [integration].[vCustomerType] cc on cc.customerTypeNumber = pc.customerTypeId
where pc.productId = @productId

declare @userId bigint = (SELECT [auth.actorId] FROM @meta)

declare @languageId bigint = (SELECT languageId
                        from [core].[language] cl
                        join [user].[session] us ON us.[language] = cl.[iso2Code]
                        where us.[actorId] = @userId)

--select 'cvvs' AS resultSetName

--select p.cvv1, p.cvv2, p.icvv, p.cavv from [card].product p
--where p.productId = @ProductId

select 'product' AS resultSetName

select
    p.productId,
    ISNULL(itt.itemNameTranslation, p.name) AS name,
    itt.itemDescriptionTranslation AS [description],
    startDate,
    endDate, 
    p.embossedTypeId,
    ISNULL(ett.itemNameTranslation, etn.itemName) AS embossedTypeName, 
    p.isActive,
    p.periodicCardFeeId,
    pc.Name AS periodicCardFeeName,
    o.organizationName AS branchName,
    p.accountLinkLimit,   
    p.pinRetriesLimit,
    p.pinRetriesDailyLimit,
    (SELECT COUNT(*) FROM [card].[card] WHERE productId = @productId) +
    (SELECT COUNT(*) FROM [card].[application] WHERE productId = @productId) +
    (SELECT COUNT(*) FROM [card].[batch] WHERE productId = @productId) AS productUsed
from [card].product p
LEFT JOIN [core].itemTranslation itt on itt.itemNameId = p.itemNameId and itt.languageId = @languageId
JOIN [card].embossedType et ON et.embossedTypeId = p.embossedTypeId
JOIN [core].itemName etn on etn.itemNameId = et.itemNameId
LEFT JOIN [core].itemTranslation ett on ett.itemNameId = et.itemNameId and ett.languageId = @languageId
join [card].periodicCardFee pc ON pc.periodicCardFeeId = p.periodicCardFeeId
join customer.organization o ON o.actorId = p.BranchId
where p.productId = @ProductId