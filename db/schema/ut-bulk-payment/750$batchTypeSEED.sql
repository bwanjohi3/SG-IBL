DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT

DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

DECLARE @itemNameId bigint 
DECLARE @parentItemNameId bigint

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'batchType')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('batchType', 'batchType', 'batchType', '[bulk].[batchType]', 'batchTypeId', NULL)
END

DELETE FROM @itemNameTranslationTT

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) 
VALUES  ('bulkDebit', 'Bulk Debit', 'Bulk Debit' ),
        ('bulkCredit', 'Bulk Credit', 'Bulk Credit'),
        ('merchantBulkCredit', 'Bulk Credit Merchant', 'Bulk Credit Merchant')

EXEC core.[itemNameTranslation.upload]
    @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId,
    @organizationId = NULL,
    @itemType = 'batchType',
    @meta = @meta
