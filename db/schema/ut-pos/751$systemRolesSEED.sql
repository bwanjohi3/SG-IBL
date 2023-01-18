DECLARE @manageTransfer BIGINT

IF NOT EXISTS (SELECT * FROM [user].[role] WHERE name = 'POS - Manage transfers role')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @manageTransfer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@manageTransfer, 'POS - Manage transfers role', 'POS - Manage transfers role', 1, 0, NULL, 1)
END
ELSE
    SET @manageTransfer = (SELECT actorId FROM [user].[role] WHERE name = 'POS - Manage transfers role')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@manageTransfer, 'transfer.push.reverse', '%', 1),
        (@manageTransfer, 'transfer.push.create', '%', 1),
        (@manageTransfer, 'transfer.transfer.get', '%', 1),
        (@manageTransfer, 'transfer.report.byChannelId', '%', 1),
        (@manageTransfer, 'pos.terminal.edit', '%', 1)
        
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

--Manage Pos:
IF NOT EXISTS(SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'managePos')
BEGIN
    DECLARE @itemNameTranslationTT core.itemNameTranslationTT
    DECLARE @meta core.metaDataTT
    DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

    INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('managePos', 'Manage POSs', 'Manage POSs')

    EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
        @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta
END

DECLARE @posMangementId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'managePos')
DECLARE @roleViewPos BIGINT, @roleAddPos BIGINT, @roleEditPos BIGINT


--View poss
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View POS')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleViewPos = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleViewPos, 'View POS', 'View POS', 1, 0, @posMangementId, 1)     
END
ELSE
     SET @roleViewPos = (SELECT actorId FROM [user].[role] WHERE name = 'View POS')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          (@roleViewPos, 'pos.terminal.fetch', '%', 1),
          (@roleViewPos, 'pos.application.fetch', '%', 1),
          (@roleViewPos, 'db/pos.terminal.fetch', '%', 1),
          (@roleViewPos, 'db/pos.application.fetch', '%', 1),
          (@roleViewPos, 'core.itemCode.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleViewPos THEN
DELETE;

--Add pos
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add POS')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleAddPos = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleAddPos, 'Add POS', 'Add POS', 1, 0, @posMangementId, 1)     
END
ELSE
     SET @roleAddPos = (SELECT actorId FROM [user].[role] WHERE name = 'Add POS')

MERGE INTO [user].actorAction AS target
USING 
     (VALUES 
          (@roleAddPos, 'pos.terminal.fetch', '%', 1),
          (@roleAddPos, 'pos.terminal.add', '%', 1),
          (@roleAddPos, 'pos.application.fetch', '%', 1),
          (@roleAddPos, 'pos.application.add', '%', 1),
          (@roleAddPos, 'pos.application.get', '%', 1),
          (@roleAddPos, 'pos.binList.fetch', '%', 1),
          (@roleAddPos, 'pos.binList.add', '%', 1),
          (@roleAddPos, 'pos.binList.get', '%', 1),
          (@roleAddPos, 'pos.keyChain.list', '%', 1),   
          (@roleAddPos, 'pos.application.list', '%', 1),
          (@roleAddPos, 'pos.organization.list', '%', 1),
          (@roleAddPos, 'customer.organization.list', '%', 1),
          (@roleAddPos, 'db/pos.terminal.fetch', '%', 1),
          (@roleAddPos, 'db/pos.terminal.add', '%', 1),
          (@roleAddPos, 'db/pos.application.fetch', '%', 1),
          (@roleAddPos, 'db/pos.application.add', '%', 1),
          (@roleAddPos, 'db/pos.application.get', '%', 1),
          (@roleAddPos, 'db/pos.binList.fetch', '%', 1),
          (@roleAddPos, 'db/pos.binList.add', '%', 1),
          (@roleAddPos, 'db/pos.binList.get', '%', 1),
          (@roleAddPos, 'db/pos.keyChain.list', '%', 1), 
          (@roleAddPos, 'db/pos.application.list', '%', 1),
          (@roleAddPos, 'db/pos.organization.list', '%', 1),
          (@roleAddPos, 'db/customer.organization.list', '%', 1),        
          (@roleAddPos, 'core.itemCode.fetch', '%', 1),
          (@roleAddPos, 'core.currency.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleAddPos THEN
DELETE;

--Edit pos
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit POS')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleEditPos = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleEditPos, 'Edit POS', 'Edit POS', 1, 0, @posMangementId, 1)     
END
ELSE
     SET @roleEditPos = (SELECT actorId FROM [user].[role] WHERE name = 'Edit POS')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          (@roleEditPos, 'pos.terminal.fetch', '%', 1),
          (@roleEditPos, 'pos.terminal.get', '%', 1),           
          (@roleAddPos, 'pos.terminal.edit', '%', 1),
          (@roleAddPos, 'pos.application.fetch', '%', 1),
          (@roleAddPos, 'pos.application.edit', '%', 1),
          (@roleAddPos, 'pos.application.get', '%', 1), 
          (@roleAddPos, 'pos.keyChain.list', '%', 1),
          (@roleEditPos, 'pos.organization.list', '%', 1),
          (@roleEditPos, 'db/pos.terminal.fetch', '%', 1),
          (@roleEditPos, 'db/pos.terminal.get', '%', 1),          
          (@roleEditPos, 'db/pos.terminal.edit', '%', 1),
          (@roleAddPos, 'db/pos.application.fetch', '%', 1),
          (@roleAddPos, 'db/pos.application.edit', '%', 1),
          (@roleAddPos, 'db/pos.application.get', '%', 1), 
          (@roleEditPos, 'db/pos.organization.list', '%', 1),
          (@roleAddPos, 'db/pos.keyChain.list', '%', 1),
          (@roleEditPos, 'core.itemCode.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleEditPos THEN
DELETE;

