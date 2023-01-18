ALTER PROCEDURE [card].[batch.get] -- this SP gets the information about the selected batch
    @batchId INT, ---the unique reference of batch in UTcard
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
SET NOCOUNT ON
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @pageSize INT = 20
DECLARE @pageNumber INT = 1
DECLARE @sortBy VARCHAR(50)
DECLARE @sortOrder VARCHAR(4)= 'ASC'
DECLARE @customerName NVARCHAR(100)
DECLARE @cardNumber VARCHAR(20)

--checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)


SELECT 'batch' AS resultSetName

SELECT b.batchId, b.statusId, ISNULL(it.itemNameTranslation, s.statusName) AS statusName,
      b.embossedTypeId, ISNULL(ett.itemNameTranslation, ein.itemName) AS embossedTypeName, ein.itemCode as nameType, b.batchName,
      o.organizationName AS targetBranchName,
      org.organizationName AS issuingBranchName,
      b.numberOfCards, ISNULL(rt.itemNameTranslation, r.name) AS reason, b.comments, b.branchId, b.typeId, ISNULL (tt.itemNameTranslation, ct.name) as typeName, b.targetBranchId, b.issuingBranchId, areAllCardsGenerated
FROM [card].batch b
JOIN [card].[status] s ON b.statusId = s.statusId
LEFT JOIN core.itemTranslation it ON it.itemNameId = s.itemNameId and it.languageId = @languageId
JOIN [card].embossedType et ON et.embossedTypeId = b.embossedTypeId
JOIN core.itemName ein on ein.itemNameId = et.itemNameId
LEFT JOIN core.itemTranslation ett on ett.itemNameId = et.itemNameId and ett.languageId = @languageId
LEFT JOIN customer.organization o ON o.actorId = b.targetBranchId
LEFT JOIN customer.organization org ON org.actorId = b.issuingBranchId
LEFT join [card].reason r ON r.reasonId = b.reasonId
LEFT JOIN [core].itemTranslation rt ON rt.itemNameId = r.itemNameId and rt.languageId = @languageid
LEFT JOIN [card].[type] ct ON b.typeId = ct.typeId
LEFT JOIN [core].itemTranslation tt ON tt.itemNameId = r.itemNameId and tt.languageId = @languageid
WHERE b.batchId = @batchId
