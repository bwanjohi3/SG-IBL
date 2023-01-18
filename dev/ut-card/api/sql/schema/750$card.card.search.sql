ALTER PROCEDURE [card].[card.search] -- SP that returns data for the card and its type
    @cardNumber varchar(32), --the encrypted card number
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

SET NOCOUNT ON
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

--checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

DECLARE @statusId tinyint = (select statusId from [card].[status] where statusName = 'Accepted')
DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

SELECT c.cardId, c.cardnumber, t.typeId, ISNULL(itt.itemNameTranslation, t.name) as typeName
FROM [card].[card] c
join [card].number n on n.numberId = c.cardId
JOIN [card].[type] t ON c.typeId = t.typeId
LEFT JOIN [core].itemTranslation itt on t.itemNameId = itt.itemNameId and itt.languageId = @languageId
WHERE c.statusId = @statusId and c.customerName is null and n.pan = @cardNumber