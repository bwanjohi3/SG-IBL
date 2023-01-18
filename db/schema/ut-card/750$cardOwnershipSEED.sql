DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT

INSERT INTO @itemNameTranslationTT(itemName, itemCode, itemNameTranslation) 
VALUES ('own', 'own', 'own'), 
        ('external', 'external', 'external'), 
        ('externalNi', 'externalNi', 'externalNi'),
        ('externalOwn', 'externalOwn', 'externalOwn');

MERGE INTO [core].[itemType] AS target
USING
    (VALUES         
        ('ownership', 'ownership', 'card ownership')
    ) AS source (alias, name, [description])
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
    INSERT (alias, name, [description])
    VALUES (alias, name, [description]);

DECLARE @itemTypeCardOwnership TINYINT = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'ownership');
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'ownership', @meta = @meta

MERGE INTO [card].ownershipType targ
USING (
    SELECT itn.itemNameId
    from @itemNameTranslationTT tt
    join core.itemName itn on tt.itemName = itn.itemName
    where itn.itemTypeId = @itemTypeCardOwnership
) src on src.itemNameId = targ.ownershipTypeId
WHEN  NOT MATCHED BY TARGET THEN
    INSERT (ownershipTypeId)
    VALUES(src.itemNameId);