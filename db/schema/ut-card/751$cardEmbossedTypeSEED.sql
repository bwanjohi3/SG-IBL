DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT

INSERT INTO @itemNameTranslationTT(itemName, itemCode, itemNameTranslation) 
VALUES ('No named cards', 'noNamed', 'No named cards'), 
        ('Named cards', 'named', 'Named cards')
        

MERGE INTO [core].[itemType] AS target
USING
(
    VALUES         
        ('embossedType', 'embossedType', 'embossedType')
) AS source (alias, name, [description])
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
    INSERT (alias, name, [description])
    VALUES (alias, name, [description]);

DECLARE @itemTypeEmbossedType TINYINT = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'embossedType');
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'embossedType', @meta = @meta

MERGE INTO [card].embossedType targ
USING 
(
    SELECT itn.itemNameId
    from @itemNameTranslationTT tt
    join core.itemName itn on tt.itemName = itn.itemName
    where itn.itemTypeId = @itemTypeEmbossedType
) src on src.itemNameId = targ.itemNameId
WHEN  NOT MATCHED BY TARGET THEN
    INSERT (itemNameId)
    VALUES(src.itemNameId);