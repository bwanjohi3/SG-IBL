DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

MERGE INTO [core].[itemType] AS target
USING
    (VALUES
        ('networkType', 'networkType', 'networkType')
    ) AS source (name, alias, [description])
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, alias, [description])
VALUES (name, alias, [description]);

---------------------------------------- NETWORK TYPES
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('Field Officer', 'Field Officer')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('Agent', 'Agent')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('Merchant', 'Merchant')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'networkType', @meta = @meta