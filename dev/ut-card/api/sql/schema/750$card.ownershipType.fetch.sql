CREATE PROCEDURE [card].[ownershipType.fetch] -- this SP gets the type of batches in DB
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

-- checks if the user has a right to make the operation
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

SELECT 'ownershipType' AS resultSetName

SELECT et.ownershipTypeId, ISNULL(ett.itemNameTranslation, ein.itemName) as ownershipTypeName, ein.itemCode
FROM [card].[ownershipType] et
join core.itemName ein on ein.itemNameId = et.ownershipTypeId
LEFT JOIN core.itemTranslation ett on ett.itemNameId = et.ownershipTypeId and ett.languageId = @languageId