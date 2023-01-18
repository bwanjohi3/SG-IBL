DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT


DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');
DECLARE @frLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'fr');
DECLARE @cnLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'cn');

DECLARE @itemNameId bigint 
DECLARE @parentItemNameId bigint


--county

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'county')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('county', 'county', 'county', NULL, 'itemCode', 'itemName')
END
 

DELETE FROM @itemNameTranslationTT

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName ) 
VALUES  (null, 'Burgas', 'Burgas', 'country','Bulgaria' ),
	   (null, 'Turgoviste', 'Turgoviste', 'country','Bulgaria')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
								@languageId = @enLanguageId, 
								@organizationId = NULL, 
								@itemType = 'county', 
								@meta = @meta



 --city

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'city')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('city', 'city', 'city', NULL, 'itemCode', 'itemName')
END
   
    
DELETE FROM @itemNameTranslationTT

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) 
VALUES  (null, 'Burgas', 'Burgas', 'county', 'Burgas'),
	   (null, 'Aitos', 'Aitos', 'county', 'Burgas'),
	   (null, 'Karnobat', 'Karnobat', 'county', 'Burgas'),
	   (null, 'Turgoviste', 'Turgoviste', 'county', 'Turgoviste'),
        (null, 'Popovo', 'Popovo', 'county', 'Turgoviste')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
								@languageId = @enLanguageId, 
								@organizationId = NULL, 
								@itemType = 'city', 
								@meta = @meta



