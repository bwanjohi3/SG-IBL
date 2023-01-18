DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('network', 'Manage Networks', 'Manage Networks')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta

DECLARE @networkId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'network')

DECLARE @networkList BIGINT, @networkAdd BIGINT, @networkEdit BIGINT, @networkLock BIGINT, @networkView BIGINT, @networkApprove BIGINT, @networkDelete BIGINT

--Manage netowrks:
--List networks
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Networks')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @networkList = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@networkList, 'List Networks', 'List Networks', 1, 0, @networkId, 1)     
END
ELSE
     SET @networkList = (SELECT actorId FROM [user].[role] WHERE name = 'List Networks')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@networkList, 'customer.organization.nav', '%', 1),
          (@networkList, 'agent.network.nav', '%', 1),
          (@networkList, 'agent.network.fetch', '%', 1),
          (@networkList, 'customer.organization.graphFetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--View Network
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Network')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @networkView = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@networkView, 'View Network', 'View Network', 1, 0, @networkId, 1)     
END
ELSE
     SET @networkView = (SELECT actorId FROM [user].[role] WHERE name = 'View Network')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@networkView, 'customer.organization.nav', '%', 1),
          (@networkView, 'agent.network.nav', '%', 1),
          (@networkView, 'agent.network.fetch', '%', 1),
          (@networkView, 'customer.organization.graphFetch', '%', 1),
          (@networkView, 'customer.organization.getBUsParents', '%', 1),
          (@networkView, 'agent.network.get', '%', 1),
          (@networkView, 'agent.networkType.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Add Network
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add Network')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @networkAdd = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@networkAdd, 'Add Network', 'Add Network', 1, 0, @networkId, 1)     
END
ELSE
     SET @networkAdd = (SELECT actorId FROM [user].[role] WHERE name = 'Add Network')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@networkAdd, 'customer.organization.nav', '%', 1),
          (@networkAdd, 'agent.network.nav', '%', 1),
          (@networkAdd, 'agent.network.fetch', '%', 1),
          (@networkAdd, 'customer.organization.graphFetch', '%', 1),
          (@networkAdd, 'customer.organization.getBUsParents', '%', 1),
          (@networkAdd, 'agent.network.get', '%', 1),
          (@networkAdd, 'agent.networkType.fetch', '%', 1),
          (@networkAdd, 'agent.network.add', '%', 1),
          (@networkAdd, 'agent.network.discard', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Edit Network
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit Network')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @networkEdit = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@networkEdit, 'Edit Network', 'Edit Network', 1, 0, @networkId, 1)     
END
ELSE
     SET @networkEdit = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Network')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@networkEdit, 'customer.organization.nav', '%', 1),
          (@networkEdit, 'agent.network.nav', '%', 1),
          (@networkEdit, 'agent.network.fetch', '%', 1),
          (@networkEdit, 'customer.organization.graphFetch', '%', 1),
          (@networkEdit, 'customer.organization.getBUsParents', '%', 1),
          (@networkEdit, 'agent.network.get', '%', 1),
          (@networkEdit, 'agent.networkType.fetch', '%', 1),
          (@networkEdit, 'agent.network.edit', '%', 1),
          (@networkEdit, 'agent.network.discard', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Delete Network
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete Network')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @networkDelete = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@networkDelete, 'Delete Network', 'Delete Network', 1, 0, @networkId, 1)     
END
ELSE
     SET @networkDelete = (SELECT actorId FROM [user].[role] WHERE name = 'Delete Network')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@networkDelete, 'customer.organization.nav', '%', 1),
          (@networkDelete, 'agent.network.nav', '%', 1),
          (@networkDelete, 'agent.network.fetch', '%', 1),
          (@networkDelete, 'customer.organization.graphFetch', '%', 1),
          (@networkDelete, 'customer.organization.getBUsParents', '%', 1),
          (@networkDelete, 'agent.network.get', '%', 1),
          (@networkDelete, 'agent.networkType.fetch', '%', 1),
          (@networkDelete, 'customer.organization.delete', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Lock / unlock Network
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Lock / Unlock Network')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @networkLock = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@networkLock, 'Lock / Unlock Network', 'Lock / Unlock Network', 1, 0, @networkId, 1)     
END
ELSE
     SET @networkLock = (SELECT actorId FROM [user].[role] WHERE name = 'Lock / Unlock Network')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@networkLock, 'customer.organization.nav', '%', 1),
          (@networkLock, 'agent.network.nav', '%', 1),
          (@networkLock, 'agent.network.fetch', '%', 1),
          (@networkLock, 'customer.organization.graphFetch', '%', 1),
          (@networkLock, 'customer.organization.getBUsParents', '%', 1),
          (@networkLock, 'agent.network.get', '%', 1),
          (@networkLock, 'agent.networkType.fetch', '%', 1),
          (@networkLock, 'customer.organization.lock', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Authorize changes (Approve/Reject)
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Authorize Network Changes (Approve/Reject)')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @networkApprove = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@networkApprove, 'Authorize Network Changes (Approve/Reject)', 'Authorize Network Changes (Approve/Reject)', 1, 0, @networkId, 1)     
END
ELSE
     SET @networkApprove = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Network Changes (Approve/Reject)')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@networkApprove, 'customer.organization.nav', '%', 1),
          (@networkApprove, 'agent.network.nav', '%', 1),
          (@networkApprove, 'agent.network.fetch', '%', 1),
          (@networkApprove, 'customer.organization.graphFetch', '%', 1),
          (@networkApprove, 'customer.organization.getBUsParents', '%', 1),
          (@networkApprove, 'agent.network.get', '%', 1),
          (@networkApprove, 'agent.networkType.fetch', '%', 1),
          (@networkApprove, 'agent.network.approve', '%', 1),
          (@networkApprove, 'agent.network.reject', '%', 1),
          (@networkApprove, 'agent.network.addApproved', '%', 1),
          (@networkApprove, 'agent.network.editApproved', '%', 1),
          (@networkApprove, 'customer.organizationHierarchyFlat.rebuild', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
