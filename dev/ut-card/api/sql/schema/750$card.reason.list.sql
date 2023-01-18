ALTER PROCEDURE [card].[reason.list] -- this SP returns all existing reasons by module
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
SET NOCOUNT ON

DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
-- checks if the user has a right to make the operation
declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
if @return != 0
BEGIN
    RETURN 55555
END

DECLARE @languageId BIGINT = isnull((SELECT languageId
                                        FROM [core].[language] cl
                                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                                        WHERE us.[actorId] = @userId),
                                    (select [languageId] from [core].[language] where [name] = 'English'))


SELECT 'ApplicationReason' AS resultSetName

SELECT r.reasonId, ISNULL(itt.itemNameTranslation, itn.itemName) as name, ra.actionId, a.actionName as actionLabel
FROM [card].reason r
join [card].reasonAction ra on ra.reasonId = r.reasonId
join [card].action a on a.actionId = ra.actionId
JOIN [core].itemName itn ON itn.itemNameId = r.itemNameId
LEFT JOIN [core].itemTranslation itt on itt.itemNameId = r.itemNameId and itt.languageId = @languageId
WHERE r.module = 'Application' and isActive = 1


SELECT 'BatchReason' AS resultSetName

SELECT r.reasonId, ISNULL(itt.itemNameTranslation, itn.itemName) as name, ra.actionId, a.actionName as actionLabel
FROM [card].reason r
join [card].reasonAction ra on ra.reasonId = r.reasonId
join [card].action a on a.actionId = ra.actionId
JOIN [core].itemName itn ON itn.itemNameId = r.itemNameId
LEFT JOIN [core].itemTranslation itt on itt.itemNameId = r.itemNameId and itt.languageId = @languageId
WHERE r.module = 'Batch' and isActive = 1


SELECT 'CardReason' AS resultSetName

SELECT r.reasonId, ISNULL(itt.itemNameTranslation, itn.itemName) as name, ra.actionId, a.actionName as actionLabel
FROM [card].reason r
join [card].reasonAction ra on ra.reasonId = r.reasonId
join [card].action a on a.actionId = ra.actionId
JOIN [core].itemName itn ON itn.itemNameId = r.itemNameId
LEFT JOIN [core].itemTranslation itt on itt.itemNameId = r.itemNameId and itt.languageId = @languageId
WHERE r.module = 'Card' and isActive = 1


SELECT 'CardInUseReason' AS resultSetName

SELECT r.reasonId, ISNULL(itt.itemNameTranslation, itn.itemName) as name, ra.actionId, a.actionName as actionLabel
FROM [card].reason r
join [card].reasonAction ra on ra.reasonId = r.reasonId
join [card].action a on a.actionId = ra.actionId
JOIN [core].itemName itn ON itn.itemNameId = r.itemNameId
LEFT JOIN [core].itemTranslation itt on itt.itemNameId = r.itemNameId and itt.languageId = @languageId
WHERE r.module = 'CardInUse' and isActive = 1