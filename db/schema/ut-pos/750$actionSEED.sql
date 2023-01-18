MERGE INTO [user].[actionCategory] AS target
USING   
    (VALUES        
        ('pos', NULL, NULL, NULL)
    ) AS source (name, [table], keyColumn, displayColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, [table], keyColumn, displayColumn)
VALUES (name, [table], keyColumn, displayColumn);

DECLARE @posActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='pos')

-- pos reports permissions
MERGE INTO [user].[action] AS target
USING
    (VALUES         
         ---
         ('pos.terminal.add', @posActionCategoryId, 'pos.terminal.add', N'{}'),
         ('pos.terminal.edit', @posActionCategoryId, 'pos.terminal.edit', N'{}'),
         ('pos.terminal.fetch', @posActionCategoryId, 'pos.terminal.fetch', N'{}'),
         ('pos.terminal.get', @posActionCategoryId, 'pos.terminal.get', N'{}'),
         ('pos.organization.list', @posActionCategoryId, 'pos.organization.list', N'{}'),
         ('customer.organization.list', @posActionCategoryId, 'customer.organization.list', N'{}'),
         ('pos.keyChain.list', @posActionCategoryId, 'pos.keyChain.list', N'{}'),
         ('pos.application.list', @posActionCategoryId, 'pos.application.list', N'{}'),
         ('pos.application.fetch', @posActionCategoryId, 'pos.application.fetch', N'{}'),
         ('pos.application.add', @posActionCategoryId, 'pos.application.add', N'{}'),
         ('pos.application.edit', @posActionCategoryId, 'pos.application.edit', N'{}'),
         ('pos.application.get', @posActionCategoryId, 'pos.application.get', N'{}'),
         ('pos.binList.fetch', @posActionCategoryId, 'pos.binList.fetch', N'{}'),
         ('pos.binList.add', @posActionCategoryId, 'pos.binList.add', N'{}'),
         ('pos.binList.edit', @posActionCategoryId, 'pos.binList.edit', N'{}'),
         ('pos.binList.get', @posActionCategoryId, 'pos.binList.get', N'{}'),
         ('db/pos.terminal.add', @posActionCategoryId, 'db/pos.terminal.add', N'{}'),
         ('db/pos.terminal.edit', @posActionCategoryId, 'db/pos.terminal.edit', N'{}'),
         ('db/pos.organization.list', @posActionCategoryId, 'db/pos.organization.list', N'{}'),
         ('db/pos.terminal.fetch', @posActionCategoryId, 'db/pos.terminal.fetch', N'{}'),
          ('db/pos.terminal.get', @posActionCategoryId, 'db/pos.terminal.get', N'{}'),
         ('db/pos.keyChain.list', @posActionCategoryId, 'db/pos.keyChain.list', N'{}'),
         ('db/customer.organization.list', @posActionCategoryId, 'db/customer.organization.list', N'{}'),
         ('db/pos.application.list', @posActionCategoryId, 'db/pos.application.list', N'{}'),
         ('db/pos.application.fetch', @posActionCategoryId, 'db/pos.application.fetch', N'{}'),
         ('db/pos.application.add', @posActionCategoryId, 'db/pos.application.add', N'{}'),
         ('db/pos.application.edit', @posActionCategoryId, 'db/pos.application.edit', N'{}'),
         ('db/pos.application.get', @posActionCategoryId, 'db/pos.application.get', N'{}'),
         ('db/pos.binList.fetch', @posActionCategoryId, 'db/pos.binList.fetch', N'{}'),
         ('db/pos.binList.add', @posActionCategoryId, 'db/pos.binList.add', N'{}'),
         ('db/pos.binList.edit', @posActionCategoryId, 'db/pos.binList.edit', N'{}'),
         ('db/pos.binList.get', @posActionCategoryId, 'db/pos.binList.get', N'{}')

    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);
