IF NOT EXISTS(SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'report')
BEGIN
    DECLARE @itemNameTranslationTT core.itemNameTranslationTT
    DECLARE @meta core.metaDataTT
    DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

    INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('report', 'Manage Reports', 'Manage Reports')
    INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('manageAtm', 'Manage ATMs', 'Manage ATMs')

    EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
        @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta
END

DECLARE @reportId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'report')
DECLARE @atmMangementId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'manageAtm')

DECLARE @reportAtmCash BIGINT
DECLARE @roleViewAtm BIGINT, @roleAddAtm BIGINT, @roleEditAtm BIGINT
DECLARE @roleViewAtmConfigFile BIGINT, @roleAddAtmConfigFile BIGINT
DECLARE @roleViewAtmProfile BIGINT, @roleAddAtmProfile BIGINT, @roleEditAtmProfile BIGINT, @roleDeleteAtmProfile BIGINT

--ATM Reports
-- Cash Position
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'ATM - Cash Position')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @reportAtmCash = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@reportAtmCash, 'ATM - Cash Position', 'ATM - Cash Position', 1, 0, @reportId, 1)     
END
ELSE
     SET @reportAtmCash = (SELECT actorId FROM [user].[role] WHERE name = 'ATM - Cash Position')
 
MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@reportAtmCash, 'report.report.nav', '%', 1),
          (@reportAtmCash, 'report.atm.nav', '%', 1),
          (@reportAtmCash, 'core.itemCode.fetch', '%', 1),
          (@reportAtmCash, 'db/atm.cashPosition', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);


--Manage atms:

--View atms
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View ATM')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleViewAtm = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleViewAtm, 'View ATM', 'View ATM', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleViewAtm = (SELECT actorId FROM [user].[role] WHERE name = 'View ATM')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          --(@roleViewAtm, 'atm.terminal.fetch', '%', 1),
          (@roleViewAtm, 'db/atm.terminal.fetch', '%', 1),
          (@roleViewAtm, 'core.itemCode.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleViewAtm THEN
DELETE;

--Add atms
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add ATM')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleAddAtm = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleAddAtm, 'Add ATM', 'Add ATM', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleAddAtm = (SELECT actorId FROM [user].[role] WHERE name = 'Add ATM')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          --(@roleAddAtm, 'atm.terminal.fetch', '%', 1),
          --(@roleAddAtm, 'atm.terminal.add', '%', 1),          
          (@roleAddAtm, 'db/atm.terminal.fetch', '%', 1),
          (@roleAddAtm, 'db/atm.terminal.add', '%', 1),
          (@roleAddAtm, 'db/atm.profile.list', '%', 1),           
          (@roleAddAtm, 'core.itemCode.fetch', '%', 1),
          (@roleAddAtm, 'core.currency.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleAddAtm THEN
DELETE;

--Edit atms
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit ATM')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleEditAtm = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleEditAtm, 'Edit ATM', 'Edit ATM', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleEditAtm = (SELECT actorId FROM [user].[role] WHERE name = 'Edit ATM')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          --(@roleEditAtm, 'atm.terminal.fetch', '%', 1),          
          --(@roleAddAtm, 'atm.terminal.edit', '%', 1),
          (@roleEditAtm, 'db/atm.terminal.fetch', '%', 1),          
          (@roleEditAtm, 'db/atm.terminal.edit', '%', 1),
          (@roleEditAtm, 'db/atm.profile.list', '%', 1),
          (@roleEditAtm, 'db/atm.organization.list', '%', 1),
          (@roleEditAtm, 'core.itemCode.fetch', '%', 1),
          (@roleEditAtm, 'core.currency.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleEditAtm THEN
DELETE;

--View atm configuration files
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View ATM Configuration Files')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleViewAtmConfigFile = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleViewAtmConfigFile, 'View ATM Configuration Files', 'View ATM Configuration Files', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleViewAtmConfigFile = (SELECT actorId FROM [user].[role] WHERE name = 'View ATM Configuration Files')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleViewAtmConfigFile, 'db/atm.configurationFile.fetch', '%', 1),
          (@roleViewAtmConfigFile, 'db/atm.configurationFileType.list', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleViewAtmConfigFile THEN
DELETE;

--Add atm configuration files
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add ATM Configuration Files')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleAddAtmConfigFile = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleAddAtmConfigFile, 'Add ATM Configuration Files', 'Add ATM Configuration Files', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleAddAtmConfigFile = (SELECT actorId FROM [user].[role] WHERE name = 'Add ATM Configuration Files')

MERGE INTO [user].actorAction AS target
USING
     (VALUES  
          (@roleAddAtmConfigFile, 'db/atm.configurationFile.add', '%', 1),        
          (@roleAddAtmConfigFile, 'db/atm.configurationFile.fetch', '%', 1),
          (@roleAddAtmConfigFile, 'db/atm.configurationFileType.list', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleAddAtmConfigFile THEN
DELETE;

--View atm profiles
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View ATM Profiles')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleViewAtmProfile = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleViewAtmProfile, 'View ATM Profiles', 'View ATM Profiles', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleViewAtmProfile = (SELECT actorId FROM [user].[role] WHERE name = 'View ATM Profiles')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleViewAtmProfile, 'db/atm.profile.fetch', '%', 1),
          (@roleViewAtmProfile, 'db/atm.profile.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleViewAtmProfile THEN
DELETE;

--Add atm profiles
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add ATM Profiles')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleAddAtmProfile = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleAddAtmProfile, 'Add ATM Profiles', 'Add ATM Profiles', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleAddAtmProfile = (SELECT actorId FROM [user].[role] WHERE name = 'Add ATM Profiles')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleAddAtmProfile, 'db/atm.profile.fetch', '%', 1),
          (@roleAddAtmProfile, 'db/atm.profile.get', '%', 1),
          (@roleAddAtmProfile, 'db/atm.profile.add', '%', 1),
          (@roleAddAtmProfile, 'db/atm.configurationFile.list', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleAddAtmProfile THEN
DELETE;

--Edit atm profiles
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit ATM Profiles')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleEditAtmProfile = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleEditAtmProfile, 'Edit ATM Profiles', 'Edit ATM Profiles', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleEditAtmProfile = (SELECT actorId FROM [user].[role] WHERE name = 'Edit ATM Profiles')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleEditAtmProfile, 'db/atm.profile.fetch', '%', 1),
          (@roleEditAtmProfile, 'db/atm.profile.get', '%', 1),
          (@roleEditAtmProfile, 'db/atm.profile.edit', '%', 1),
          (@roleEditAtmProfile, 'db/atm.configurationFile.list', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleEditAtmProfile THEN
DELETE;

--Delete atm profiles
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete ATM Profiles')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleDeleteAtmProfile = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleDeleteAtmProfile, 'Delete ATM Profiles', 'Delete ATM Profiles', 1, 0, @atmMangementId, 1)     
END
ELSE
     SET @roleDeleteAtmProfile = (SELECT actorId FROM [user].[role] WHERE name = 'Delete ATM Profiles')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleDeleteAtmProfile, 'db/atm.profile.fetch', '%', 1),
          (@roleDeleteAtmProfile, 'db/atm.profile.get', '%', 1),
          (@roleDeleteAtmProfile, 'db/atm.profile.delete', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleDeleteAtmProfile THEN
DELETE;

---Update unnecessary permissions
update [core].[itemName] set isEnabled=0 
 where itemname in ('Manage KYC Levels','Manage Documents','Manage Networks','Manage AML','Manage Accounts','Manage Transactions',
 'Manage Customers','Manage Referrals','Manage Bulk Transactions')

