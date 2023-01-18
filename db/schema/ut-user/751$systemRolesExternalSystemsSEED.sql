DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('externalSystem', 'Manage External Systems', 'Manage External Systems')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta

DECLARE @externalSystemId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'externalSystem')

DECLARE @roleAddES BIGINT, @roleViewES BIGINT, @roleDeleteES BIGINT, @roleEditES BIGINT, @roleActivateES BIGINT, @roleListES BIGINT

-- External Systems
--List External Systems
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List External Systems')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleListES = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleListES, 'List External Systems', 'List External Systems', 1, 0, @externalSystemId, 1)     
END
ELSE
     SET @roleListES = (SELECT actorId FROM [user].[role] WHERE name = 'List External Systems')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleListES, 'user.system.nav', '%', 1),
          (@roleListES, 'customer.organization.graphFetch', '%', 1),
          (@roleListES, 'core.externalSystem.fetch', '%', 1),
          (@roleListES, 'core.externalSystemType.list', '%', 1),          
          (@roleListES, 'user.externalSystem.fetch', '%', 1)         
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--View External Systems
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View External Systems')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleViewES = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleViewES, 'View External Systems', 'View External Systems', 1, 0, @externalSystemId, 1)     
END
ELSE
     SET @roleViewES = (SELECT actorId FROM [user].[role] WHERE name = 'View External Systems')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleViewES, 'user.system.nav', '%', 1),
          (@roleViewES, 'customer.organization.graphFetch', '%', 1),
          (@roleViewES, 'core.externalSystem.fetch', '%', 1),
          (@roleViewES, 'core.externalSystem.get', '%', 1),
          (@roleViewES, 'core.externalSystemType.list', '%', 1), 
          (@roleViewES, 'core.externalSystemAttributes.get', '%', 1),          
          (@roleViewES, 'user.externalUser.get', '%', 1),  
          (@roleViewES, 'user.externalSystem.fetch', '%', 1),
          (@roleViewES, 'user.externalSystem.get', '%', 1),
          (@roleViewES, 'customer.organization.getByDepth', '%', 1),
          (@roleViewES, 'customer.mno.fetch', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Add External Systems
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add External Systems')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleAddES = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleAddES, 'Add External Systems', 'Add External Systems', 1, 0, @externalSystemId, 1)     
END
ELSE
     SET @roleAddES = (SELECT actorId FROM [user].[role] WHERE name = 'Add External Systems')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleAddES, 'user.system.nav', '%', 1),
          (@roleAddES, 'customer.organization.graphFetch', '%', 1),
          (@roleAddES, 'core.externalSystem.fetch', '%', 1),
          (@roleAddES, 'core.externalSystem.get', '%', 1),
          (@roleAddES, 'core.externalSystemType.list', '%', 1), 
          (@roleAddES, 'core.externalSystemAttributes.get', '%', 1), 
          (@roleAddES, 'core.externalSystem.add', '%', 1),
          (@roleAddES, 'user.externalUser.get', '%', 1), 
          (@roleAddES, 'user.externalUser.add', '%', 1),
          (@roleAddES, 'user.externalSystem.fetch', '%', 1),
          (@roleAddES, 'user.externalSystem.add', '%', 1),
          (@roleAddES, 'user.externalSystem.get', '%', 1),
          (@roleAddES, 'customer.organization.getByDepth', '%', 1),
          (@roleAddES, 'customer.mno.fetch', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Edit External Systems
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit External Systems')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleEditES = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleEditES, 'Edit External Systems', 'Edit External Systems', 1, 0, @externalSystemId, 1)     
END
ELSE
     SET @roleEditES = (SELECT actorId FROM [user].[role] WHERE name = 'Edit External Systems')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleEditES, 'user.system.nav', '%', 1),
          (@roleEditES, 'customer.organization.graphFetch', '%', 1),
          (@roleEditES, 'core.externalSystem.fetch', '%', 1),
          (@roleEditES, 'core.externalSystem.get', '%', 1),
          (@roleEditES, 'core.externalSystemType.list', '%', 1), 
          (@roleEditES, 'core.externalSystemAttributes.get', '%', 1), 
          (@roleEditES, 'core.externalSystem.edit', '%', 1),
          (@roleEditES, 'user.externalUser.get', '%', 1), 
          (@roleEditES, 'user.externalUser.update', '%', 1),
          (@roleEditES, 'user.externalSystem.fetch', '%', 1),
          (@roleEditES, 'user.externalSystem.edit', '%', 1),
          (@roleEditES, 'user.externalSystem.get', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Delete External Systems
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete External Systems')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleDeleteES = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleDeleteES, 'Delete External Systems', 'Delete External Systems', 1, 0, @externalSystemId, 1)     
END
ELSE
     SET @roleDeleteES = (SELECT actorId FROM [user].[role] WHERE name = 'Delete External Systems')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleDeleteES, 'user.system.nav', '%', 1),
          (@roleDeleteES, 'customer.organization.graphFetch', '%', 1),
          (@roleDeleteES, 'core.externalSystem.fetch', '%', 1),
          (@roleDeleteES, 'core.externalSystem.get', '%', 1),
          (@roleDeleteES, 'core.externalSystemType.list', '%', 1), 
          (@roleDeleteES, 'core.externalSystemAttributes.get', '%', 1), 
          (@roleDeleteES, 'core.externalSystem.delete', '%', 1),          
          (@roleDeleteES, 'user.externalUser.get', '%', 1), 
          (@roleDeleteES, 'user.externalUser.delete', '%', 1),
          (@roleDeleteES, 'user.externalSystem.fetch', '%', 1),
          (@roleDeleteES, 'user.externalSystem.delete', '%', 1),
          (@roleDeleteES, 'user.externalSystem.get', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Activate External Systems
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Activate/Deactivate External Systems')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleActivateES = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleActivateES, 'Activate/Deactivate External Systems', 'Activate/Deactivate External Systems', 1, 0, @externalSystemId, 1)     
END
ELSE
     SET @roleActivateES = (SELECT actorId FROM [user].[role] WHERE name = 'Activate/Deactivate External Systems')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleActivateES, 'user.system.nav', '%', 1),
          (@roleActivateES, 'customer.organization.graphFetch', '%', 1),
          (@roleActivateES, 'core.externalSystem.fetch', '%', 1),
          (@roleActivateES, 'core.externalSystem.get', '%', 1),
          (@roleActivateES, 'core.externalSystemType.list', '%', 1), 
          (@roleActivateES, 'core.externalSystemAttributes.get', '%', 1), 
          (@roleActivateES, 'core.externalSystem.activateDeactivate', '%', 1),          
          (@roleActivateES, 'user.externalUser.get', '%', 1), 
          (@roleActivateES, 'user.externalUser.activateDeactivate', '%', 1),
          (@roleActivateES, 'user.externalSystem.fetch', '%', 1),
          (@roleActivateES, 'user.externalSystem.activateDeactivate', '%', 1),
          (@roleActivateES, 'user.externalSystem.get', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
