DECLARE @cardStatuses AS TABLE (itemTypeName NVARCHAR(50), itemName NVARCHAR(50), itemNameTranslation NVARCHAR(50))

INSERT INTO @cardStatuses 
    VALUES
        (N'cardStatus', N'New', N'New'),
        (N'cardStatus', N'Approved', N'Approved'),
        (N'cardStatus', N'Rejected', N'Rejected'),
        (N'cardStatus', N'Declined', N'Declined'),
        (N'cardStatus', N'Completed', N'Completed'),
        (N'cardStatus', N'Production', N'Production'),
        (N'cardStatus', N'Accepted', N'Accepted'),
        (N'cardStatus', N'PermanentBlocked', N'Permanent Blocked'),
        (N'cardStatus', N'PendingActivation', N'Pending Activation'),
        (N'cardStatus', N'Active', N'Active'),
        (N'cardStatus', N'PendingDestruction', N'Pending Destruction'),
        (N'cardStatus', N'Destructed', N'Destructed'),
        (N'cardStatus', N'HOT', N'HOT'),
        (N'cardStatus', N'Inactive', N'Inactive'),
        (N'cardStatus', N'PendingDeactivation', N'Pending Deactivation'),
        (N'cardStatus', N'RejectedAllocation', N'Rejected Allocation'),
        (N'cardStatus', N'PendingAllocation', N'Pending Allocation'),
        (N'cardStatus', N'Sent', N'Sent'),
        (N'cardStatus', N'RejectedAcceptance', N'Rejected Acceptance'),
        (N'cardStatus', N'PendingAcceptance', N'Pending Acceptance'),
        (N'cardStatus', N'Generated', N'Generated')

MERGE INTO [core].[itemType] AS target
USING(
    VALUES
        (N'cardStatus', N'cardStatus', N'cardStatus', N'card.status', N'statusId', N'statusName')
    ) AS source (alias, [name], [description], [table], keyColumn, nameColumn)
ON  target.[name] = source.[name]
WHEN MATCHED AND (   target.alias <> source.alias
                  OR target.[description] <> source.[description]
                  OR target.[table] <> source.[table]
                  OR target.keyColumn <> source.keyColumn
                  OR target.nameColumn <> source.nameColumn
                )
    THEN
		UPDATE SET target.alias = source.alias,
                     target.[description] = source.[description],
                     target.[table] = source.[table],
                     target.keyColumn = source.keyColumn,
                     target.nameColumn = source.nameColumn
WHEN NOT MATCHED BY TARGET THEN
INSERT (alias, [name], [description], [table], keyColumn, nameColumn)
VALUES (SOURCE.alias, SOURCE.[name], SOURCE.[description], SOURCE.[table], SOURCE.keyColumn, SOURCE.nameColumn)
-- the output can be commented in production
-- OUTPUT $action, DELETED.*, INSERTED.*
;

MERGE INTO [core].[itemName] AS target
USING(
        SELECT it.itemTypeId, cs.itemName
        FROM 
            @cardStatuses cs
        INNER JOIN 
            [core].[itemType] it ON it.[name] = cs.itemTypeName
    ) AS source (itemTypeId, itemName)
ON  target.itemName = source.itemName 
AND target.itemTypeId = source.itemTypeId 
WHEN NOT MATCHED BY TARGET THEN
INSERT (itemTypeId, itemName)
VALUES (source.itemTypeId, SOURCE.itemName)
-- the output can be commented in production
-- OUTPUT $action, DELETED.*, INSERTED.*
;

MERGE INTO [core].[itemTranslation] AS target
USING(
        SELECT l.languageId, i.itemNameId, cs.itemNameTranslation
        FROM 
            @cardStatuses cs
        INNER JOIN 
            [core].[itemType] it ON it.[name] = cs.itemTypeName
        INNER JOIN 
            [core].[itemName] i ON i.itemName = cs.itemName AND i.itemTypeId = it.itemTypeId
        INNER JOIN 
            [core].[language] l ON l.[name] = N'English'
    ) AS source (languageId, itemNameId, itemNameTranslation)
ON  target.languageId = SOURCE.languageId
AND target.itemNameId = SOURCE.itemNameId 
AND target.itemNameTranslation = SOURCE.itemNameTranslation 
WHEN NOT MATCHED BY TARGET THEN
INSERT (languageId, itemNameId, itemNameTranslation)
VALUES (SOURCE.[languageId], SOURCE.itemNameId, SOURCE.itemNameTranslation)
-- the output can be commented in production
-- OUTPUT $action, DELETED.*, INSERTED.*, source.*
;

MERGE INTO [card].[status] AS target
USING(
        SELECT i.itemNameId, cs.itemName
        FROM 
            @cardStatuses cs
        INNER JOIN 
            [core].[itemType] it ON it.[name] = cs.itemTypeName
        INNER JOIN 
            [core].[itemName] i ON i.itemName = cs.itemName AND i.itemTypeId = it.itemTypeId
    ) AS source (itemNameId, statusName)
ON  target.itemNameId = SOURCE.itemNameId 
AND target.statusName = SOURCE.statusName 
WHEN NOT MATCHED BY TARGET THEN
INSERT (itemNameId, statusName)
VALUES (SOURCE.itemNameId, SOURCE.statusName)
-- the output can be commented in production
-- OUTPUT $action, DELETED.*, INSERTED.*, source.*
;