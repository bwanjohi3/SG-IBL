ALTER PROCEDURE [card].[bin.list] -- this SP gets all existing card bins in DB    
    @isActive bit = NULL, -- filter by isActive flag in card.product
    @skipUsed bit = 1, -- skip or return already used BINs
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    SET NOCOUNT ON

    DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
    --DECLARE @ownershipTypeIdOwn bigint = (SELECT TOP 1 [ownershipTypeId]
    --                            FROM [card].[ownershipType] cot
    --                            LEFT JOIN [core].[itemName] cin on cin.itemNameId = cot.ownershipTypeId
    --                            WHERE cin.itemCode = 'own')
    --DECLARE @ownershipTypeIdExternal bigint = (SELECT TOP 1 [ownershipTypeId]
    --                            FROM [card].[ownershipType] cot
    --                            LEFT JOIN [core].[itemName] cin on cin.itemNameId = cot.ownershipTypeId
    --                            WHERE cin.itemCode = 'external')
    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)
    IF @languageId IS NULL
        SET @languageId = (SELECT [languageId] FROM [core].[language] WHERE [name] = 'English')

     SELECT 'cardBin' AS resultSetName
     --SELECT  b.binId, ownershipTypeId, ISNULL(it.itemNameTranslation, itn.itemName) as [description], typeId
     --  FROM [card].[bin] b
     --  JOIN [core].itemName itn ON itn.itemNameId = b.itemNameId
     --  LEFT JOIN [core].itemTranslation it ON it.itemNameId = b.itemNameId and @languageId = it.languageId
     --  WHERE (@isActive IS NULL OR isActive = @isActive)
     --  AND ownershipTypeId = @ownershipTypeIdOwn
     --  UNION ALL
     --SELECT  b.binId, ownershipTypeId, ISNULL(it.itemNameTranslation, itn.itemName) as [description], typeId
     --  FROM [card].[bin] b
     --  JOIN [core].itemName itn ON itn.itemNameId = b.itemNameId
     --  LEFT JOIN [core].itemTranslation it ON it.itemNameId = b.itemNameId and @languageId = it.languageId
     --  WHERE (@isActive IS NULL OR isActive = @isActive)
     --  AND ownershipTypeId = @ownershipTypeIdExternal
     --  AND typeId is null
     SELECT  b.binId, ownershipTypeId, ISNULL(it.itemNameTranslation, itn.itemName) as [description]
       FROM  [card].[bin] b
       JOIN [core].itemName itn ON itn.itemNameId = b.itemNameId
       LEFT JOIN [core].itemTranslation it ON it.itemNameId = b.itemNameId and @languageId = it.languageId
       WHERE (@isActive IS NULL OR isActive = @isActive)
            AND (typeId is NULL OR @skipUsed = 0)
