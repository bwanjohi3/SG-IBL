alter PROCEDURE [card].[type.get] -- this SP gets existing card Type in DB
    @typeId int, -- this SP gets the information about type
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS

declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
if @return != 0
begin
    RETURN 55555
END

declare @userId bigint = (SELECT [auth.actorId] FROM @meta)

declare @languageId bigint = (SELECT languageId
                        from [core].[language] cl
                        join [user].[session] us ON us.[language] = cl.[iso2Code]
                        where us.[actorId] = @userId)
if @languageId is null
        set @languageId = (select [languageId] from [core].[language] where [name] = 'English')

select 'type' AS resultSetName
select
    t.typeId,
    ISNULL(itt.itemNameTranslation, t.name) as name,
    t.description,
    t.cardBrandId,
    t.cardNumberConstructionId,
    --branch
    t.termMonth,
    CASE
        WHEN t.cvk IS NOT NULL then 1
        ELSE 0
    END
    as cvkExists,
    CASE
        WHEN t.pvk IS NOT NULL then 1
        ELSE 0
    END
    as pvkExists,
    t.cryptogramMethodIndex,
    t.cryptogramMethodName,
    t.schemeId,
    CASE
        WHEN t.mkac IS NOT NULL then 1
        ELSE 0
    END
    as mkacExists,
    CASE
        WHEN t.ivac IS NOT NULL then 1
        ELSE 0
    END
    as ivacExists,
    cdol1ProfileId,
    t.applicationInterchangeProfile,
    CASE
        WHEN t.decimalisation IS NOT NULL then 1
        ELSE 0
    END
    as decimalisationExists,
    t.cipher,
    t.cvv1,
    t.cvv2,
    t.icvv,
    t.serviceCode1,
    t.serviceCode2,
    t.serviceCode3,
    t.generateControlDigit,
    t.emvRequestTags,
    t.emvResponseTags,
    t.flow,
    t.issuerId,
    t.isActive
from [card].[type] t
LEFT JOIN [core].itemTranslation itt on itt.itemNameId = t.itemNameId and itt.languageId = @languageId
--LEFT JOIN [card].cardBrand ccb on ccb.cardBrandId = t.cardBrandId
where t.typeId = @typeId

select 'typeBin' AS resultSetName
select
    cb.binId,
    cb.startBin,
    cb.endBin,
    ISNULL(itt.itemNameTranslation, cb.description) as binDescription,
    cin.itemCode as ownershipTypeName,
    cb.ownershipTypeId,
    cb.isActive   
from [card].[type] t  
JOIN [card].bin cb on cb.typeId = t.typeId
LEFT JOIN core.itemName cin on cb.ownershipTypeId = cin.itemNameId
LEFT JOIN core.itemTranslation itt on itt.itemNameId = cb.itemNameId and itt.languageId = @languageId
where t.typeId = @typeId
