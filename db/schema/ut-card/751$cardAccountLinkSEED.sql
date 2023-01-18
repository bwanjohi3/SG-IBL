DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT

INSERT INTO @itemNameTranslationTT(itemName, itemCode, itemNameTranslation) 
VALUES ('savings', '10', 'savings'), 
        ('current', '20', 'current'),
        ('loan', '30', 'loan')

MERGE INTO [core].[itemType] AS target
USING
    (VALUES         
        ('cardAccountLink', 'cardAccountLink', 'cardAccountLink')
    ) AS source (alias, name, [description])
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
    INSERT (alias, name, [description])
    VALUES (alias, name, [description]);

DECLARE @itemTypeCardAccountLink TINYINT = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'cardAccountLink');
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'cardAccountLink', @meta = @meta

MERGE INTO [card].accountLink targ
USING (
    SELECT itn.itemNameId
    from @itemNameTranslationTT tt
    join core.itemName itn on tt.itemName = itn.itemName
    where itn.itemTypeId = @itemTypeCardAccountLink
) src on src.itemNameId = targ.itemNameId
WHEN  NOT MATCHED BY TARGET THEN
    INSERT (itemNameId)
    VALUES(src.itemNameId);