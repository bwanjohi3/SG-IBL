DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('report', 'Manage Reports', 'Manage Reports')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta


--Reports

DECLARE @reportId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'report')

DECLARE @reportActivity BIGINT

-- List reports
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Mirrors - List Reports')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportActivity = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportActivity, 'Mirrors - List Reports', 'Mirrors - List Reports', 1, 0, @reportId, 1)    
END
ELSE
    SET @reportActivity = (SELECT actorId FROM [user].[role] WHERE name = 'Mirrors - List Reports')

MERGE INTO [user].actorAction AS target
USING
    (VALUES        
        (@reportActivity, 'report.report.nav', '%', 1),
        (@reportActivity, 'mirrors.getReport', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- All loans report
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Mirrors - All Loans Report')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportActivity = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportActivity, 'Mirrors - All Loans Report', 'Mirrors - All Loans Report', 1, 0, @reportId, 1)    
END
ELSE
    SET @reportActivity = (SELECT actorId FROM [user].[role] WHERE name = 'Mirrors - All Loans Report')

MERGE INTO [user].actorAction AS target
USING
    (VALUES        
        (@reportActivity, 'report.report.nav', '%', 1),
        (@reportActivity, 'mirrors.report.allloans', '%', 1),
        (@reportActivity, 'mirrors.getReport', '%', 1),
        (@reportActivity, 'mirrors.viewReport', '%', 1),
        (@reportActivity, 'user.organization.fetchVisible', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- Customer exchanges report

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Mirrors - Customer Exchange Rates Report')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportActivity = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportActivity, 'Mirrors - Customer Exchange Rates Report', 'Mirrors - Customer Exchange Rates Report', 1, 0, @reportId, 1)    
END
ELSE
    SET @reportActivity = (SELECT actorId FROM [user].[role] WHERE name = 'Mirrors - Customer Exchange Rates Report')

MERGE INTO [user].actorAction AS target
USING
    (VALUES        
        (@reportActivity, 'report.report.nav', '%', 1),
        (@reportActivity, 'mirrors.report.customerexchangerates', '%', 1),
        (@reportActivity, 'mirrors.getReport', '%', 1),
        (@reportActivity, 'mirrors.viewReport', '%', 1),
        (@reportActivity, 'user.organization.fetchVisible', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
