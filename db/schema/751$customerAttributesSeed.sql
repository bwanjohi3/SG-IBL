DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT


DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');
DECLARE @frLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'fr');
DECLARE @cnLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'cn');

DECLARE @itemNameId bigint 

--education

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'education')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('education', 'education', 'education', NULL, 'itemCode', 'itemName')
END
   
    SET @itemNameId = (SELECT itemTypeId FROM core.itemType WHERE [name] = 'education')

DELETE FROM @itemNameTranslationTT

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'primary education', 'primary education'),
    (null, 'secondary education', 'secondary education'),
    (null, 'secondary special education', 'secondary special education'),
    (null, 'bachelor', 'bachelor'),
    (null, 'master', 'master')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'education', @meta = @meta

INSERT INTO customer.education (itemNameId)
SELECT i.itemNameId 
FROM core.itemName i
LEFT JOIN customer.education e ON e.itemNameId = i.itemNameId
WHERE i.itemTypeId = @itemNameId
AND e.itemNameId IS NULL 


--employment
IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'employment')

BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description])
    VALUES('employment', 'employment', 'employment')
END

    SET @itemNameId = (SELECT itemTypeId FROM core.itemType WHERE [name] = 'employment')

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES 
(null, 'unclerical contract', 'unclerical contract')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'employment', @meta = @meta

INSERT INTO customer.employment (itemNameId)
SELECT i.itemNameId 
FROM core.itemName i
LEFT JOIN customer.employment e ON e.itemNameId = i.itemNameId
WHERE i.itemTypeId = @itemNameId
AND e.itemNameId IS NULL 

--employerCategory
IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'employerCategory')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description])
    VALUES('employerCategory', 'employerCategory', 'employerCategory')
END

    SET @itemNameId = (SELECT itemTypeId FROM core.itemType WHERE [name] = 'employerCategory')

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES 
('LLC', 'Limited Liability Company', 'Limited Liability Company')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'employerCategory', @meta = @meta

INSERT INTO customer.employerCategory (itemNameId)
SELECT i.itemNameId 
FROM core.itemName i
LEFT JOIN customer.employerCategory e ON e.itemNameId = i.itemNameId
WHERE i.itemTypeId = @itemNameId
AND e.itemNameId IS NULL 

--industry
IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'industry')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description])
    VALUES('industry', 'industry', 'industry')
END

    SET @itemNameId = (SELECT itemTypeId FROM core.itemType WHERE [name] = 'industry')
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES 
('IT', 'IT', 'IT')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'industry', @meta = @meta

INSERT INTO customer.industry (itemNameId)
SELECT i.itemNameId 
FROM core.itemName i
LEFT JOIN customer.industry e ON e.itemNameId = i.itemNameId
WHERE i.itemTypeId = @itemNameId
AND e.itemNameId IS NULL 

--income range
IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'incomeRange')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description])
    VALUES('incomeRange', 'incomeRange', 'incomeRange')
END

    SET @itemNameId = (SELECT itemTypeId FROM core.itemType WHERE [name] = 'incomeRange')

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES 
(NULL , '100 - 200', '100 - 200'),
(NULL , '200 - 500', '200 - 500'),
(NULL , '500 - 1000', '500 - 1000')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'incomeRange', @meta = @meta


INSERT INTO customer.incomeRange (itemNameId)
SELECT i.itemNameId 
FROM core.itemName i
LEFT JOIN customer.incomeRange e ON e.itemNameId = i.itemNameId
WHERE i.itemTypeId = @itemNameId
AND e.itemNameId IS NULL 


--Maritial Status
IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'maritalStatus')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description])
    VALUES('maritalStatus', 'maritalStatus', 'maritalStatus')
END

    SET @itemNameId = (SELECT itemTypeId FROM core.itemType WHERE [name] = 'maritalStatus')

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES 
(NULL , 'Married', 'Married'),
(NULL , 'Single', 'Single'),
(NULL , 'Divorced', 'Divorced'),
(NULL , 'Widowed', 'Widowed')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'maritalStatus', @meta = @meta


INSERT INTO customer.maritalStatus (itemNameId, cbsName)
SELECT i.itemNameId, 'N/A' 
FROM core.itemName i
LEFT JOIN customer.maritalStatus e ON e.itemNameId = i.itemNameId
WHERE i.itemTypeId = @itemNameId
AND e.itemNameId IS NULL 

 