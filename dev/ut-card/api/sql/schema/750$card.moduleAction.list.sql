ALTER PROCEDURE [card].[moduleAction.list] -- this SP returns all available actions for module
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @userId bigint = (select [auth.actorId] from @meta)
DECLARE @languageId BIGINT = isnull((SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId), isnull((select languageId from @meta), (select languageId from core.[language] where name = 'English')))


SELECT 'Application' AS resultSetName

SELECT DISTINCT a.actionId, a.actionName, ISNULL(it.itemDescriptionTranslation, itn.itemDescription) AS itemDescriptionTranslation
FROM [card].[action] a
JOIN [card].statusAction sa ON a.actionId = sa.actionId
JOIN core.itemName itn ON itn.itemNameId = a.itemNameId
LEFT JOIN core.itemTranslation it ON it.itemNameId = a.itemNameId and it.languageId = @languageId
WHERE module = 'Application'
ORDER BY ISNULL(it.itemDescriptionTranslation, itn.itemDescription)



SELECT 'Batch' AS resultSetName

SELECT DISTINCT a.actionId, a.actionName, ISNULL(it.itemDescriptionTranslation, itn.itemDescription) AS itemDescriptionTranslation
FROM [card].[action] a
JOIN [card].statusAction sa ON a.actionId = sa.actionId
JOIN core.itemName itn ON itn.itemNameId = a.itemNameId
LEFT JOIN core.itemTranslation it ON it.itemNameId = a.itemNameId and it.languageId = @languageId
WHERE module = 'Batch'
ORDER BY ISNULL(it.itemDescriptionTranslation, itn.itemDescription)

SELECT 'Card' AS resultSetName

SELECT DISTINCT a.actionId, a.actionName, ISNULL(it.itemDescriptionTranslation, itn.itemDescription) AS itemDescriptionTranslation
FROM [card].[action] a
JOIN [card].statusAction sa ON a.actionId = sa.actionId
JOIN core.itemName itn ON itn.itemNameId = a.itemNameId
LEFT JOIN core.itemTranslation it ON it.itemNameId = a.itemNameId and it.languageId = @languageId
WHERE module = 'Card'
ORDER BY ISNULL(it.itemDescriptionTranslation, itn.itemDescription)


SELECT 'CardInUse' AS resultSetName

SELECT DISTINCT a.actionId, a.actionName, ISNULL(it.itemDescriptionTranslation, itn.itemDescription) AS itemDescriptionTranslation
FROM [card].[action] a
JOIN [card].statusAction sa ON a.actionId = sa.actionId
JOIN core.itemName itn ON itn.itemNameId = a.itemNameId
LEFT JOIN core.itemTranslation it ON it.itemNameId = a.itemNameId and it.languageId = @languageId
WHERE module = 'CardInUse'
ORDER BY ISNULL(it.itemDescriptionTranslation, itn.itemDescription)