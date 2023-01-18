DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('externalUser', 'Manage Generic Users', 'Manage Generic Users')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta

DECLARE @externalUserId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'externalUser')

DECLARE @roleAddEU BIGINT, @roleViewEU BIGINT, @roleListEU BIGINT, @roleDeleteEU BIGINT, @roleEditEU BIGINT, @roleActivateEU BIGINT

--external User - Generic users create
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List External Users')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleListEU = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleListEU, 'List External Users', 'List External Users', 1, 0, @externalUserId, 1)     
END
ELSE
     SET @roleListEU = (SELECT actorId FROM [user].[role] WHERE name = 'List External Users')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleListEU, 'user.system.nav', '%', 1),
          (@roleListEU, 'user.externalUser.fetch', '%', 1),
          (@roleListEU, 'customer.organization.graphFetch', '%', 1),
          (@roleListEU, 'user.visibleExternalSystem.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View External User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleViewEU = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleViewEU, 'View External User', 'View External User', 1, 0, @externalUserId, 1)     
END
ELSE
     SET @roleViewEU = (SELECT actorId FROM [user].[role] WHERE name = 'View External User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleViewEU, 'user.system.nav', '%', 1),
          (@roleViewEU, 'user.externalUser.fetch', '%', 1),
          (@roleViewEU, 'customer.organization.graphFetch', '%', 1),
          (@roleViewEU, 'user.visibleExternalSystem.fetch', '%', 1),
          (@roleViewEU, 'user.externalUser.view', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add External User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleAddEU = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleAddEU, 'Add External User', 'Add External User', 1, 0, @externalUserId, 1)     
END
ELSE
     SET @roleAddEU = (SELECT actorId FROM [user].[role] WHERE name = 'Add External User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleAddEU, 'user.system.nav', '%', 1),
          (@roleAddEU, 'user.externalUser.fetch', '%', 1),
          (@roleAddEU, 'customer.organization.graphFetch', '%', 1),
          (@roleAddEU, 'user.visibleExternalSystem.fetch', '%', 1),
          (@roleAddEU, 'user.externalUser.view', '%', 1),
          (@roleAddEU, 'user.externalUser.add', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit External User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleEditEU = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleEditEU, 'Edit External User', 'Edit External User', 1, 0, @externalUserId, 1)     
END
ELSE
     SET @roleEditEU = (SELECT actorId FROM [user].[role] WHERE name = 'Edit External User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleEditEU, 'user.system.nav', '%', 1),
          (@roleEditEU, 'user.externalUser.fetch', '%', 1),
          (@roleEditEU, 'customer.organization.graphFetch', '%', 1),
          (@roleEditEU, 'user.visibleExternalSystem.fetch', '%', 1),
          (@roleEditEU, 'user.externalUser.view', '%', 1),
          (@roleEditEU, 'user.externalUser.update', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Activate/Deactivate External User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleActivateEU = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleActivateEU, 'Activate/Deactivate External User', 'Activate/Deactivate External User', 1, 0, @externalUserId, 1)     
END
ELSE
     SET @roleActivateEU = (SELECT actorId FROM [user].[role] WHERE name = 'Activate/Deactivate External User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@roleActivateEU, 'user.system.nav', '%', 1),
          (@roleActivateEU, 'user.externalUser.fetch', '%', 1),
          (@roleActivateEU, 'customer.organization.graphFetch', '%', 1),
          (@roleActivateEU, 'user.visibleExternalSystem.fetch', '%', 1),
          (@roleActivateEU, 'user.externalUser.view', '%', 1),
          (@roleActivateEU, 'user.externalUser.activateDeactivate', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source  AND target.actorId = @roleActivateEU THEN
DELETE;

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete External User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleDeleteEU = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleDeleteEU, 'Delete External User', 'Delete External User', 1, 0, @externalUserId, 1)     
END
ELSE
     SET @roleDeleteEU = (SELECT actorId FROM [user].[role] WHERE name = 'Delete External User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@roleDeleteEU, 'user.system.nav', '%', 1),
          (@roleDeleteEU, 'user.externalUser.fetch', '%', 1),
          (@roleDeleteEU, 'customer.organization.graphFetch', '%', 1),
          (@roleDeleteEU, 'user.visibleExternalSystem.fetch', '%', 1),
          (@roleDeleteEU, 'user.externalUser.view', '%', 1),
          (@roleDeleteEU, 'user.externalUser.delete', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
