ALTER procedure [card].[card.panGet] -- this procedure sets for the cards that are passed that their pin mails are generated
   @cards card.cardTT READONLY, -- in this parameter the stored procedure receives cardId list
   @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

SELECT 'configuration' as resultSetName
SELECT
    [key],
    value
FROM [user].[configuration]
WHERE [key] = 'pinMailerFormatString'
    OR [key] = 'pinMailerMaxFieldIndex'

SELECT 'pans' as resultSetName
SELECT
     cc.[cardId]
    ,cn.pan
    ,isnull(cc.pvk, ct.pvk) as pvk
    ,isnull(cc.decimalisation, ct.decimalisation) as decimalisation
    ,isnull(cc.cipher, ct.cipher) as cipher
    ,bpg.printFields
FROM @cards c
LEFT JOIN [card].[card] cc on cc.cardId = c.cardId
LEFT JOIN [card].[number] cn ON cn.numberId = cc.cardId
LEFT JOIN [card].[type] ct ON ct.typeId = cc.typeId
LEFT JOIN [integration].vBatchPansGet bpg ON bpg.cardId = cc.cardId
