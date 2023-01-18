ALTER PROCEDURE [card].[reason.get] -- this SP gets the information about reason
    @reasonId TINYINT, ---the unique reference of reason
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

    SELECT 'reasonAction' AS resultSetName

    SELECT  a.actionId, ISNULL(itt.itemDescriptionTranslation, itn.itemDescription) as actionName, a.actionName as actionLabel
       FROM  [card].reasonAction ra
       join  [card].[action] a on a.actionId = ra.actionId
       JOIN [core].itemName itn ON itn.itemNameId = a.itemNameId
       LEFT JOIN [core].itemTranslation itt on itt.itemNameId = a.itemNameId and @languageId = itt.languageId
       WHERE ra.reasonId = @reasonid

    SELECT 'cardReason' AS resultSetName

    SELECT  r.reasonId, r.code, r.module, ISNULL(it.itemNameTranslation, itn.itemName) as reasonName, r.isActive
       FROM [card].reason r
       JOIN [core].itemName itn ON itn.itemNameId = r.itemNameId
       LEFT JOIN [core].itemTranslation it on it.itemNameId = r.itemNameId and @languageId = it.languageId
       WHERE r.reasonId = @reasonid and isDeleted = 0