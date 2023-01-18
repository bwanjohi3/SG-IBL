DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT

DECLARE @itemTypeTextId INT = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'text');

DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemName, itemTypeId, itemNameTranslation) 
VALUES  ('Staff', @itemTypeTextId, 'Staff'),
        ('Non Staff', @itemTypeTextId, 'Non Staff')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @meta = @meta
