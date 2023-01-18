MERGE INTO [user].[actionCategory] AS target
USING
    (VALUES ('report', 'report', 'reportId', 'name')
    ) AS source (name, [table], keyColumn, displayColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, [table], keyColumn, displayColumn)
VALUES (name, [table], keyColumn, displayColumn);

DECLARE @reportActionCategroyId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='report')

--report
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('mirrors.getReport', @reportActionCategroyId, 'Get Report Details', '{}'),
        ('mirrors.viewReport', @reportActionCategroyId, 'View Report', '{}'),
		('mirrors.report.allloans', @reportActionCategroyId, 'All Loans Report', '{}'),
        ('mirrors.report.customerexchangerates', @reportActionCategroyId, 'Customer Exchange Rates Report', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);
