IF NOT EXISTS(SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'aml')
BEGIN
    DECLARE @itemNameTranslationTT core.itemNameTranslationTT
    DECLARE @meta core.metaDataTT
    DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

    INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('aml', 'Manage AML', 'Manage AML')

    EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
        @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta
END

DECLARE @amlId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'aml')

DECLARE @roleListRole BIGINT

-- AML -> Manage Notifiations
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'AML Manage Notification')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleListRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@roleListRole, 'AML Manage Notification', 'AML Manage Notification', 1, 0, @amlId, 1)
END
ELSE
    SET @roleListRole = (SELECT actorId FROM [user].[role] WHERE name = 'AML Manage Notification')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@roleListRole, N'aml.list.home', '%', 1),
        (@roleListRole, N'aml.notification.fetch', '%', 1),
        (@roleListRole, N'aml.notification.changeStatus', '%', 1),
        (@roleListRole, N'aml.notification.get', '%', 1),
        (@roleListRole, N'aml.notification.edit', '%', 1),
        (@roleListRole, N'aml.notification.delete', '%', 1),
        (@roleListRole, N'aml.notification.userSearch', '%', 1),
        (@roleListRole, N'aml.notification.roleSearch', '%', 1),
        (@roleListRole, N'aml.notification.user.search', '%', 1),
        (@roleListRole, N'aml.notification.role.search', '%', 1),
        (@roleListRole, N'customer.organization.graphFetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- AML -> Manage Monitoring
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'AML Manage Monitoring')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleListRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@roleListRole, 'AML Manage Monitoring', 'AML Manage Monitoring', 1, 0, @amlId, 1)
END
ELSE
    SET @roleListRole = (SELECT actorId FROM [user].[role] WHERE name = 'AML Manage Monitoring')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@roleListRole, N'aml.list.home', '%', 1),
        (@roleListRole, N'aml.monitoring.fetch', '%', 1),
        (@roleListRole, N'aml.monitoring.start', '%', 1),
        (@roleListRole, N'aml.monitoring.stop', '%', 1),
        (@roleListRole, N'aml.monitoring.scheduler.fetch', '%', 1),
        (@roleListRole, N'aml.monitoring.scheduler.add', '%', 1),
        (@roleListRole, N'aml.monitoring.scheduler.setting.fetch', '%', 1),
        (@roleListRole, N'aml.monitoringSchedulerAdd', '%', 1),
        (@roleListRole, N'aml.monitoringSchedulerFetch', '%', 1),
        (@roleListRole, N'aml.monitoringSchedulerSettingFetch', '%', 1),
        (@roleListRole, N'aml.monitoringWhatcher', '%', 1),
        (@roleListRole, N'aml.timeUnit.get', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- AML -> Manage List and Imports
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'AML Manage List and Imports')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleListRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@roleListRole, 'AML Manage List and Imports', 'AML Manage List and Imports', 1, 0, @amlId, 1)
END
ELSE
    SET @roleListRole = (SELECT actorId FROM [user].[role] WHERE name = 'AML Manage List and Imports')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@roleListRole, N'aml.list.home', '%', 1),
        (@roleListRole, N'aml.import.fetch', '%', 1),
        (@roleListRole, N'aml.import.stop', '%', 1),
        (@roleListRole, N'aml.import.start', '%', 1),
        (@roleListRole, N'aml.setupList.edit', '%', 1),
        (@roleListRole, N'aml.setupList.add', '%', 1),
        (@roleListRole, N'aml.setupList.get', '%', 1),
        (@roleListRole, N'aml.setupList.fetch', '%', 1),
        (@roleListRole, N'aml.setupList.delete', '%', 1),
        (@roleListRole, N'aml.setupList.changeStatus', '%', 1),
        (@roleListRole, N'aml.import.update', '%', 1),
        (@roleListRole, N'aml.setting.timeUnit.fetch', '%', 1),
        (@roleListRole, N'aml.setting.country.fetch', '%', 1),
        (@roleListRole, N'aml.country.fetch', '%', 1),
        (@roleListRole, N'aml.import.edit', '%', 1),
        (@roleListRole, N'aml.importError.add', '%', 1),
        (@roleListRole, N'aml.importWhatcher', '%', 1),
        (@roleListRole, N'aml.timeUnit.get', '%', 1),
        (@roleListRole, N'aml.setupList.addFile', '%', 1),
        (@roleListRole, N'aml.rawDataTmp.delete', '%', 1),
        (@roleListRole, N'customer.organization.graphFetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- AML -> Conflicts Manage
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'AML Manage Conflicts')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleListRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@roleListRole, 'AML Manage Conflicts', 'AML Manage Conflicts', 1, 0, @amlId, 1)
END
ELSE
    SET @roleListRole = (SELECT actorId FROM [user].[role] WHERE name = 'AML Manage Conflicts')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@roleListRole, N'aml.list.home', '%', 1),
        (@roleListRole, N'aml.conflicts.management.fetch', '%', 1),
        (@roleListRole, N'aml.conflicts.management.get', '%', 1),
        (@roleListRole, N'aml.setting.timeUnit.fetch', '%', 1),
        (@roleListRole, N'aml.setting.country.fetch', '%', 1),
        (@roleListRole, N'aml.settingConflicts.fetch', '%', 1),
        (@roleListRole, N'aml.setting.conflicts.fetch', '%', 1),
        (@roleListRole, N'aml.conflicts.management.exportCSV', '%', 1),
        (@roleListRole, N'aml.conflicts.management.changeStatus', '%', 1),
        (@roleListRole, N'aml.conflicts.management.discard', '%', 1),
        (@roleListRole, N'aml.changeConflictStatus', '%', 1),
        (@roleListRole, N'aml.country.fetch', '%', 1),
        (@roleListRole, N'aml.discardConflict', '%', 1),
        (@roleListRole, N'aml.rawDataConflict.fetch', '%', 1),
        (@roleListRole, N'aml.timeUnit.get', '%', 1),
        (@roleListRole, N'customer.organization.graphFetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- AML -> Manage Alerts
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'AML Manage Alerts')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleListRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@roleListRole, 'AML Manage Alerts', 'AML Manage Alerts', 1, 0, @amlId, 1)
END
ELSE
    SET @roleListRole = (SELECT actorId FROM [user].[role] WHERE name = 'AML Manage Alerts')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@roleListRole, N'aml.list.home', '%', 1),
        (@roleListRole, N'aml.monitoring.results.fetch', '%', 1),
        (@roleListRole, N'aml.monitoring.results.get', '%', 1),
        (@roleListRole, N'aml.setting.timeUnit.fetch', '%', 1),
        (@roleListRole, N'aml.setting.country.fetch', '%', 1),
        (@roleListRole, N'aml.monitoring.results.matches.fetch', '%', 1),
        (@roleListRole, N'aml.monitoring.results.exportCSV', '%', 1),
        (@roleListRole, N'aml.monitoring.results.changeStatus', '%', 1),
        (@roleListRole, N'aml.monitoring.results.setting.fetch', '%', 1),
        (@roleListRole, N'aml.monitoring.results.matches.history.fetch', '%', 1),
        (@roleListRole, N'aml.changeMatchStatus', '%', 1),
        (@roleListRole, N'aml.country.fetch', '%', 1),
        (@roleListRole, N'aml.rawDataCustomerMatch.fetch', '%', 1),
        (@roleListRole, N'aml.rawDataCustomerMatchByCustomer.fetch', '%', 1),
        (@roleListRole, N'aml.rawDataCustomerMatchHistory.fetch', '%', 1),
        (@roleListRole, N'aml.timeUnit.get', '%', 1),
        (@roleListRole, N'customer.organization.graphFetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- AML -> Manual Search
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'AML Manage Manual Search')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleListRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@roleListRole, 'AML Manage Manual Search', 'AML Manage Manual Search', 1, 0, @amlId, 1)
END
ELSE
    SET @roleListRole = (SELECT actorId FROM [user].[role] WHERE name = 'AML Manage Manual Search')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@roleListRole, N'aml.list.home', '%', 1),
        (@roleListRole, N'aml.manualSearch.get', '%', 1),
        (@roleListRole, N'aml.manualSearch.fetch', '%', 1),
        (@roleListRole, N'aml.manualSearch.exportCSV', '%', 1),
        (@roleListRole, N'aml.setting.country.fetch', '%', 1),
        (@roleListRole, N'aml.country.fetch', '%', 1),
        (@roleListRole, N'customer.organization.graphFetch', '%', 1),
        (@roleListRole, N'aml.standartSearch', '%', 1),
        (@roleListRole, N'aml.monitoringSearch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- AML -> Use API
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'AML API')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleListRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@roleListRole, 'AML API', 'AML API', 1, 0, @amlId, 1)
END
ELSE
    SET @roleListRole = (SELECT actorId FROM [user].[role] WHERE name = 'AML API')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@roleListRole, N'aml.api.customerPreRegistrationCheck', '%', 1),
        (@roleListRole, N'aml.monitoringSearchPreRegistration', '%', 1),
        (@roleListRole, N'aml.api.customerPostRegistrationCheck', '%', 1),
        (@roleListRole, N'aml.monitoringSearchPostRegistration', '%', 1),
        (@roleListRole, N'aml.standartSearch', '%', 1),
        (@roleListRole, N'aml.monitoringSearch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
