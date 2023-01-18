DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('customer', 'Manage Customers', 'Manage Customers')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('referral', 'Manage Referrals', 'Manage Referrals')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta

DECLARE @customerId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'customer')
DECLARE @referralManagement BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'referral')
DECLARE @customerList BIGINT, @customerAdd BIGINT, @customerEdit BIGINT, @customerView BIGINT
DECLARE @permissionId BIGINT
--Manage Customers
--List Customers
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Customers')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @customerList = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@customerList, 'List Customers', 'List Customers', 1, 0, @customerId, 1)     
END
ELSE
     SET @customerList = (SELECT actorId FROM [user].[role] WHERE name = 'List Customers')

MERGE INTO [user].actorAction AS target
USING
     (VALUES    
         (@customerList, 'customer.customer.nav', '%', 1),
         (@customerList, 'customer.type.fetch', '%', 1),
         (@customerList, 'customer.status.fetch', '%', 1),
         (@customerList, 'customer.customer.fetch', '%', 1),
         (@customerList, 'customer.customerType.list', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]); 

--View Customers
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Customer')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @customerView = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@customerView, 'View Customer', 'View Customer', 1, 0, @customerId, 1)     
END
ELSE
     SET @customerView = (SELECT actorId FROM [user].[role] WHERE name = 'View Customer')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@customerView, 'customer.customer.nav', '%', 1),
         --edit
          (@customerView, 'document.documentType.fetch', '%', 1),
          (@customerView, 'customer.country.fetch', '%', 1),
          (@customerView, 'customer.maritalStatus.list', '%', 1),
          (@customerView, 'customer.education.list', '%', 1),
          (@customerView, 'customer.employment.list', '%', 1),
          (@customerView, 'customer.employerCategory.list', '%', 1),
          (@customerView, 'customer.industry.list', '%', 1),
          (@customerView, 'customer.incomeRange.list', '%', 1),
          (@customerView, 'core.itemNameByParent.list', '%', 1),
          (@customerView, 'customer.type.fetch', '%', 1),
          (@customerView, 'customer.status.fetch', '%', 1),
          (@customerView, 'customer.customer.fetch', '%', 1),
          (@customerView, 'customer.customerType.list', '%', 1),
          --edit GeneralInfo 
          (@customerView, 'customer.organization.graphFetch', '%', 1),
          (@customerView, 'customer.customer.get', '%', 1),
          --account
          (@customerView, 'ledger.account.fetch', '%', 1),
          (@customerView, 'ledger.account.get', '%', 1),
          --document
          (@customerView, 'document.documentTypeClass.fetch', '%', 1),
          (@customerView, 'document.document.fetch', '%', 1)         
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Add Customer
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add Customer')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @customerAdd = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@customerAdd, 'Add Customer', 'Add Customer', 1, 0, @customerId, 1)     
END
ELSE
     SET @customerAdd = (SELECT actorId FROM [user].[role] WHERE name = 'Add Customer')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
         --list
         (@customerAdd, 'customer.customer.nav', '%', 1),
         (@customerAdd, 'customer.type.fetch', '%', 1),
         (@customerAdd, 'customer.status.fetch', '%', 1),
         (@customerAdd, 'customer.customer.fetch', '%', 1),
         (@customerAdd, 'customer.customerType.list', '%', 1),
         --add
         (@customerAdd, 'document.documentType.fetch', '%', 1),
         (@customerAdd, 'customer.country.fetch', '%', 1),
         (@customerAdd, 'customer.maritalStatus.list', '%', 1),
         (@customerAdd, 'customer.education.list', '%', 1),
         (@customerAdd, 'customer.employment.list', '%', 1),
         (@customerAdd, 'customer.employerCategory.list', '%', 1),
         (@customerAdd, 'customer.industry.list', '%', 1),
         (@customerAdd, 'customer.incomeRange.list', '%', 1),
         (@customerAdd, 'core.itemNameByParent.list', '%', 1),
         (@customerAdd, 'customer.organization.graphFetch', '%', 1),
         (@customerAdd, 'document.documentTypeClass.fetch', '%', 1),
         (@customerAdd, 'ledger.account.fetch', '%', 1),
         (@customerAdd, 'customer.customer.add', '%', 1),
         (@customerAdd, 'customer.customer.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Edit Customer
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit Customer')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @customerEdit = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@customerEdit, 'Edit Customer', 'Edit Customer', 1, 0, @customerId, 1)     
END
ELSE
     SET @customerEdit = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Customer')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@customerList, 'customer.customer.nav', '%', 1),
         --edit
          (@customerEdit, 'document.documentType.fetch', '%', 1),
          (@customerEdit, 'customer.country.fetch', '%', 1),
          (@customerEdit, 'customer.maritalStatus.list', '%', 1),
          (@customerEdit, 'customer.education.list', '%', 1),
          (@customerEdit, 'customer.employment.list', '%', 1),
          (@customerEdit, 'customer.employerCategory.list', '%', 1),
          (@customerEdit, 'customer.industry.list', '%', 1),
          (@customerEdit, 'customer.incomeRange.list', '%', 1),
          (@customerEdit, 'core.itemNameByParent.list', '%', 1),
          (@customerEdit, 'customer.type.fetch', '%', 1),
          (@customerEdit, 'customer.status.fetch', '%', 1),
          (@customerEdit, 'customer.customer.fetch', '%', 1),
          (@customerEdit, 'customer.customerType.list', '%', 1),
          --edit GeneralInfo 
          (@customerEdit, 'customer.organization.graphFetch', '%', 1),
          --account
          (@customerEdit, 'ledger.account.fetch', '%', 1),
          (@customerEdit, 'ledger.account.get', '%', 1),
          (@customerEdit, 'ledger.account.edit', '%', 1),
          --document
          (@customerEdit, 'document.documentTypeClass.fetch', '%', 1),
          (@customerEdit, 'document.document.fetch', '%', 1),
          (@customerEdit, 'document.document.edit', '%', 1),
          --edit
          (@customerEdit, 'customer.customer.edit', '%', 1),
          (@customerEdit, 'customer.customer.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Manage Referrals
--View Referrals
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Referrals')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'View Referrals', 'View Referrals', 1, 0, @referralManagement, 1)     
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'View Referrals')

MERGE INTO [user].actorAction AS target
USING
     (VALUES    
		 (@permissionId,'customer.referral.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--List Referrals
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Referrals')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'List Referrals', 'List Referrals', 1, 0, @referralManagement, 1)     
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'List Referrals')

MERGE INTO [user].actorAction AS target
USING
     (VALUES    
         (@permissionId, 'customer.referral.fetch', '%', 1),
         (@permissionId, 'customer.referral.statusFetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]); 

--Add Referrals
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add Referrals')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Add Referrals', 'Add Referrals', 1, 0, @referralManagement, 1)     
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Add Referrals')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@permissionId, 'customer.referral.add', '%', 1),
          (@permissionId, 'customer.referral.getReferre', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Edit Referrals
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Authorize Referral Changes')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Authorize Referral Changes', 'Authorize Referral Changes', 1, 0, @referralManagement, 1)     
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Referral Changes')

MERGE INTO [user].actorAction AS target
USING
     (VALUES         
         (@permissionId, 'customer.referral.statusUpdate', '%', 1),
         (@permissionId, 'customer.referral.statusFetch', '%', 1),
         (@permissionId,'customer.referral.statusCheckerUpdate', '%', 1),
         (@permissionId,'customer.referral.statusMakerUpdate', '%', 1),
         (@permissionId,'customer.referral.approve', '%', 1),
         (@permissionId,'customer.referral.approveNew', '%', 1),
         (@permissionId,'customer.referral.reject', '%', 1),
         (@permissionId,'customer.referral.openAccount', '%', 1),
         (@permissionId,'customer.referral.deactivate', '%', 1),
         (@permissionId,'customer.referral.complete', '%', 1),
         (@permissionId,'customer.referral.approveDeactivation', '%', 1),
         (@permissionId,'customer.referral.rejectDeactivation', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Delete Referrals
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete Referrals')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Delete Referrals', 'Delete Referrals', 1, 0, @referralManagement, 1)     
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Delete Referrals')

MERGE INTO [user].actorAction AS target
USING
     (VALUES         
         (@permissionId, 'customer.referral.delete', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);