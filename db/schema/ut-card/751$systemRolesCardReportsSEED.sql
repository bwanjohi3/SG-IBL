IF NOT EXISTS(SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'report')
BEGIN
    DECLARE @itemNameTranslationTT core.itemNameTranslationTT
    DECLARE @meta core.metaDataTT
    DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

    INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('report', 'Manage Reports', 'Manage Reports')

    EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
        @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta
END

DECLARE @reportId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'report')
DECLARE @reportCardList BIGINT

--Card reports
--List of Cards
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Cards - List of Cards')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @reportCardList = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@reportCardList, 'Cards - List of Cards', 'Cards - List of Cards', 1, 0, @reportId, 1)     
END
ELSE
     SET @reportCardList = (SELECT actorId FROM [user].[role] WHERE name = 'Cards - List of Cards')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@reportCardList, 'report.report.nav', '%', 1),
          (@reportCardList, 'report.card.nav', '%', 1),
          (@reportCardList, 'card.report.listOfCards', '%', 1),
          (@reportCardList, 'card.status.list', '%', 1),
          (@reportCardList, 'customer.organization.list', '%', 1),
          (@reportCardList, 'card.product.list', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
