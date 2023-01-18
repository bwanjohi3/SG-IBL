CREATE PROCEDURE [card].[type.list] -- this SP gets all existing card types in DB
    @isActive BIT = NULL, -- filter by isActive flag in card.type
    @ownershipTypeId BIGINT = NULL, --filter by ownership type   
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
    SET NOCOUNT ON

    DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
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

    SELECT 'type' AS resultSetName

    SELECT t.typeId, ISNULL(itt.itemNameTranslation, t.[name]) AS [name]
    FROM [card].[type] t
    LEFT JOIN [core].itemTranslation itt ON itt.itemNameId = t.itemNameId and itt.languageId = @languageId
    JOIN [card].bin cb ON cb.typeId = t.typeId
    WHERE (@isActive IS NULL OR t.isActive = @isActive) 
      AND (@ownershipTypeId IS NULL OR cb.ownershipTypeId = @ownershipTypeId)
            
            
