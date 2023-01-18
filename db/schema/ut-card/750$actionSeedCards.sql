MERGE INTO [user].[actionCategory] AS target
USING   
    (VALUES
        ('card', 'card', 'cardId', 'name')
    ) AS source (name, [table], keyColumn, displayColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, [table], keyColumn, displayColumn)
VALUES (name, [table], keyColumn, displayColumn);

DECLARE @cardCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name ='card')

--webui and tabs access
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('report.card.nav', @cardCategoryId, 'View Card Reports submenu', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);