DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('product', 'Manage Products', 'Manage Products')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('account', 'Manage Accounts', 'Manage Accounts')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta

DECLARE @productId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'product')
DECLARE @accountId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'account')

DECLARE @productList BIGINT, @productView BIGINT, @productAdd BIGINT, @productEdit BIGINT, @productApprove BIGINT, @productLock BIGINT
DECLARE @accountList BIGINT, @accountView BIGINT, @accountAdd BIGINT, @accountEdit BIGINT, @accountApprove BIGINT, @accountClose BIGINT

--Manage Products
--List Products
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Products')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @productList = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@productList, 'List Products', 'List Products', 1, 0, @productId, 1)     
END
ELSE
     SET @productList = (SELECT actorId FROM [user].[role] WHERE name = 'List Products')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@productList, 'ledger.ledger.nav', '%', 1),
          (@productList, 'ledger.product.nav', '%', 1),
          (@productList, 'customer.organization.graphFetch', '%', 1),
          (@productList, 'customer.kyc.fetch', '%', 1),
          (@productList, 'ledger.product.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]); 
 
--View Product
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Product')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @productView = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@productView, 'View Product', 'View Product', 1, 0, @productId, 1)     
END
ELSE
     SET @productView = (SELECT actorId FROM [user].[role] WHERE name = 'View Product')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@productView, 'ledger.ledger.nav', '%', 1),
          (@productView, 'ledger.product.nav', '%', 1),
          (@productView, 'customer.kyc.fetch', '%', 1),
          (@productView, 'ledger.product.fetch', '%', 1),
          (@productView, 'customer.type.fetch', '%', 1),
          (@productView, 'core.currency.fetch', '%', 1),
          (@productView, 'customer.customerCategory.fetch', '%', 1),
          (@productView, 'customer.organization.graphFetch', '%', 1),
          (@productView, 'ledger.productGroup.fetch', '%', 1),
          (@productView, 'ledger.productType.fetch', '%', 1),
          (@productView, 'ledger.productPeriodicFee.fetch', '%', 1),
          (@productView, 'ledger.product.get', '%', 1),
          (@productView, 'ledger.product.uniqueNamesGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
 
--Add Product
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add Product')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @productAdd = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@productAdd, 'Add Product', 'Add Product', 1, 0, @productId, 1)     
END
ELSE
     SET @productAdd = (SELECT actorId FROM [user].[role] WHERE name = 'Add Product')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@productAdd, 'ledger.ledger.nav', '%', 1),
          (@productAdd, 'ledger.product.nav', '%', 1),
          (@productAdd, 'customer.kyc.fetch', '%', 1),
          (@productAdd, 'ledger.product.fetch', '%', 1),
          (@productAdd, 'customer.type.fetch', '%', 1),
          (@productAdd, 'core.currency.fetch', '%', 1),
          (@productAdd, 'customer.customerCategory.fetch', '%', 1),
          (@productAdd, 'customer.organization.graphFetch', '%', 1),
          (@productAdd, 'ledger.productGroup.fetch', '%', 1),
          (@productAdd, 'ledger.productType.fetch', '%', 1),
          (@productAdd, 'ledger.productPeriodicFee.fetch', '%', 1),
          (@productAdd, 'ledger.product.get', '%', 1),
          (@productAdd, 'ledger.product.add', '%', 1),
          (@productAdd, 'ledger.product.discard', '%', 1),
          (@productAdd, 'ledger.product.uniqueNamesGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Edit Product
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit Product')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @productEdit = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@productEdit, 'Edit Product', 'Edit Product', 1, 0, @productId, 1)     
END
ELSE
     SET @productEdit = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Product')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@productEdit, 'ledger.ledger.nav', '%', 1),
          (@productEdit, 'ledger.product.nav', '%', 1),
          (@productEdit, 'customer.kyc.fetch', '%', 1),
          (@productEdit, 'ledger.product.fetch', '%', 1),
          (@productEdit, 'customer.type.fetch', '%', 1),
          (@productEdit, 'core.currency.fetch', '%', 1),
          (@productEdit, 'customer.customerCategory.fetch', '%', 1),
          (@productEdit, 'customer.organization.graphFetch', '%', 1),
          (@productEdit, 'ledger.productGroup.fetch', '%', 1),
          (@productEdit, 'ledger.productType.fetch', '%', 1),
          (@productEdit, 'ledger.productPeriodicFee.fetch', '%', 1),
          (@productEdit, 'ledger.product.get', '%', 1),
          (@productEdit, 'ledger.product.edit', '%', 1),
          (@productEdit, 'ledger.product.discard', '%', 1),
          (@productEdit, 'ledger.product.uniqueNamesGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Lock Product
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Activate / Deactivate Product')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @productLock = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@productLock, 'Activate / Deactivate Product', 'Activate / Deactivate Product', 1, 0, @productId, 1)     
END
ELSE
     SET @productLock = (SELECT actorId FROM [user].[role] WHERE name = 'Activate / Deactivate Product')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@productLock, 'ledger.ledger.nav', '%', 1),
          (@productLock, 'ledger.product.nav', '%', 1),
          (@productLock, 'customer.kyc.fetch', '%', 1),
          (@productLock, 'ledger.product.fetch', '%', 1),
          (@productLock, 'customer.type.fetch', '%', 1),
          (@productLock, 'core.currency.fetch', '%', 1),
          (@productLock, 'customer.customerCategory.fetch', '%', 1),
          (@productLock, 'customer.organization.graphFetch', '%', 1),
          (@productLock, 'ledger.productGroup.fetch', '%', 1),
          (@productLock, 'ledger.productType.fetch', '%', 1),
          (@productLock, 'ledger.productPeriodicFee.fetch', '%', 1),
          (@productLock, 'ledger.product.get', '%', 1),
          (@productLock, 'ledger.product.lock', '%', 1),
          (@productLock, 'ledger.product.uniqueNamesGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Approve Product
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Authorize Product Changes (Approve/Reject)')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @productApprove = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@productApprove, 'Authorize Product Changes (Approve/Reject)', 'Authorize Product Changes (Approve/Reject)', 1, 0, @productId, 1)     
END
ELSE
     SET @productApprove = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Product Changes (Approve/Reject)')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@productApprove, 'ledger.ledger.nav', '%', 1),
          (@productApprove, 'ledger.product.nav', '%', 1),
          (@productApprove, 'customer.kyc.fetch', '%', 1),
          (@productApprove, 'ledger.product.fetch', '%', 1),
          (@productApprove, 'customer.type.fetch', '%', 1),
          (@productApprove, 'core.currency.fetch', '%', 1),
          (@productApprove, 'customer.customerCategory.fetch', '%', 1),
          (@productApprove, 'customer.organization.graphFetch', '%', 1),
          (@productApprove, 'ledger.productGroup.fetch', '%', 1),
          (@productApprove, 'ledger.productType.fetch', '%', 1),
          (@productApprove, 'ledger.productPeriodicFee.fetch', '%', 1),
          (@productApprove, 'ledger.product.get', '%', 1),
          (@productApprove, 'ledger.product.addApproved', '%', 1),
          (@productApprove, 'ledger.product.editApproved', '%', 1),
          (@productApprove, 'ledger.product.reject', '%', 1),
          (@productApprove, 'ledger.product.approve', '%', 1),
          (@productApprove, 'ledger.product.uniqueNamesGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Manage Accounts
--List Accounts
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Accounts')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @accountList = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@accountList, 'List Accounts', 'List Accounts', 1, 0, @accountId, 1)     
END
ELSE
     SET @accountList = (SELECT actorId FROM [user].[role] WHERE name = 'List Accounts')

MERGE INTO [user].actorAction AS target
USING
     (VALUES    
         (@accountList, 'ledger.ledger.nav', '%', 1),
         (@accountList, 'ledger.account.nav', '%', 1),
         (@accountList, 'core.itemName.fetch', '%', 1),
         (@accountList, 'ledger.account.fetch', '%', 1),
         (@accountList, 'ledger.state.list', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]); 
 
--View Account
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Account')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @accountView = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@accountView, 'View Account', 'View Account', 1, 0, @accountId, 1)     
END
ELSE
     SET @accountView = (SELECT actorId FROM [user].[role] WHERE name = 'View Account')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
         (@accountView, 'ledger.ledger.nav', '%', 1),
         (@accountView, 'ledger.account.nav', '%', 1),
         (@accountView, 'core.itemName.fetch', '%', 1),
         (@accountView, 'ledger.account.fetch', '%', 1),
         (@accountView, 'ledger.account.get', '%', 1),
         (@accountView, 'ledger.state.list', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
 
--Add Account
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add Account')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @accountAdd = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@accountAdd, 'Add Account', 'Add Account', 1, 0, @accountId, 1)     
END
ELSE
     SET @accountAdd = (SELECT actorId FROM [user].[role] WHERE name = 'Add Account')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
         --list
         (@accountAdd, 'ledger.ledger.nav', '%', 1),
         (@accountAdd, 'ledger.account.nav', '%', 1),
         (@accountAdd, 'core.itemName.fetch', '%', 1),
         (@accountAdd, 'ledger.account.fetch', '%', 1),
         (@accountAdd, 'ledger.state.list', '%', 1),
         -- view
         (@accountAdd, 'ledger.account.get', '%', 1),
         --add
         (@accountAdd, 'ledger.productGroup.fetch', '%', 1),
         (@accountAdd, 'customer.organization.graphFetch', '%', 1),
         (@accountAdd, 'ledger.productType.fetch', '%', 1),
         (@accountAdd, 'ledger.product.list', '%', 1),
         (@accountAdd, 'ledger.account.add', '%', 1),
         (@accountAdd, 'ledger.account.discard', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Approve Account
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Authorize Account Changes (Approve/Reject)')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @accountApprove = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@accountApprove, 'Authorize Account Changes (Approve/Reject)', 'Authorize Account Changes (Approve/Reject)', 1, 0, @accountId, 1)     
END
ELSE
     SET @accountApprove = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Account Changes (Approve/Reject)')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
         --list
         (@accountApprove, 'ledger.ledger.nav', '%', 1),
         (@accountApprove, 'ledger.account.nav', '%', 1),
         (@accountApprove, 'core.itemName.fetch', '%', 1),
         (@accountApprove, 'ledger.account.fetch', '%', 1),
         (@accountApprove, 'ledger.state.list', '%', 1),
         --view
         (@accountApprove, 'ledger.account.get', '%', 1),
         --add & edit
         (@accountApprove, 'ledger.account.addApproved', '%', 1),
         (@accountApprove, 'ledger.account.editApproved', '%', 1),
         (@accountApprove, 'ledger.account.approve', '%', 1),
         (@accountApprove, 'ledger.account.reject', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Edit Account
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit Account')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @accountEdit = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@accountEdit, 'Edit Account', 'Edit Account', 1, 0, @accountId, 1)     
END
ELSE
     SET @accountEdit = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Account')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          --list
         (@accountEdit, 'ledger.ledger.nav', '%', 1),
         (@accountEdit, 'ledger.account.nav', '%', 1),
         (@accountEdit, 'core.itemName.fetch', '%', 1),
         (@accountEdit, 'ledger.account.fetch', '%', 1),
         (@accountEdit, 'ledger.state.list', '%', 1),
         --view
         (@accountEdit, 'ledger.account.get', '%', 1),
         --edit
         (@accountEdit, 'ledger.productGroup.fetch', '%', 1),
         (@accountEdit, 'customer.organization.graphFetch', '%', 1),
         (@accountEdit, 'ledger.productType.fetch', '%', 1),
         (@accountEdit, 'ledger.product.list', '%', 1),
         (@accountEdit, 'ledger.account.edit', '%', 1),
         (@accountEdit, 'ledger.account.discard', '%', 1)
          
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Close Account
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Close Account')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @accountClose = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@accountClose, 'Close Account', 'Close Account', 1, 0, @accountId, 1)     
END
ELSE
     SET @accountClose = (SELECT actorId FROM [user].[role] WHERE name = 'Close Account')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
         --list
         (@accountClose, 'ledger.ledger.nav', '%', 1),
         (@accountClose, 'ledger.account.nav', '%', 1),
         (@accountClose, 'core.itemName.fetch', '%', 1),
         (@accountClose, 'ledger.account.fetch', '%', 1),
         (@accountClose, 'ledger.state.list', '%', 1),
         --view
         (@accountClose, 'ledger.account.get', '%', 1),
         --close
         (@accountClose, 'ledger.account.close', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
