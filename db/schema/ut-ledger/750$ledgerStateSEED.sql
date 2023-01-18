DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT


DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');
DECLARE @frLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'fr');
DECLARE @cnLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'cn');

DECLARE @itemNameId bigint 
DECLARE @parentItemNameId bigint

/*
--accountStatus

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'accountStatus')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('accountStatus', 'accountStatus', 'accountStatus', NULL, 'itemCode', 'itemName')
END
 

DELETE FROM @itemNameTranslationTT

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName ) 
VALUES  (null, 'New', 'New', NULL,NULL),
	   (null, 'Approved', 'Approved', NULL, NULL),
	   (null, 'Pending', 'Pending', NULL,NULL),
	   (null, 'Rejected', 'Rejected', NULL, NULL)

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
								@languageId = @enLanguageId, 
								@organizationId = NULL, 
								@itemType = 'accountStatus', 
								@meta = @meta

*/

 --Account State

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'accountState')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('accountState', 'accountState', 'accountState', 'ledger.state', 'itemNameId', 'itemName')
END
 

DELETE FROM @itemNameTranslationTT

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) 
VALUES  ('Active', 'Active', 'Active'),
	   ('Inactive', 'Inactive', 'Inactive'),
	   ('Dormant', 'Dormant', 'Dormant'),
	   ('Blocked', 'Blocked', 'Blocked'),
	   ('Closed', 'Closed', 'Closed')
	

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
								@languageId = @enLanguageId, 
								@organizationId = NULL, 
								@itemType = 'accountState', 
								@meta = @meta



UPDATE s 
SET isForCustomerAccount = 1 
FROM core.itemName i 
    JOIN ledger.state s ON i.itemNameId = s.itemNameId
    WHERE i.itemName IN ('Active', 'Blocked', 'Closed', 'Dormant', 'Inactive')
    AND isForCustomerAccount <> 1

UPDATE s 
SET isForInternalAccount = 1 
FROM core.itemName i 
    JOIN ledger.state s ON i.itemNameId = s.itemNameId
    WHERE i.itemName IN ('Active', 'Closed')
    AND isForInternalAccount <> 1
