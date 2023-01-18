ALTER PROCEDURE [card].[bin.get] -- this SP gets the information about bin
    @binId INT, ---the unique reference of bin
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

    DECLARE @languageId BIGINT = isnull((SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId), (select [languageId] from [core].[language] where [name] = 'English'))

    SELECT 'cardBin' AS resultSetName

    SELECT  b.binId, b.startBin, b.endBin, ISNULL(it.itemNameTranslation, itn.itemName) as [description], b.isActive, b.ownershipTypeId
	   FROM  [card].[bin] b
       JOIN [core].itemName itn ON itn.itemNameId = b.itemNameId
	   LEFT JOIN [core].itemTranslation it ON it.itemNameId = b.itemNameId and @languageId = it.languageId
	   WHERE b.binId = @binId
