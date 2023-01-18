MERGE INTO [user].[actionCategory] AS target
USING   
    (VALUES
        ('general', NULL, NULL, NULL),
        ('customer', 'customer', 'customerId', 'name'),
        ('role', '[user].[role]', 'actorId', 'name'),
        ('user', '[user].[user]', 'userId', 'name'),
        ('webui', 'webui', 'webuiId', 'name'),
        ('report', NULL, NULL, NULL),
        ('audit', NULL, NULL, NULL),
        ('rule', NULL, NULL, NULL)
    ) AS source (name, [table], keyColumn, displayColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, [table], keyColumn, displayColumn)
VALUES (name, [table], keyColumn, displayColumn);

DECLARE @customerActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='customer')
DECLARE @roleActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='role')
DECLARE @userActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='user')
DECLARE @generalActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='general')
DECLARE @webuiActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='webui')
DECLARE @reportActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='report')
DECLARE @ruleActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='rule')

--webui and tabs access
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('customer.webui.view', @webuiActionCategoryId, 'customer webui view', '{}'),
        ('user.webui.view', @webuiActionCategoryId, 'user webui view', '{}'),
        ('core.webui.view', @webuiActionCategoryId, 'core webui view', '{}'),
        --administration        
        ('customer.organization.nav', @customerActionCategoryId, 'View Organizations tab', '{}'),
        ('customer.bu.nav', @customerActionCategoryId, 'Access BU submenu', '{}'),
        ('user.admin.nav', @userActionCategoryId, 'Access to Roles & Users tab', '{}'),
        ('user.role.nav', @userActionCategoryId, 'View Role submenu', '{}'),
        ('user.permissions.nav', @userActionCategoryId, 'View Permissions submenu', '{}'),
        ('user.user.nav', @userActionCategoryId, 'View Users submenu', '{}'),
        ('user.access.nav', @userActionCategoryId, 'Access to Access Policies submenu', '{}'),
        ('user.actionLog.nav', @userActionCategoryId, 'Access to audit tab menu', '{}'),
        ('user.system.nav', @userActionCategoryId, 'Access to System tab', '{}'),
        ('core.content.nav', @generalActionCategoryId, 'Access to content submenu', N'{}'),
        ('report.report.nav', @reportActionCategoryId, 'View Reports tab', '{}'),
        ('rule.rule.nav', @ruleActionCategoryId, 'Access to Rule tab', N'{}'),
        --solution
        ('customer.customer.nav', @customerActionCategoryId, 'Access customers tab', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);
    
--general (in core)
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('core.actorHierarchy.add', @generalActionCategoryId, 'core.actorHierarchy.add', '{}'),
        ('core.actorHierarchy.addUnapproved', @generalActionCategoryId, 'core.actorHierarchy.add', '{}'),
        ('core.cbs.fetch', @generalActionCategoryId, 'cbs fetch', '{}'),
        ('core.cbs.get', @generalActionCategoryId, 'cbs get', '{}'),
        ('core.currency.fetch', @generalActionCategoryId, 'Fetch currencies', '{}'),
        ('core.externalSystemByName.get', @generalActionCategoryId, 'Returns the external systems by name', '{}'),
        ('core.externalSystem.get', @generalActionCategoryId, 'Returns the external systems by id', '{}'),
        ('core.externalSystem.fetch', @generalActionCategoryId, 'External systems fetch', '{}'),
        ('core.externalSystem.add', @generalActionCategoryId, 'Add external system', '{}'),
        ('core.externalSystem.edit', @generalActionCategoryId, 'Edit external system', '{}'),
        ('core.externalSystem.delete', @generalActionCategoryId, 'Delete external system', '{}'),
        ('core.externalSystem.activateDeactivate', @generalActionCategoryId, 'Activate/Deactivate external system', '{}'),
        ('core.externalSystemAttributes.get', @generalActionCategoryId, 'Gets the attributes for specific external system', '{}'),
        ('core.externalSystemType.list', @generalActionCategoryId, 'List available system types', '{}'),
        ('core.itemCode.fetch', @generalActionCategoryId, 'rule item fetch', '{}'),
        ('core.itemName.add', @generalActionCategoryId, 'itemName add', '{}'),
        ('core.itemName.edit', @generalActionCategoryId, 'itemName edit', '{}'),
        ('core.itemName.fetch', @generalActionCategoryId, 'itemName fetch', '{}'),
        ('core.itemNameByItemType.fetch', @generalActionCategoryId, 'Returns itemName filtered by itemType', '{}'),
        ('core.itemNameItemTranslation.add', @generalActionCategoryId, 'Add item name and its translation', '{}'),
        ('core.itemNameItemTranslation.edit', @generalActionCategoryId, 'Edit item name and its translation', '{}'),
        ('core.itemNameTranslation.get', @generalActionCategoryId, 'Gets translations', '{}'),
        ('core.itemNameStatusChange', @generalActionCategoryId, 'itemName StatusChange', '{}'),
        ('core.itemNameTranslation.save', @generalActionCategoryId, 'Multiple save of item names and translations', '{}'),
        ('core.itemNameTranslation.upload', @generalActionCategoryId, 'Upload translations from file run', '{}'),
        ('core.itemTranslation.add', @generalActionCategoryId, 'itemTranslation add', '{}'),
        ('core.itemTranslation.edit', @generalActionCategoryId, 'itemTranslation edit', '{}'),
        ('core.itemTranslation.fetch', @generalActionCategoryId, 'itemTranslation fetch', '{}'),
        ('core.translation.fetch', @generalActionCategoryId, 'core.translation.fetch', '{}'),
        ('core.translation.byLanguageFetch', @generalActionCategoryId, 'Fetch translations by language', '{}'),
        ('core.itemType.fetch', @generalActionCategoryId, 'itemType fetch', '{}'),
        ('core.language.fetch', @generalActionCategoryId, 'language fetch', '{}'),
        ('core.itemNameByParent.list', @generalActionCategoryId, 'core.itemNameByParent.list', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

-- document
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('document.document.add', @customerActionCategoryId, 'Document add', '{}'),
        ('document.attachment.update', @customerActionCategoryId, 'Update attachment', '{}'),
        ('document.document.edit', @customerActionCategoryId, 'Document edit', '{}'),
        ('document.attachment.edit', @customerActionCategoryId, 'edit attachment', '{}'),
        ('document.attachment.addWithUDF', @customerActionCategoryId, 'Add attachment and generate XML iwth old values', '{}'),
        ('document.document.addWithUDF', @customerActionCategoryId, 'Add document and generate XML iwth old values', '{}'),
        ('document.attachment.add', @customerActionCategoryId, 'add attachment', '{}'),
        ('document.document.update', @customerActionCategoryId, 'document update', '{}'),
        ('document.document.addUnapproved', @customerActionCategoryId, 'document.document.addUnapproved', '{}'),
        ('document.attachment.addUnapproved', @customerActionCategoryId, 'document.attachment.addUnapproved', '{}'),      
        ('document.document.get', @customerActionCategoryId, 'document.document.get', '{}'),
        ('document.document.fetch', @customerActionCategoryId, 'document.document.fetch', '{}'),
        ('document.document.discard', @customerActionCategoryId, 'document.document.discard', '{}'),
        ('document.document.editApproved', @customerActionCategoryId, 'document.document.editApproved', '{}'),
        ('document.document.addApproved', @customerActionCategoryId, 'document.document.addApproved', '{}'),
        ('document.documentTypeClass.fetch', @customerActionCategoryId, 'document.documentTypeClass.fetch', '{}'),
        ('document.documentType.fetch', @customerActionCategoryId, 'document.documentType.fetch', '{}'),
        ('document.document.editUnapproved', @customerActionCategoryId, 'document.document.editUnapproved', '{}'),
        ('document.archivedDocument.get', @customerActionCategoryId, 'document.archivedDocument.get', '{}'),
        ('document.document.archive', @customerActionCategoryId, 'document.document.archive', '{}'),
        ('document.document.viewArchive', @customerActionCategoryId, 'document.document.viewArchive', '{}'),
        ('document.document.delete', @customerActionCategoryId, 'document.document.delete', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

-- customer
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('customer.account.add', @customerActionCategoryId, 'Customer account add', '{}'),
        ('customer.account.addUnapproved', @customerActionCategoryId, 'customer.account.addUnapproved', '{}'),
        ('customer.account.edit', @customerActionCategoryId, 'Customer account edit', '{}'),
        ('customer.account.editUnapproved', @customerActionCategoryId, 'customer.account.editUnapproved', '{}'),
        ('customer.activationReport.run', @customerActionCategoryId, 'customer activation report run', '{}'),
        ('customer.activityReport.add', @customerActionCategoryId, 'Allow reporting the result of certain action for client application', '{}'),
        ('customer.activityReport.run', @customerActionCategoryId, 'customer activation report run', '{}'),
        ('customer.address.add', @customerActionCategoryId, 'Customer address add', '{}'),
        ('customer.address.addUnapproved', @customerActionCategoryId, 'customer.address.addUnapproved', '{}'),
        ('customer.address.edit', @customerActionCategoryId, 'Customer address edit', '{}'),
        ('customer.address.editUnapproved', @customerActionCategoryId, 'customer.address.editUnapproved', '{}'),
        ('customer.address.get', @customerActionCategoryId, 'Customer address get', '{}'),
        ('customer.address.update', @customerActionCategoryId, 'address update', '{}'),
        ('customer.attachment.add', @customerActionCategoryId, 'customer attachment upload', '{}'),
        ('customer.attachment.update', @customerActionCategoryId, 'Update customer document attachment', '{}'),
        ('customer.cbs.activity', @customerActionCategoryId, 'Allow requesting balance enquiry and mini statement from CBS', '{}'),
        ('customer.country.fetch', @generalActionCategoryId, 'country fetch', '{}'),
        ('customer.country.get', @generalActionCategoryId, 'country get', '{}'),
        ('customer.customer.edit', @customerActionCategoryId, 'Customer edit', '{}'),
        ('customer.customer.add', @customerActionCategoryId, 'Customer add', '{}'),
        ('customer.customer.approve', @customerActionCategoryId, 'Customer approve', '{}'),
        ('customer.customer.fetch', @customerActionCategoryId, 'Customer fetch', '{}'),
        ('customer.customer.get', @customerActionCategoryId, 'Customer add', '{}'),
        ('customer.customer.picture', @customerActionCategoryId, 'customer.customer.picture', '{}'),
        ('customer.customer.search', @customerActionCategoryId, 'Customer search', '{}'),
        ('customer.customer.update', @customerActionCategoryId, 'update customer', '{}'),
        ('customer.customerCategory.fetch', @customerActionCategoryId, 'Fetch customer categories', '{}'),
        ('customer.document.add', @customerActionCategoryId, 'Add customer document', '{}'),
        ('customer.email.add', @customerActionCategoryId, 'Customer email add', '{}'),
        ('customer.email.addUnapproved', @customerActionCategoryId, 'customer.email.addUnapproved', '{}'),
        ('customer.email.edit', @customerActionCategoryId, 'Customer email edit', '{}'),
        ('customer.email.editUnapproved', @customerActionCategoryId, 'customer.email.editUnapproved', '{}'),
        ('customer.email.get', @customerActionCategoryId, 'Customer email get', '{}'),
        ('customer.file.approve', @customerActionCategoryId, 'customer approved', '{}'),
        ('customer.file.block', @customerActionCategoryId, 'customer block', '{}'),
        ('customer.file.get', @customerActionCategoryId, 'ClientFile get', '{}'),
        ('customer.file.getCount', @customerActionCategoryId, 'ClientFile get count', '{}'),
        ('customer.file.reject', @customerActionCategoryId, 'customer reject', '{}'),
        ('customer.file.update', @customerActionCategoryId, 'ClientFile update', '{}'),
        ('customer.file.updateState', @customerActionCategoryId, 'ClientFile update state - approve/reject', '{}'),
        ('customer.joint.get', @customerActionCategoryId, 'Customer joint get', '{}'),
        ('customer.kyc.fetch', @customerActionCategoryId, 'KYC fetch', '{}'),
        ('customer.mno.fetch', @generalActionCategoryId, 'mno fetch', '{}'),
        ('customer.organization.add', @customerActionCategoryId, 'customer.organization.add', '{}'),
        ('customer.organization.addApproved', @customerActionCategoryId, 'Adds approved data for organization', '{}'),
        ('customer.organization.approve', @customerActionCategoryId, 'Approves organization', '{}'),
        ('customer.organization.discard', @customerActionCategoryId, 'Discards changes for organization', '{}'),
        ('customer.organization.edit', @customerActionCategoryId, 'organization edit', '{}'),
        ('db/customer.organization.edit', @customerActionCategoryId, 'organization edit', '{}'),
        ('customer.organization.editApproved', @customerActionCategoryId, 'Edits approved data for organization', '{}'),
        ('customer.organization.fetch', @customerActionCategoryId, 'organization fetch', '{}'),
        ('customer.organizationHierarchyFlat.rebuild', @customerActionCategoryId, 'organization hierarchy flat rebuild', '{}'),
        ('customer.organization.get', @customerActionCategoryId, 'Customer organization get', '{}'),
        ('customer.organization.getByDepth', @customerActionCategoryId, 'Returns organizations with specific depth', '{}'),
        ('customer.organization.graphFetch', @customerActionCategoryId, 'Fetch customer organizations', '{}'),
        ('customer.organization.list', @customerActionCategoryId, 'customer.organization.list', '{}'),
        ('customer.organization.lock', @customerActionCategoryId, 'customer.organization.lock', '{}'),
        ('customer.organization.delete', @customerActionCategoryId, 'customer.organization.delete', '{}'),
        ('customer.organization.reject', @customerActionCategoryId, 'Rejects changes for organization', '{}'),
        ('customer.organization.update', @customerActionCategoryId, 'organization update', '{}'),
        ('customer.otp.check', @customerActionCategoryId, 'customer otp check', '{}'),
        ('customer.otp.send', @customerActionCategoryId, 'customer otp send', '{}'),
        ('customer.person.add', @customerActionCategoryId, 'Customer person add', '{}'),
        ('customer.person.addUnapproved', @customerActionCategoryId, 'customer.person.addUnapproved', '{}'),
        ('customer.person.edit', @customerActionCategoryId, 'Customer person edit', '{}'),
        ('customer.person.editUnapproved', @customerActionCategoryId, 'customer.person.editUnapproved', '{}'),
        ('customer.person.get', @customerActionCategoryId, 'Customer person get', '{}'),
        ('customer.person.getUnapproved', @customerActionCategoryId, 'customer.person.getUnapproved', '{}'),
        ('customer.person.update', @customerActionCategoryId, 'person update', '{}'),
        ('customer.phone.add', @customerActionCategoryId, 'Customer phone add', '{}'),
        ('customer.phone.addUnapproved', @customerActionCategoryId, 'customer.phone.addUnapproved', '{}'),
        ('customer.phone.edit', @customerActionCategoryId, 'Customer phone edit', '{}'),
        ('customer.phone.editUnapproved', @customerActionCategoryId, 'customer.phone.editUnapproved', '{}'),
        ('customer.phone.get', @customerActionCategoryId, 'Customer phone get', '{}'),
        ('customer.phone.update', @customerActionCategoryId, 'phone update', '{}'),
        ('customer.phone.validate', @customerActionCategoryId, 'customer phone validate', '{}'),
        ('customer.picture.get', @customerActionCategoryId, 'customer.picture.get', '{}'),
        ('customer.type.fetch', @customerActionCategoryId, 'Fetch customer types', '{}'), 
        ('customer.customerType.list', @customerActionCategoryId, 'customer.customerType.list', '{}'), 
        ('customer.status.fetch', @customerActionCategoryId, 'customer.status.fetch', '{}'), 
        ('customer.incomeRange.list', @customerActionCategoryId, 'customer.incomeRange.list', '{}'),
        ('customer.maritalStatus.list', @customerActionCategoryId, 'customer.maritalStatus.list', '{}'),
        ('customer.education.list', @customerActionCategoryId, 'customer.education.list', '{}'),
        ('customer.employment.list', @customerActionCategoryId, 'customer.employment.list', '{}'),
        ('customer.employerCategory.list', @customerActionCategoryId, 'customer.employerCategory.list', '{}'),
        ('customer.industry.list', @customerActionCategoryId, 'customer.industry.list', '{}'),
        ('report.report.run', @customerActionCategoryId, 'Report run', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

--bio
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('bio.scan', @customerActionCategoryId, 'Bio scan', '{}'),
        ('bio.check', @customerActionCategoryId, 'Bio check', '{}'),
        ('bio.add', @customerActionCategoryId, 'Bio add', '{}'),
        ('customer.bio.add', @userActionCategoryId, 'Bio add', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

-- user
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('identity.changePassword', @userActionCategoryId, 'Change password', '{}'),
        ('user.action.grant', @userActionCategoryId, 'grants an action', '{}'),
        ('user.actionCategory.fetch', @userActionCategoryId, 'returns action categories and actions', '{}'),
        ('user.actorAction.fetch', @userActionCategoryId, 'returns actor actions', '{}'),
        ('user.actorAction.update', @userActionCategoryId, 'updates actor actions', '{}'),
        ('user.bio.add', @userActionCategoryId, 'Bio add', '{}'),
        ('user.changePassword', @userActionCategoryId, 'Change password', '{}'),
        ('user.details.get', @userActionCategoryId, 'user details get', '{}'),
        ('user.device.update', @userActionCategoryId, 'Update User Device info', '{}'),
        ('user.errors.fetch', @userActionCategoryId, 'fetches all errors in the error catalogue', '{}'),
        ('user.externalCredentialsTab.view', @userActionCategoryId, 'Permission to view external credentials tab', '{}'),
        ('user.externalUser.activateDeactivate', @userActionCategoryId, 'Activate and deactivate external user', '{}'),
        ('user.externalUser.add', @userActionCategoryId, 'Adds external user', '{}'),
        ('user.externalUser.addUnapproved', @userActionCategoryId, 'Adds external unapproved user', '{}'),
        ('user.externalUser.delete', @userActionCategoryId, 'Deletes external user', '{}'),
        ('user.externalUser.fetch', @userActionCategoryId, 'Fetch external user', '{}'),
        ('user.externalUser.get', @userActionCategoryId, 'Get external user', '{}'),
        ('user.externalUser.update', @userActionCategoryId, 'Updates external user', '{}'),
        ('user.externalUser.view', @userActionCategoryId, 'access to externalUser popup', '{}'),
        ('user.externalUserForLoggedUser.add', @userActionCategoryId, 'Adds external user for logged user', '{}'),
        ('user.externalUserForLoggedUser.get', @userActionCategoryId, 'Gets external user for logged user', '{}'),
        ('user.externalUserForLoggedUser.update', @userActionCategoryId, 'returns the systems', '{}'),
        ('user.externalSystem.fetch', @userActionCategoryId, 'Fetch external system', '{}'),
        ('user.externalSystem.add', @userActionCategoryId, 'Method for external system add', '{}'),
        ('user.externalSystem.edit', @userActionCategoryId, 'Method for external system edit', '{}'),
        ('user.externalSystem.delete', @userActionCategoryId, 'Method for external system delete', '{}'),
        ('user.externalSystem.get', @userActionCategoryId, 'Method for external system get', '{}'),
        ('user.externalSystem.activateDeactivate', @userActionCategoryId, 'Method for external system activate', '{}'),
        ('user.hash.add', @userActionCategoryId, 'hash add', '{}'),
        ('user.hash.addUnapproved', @userActionCategoryId, 'user.hash.addUnapproved', '{}'),
        ('user.hash.check', @userActionCategoryId, 'hash check', '{}'),
        ('user.hash.clearAttempts', @userActionCategoryId, 'clear failed attempts', '{}'),
        ('user.hash.editUnapproved', @userActionCategoryId, 'user.hash.editUnapproved', '{}'),
        ('user.hash.replace', @userActionCategoryId, 'hash replace', '{}'),
        ('user.hash.update', @userActionCategoryId, 'user.hash.update', '{}'),
        ('user.identity.check', @userActionCategoryId, 'identity check', '{}'),
        ('user.identity.checkPolicy', @userActionCategoryId, 'identity check', '{}'),
        ('user.identity.get', @userActionCategoryId, 'identity get', '{}'),
        ('user.language.fetch', @userActionCategoryId, 'user language get', '{}'),
        ('user.role.actionFetch', @roleActionCategoryId, 'fetches permissions of a role', '{}'),
        ('user.role.actionInheritedFetch', @roleActionCategoryId, 'dynamically fetches inherited permissions of a role', '{}'),
        ('user.role.add', @roleActionCategoryId, 'adds a role', '{}'),
        ('user.role.addApproved', @roleActionCategoryId, 'Approves a new role', '{}'),
        ('user.role.approve', @roleActionCategoryId, 'Approves a role', '{}'),
        ('user.role.assign', @userActionCategoryId, 'Right to change assigned roles', '{}'),
        ('user.role.assignFetch', @userActionCategoryId, 'get possible roles that can be assigned', '{}'),
        ('user.role.assignFetchForRoles', @userActionCategoryId, 'get possible roles that can be assigned to roles', '{}'),
        ('user.role.delete', @roleActionCategoryId, 'delete a role', '{}'),
        ('user.role.discard', @roleActionCategoryId, 'discards a role', '{}'),
        ('user.role.edit', @roleActionCategoryId, 'Edit role', '{}'),
        ('history.history.listChanges', @roleActionCategoryId, 'List history', '{}'),
        ('user.role.editApproved', @roleActionCategoryId, 'Approves an edited existing role', '{}'),
        ('user.role.fetch', @roleActionCategoryId, 'fetches roles', '{}'),
        ('user.role.get', @roleActionCategoryId, 'get a role', '{}'),
        ('user.role.grant', @userActionCategoryId, 'Grant role', '{}'),
        ('user.role.grantUnapproved', @userActionCategoryId, 'user.role.grantUnapproved', '{}'),
        ('user.role.lock', @roleActionCategoryId, 'locks a role', '{}'),
        ('user.role.possibleFetch', @userActionCategoryId, 'user possible roles get', '{}'),
        ('user.role.reject', @roleActionCategoryId, 'rejects a role', '{}'),
        ('user.session.delete', @userActionCategoryId, 'log out', '{}'),
        ('user.user.add', @userActionCategoryId, 'user add', '{}'),
        ('user.user.addApproved', @userActionCategoryId, 'user.user.addApproved', '{}'),
        ('user.user.approve', @userActionCategoryId, 'user approve', '{}'),
        ('user.user.byPermissionsFetch', @userActionCategoryId, 'grants an action', '{}'),
        ('user.user.delete', @userActionCategoryId, 'user delete', '{}'),
        ('user.user.discard', @userActionCategoryId, 'user.user.discard', '{}'),
        ('user.user.edit', @userActionCategoryId, 'user edit', '{}'),
        ('user.user.editApproved', @userActionCategoryId, 'user.user.editApproved', '{}'),
        ('user.user.fetch', @userActionCategoryId, 'user fetch', '{}'),
        ('user.user.get', @userActionCategoryId, 'Get user', '{}'),
        ('user.user.languageChange', @userActionCategoryId, 'User changes the preferred language', '{}'),
        ('user.user.lock', @userActionCategoryId, 'user lock/unlock', '{}'),
        ('user.user.reject', @userActionCategoryId, 'user.user.reject', '{}'),
        ('user.userToExternalUser.addUnapproved', @userActionCategoryId, 'Adds unapproved userToExternalUser', '{}'),
        ('user.userToExternalUser.edit', @userActionCategoryId, 'userToExternalUser.edit', '{}'),
        ('user.userToExternalUser.editUnapproved', @userActionCategoryId, 'user.userToExternalUser.editUnapproved', '{}'),
        ('user.visibleExternalSystem.fetch', @userActionCategoryId, 'Fetch visible external system', '{}'),
        ('user.externalSystemForBU.fetch', @userActionCategoryId, 'Fetch external system for BU', '{}'),
        ('user.externalSystemsAndRolesForBUs.fetch', @userActionCategoryId, 'Fetch external system and roles for BU', '{}'),
        ('user.visibility.check', @userActionCategoryId, 'Check visibility', '{}'),
        ('user.organization.fetchVisible', @userActionCategoryId, 'Fetch visibility', '{}'),
        ('user.secretQuestionAnswer.add', @userActionCategoryId, 'Adds secret questions and answers', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

--opt
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('user.hash.return', @userActionCategoryId, 'user.hash.return', '{}'),
        ('user.genHash', @userActionCategoryId, 'user.genHash', '{}'),
        ('otp.check', @userActionCategoryId, 'otp.check', '{}'),
        ('alert.queueOut.push', @userActionCategoryId, 'alert.queueOut.push', '{}'),
        ('user.getHash', @userActionCategoryId, 'user.getHash', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

---policy
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('policy.policy.add', @userActionCategoryId, 'adds access policy', '{}'),
        ('policy.policy.delete', @userActionCategoryId, 'deletes access policy', '{}'),
        ('policy.policy.duplicate', @userActionCategoryId, 'duplicates access policy', '{}'),
        ('policy.policy.edit', @userActionCategoryId, 'edits access policy', '{}'),
        ('policy.policy.fetch', @userActionCategoryId, 'returns all policies', '{}'),
        ('policy.policy.get', @userActionCategoryId, 'get a policy details', '{}'),
        ('policy.ldapPolicy.get', @userActionCategoryId, 'get an ldap policy details', '{}'),
        ('policy.rolesPolicy.get', @userActionCategoryId, 'returns the inherited policy', '{}'),
        ('policy.policy.channelsGet', @userActionCategoryId, 'returns policy channels', '{}'),
        ('policy.usernameCredentials.get', @userActionCategoryId, 'returns username credentials', '{}'),
        ('policy.policy.uniqueFieldsGet', @userActionCategoryId, 'returns unique fields', '{}'),
        ('policy.policy.functionsGet', @userActionCategoryId, 'returns functions', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

-- kyc 
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('customer.kyc.add', @customerActionCategoryId, 'Add new KYC Level', '{}'),
        ('customer.kyc.changeStatus', @customerActionCategoryId, 'Activate/Deactivate KYC Level', '{}'),
        ('customer.kyc.delete', @customerActionCategoryId, 'Delete KYC Level', '{}'),
        ('customer.kyc.edit', @customerActionCategoryId, 'Edit KYC Level', '{}'),
        ('customer.kyc.fetch', @customerActionCategoryId, 'Returns all KYC Levels', '{}'),
        ('customer.kyc.get', @customerActionCategoryId, 'Returns specific KYC level', '{}'),
        ('customer.kyc.getForCreate', @customerActionCategoryId, 'Returns non defined KYC levels', '{}'),
        ('customer.kycAttribute.list', @customerActionCategoryId, 'Returns KYC attributes per customer type', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);

--rule
MERGE INTO [user].[action] AS target
USING
    (VALUES        
        ('rule.rule.fetch', @ruleActionCategoryId, 'rule fetch', N'{}'),
        ('rule.rule.remove', @ruleActionCategoryId, 'rule remove', N'{}'),
        ('rule.rule.edit', @ruleActionCategoryId, 'rule edit', N'{}'),
        ('rule.rule.add', @ruleActionCategoryId, 'rule add', N'{}'),
        ('rule.item.fetch', @ruleActionCategoryId, 'rule item fetch', N'{}'),
        ('db/rule.decision.lookup', @ruleActionCategoryId, 'rule decision lookup', N'{}'),        
        ('db/rule.rule.fetch', @ruleActionCategoryId, 'rule fetch', '{}'),    
        ('db/rule.rule.add', @ruleActionCategoryId, 'rule add', '{}'),
        ('db/rule.rule.edit', @ruleActionCategoryId, 'rule edit', '{}'),
        ('db/rule.rule.remove', @ruleActionCategoryId, 'rule remove', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);
