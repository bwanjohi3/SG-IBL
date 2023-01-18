MERGE INTO [user].[actionCategory] AS target
USING   
    (VALUES        
        ('atm', NULL, NULL, NULL)
    ) AS source (name, [table], keyColumn, displayColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, [table], keyColumn, displayColumn)
VALUES (name, [table], keyColumn, displayColumn);

DECLARE @atmActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='atm')

-- atm reports permissions
MERGE INTO [user].[action] AS target
USING
    (VALUES         
         ('report.atm.nav', @atmActionCategoryId, 'View ATM Reports submenu', '{}'),
         ('db/atm.cashPosition', @atmActionCategoryId, 'Cash Position', '{}'),
         ---
         ('atm.terminal.add', @atmActionCategoryId, 'atm.terminal.add', N'{}'),
         ('atm.terminal.edit', @atmActionCategoryId, 'atm.terminal.edit', N'{}'),
         ('atm.terminal.fetch', @atmActionCategoryId, 'atm.terminal.fetch', N'{}'),
         ('db/atm.terminal.add', @atmActionCategoryId, 'db/atm.terminal.add', N'{}'),
         ('db/atm.terminal.edit', @atmActionCategoryId, 'db/atm.terminal.edit', N'{}'),
         ('db/atm.organization.list', @atmActionCategoryId, 'db/atm.organization.list', N'{}'),
         ('db/atm.terminal.fetch', @atmActionCategoryId, 'db/atm.terminal.fetch', N'{}'),
         ---
         ('db/atm.configurationFile.add', @atmActionCategoryId, 'db/atm.configurationFile.add', N'{}'),
         ('db/atm.configurationFile.list', @atmActionCategoryId, 'db/atm.configurationFile.list', N'{}'),        
         ('db/atm.configurationFile.fetch', @atmActionCategoryId, 'db/atm.configurationFile.fetch', N'{}'),
         ('db/atm.configurationFile.download', @atmActionCategoryId, 'db/atm.configurationFile.download', N'{}'),           
         ('db/atm.configurationFileType.list', @atmActionCategoryId, 'db/atm.configurationFileType.list', N'{}'),
         ---
         ('db/atm.profile.add', @atmActionCategoryId, 'db/atm.profile.add', N'{}'),
         ('db/atm.profile.get', @atmActionCategoryId, 'db/atm.profile.get', N'{}'),
         ('db/atm.profile.list', @atmActionCategoryId, 'db/atm.profile.list', N'{}'),
         ('db/atm.profile.edit', @atmActionCategoryId, 'db/atm.profile.edit', N'{}'),
         ('db/atm.profile.fetch', @atmActionCategoryId, 'db/atm.profile.fetch', N'{}'),
         ('db/atm.profile.delete', @atmActionCategoryId, 'db/atm.profile.delete', N'{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);