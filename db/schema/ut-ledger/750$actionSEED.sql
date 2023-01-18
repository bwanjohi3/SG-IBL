MERGE INTO [user].[actionCategory] AS target
USING   
    (VALUES       
        ('ledger', NULL, NULL, NULL)
    ) AS source (name, [table], keyColumn, displayColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, [table], keyColumn, displayColumn)
VALUES (name, [table], keyColumn, displayColumn);

DECLARE @ledgerActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='ledger')

--webui and tabs access
MERGE INTO [user].[action] AS target
USING
    (VALUES        
        ('ledger.ledger.nav', @ledgerActionCategoryId, 'View Products & Accounts tab', '{}'),
        ('ledger.account.nav', @ledgerActionCategoryId, 'View Accounts submenu', '{}'),
        ('ledger.product.nav', @ledgerActionCategoryId, 'View Products submenu', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);    

-- ledger
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('ledger.product.add', @ledgerActionCategoryId, 'Product add', '{}'),
        ('ledger.product.addApproved', @ledgerActionCategoryId, 'Product add approved', '{}'),
        ('ledger.product.discard', @ledgerActionCategoryId, 'Product discard', '{}'),
        ('ledger.product.approve', @ledgerActionCategoryId, 'Product approve', '{}'),
        ('ledger.product.edit', @ledgerActionCategoryId, 'Product edit', '{}'),
        ('ledger.product.editApproved', @ledgerActionCategoryId, 'Product edit approved', '{}'),
        ('ledger.product.fetch', @ledgerActionCategoryId, 'Product fetch', '{}'),
        ('ledger.product.lock', @ledgerActionCategoryId, 'Product lock', '{}'),
        ('ledger.product.reject', @ledgerActionCategoryId, 'Product reject', '{}'),
        ('ledger.productGroup.fetch', @ledgerActionCategoryId, 'Fetch product groups', '{}'),
        ('ledger.productPeriodicFee.fetch', @ledgerActionCategoryId, 'Fetch periodic fees', '{}'),
        ('ledger.productType.fetch', @ledgerActionCategoryId, 'Fetch product types', '{}'),
        ('ledger.product.uniqueNamesGet', @ledgerActionCategoryId, 'Get product unique names per branch', '{}'),
        ('ledger.product.list', @ledgerActionCategoryId, 'List product', '{}'),
        ('ledger.product.get', @ledgerActionCategoryId, 'Product get', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

-- ledger.account
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('ledger.account.add', @ledgerActionCategoryId, 'Account add', '{}'),
        ('ledger.account.addApproved', @ledgerActionCategoryId, 'Account addApproved', '{}'),
        ('ledger.account.addUnapproved', @ledgerActionCategoryId, 'Account add unapproved', '{}'),
        ('ledger.account.approve', @ledgerActionCategoryId, 'Account approve', '{}'),
        ('ledger.account.close', @ledgerActionCategoryId, 'Account close', '{}'),
        ('ledger.account.discard', @ledgerActionCategoryId, 'Account discard', '{}'),
        ('ledger.account.edit', @ledgerActionCategoryId, 'Account edit', '{}'),
        ('ledger.account.editApproved', @ledgerActionCategoryId, 'Account editApproved', '{}'),
        ('ledger.account.editUnapproved', @ledgerActionCategoryId, 'Account edit unapproved', '{}'),
        ('ledger.account.fetch', @ledgerActionCategoryId, 'Account fetch', '{}'),
        ('ledger.account.get', @ledgerActionCategoryId, 'Account get', '{}'),
        ('ledger.account.reject', @ledgerActionCategoryId, 'Account reject', '{}'),
        ('ledger.userAccount.get', @ledgerActionCategoryId, 'Get user account', '{}'),
        ('ledger.state.list', @ledgerActionCategoryId, 'List account states', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);
