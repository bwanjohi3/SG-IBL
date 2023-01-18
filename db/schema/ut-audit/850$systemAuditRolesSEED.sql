DECLARE @auditManagement BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'auditManagement')

IF(@auditManagement IS NULL)
BEGIN
    DECLARE @itemNameTranslationTT core.itemNameTranslationTT
    DECLARE @meta core.metaDataTT
    DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');
    INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('auditManagement', 'Manage Audit', 'Manage Audit')

    EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
        @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta
    SET @auditManagement = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'auditManagement')
END


DECLARE @permissionId BIGINT

-- View/Edit Audit Log  Configuration
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View/Edit Audit Log  Configuration')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'View/Edit Audit Log  Configuration', 'View/Edit Audit Log  Configuration', 1, 0, @auditManagement, 1)
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'View/Edit Audit Log  Configuration')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
        (@permissionId, 'externalAudit.action.edit', '%', 1),
        (@permissionId, 'externalAudit.action.fetch', '%', 1),
        (@permissionId, 'externalAudit.action.categoryFetch', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- View Audit Log Report
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Audit Log Report')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'View Audit Log Report', 'View Audit Log Report', 1, 0, @auditManagement, 1)
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'View Audit Log Report')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
        (@permissionId, 'externalAudit.audit.fetch', '%', 1),
        (@permissionId, 'externalAudit.audit.fetchForExport', '%', 1),
        (@permissionId, 'externalAudit.audit.get', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);