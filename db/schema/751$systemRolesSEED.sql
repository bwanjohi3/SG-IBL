DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'roleCategory')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('roleCategory', 'roleCategory', 'roleCategory', NULL, 'itemCode', 'itemName')
END

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('user', 'Manage Users', 'Manage Users')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('role', 'Manage Roles', 'Manage Roles')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('businessUnits', 'Manage Business Units', 'Manage Business Units')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('accessPolicy', 'Manage Access Policy', 'Manage Access Policy')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('permission', 'Manage Permissions', 'Manage Permissions')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('kycMangement', 'Manage KYC Levels', 'Manage KYC Levels')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('manageDocument', 'Manage Documents', 'Manage Documents')


EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta


DECLARE @roleId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'role')
DECLARE @userId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'user')
DECLARE @generalId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'general')
DECLARE @buId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'businessUnits')
DECLARE @permissionId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'permission')
DECLARE @accessPolicyId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'accessPolicy')
DECLARE @kycMangementId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'kycMangement')
DECLARE @documentMangementId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'manageDocument')


DECLARE @roleAddRole BIGINT, @roleViewRole BIGINT, @roleListRole BIGINT, @roleDeleteRole BIGINT, @roleEditRole BIGINT, @roleLockRole BIGINT, @roleChangeAP BIGINT, @roleChangeBU BIGINT, @roleChangeRoles BIGINT, @roleApproveRole BIGINT
DECLARE @userAddUser BIGINT,@userDeleteUser BIGINT,@userEditUser BIGINT,@userViewUser BIGINT,@userListUser BIGINT,@userLockUser BIGINT,@userApproveUser BIGINT,@userClear BIGINT
DECLARE @userAddBio BIGINT
DECLARE @buAdd BIGINT,@buDelete BIGINT,@buEdit BIGINT,@buView BIGINT,@buList BIGINT,@buLock BIGINT, @buApprove BIGINT
DECLARE @contentAdd BIGINT,@contentDelete BIGINT,@contentEdit BIGINT,@contentView BIGINT,@contentList BIGINT,@contentLock BIGINT,@contentUpload BIGINT
DECLARE @permissionList BIGINT,@permissionUpdate BIGINT, @permissionView BIGINT
DECLARE @policyList BIGINT, @policyAdd BIGINT, @policyEdit BIGINT, @policyDuplicate BIGINT, @policyDelete BIGINT, @policyView BIGINT
DECLARE @errorsView BIGINT
DECLARE @kycView BIGINT, @kycAdd BIGINT, @kycEdit BIGINT, @kycDelete BIGINT, @kycActivate BIGINT
DECLARE @roleViewDocument BIGINT, @roleAddDocument BIGINT, @roleEditDocument BIGINT, @roleArchiveDocument BIGINT, @roleViewArchivedDocument BIGINT

--Manage roles:
--List role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Roles')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleListRole = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleListRole, 'List Roles', 'List Roles', 1, 0, @roleId, 1)
END
ELSE
     SET @roleListRole = (SELECT actorId FROM [user].[role] WHERE name = 'List Roles')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          (@roleListRole, 'user.admin.nav', '%', 1),
          (@roleListRole, 'user.role.nav', '%', 1),
          (@roleListRole, 'user.role.fetch', '%', 1),
          (@roleListRole, 'customer.organization.graphFetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleListRole THEN
DELETE;

--View role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Role')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleViewRole = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleViewRole, 'View Role', 'View Role', 1, 0, @roleId, 1)     
END
ELSE
     SET @roleViewRole = (SELECT actorId FROM [user].[role] WHERE name = 'View Role')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@roleViewRole, 'user.admin.nav', '%', 1),
          (@roleViewRole, 'user.role.nav', '%', 1),
          (@roleViewRole, 'user.role.fetch', '%', 1),
          (@roleViewRole, 'user.role.get', '%', 1),
          (@roleViewRole, 'customer.organization.graphFetch', '%', 1),
          (@roleViewRole, 'policy.policy.fetch', '%', 1),
          (@roleViewRole, 'user.role.assignFetchForRoles', '%', 1),
          (@roleViewRole, 'user.role.grant', '%', 1),
          (@roleViewRole, 'user.role.actionFetch', '%', 1),
          (@roleViewRole, 'user.role.actionInheritedFetch', '%', 1),
          (@roleViewRole, 'user.actionCategory.fetch', '%', 1),
          (@roleViewRole, 'user.actorAction.fetch', '%', 1),
          (@roleViewRole, 'document.document.get', '%', 1),
          (@roleViewRole, 'document.documentTypeClass.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleViewRole THEN
DELETE;

--Add role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add Role')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleAddRole = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleAddRole, 'Add Role', 'Add Role', 1, 0, @roleId, 1)     
END
ELSE
     SET @roleAddRole = (SELECT actorId FROM [user].[role] WHERE name = 'Add Role')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@roleAddRole, 'user.admin.nav', '%', 1),
          (@roleAddRole, 'user.role.nav', '%', 1),
          (@roleAddRole, 'user.role.fetch', '%', 1),
          (@roleAddRole, 'user.role.get', '%', 1),
          (@roleAddRole, 'user.role.add', '%', 1),
          (@roleAddRole, 'user.role.grant', '%', 1),
          (@roleAddRole, 'customer.organization.graphFetch', '%', 1),
          (@roleAddRole, 'policy.policy.fetch', '%', 1),
          (@roleAddRole, 'user.role.assign', '%', 1),
          (@roleAddRole, 'user.role.assignFetchForRoles', '%', 1),
          (@roleAddRole, 'user.role.discard', '%', 1),
          (@roleAddRole, 'user.action.grant', '%', 1),
          (@roleAddRole, 'user.role.actionFetch', '%', 1),
          (@roleAddRole, 'user.role.actionInheritedFetch', '%', 1),
          (@roleAddRole, 'user.actionCategory.fetch', '%', 1),
          (@roleAddRole, 'user.actorAction.fetch', '%', 1),
          (@roleAddRole, 'user.actorAction.update', '%', 1),
          (@roleAddRole, 'document.document.addUnapproved', '%', 1),
          (@roleAddRole, 'document.document.add', '%', 1),
          (@roleAddRole, 'document.document.get', '%', 1),
          (@roleAddRole, 'document.document.discard', '%', 1),
          (@roleAddRole, 'document.documentTypeClass.fetch', '%', 1),
          (@roleAddRole, 'history.history.listChanges', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleAddRole THEN
DELETE;

--Edit role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit Role')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleEditRole = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleEditRole, 'Edit Role', 'Edit Role', 1, 0, @roleId, 1)     
END
ELSE
     SET @roleEditRole = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Role')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          (@roleEditRole, 'user.admin.nav', '%', 1),
          (@roleEditRole, 'user.role.nav', '%', 1),
          (@roleEditRole, 'user.role.fetch', '%', 1),
          (@roleEditRole, 'user.role.get', '%', 1),
          (@roleEditRole, 'user.role.edit', '%', 1),
          (@roleEditRole, 'user.role.discard', '%', 1),
          (@roleEditRole, 'user.role.grant', '%', 1),
          (@roleEditRole, 'user.role.grantUnapproved', '%', 1),
          (@roleEditRole, 'customer.organization.graphFetch', '%', 1),
          (@roleEditRole, 'policy.policy.fetch', '%', 1),
          (@roleEditRole, 'user.role.assign', '%', 1),
          (@roleEditRole, 'user.role.assignFetchForRoles', '%', 1),
          (@roleEditRole, 'user.role.actionFetch', '%', 1),
          (@roleEditRole, 'user.role.actionInheritedFetch', '%', 1),
          (@roleEditRole, 'user.actionCategory.fetch', '%', 1),
          (@roleEditRole, 'user.actorAction.fetch', '%', 1),
          (@roleEditRole, 'user.actorAction.update', '%', 1),
          (@roleEditRole, 'document.document.discard', '%', 1),
          (@roleEditRole, 'document.document.get', '%', 1),
          (@roleEditRole, 'document.document.editUnapproved', '%', 1),
          (@roleEditRole, 'document.document.edit', '%', 1),
          (@roleEditRole, 'document.documentTypeClass.fetch', '%', 1),
          (@roleEditRole, 'document.document.archive', '%', 1),
          (@roleEditRole, 'document.document.viewArchive', '%', 1),
          (@roleEditRole, 'document.archivedDocument.get', '%', 1),
          (@roleEditRole, 'document.document.delete', '%', 1),
          (@roleEditRole, 'document.document.update', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleEditRole THEN
DELETE;

--Approve role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Authorize Role Changes (Approve/Reject)')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleApproveRole = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleApproveRole, 'Authorize Role Changes (Approve/Reject)', 'Authorize Role Changes (Approve/Reject)', 1, 0, @roleId, 1)     
END
ELSE
     SET @roleApproveRole = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Role Changes (Approve/Reject)')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@roleApproveRole, 'user.admin.nav', '%', 1),
          (@roleApproveRole, 'user.role.nav', '%', 1),
          (@roleApproveRole, 'user.role.fetch', '%', 1),
          (@roleApproveRole, 'user.role.get', '%', 1),
          (@roleApproveRole, 'user.role.grant', '%', 1),
          (@roleApproveRole, 'user.role.grantUnapproved', '%', 1),
          (@roleApproveRole, 'user.role.approve', '%', 1),
          (@roleApproveRole, 'user.role.reject', '%', 1),
          (@roleApproveRole, 'customer.organization.graphFetch', '%', 1),
          (@roleApproveRole, 'policy.policy.fetch', '%', 1),
          (@roleApproveRole, 'user.role.assignFetchForRoles', '%', 1),
          (@roleApproveRole, 'user.role.addApproved', '%', 1),
          (@roleApproveRole, 'user.role.editApproved', '%', 1),
          (@roleApproveRole, 'user.role.actionFetch', '%', 1),
          (@roleApproveRole, 'user.role.actionInheritedFetch', '%', 1),
          (@roleApproveRole, 'user.actionCategory.fetch', '%', 1),
          (@roleApproveRole, 'user.actorAction.fetch', '%', 1),
          (@roleApproveRole, 'document.document.addApproved', '%', 1), 
          (@roleApproveRole, 'document.document.get', '%', 1),
          (@roleApproveRole, 'document.document.editApproved', '%', 1),
          (@roleApproveRole, 'document.document.edit', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleApproveRole THEN
DELETE;

--Lock / unlock a role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Lock / Unlock Role')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleLockRole = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleLockRole, 'Lock / Unlock Role', 'Lock / Unlock Role', 1, 0, @roleId, 1)     
END
ELSE
     SET @roleLockRole = (SELECT actorId FROM [user].[role] WHERE name = 'Lock / Unlock Role')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@roleLockRole, 'user.admin.nav', '%', 1),
          (@roleLockRole, 'user.role.nav', '%', 1),
          (@roleLockRole, 'user.role.fetch', '%', 1),
          (@roleLockRole, 'user.role.get', '%', 1),
          (@roleLockRole, 'user.role.lock', '%', 1),
          (@roleLockRole, 'user.role.grant', '%', 1),
          (@roleLockRole, 'customer.organization.graphFetch', '%', 1),
          (@roleLockRole, 'policy.policy.fetch', '%', 1),
          (@roleLockRole, 'user.role.assignFetchForRoles', '%', 1),
          (@roleLockRole, 'user.role.actionFetch', '%', 1),
          (@roleLockRole, 'user.role.actionInheritedFetch', '%', 1),
          (@roleLockRole, 'user.actionCategory.fetch', '%', 1),
          (@roleLockRole, 'user.actorAction.fetch', '%', 1),
          (@roleLockRole, 'document.document.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleLockRole THEN
DELETE;

--Delete role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete Role')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleDeleteRole = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleDeleteRole, 'Delete Role', 'Delete Role', 1, 0, @roleId, 1)
END
ELSE
     SET @roleDeleteRole = (SELECT actorId FROM [user].[role] WHERE name = 'Delete Role')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@roleDeleteRole, 'user.admin.nav', '%', 1),
          (@roleDeleteRole, 'user.role.nav', '%', 1),
          (@roleDeleteRole, 'user.role.fetch', '%', 1),
          (@roleDeleteRole, 'user.role.get', '%', 1),
          (@roleDeleteRole, 'user.role.delete', '%', 1),
          (@roleDeleteRole, 'user.role.grant', '%', 1),
          (@roleDeleteRole, 'customer.organization.graphFetch', '%', 1),
          (@roleDeleteRole, 'policy.policy.fetch', '%', 1),
          (@roleDeleteRole, 'user.role.assignFetchForRoles', '%', 1),
          (@roleDeleteRole, 'user.role.actionFetch', '%', 1),
          (@roleDeleteRole, 'user.role.actionInheritedFetch', '%', 1),
          (@roleDeleteRole, 'user.actionCategory.fetch', '%', 1),
          (@roleDeleteRole, 'user.actorAction.fetch', '%', 1),
          (@roleDeleteRole, 'document.document.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleDeleteRole THEN
DELETE;

--Manage users:
--List user
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Users')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @userListUser = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@userListUser, 'List Users', 'List Users', 1, 0, @userId, 1)     
END
ELSE
     SET @userListUser = (SELECT actorId FROM [user].[role] WHERE name = 'List Users')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@userListUser, 'user.admin.nav', '%', 1),
          (@userListUser, 'user.user.nav', '%', 1),
          (@userListUser, 'user.webui.view', '%', 1),
          (@userListUser, 'customer.organization.graphFetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @userListUser THEN
DELETE;

-- permissions with objects
MERGE INTO [user].[roleActionForObjects] AS target
USING
     (VALUES
          (@userListUser, 'user.user.fetch')
     ) AS source (actorId, actionId)
ON target.actorId = source.actorId AND target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId)
VALUES (actorId, actionId);

--View user
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @userViewUser = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@userViewUser, 'View User', 'View User', 1, 0, @userId, 1)     
END
ELSE
     SET @userViewUser = (SELECT actorId FROM [user].[role] WHERE name = 'View User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@userViewUser, 'user.admin.nav', '%', 1),
          (@userViewUser, 'user.user.nav', '%', 1),
          (@userViewUser, 'customer.organization.graphFetch', '%', 1),
          (@userViewUser, 'user.webui.view', '%', 1),
          (@userViewUser, 'policy.policy.fetch', '%', 1),
          (@userViewUser, 'policy.policy.get', '%', 1),
          (@userViewUser, 'policy.ldapPolicy.get', '%', 1),
          (@userViewUser, 'customer.mno.fetch', '%', 1),
          (@userViewUser, 'core.language.fetch', '%', 1),
          (@userViewUser, 'user.role.assignFetch', '%', 1),
          (@userViewUser, 'user.role.possibleFetch', '%', 1),          
          (@userViewUser, 'policy.usernameCredentials.get', '%', 1),
          (@userViewUser, 'user.externalSystemForBU.fetch', '%', 1),
          (@userViewUser, 'user.externalSystemsAndRolesForBUs.fetch', '%', 1),
          (@userViewUser, 'user.externalUser.fetch', '%', 1),          
          (@userViewUser, 'user.externalCredentialsTab.view', '%', 1),
          (@userViewUser, 'document.document.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @userViewUser THEN
DELETE;

-- permissions with objects
MERGE INTO [user].[roleActionForObjects] AS target
USING
     (VALUES
          (@userViewUser, 'user.user.fetch'),
          (@userViewUser, 'user.user.get'),
          (@userViewUser, 'user.role.grantUnapproved'),
          (@userViewUser, 'user.role.grant')
     ) AS source (actorId, actionId)
ON target.actorId = source.actorId AND target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId)
VALUES (actorId, actionId);

--Add user
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @userAddUser = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@userAddUser, 'Add User', 'Add User', 1, 0, @userId, 1)     
END
ELSE
     SET @userAddUser = (SELECT actorId FROM [user].[role] WHERE name = 'Add User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@userAddUser, 'user.admin.nav', '%', 1),
          (@userAddUser, 'user.user.nav', '%', 1),
          (@userAddUser, 'customer.organization.graphFetch', '%', 1),
          (@userAddUser, 'user.webui.view', '%', 1),
          (@userAddUser, 'policy.policy.fetch', '%', 1),
          (@userAddUser, 'policy.policy.get', '%', 1),
          (@userAddUser, 'policy.ldapPolicy.get', '%', 1),
          (@userAddUser, 'customer.mno.fetch', '%', 1),
          (@userAddUser, 'core.language.fetch', '%', 1),
          (@userAddUser, 'bio.scan', '%', 1),
          (@userAddUser, 'bio.add', '%', 1),
          (@userAddUser, 'user.bio.add', '%', 1),
          (@userAddUser, 'user.hash.add', '%', 1),
          (@userAddUser, 'policy.rolesPolicy.get', '%', 1),
          --person.add
          (@userAddUser, 'customer.person.addUnapproved', '%', 1),
          (@userAddUser, 'customer.account.addUnapproved', '%', 1),
          (@userAddUser, 'customer.email.addUnapproved', '%', 1),
          (@userAddUser, 'customer.phone.addUnapproved', '%', 1),
          (@userAddUser, 'customer.address.addUnapproved', '%', 1),
          (@userAddUser, 'user.hash.addUnapproved', '%', 1),
          (@userAddUser, 'user.externalUser.addUnapproved', '%', 1),
          (@userAddUser, 'user.userToExternalUser.addUnapproved', '%', 1),
          --role.grant
          (@userAddUser, 'user.role.assign', '%', 1), -- UI
          (@userAddUser, 'user.role.assignFetch', '%', 1),
          (@userAddUser, 'user.role.possibleFetch', '%', 1),
          --document.add
          (@userAddUser, 'document.document.addUnapproved', '%', 1),
          (@userAddUser, 'document.document.discard', '%', 1),
          (@userAddUser, 'document.document.get', '%', 1),
          --user.user.get
          (@userAddUser, 'customer.person.get', '%', 1),
          (@userAddUser, 'customer.person.getUnapproved', '%', 1),
          (@userAddUser, 'customer.phone.get', '%', 1),
          (@userAddUser, 'customer.address.get', '%', 1),
          (@userAddUser, 'customer.email.get', '%', 1),
          (@userAddUser, 'policy.usernameCredentials.get', '%', 1),
          (@userAddUser, 'user.externalSystemForBU.fetch', '%', 1),
          (@userAddUser, 'user.externalSystemsAndRolesForBUs.fetch', '%', 1),
          (@userAddUser, 'user.externalUser.fetch', '%', 1),
          (@userAddUser, 'user.externalCredentialsTab.view', '%', 1)          
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @userAddUser THEN
DELETE;

-- permissions with objects
MERGE INTO [user].[roleActionForObjects] AS target
USING
     (VALUES
          (@userAddUser, 'user.user.fetch'),
          (@userAddUser, 'user.user.get'),
          (@userAddUser, 'user.user.discard'),
          (@userAddUser, 'user.role.grant'),
          (@userAddUser, 'user.role.grantUnapproved'),
          (@userAddUser, 'user.user.add')
     ) AS source (actorId, actionId)
ON target.actorId = source.actorId AND target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId)
VALUES (actorId, actionId);

--Edit user
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @userEditUser = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@userEditUser, 'Edit User', 'Edit User', 1, 0, @userId, 1)     
END
ELSE
     SET @userEditUser = (SELECT actorId FROM [user].[role] WHERE name = 'Edit User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          (@userEditUser, 'user.admin.nav', '%', 1),
          (@userEditUser, 'user.user.nav', '%', 1),
          (@userEditUser, 'customer.organization.graphFetch', '%', 1),
          (@userEditUser, 'user.webui.view', '%', 1),
          (@userEditUser, 'policy.policy.fetch', '%', 1),
          (@userEditUser, 'policy.policy.get', '%', 1),
          (@userEditUser, 'policy.ldapPolicy.get', '%', 1),
          (@userEditUser, 'customer.mno.fetch', '%', 1),
          (@userEditUser, 'core.language.fetch', '%', 1),
          (@userEditUser, 'bio.scan', '%', 1),
          (@userEditUser, 'bio.add', '%', 1),
          (@userEditUser, 'user.bio.add', '%', 1),
          (@userEditUser, 'user.hash.add', '%', 1),
          (@userEditUser, 'policy.rolesPolicy.get', '%', 1),
          --person.edit
          (@userEditUser, 'customer.person.editUnapproved', '%', 1),
          (@userEditUser, 'customer.account.editUnapproved', '%', 1),
          (@userEditUser, 'customer.email.editUnapproved', '%', 1),
          (@userEditUser, 'customer.phone.editUnapproved', '%', 1),
          (@userEditUser, 'customer.address.editUnapproved', '%', 1),
          (@userEditUser, 'user.hash.editUnapproved', '%', 1),
          (@userEditUser, 'user.userToExternalUser.editUnapproved', '%', 1),
          --role.grant
          (@userEditUser, 'user.role.assign', '%', 1),
          (@userEditUser, 'user.role.assignFetch', '%', 1),
          (@userEditUser, 'user.role.possibleFetch', '%', 1),
          --document.edit
          (@userEditUser, 'document.document.editUnapproved', '%', 1),
          (@userEditUser, 'document.document.discard', '%', 1),
          --user.user.get
          (@userEditUser, 'customer.person.get', '%', 1),
          (@userEditUser, 'customer.person.getUnapproved', '%', 1),
          (@userEditUser, 'customer.phone.get', '%', 1),
          (@userEditUser, 'customer.address.get', '%', 1),
          (@userEditUser, 'customer.email.get', '%', 1),
          (@userEditUser, 'document.document.get', '%', 1),
          (@userEditUser, 'policy.usernameCredentials.get', '%', 1),
          (@userEditUser, 'user.externalSystemForBU.fetch', '%', 1),
          (@userEditUser, 'user.externalSystemsAndRolesForBUs.fetch', '%', 1),
          (@userEditUser, 'user.externalUser.fetch', '%', 1),
          (@userEditUser, 'user.externalCredentialsTab.view', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @userEditUser THEN
DELETE;

-- permissions with objects
MERGE INTO [user].[roleActionForObjects] AS target
USING
     (VALUES
          (@userEditUser, 'user.user.fetch'),
          (@userEditUser, 'user.user.get'),
          (@userEditUser, 'user.user.discard'),
          (@userEditUser, 'user.user.edit'),
          (@userEditUser, 'user.role.grant'),
          (@userEditUser, 'user.role.grantUnapproved')
     ) AS source (actorId, actionId)
ON target.actorId = source.actorId AND target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId)
VALUES (actorId, actionId);

--Delete user
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @userDeleteUser = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@userDeleteUser, 'Delete User', 'Delete User', 1, 0, @userId, 1)     
END
ELSE
     SET @userDeleteUser = (SELECT actorId FROM [user].[role] WHERE name = 'Delete User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@userDeleteUser, 'user.admin.nav', '%', 1),
          (@userDeleteUser, 'user.user.nav', '%', 1),
          (@userDeleteUser, 'customer.organization.graphFetch', '%', 1),
          (@userDeleteUser, 'user.webui.view', '%', 1),
          (@userDeleteUser, 'policy.policy.fetch', '%', 1),
          (@userDeleteUser, 'policy.policy.get', '%', 1),
          (@userDeleteUser, 'policy.ldapPolicy.get', '%', 1),
          (@userDeleteUser, 'customer.mno.fetch', '%', 1),
          (@userDeleteUser, 'core.language.fetch', '%', 1),
          (@userDeleteUser, 'user.role.assignFetch', '%', 1),
          (@userDeleteUser, 'user.role.possibleFetch', '%', 1),
          (@userDeleteUser, 'policy.usernameCredentials.get', '%', 1),
          (@userDeleteUser, 'user.externalSystemForBU.fetch', '%', 1),
          (@userDeleteUser, 'user.externalSystemsAndRolesForBUs.fetch', '%', 1),
          (@userDeleteUser, 'user.externalUser.fetch', '%', 1),
          (@userDeleteUser, 'user.externalCredentialsTab.view', '%', 1),
          (@userDeleteUser, 'document.document.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @userDeleteUser THEN
DELETE;

-- permissions with objects
MERGE INTO [user].[roleActionForObjects] AS target
USING
     (VALUES
          (@userDeleteUser, 'user.user.fetch'),
          (@userDeleteUser, 'user.user.get'),
          (@userDeleteUser, 'user.user.delete'),
          (@userDeleteUser, 'user.role.grant'),
          (@userDeleteUser, 'user.role.grantUnapproved')
     ) AS source (actorId, actionId)
ON target.actorId = source.actorId AND target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId)
VALUES (actorId, actionId);

--Lock / unlock user
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Lock / Unlock User')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @userLockUser = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@userLockUser, 'Lock / Unlock User', 'Lock / Unlock User', 1, 0, @userId, 1)     
END
ELSE
     SET @userLockUser = (SELECT actorId FROM [user].[role] WHERE name = 'Lock / Unlock User')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          (@userLockUser, 'user.admin.nav', '%', 1),
          (@userLockUser, 'user.user.nav', '%', 1),
          (@userLockUser, 'customer.organization.graphFetch', '%', 1),
          (@userLockUser, 'user.webui.view', '%', 1),
          (@userLockUser, 'policy.policy.fetch', '%', 1),
          (@userLockUser, 'policy.policy.get', '%', 1),
          (@userLockUser, 'policy.ldapPolicy.get', '%', 1),
          (@userLockUser, 'customer.mno.fetch', '%', 1),
          (@userLockUser, 'core.language.fetch', '%', 1),
          (@userLockUser, 'user.role.assignFetch', '%', 1),
          (@userLockUser, 'user.role.possibleFetch', '%', 1),
          (@userLockUser, 'policy.usernameCredentials.get', '%', 1),
          (@userLockUser, 'user.externalSystemForBU.fetch', '%', 1),
          (@userLockUser, 'user.externalSystemsAndRolesForBUs.fetch', '%', 1),
          (@userLockUser, 'user.externalUser.fetch', '%', 1),
          (@userLockUser, 'user.externalCredentialsTab.view', '%', 1),
          (@userLockUser, 'document.document.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @userLockUser THEN
DELETE;

-- permissions with objects
MERGE INTO [user].[roleActionForObjects] AS target
USING
     (VALUES
          (@userLockUser, 'user.user.fetch'),
          (@userLockUser, 'user.user.get'),
          (@userLockUser, 'user.user.lock'),
          (@userLockUser, 'user.role.grant'),
          (@userLockUser, 'user.role.grantUnapproved')
     ) AS source (actorId, actionId)
ON target.actorId = source.actorId AND target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId)
VALUES (actorId, actionId);

--Clear unsuccessful login attempts
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Clear Unsuccessful Login Attempts')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @userClear = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@userClear, 'Clear Unsuccessful Login Attempts', 'Clear Unsuccessful Login Attempts', 1, 0, @userId, 1)     
END
ELSE
     SET @userClear = (SELECT actorId FROM [user].[role] WHERE name = 'Clear Unsuccessful Login Attempts')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@userClear, 'user.admin.nav', '%', 1),
          (@userClear, 'user.user.nav', '%', 1),
          (@userClear, 'customer.organization.graphFetch', '%', 1),
          (@userClear, 'user.webui.view', '%', 1),
          (@userClear, 'policy.policy.fetch', '%', 1),
          (@userClear, 'policy.policy.get', '%', 1),
          (@userClear, 'policy.ldapPolicy.get', '%', 1),
          (@userClear, 'customer.mno.fetch', '%', 1),
          (@userClear, 'core.language.fetch', '%', 1),
          (@userClear, 'user.role.assignFetch', '%', 1),
          (@userClear, 'user.role.possibleFetch', '%', 1),
          (@userClear, 'policy.usernameCredentials.get', '%', 1),
          (@userClear, 'user.externalSystemForBU.fetch', '%', 1),
          (@userClear, 'user.externalSystemsAndRolesForBUs.fetch', '%', 1),
          (@userClear, 'user.externalUser.fetch', '%', 1),
          (@userClear, 'user.externalCredentialsTab.view', '%', 1),
          (@userClear, 'document.document.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @userClear THEN
DELETE;

-- permissions with objects
MERGE INTO [user].[roleActionForObjects] AS target
USING
     (VALUES
          (@userClear, 'user.user.fetch'),
          (@userClear, 'user.user.get'),
          (@userClear, 'user.hash.clearAttempts'),          
          (@userClear, 'user.role.grant'),
          (@userClear, 'user.role.grantUnapproved')
     ) AS source (actorId, actionId)
ON target.actorId = source.actorId AND target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId)
VALUES (actorId, actionId);

--Authorize changes (Approve/Reject)
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Authorize Changes (Approve/Reject)')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @userApproveUser = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@userApproveUser, 'Authorize Changes (Approve/Reject)', 'Authorize Changes (Approve/Reject)', 1, 0, @userId, 1)     
END
ELSE
     SET @userApproveUser = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Changes (Approve/Reject)')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@userApproveUser, 'user.admin.nav', '%', 1),
          (@userApproveUser, 'user.user.nav', '%', 1),
          (@userApproveUser, 'customer.organization.graphFetch', '%', 1),
          (@userApproveUser, 'user.webui.view', '%', 1),
          (@userApproveUser, 'policy.policy.fetch', '%', 1),
          (@userApproveUser, 'policy.policy.get', '%', 1),
          (@userApproveUser, 'policy.ldapPolicy.get', '%', 1),
          (@userApproveUser, 'customer.mno.fetch', '%', 1),
          (@userApproveUser, 'core.language.fetch', '%', 1),          
          (@userApproveUser, 'user.user.addApproved', '%', 1),
          (@userApproveUser, 'user.user.editApproved', '%', 1),
          (@userApproveUser, 'policy.rolesPolicy.get', '%', 1),
          --person.add/edit
          (@userApproveUser, 'customer.person.add', '%', 1),
          (@userApproveUser, 'customer.account.add', '%', 1),
          (@userApproveUser, 'customer.email.add', '%', 1),
          (@userApproveUser, 'customer.phone.add', '%', 1),
          (@userApproveUser, 'customer.address.add', '%', 1),
          (@userApproveUser, 'user.hash.add', '%', 1),
          --person.edit
          (@userApproveUser, 'customer.person.edit', '%', 1),
          (@userApproveUser, 'customer.account.edit', '%', 1),
          (@userApproveUser, 'customer.email.edit', '%', 1),
          (@userApproveUser, 'customer.phone.edit', '%', 1),
          (@userApproveUser, 'customer.address.edit', '%', 1),
          (@userApproveUser, 'user.hash.update', '%', 1),
          (@userApproveUser, 'user.userToExternalUser.edit', '%', 1),
          --role.grant
          (@userApproveUser, 'user.role.assignFetch', '%', 1),
          (@userApproveUser, 'user.role.possibleFetch', '%', 1),
          --document.add
          (@userApproveUser, 'document.document.add', '%', 1),
          (@userApproveUser, 'document.document.edit', '%', 1),
          (@userApproveUser, 'document.document.addApproved', '%', 1),
          (@userApproveUser, 'document.document.get', '%', 1),
          (@userApproveUser, 'document.document.editApproved', '%', 1),
          --user.user.get
          (@userApproveUser, 'customer.person.get', '%', 1),
          (@userApproveUser, 'customer.phone.get', '%', 1),
          (@userApproveUser, 'customer.address.get', '%', 1),
          (@userApproveUser, 'customer.email.get', '%', 1),
          (@userApproveUser, 'policy.usernameCredentials.get', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @userApproveUser THEN
DELETE;

-- permissions with objects
MERGE INTO [user].[roleActionForObjects] AS target
USING
     (VALUES
          (@userApproveUser, 'user.user.fetch'),
          (@userApproveUser, 'user.user.get'),
          (@userApproveUser, 'user.role.grant'),
          (@userApproveUser, 'user.role.grantUnapproved'),
          (@userApproveUser, 'user.user.approve'),
          (@userApproveUser, 'user.user.reject')
     ) AS source (actorId, actionId)
ON target.actorId = source.actorId AND target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId)
VALUES (actorId, actionId);

--Manage business units:
--List business unit
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Business Units')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @buList = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@buList, 'List Business Units', 'List Business Units', 1, 0, @buId, 1)     
END
ELSE
     SET @buList = (SELECT actorId FROM [user].[role] WHERE name = 'List Business Units')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@buList, 'customer.organization.nav', '%', 1),
          (@buList, 'customer.bu.nav', '%', 1),
          (@buList, 'customer.organization.fetch', '%', 1),
          (@buList, 'customer.organization.graphFetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--View business unit
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Business Unit')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @buView = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@buView, 'View Business Unit', 'View Business Unit', 1, 0, @buId, 1)     
END
ELSE
     SET @buView = (SELECT actorId FROM [user].[role] WHERE name = 'View Business Unit')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@buView, 'customer.organization.nav', '%', 1),
          (@buView, 'customer.bu.nav', '%', 1),
          (@buView, 'customer.organization.fetch', '%', 1),
          (@buView, 'customer.organization.graphFetch', '%', 1),
          (@buView, 'user.role.assignFetch', '%', 1),
          (@buView, 'user.role.grant', '%', 1),
          (@buView, 'customer.organization.get', '%', 1),
          (@buView, 'core.cbs.fetch', '%', 1),
          (@buView, 'customer.country.fetch', '%', 1),
          (@buView, 'core.language.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Add business unit
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add Business Unit')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @buAdd = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@buAdd, 'Add Business Unit', 'Add Business Unit', 1, 0, @buId, 1)     
END
ELSE
     SET @buAdd = (SELECT actorId FROM [user].[role] WHERE name = 'Add Business Unit')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@buAdd, 'customer.organization.nav', '%', 1),
          (@buAdd, 'customer.bu.nav', '%', 1),
          (@buAdd, 'customer.organization.fetch', '%', 1),
          (@buAdd, 'customer.organization.graphFetch', '%', 1),
          (@buAdd, 'user.role.assign', '%', 1),
          (@buAdd, 'user.role.assignFetch', '%', 1),
          (@buAdd, 'user.role.grant', '%', 1),
          (@buAdd, 'customer.organization.get', '%', 1),
          (@buAdd, 'core.cbs.fetch', '%', 1),
          (@buAdd, 'customer.country.fetch', '%', 1),
          (@buAdd, 'core.language.fetch', '%', 1),
          (@buAdd, 'customer.organization.add', '%', 1),
          (@buAdd, 'customer.organization.discard', '%', 1),
          (@buAdd, 'core.actorHierarchy.addUnapproved', '%', 1),
          (@buAdd, 'customer.email.addUnapproved', '%', 1),
          (@buAdd, 'customer.phone.addUnapproved', '%', 1),
          (@buAdd, 'customer.address.addUnapproved', '%', 1),
          (@buAdd, 'user.role.grantUnapproved', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Edit business unit
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit Business Unit')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @buEdit = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@buEdit, 'Edit Business Unit', 'Edit Business Unit', 1, 0, @buId, 1)     
END
ELSE
     SET @buEdit = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Business Unit')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@buEdit, 'customer.organization.nav', '%', 1),
          (@buEdit, 'customer.bu.nav', '%', 1),
          (@buEdit, 'customer.organization.fetch', '%', 1),
          (@buEdit, 'customer.organization.graphFetch', '%', 1),
          (@buEdit, 'user.role.assign', '%', 1),
          (@buEdit, 'user.role.assignFetch', '%', 1),
          (@buEdit, 'user.role.grant', '%', 1),
          (@buEdit, 'user.role.grantUnapproved', '%', 1),
          (@buEdit, 'customer.organization.get', '%', 1),
          (@buEdit, 'core.cbs.fetch', '%', 1),
          (@buEdit, 'customer.country.fetch', '%', 1),
          (@buEdit, 'core.language.fetch', '%', 1),
          (@buEdit, 'customer.organization.edit', '%', 1),
          (@buEdit, 'db/customer.organization.edit', '%', 1),
          (@buEdit, 'customer.organization.discard', '%', 1),
          (@buEdit, 'customer.email.editUnapproved', '%', 1),
          (@buEdit, 'customer.phone.editUnapproved', '%', 1),
          (@buEdit, 'customer.address.editUnapproved', '%', 1),
          (@buEdit, 'user.visibility.check', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Delete business unit
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete Business Unit')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @buDelete = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@buDelete, 'Delete Business Unit', 'Delete Business Unit', 1, 0, @buId, 1)     
END
ELSE
     SET @buDelete = (SELECT actorId FROM [user].[role] WHERE name = 'Delete Business Unit')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@buDelete, 'customer.organization.nav', '%', 1),
          (@buDelete, 'customer.bu.nav', '%', 1),
          (@buDelete, 'customer.organization.fetch', '%', 1),
          (@buDelete, 'customer.organization.graphFetch', '%', 1),
          (@buDelete, 'user.role.assignFetch', '%', 1),
          (@buDelete, 'user.role.grant', '%', 1),
          (@buDelete, 'customer.organization.get', '%', 1),
          (@buDelete, 'core.cbs.fetch', '%', 1),
          (@buDelete, 'customer.country.fetch', '%', 1),
          (@buDelete, 'core.language.fetch', '%', 1),
          (@buDelete, 'customer.organization.delete', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Lock / unlock business unit
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Lock / Unlock Business Unit')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @buLock = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@buLock, 'Lock / Unlock Business Unit', 'Lock / Unlock Business Unit', 1, 0, @buId, 1)     
END
ELSE
     SET @buLock = (SELECT actorId FROM [user].[role] WHERE name = 'Lock / Unlock Business Unit')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@buLock, 'customer.organization.nav', '%', 1),
          (@buLock, 'customer.bu.nav', '%', 1),
          (@buLock, 'customer.organization.fetch', '%', 1),
          (@buLock, 'customer.organization.graphFetch', '%', 1),
          (@buLock, 'user.role.assignFetch', '%', 1),
          (@buLock, 'user.role.grant', '%', 1),
          (@buLock, 'customer.organization.get', '%', 1),
          (@buLock, 'core.cbs.fetch', '%', 1),
          (@buLock, 'customer.country.fetch', '%', 1),
          (@buLock, 'core.language.fetch', '%', 1),
          (@buLock, 'customer.organization.lock', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Authorize changes (Approve/Reject)
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Authorize Business Unit Changes (Approve/Reject)')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @buApprove = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@buApprove, 'Authorize Business Unit Changes (Approve/Reject)', 'Authorize Business Unit Changes (Approve/Reject)', 1, 0, @buId, 1)     
END
ELSE
     SET @buApprove = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Business Unit Changes (Approve/Reject)')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@buApprove, 'customer.organization.nav', '%', 1),
          (@buApprove, 'customer.bu.nav', '%', 1),
          (@buApprove, 'customer.organization.fetch', '%', 1),
          (@buApprove, 'customer.organization.graphFetch', '%', 1),
          (@buApprove, 'user.role.assignFetch', '%', 1),
          (@buApprove, 'user.role.grant', '%', 1),
          (@buApprove, 'customer.organization.get', '%', 1),
          (@buApprove, 'core.cbs.fetch', '%', 1),
          (@buApprove, 'customer.country.fetch', '%', 1),
          (@buApprove, 'core.language.fetch', '%', 1),
          (@buApprove, 'customer.organization.approve', '%', 1),
          (@buApprove, 'customer.organization.reject', '%', 1),
          (@buApprove, 'customer.organization.addApproved', '%', 1),
          (@buApprove, 'customer.organization.editApproved', '%', 1),
          --organization.add/edit
          (@buApprove, 'core.actorHierarchy.add', '%', 1),
          (@buApprove, 'customer.email.add', '%', 1),
          (@buApprove, 'customer.phone.add', '%', 1),
          (@buApprove, 'customer.address.add', '%', 1),
          --organization.edit
          (@buApprove, 'customer.email.edit', '%', 1),
          (@buApprove, 'customer.phone.edit', '%', 1),
          (@buApprove, 'customer.address.edit', '%', 1),
          --get
          (@buApprove, 'customer.phone.get', '%', 1),
          (@buApprove, 'customer.address.get', '%', 1),
          (@buApprove, 'customer.email.get', '%', 1),
          (@buApprove, 'customer.organizationHierarchyFlat.rebuild', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Manage permissions:
--List permissions
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Permissions')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionList = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionList, 'List Permissions', 'List Permissions', 1, 0, @permissionId, 1)     
END
ELSE
     SET @permissionList = (SELECT actorId FROM [user].[role] WHERE name = 'List Permissions')
 
MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@permissionList, 'user.admin.nav', '%', 1),
          (@permissionList, 'user.permissions.nav', '%', 1),
          (@permissionList, 'user.actionCategory.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
 
--View role permissions
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Role Permissions')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionView = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionView, 'View Role Permissions', 'View Role Permissions', 1, 0, @permissionId, 1)     
END
ELSE
     SET @permissionView = (SELECT actorId FROM [user].[role] WHERE name = 'View Role Permissions')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@permissionView, 'user.admin.nav', '%', 1),
          (@permissionView, 'user.permissions.nav', '%', 1),
          (@permissionView, 'user.actionCategory.fetch', '%', 1),
          (@permissionView, 'user.role.fetch', '%', 1),
          (@permissionView, 'user.actorAction.fetch', '%', 1),
          (@permissionView, 'customer.organization.graphFetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]); 
 
--Update role permissions
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Update Role Permissions')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionUpdate = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionUpdate, 'Update Role Permissions', 'Update Role Permissions', 1, 0, @permissionId, 1)     
END
ELSE
     SET @permissionUpdate = (SELECT actorId FROM [user].[role] WHERE name = 'Update Role Permissions')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@permissionUpdate, 'user.admin.nav', '%', 1),
          (@permissionUpdate, 'user.permissions.nav', '%', 1),
          (@permissionUpdate, 'user.actionCategory.fetch', '%', 1),
          (@permissionUpdate, 'user.role.fetch', '%', 1),
          (@permissionUpdate, 'user.actorAction.fetch', '%', 1),
          (@permissionUpdate, 'user.actorAction.update', '%', 1),
          (@permissionUpdate, 'customer.organization.graphFetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]); 
 
--Manage Access Policy
--List Access Policies
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'List Access Policies')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @policyList = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@policyList, 'List Access Policies', 'List Access Policies', 1, 0, @accessPolicyId, 1)     
END
ELSE
     SET @policyList = (SELECT actorId FROM [user].[role] WHERE name = 'List Access Policies')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@policyList, 'user.admin.nav', '%', 1),
          (@policyList, 'user.access.nav', '%', 1),
          (@policyList, 'policy.policy.fetch', '%', 1),
          (@policyList, 'policy.policy.channelsGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]); 
 
--View Access Policy
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Access Policy')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @policyView = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@policyView, 'View Access Policy', 'View Access Policy', 1, 0, @accessPolicyId, 1)     
END
ELSE
     SET @policyView = (SELECT actorId FROM [user].[role] WHERE name = 'View Access Policy')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@policyView, 'user.admin.nav', '%', 1),
          (@policyView, 'user.access.nav', '%', 1),
          (@policyView, 'policy.policy.fetch', '%', 1),
          (@policyView, 'policy.policy.get', '%', 1),
          (@policyView, 'policy.policy.uniqueFieldsGet', '%', 1),
          (@policyView, 'policy.policy.functionsGet', '%', 1),
          (@policyView, 'policy.policy.channelsGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
 
--Add Access Policy
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add Access Policy')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @policyAdd = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@policyAdd, 'Add Access Policy', 'Add Access Policy', 1, 0, @accessPolicyId, 1)     
END
ELSE
     SET @policyAdd = (SELECT actorId FROM [user].[role] WHERE name = 'Add Access Policy')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@policyAdd, 'user.admin.nav', '%', 1),
          (@policyAdd, 'user.access.nav', '%', 1),
          (@policyAdd, 'policy.policy.fetch', '%', 1),
          (@policyAdd, 'policy.policy.get', '%', 1),
          (@policyAdd, 'policy.policy.add', '%', 1),
          (@policyAdd, 'policy.policy.uniqueFieldsGet', '%', 1),
          (@policyAdd, 'policy.policy.functionsGet', '%', 1),
          (@policyAdd, 'policy.policy.channelsGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Edit Access Policy
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Edit Access Policy')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @policyEdit = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@policyEdit, 'Edit Access Policy', 'Edit Access Policy', 1, 0, @accessPolicyId, 1)     
END
ELSE
     SET @policyEdit = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Access Policy')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@policyEdit, 'user.admin.nav', '%', 1),
          (@policyEdit, 'user.access.nav', '%', 1),
          (@policyEdit, 'policy.policy.fetch', '%', 1),
          (@policyEdit, 'policy.policy.get', '%', 1),
          (@policyEdit, 'policy.policy.edit', '%', 1),
          (@policyEdit, 'policy.policy.uniqueFieldsGet', '%', 1),
          (@policyEdit, 'policy.policy.functionsGet', '%', 1),
          (@policyEdit, 'policy.policy.channelsGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Delete Access Policy
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Delete Access Policy')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @policyDelete = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@policyDelete, 'Delete Access Policy', 'Delete Access Policy', 1, 0, @accessPolicyId, 1)     
END
ELSE
     SET @policyDelete = (SELECT actorId FROM [user].[role] WHERE name = 'Delete Access Policy')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
          (@policyDelete, 'user.admin.nav', '%', 1),
          (@policyDelete, 'user.access.nav', '%', 1),
          (@policyDelete, 'policy.policy.fetch', '%', 1),
          (@policyDelete, 'policy.policy.get', '%', 1),
          (@policyDelete, 'policy.policy.delete', '%', 1),
          (@policyDelete, 'policy.policy.uniqueFieldsGet', '%', 1),
          (@policyDelete, 'policy.policy.functionsGet', '%', 1),
          (@policyDelete, 'policy.policy.channelsGet', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--KYC View role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'KYC View')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @kycView = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@kycView, 'KYC View', 'KYC View Role', 1, 0, @kycMangementId, 1)     
END
ELSE
     SET @kycView = (SELECT actorId FROM [user].[role] WHERE name = 'KYC View')

MERGE INTO [user].actorAction AS target
USING
     (VALUES
          (@kycView, 'rule.rule.nav', '%', 1),
          (@kycView, 'customer.organization.getByDepth', '%', 1),
          (@kycView, 'customer.kycAttribute.list', '%', 1),
          (@kycView, 'customer.kyc.get', '%', 1),
          (@kycView, 'customer.kyc.fetch', '%', 1),
          (@kycView, 'customer.organization.graphFetch', '%', 1),
          (@kycView, 'customer.type.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--KYC Add role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'KYC Add')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @kycAdd = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@kycAdd, 'KYC Add', 'KYC Add', 1, 0, @kycMangementId, 1)     
END
ELSE
     SET @kycAdd = (SELECT actorId FROM [user].[role] WHERE name = 'KYC Add')

MERGE INTO [user].actorAction AS target
USING
     (VALUES  
          (@kycAdd, 'rule.rule.nav', '%', 1),
          (@kycAdd, 'customer.organization.getByDepth', '%', 1),
          (@kycAdd, 'customer.kyc.get', '%', 1),
          (@kycAdd, 'customer.kycAttribute.list', '%', 1),
          (@kycAdd, 'customer.kyc.fetch', '%', 1),
          (@kycAdd, 'customer.kyc.add', '%', 1),
          (@kycAdd, 'customer.kyc.getForCreate', '%', 1),
          (@kycAdd, 'customer.organization.graphFetch', '%', 1),
          (@kycAdd, 'customer.type.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--KYC Edit role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'KYC Edit')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @kycEdit = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@kycEdit, 'KYC Edit', 'KYC Edit', 1, 0, @kycMangementId, 1)     
END
ELSE
     SET @kycEdit = (SELECT actorId FROM [user].[role] WHERE name = 'KYC Edit')

MERGE INTO [user].actorAction AS target
USING
     (VALUES  
          (@kycEdit, 'rule.rule.nav', '%', 1),
          (@kycEdit, 'customer.organization.getByDepth', '%', 1),
          (@kycEdit, 'customer.kycAttribute.list', '%', 1),
          (@kycEdit, 'customer.kyc.get', '%', 1),
          (@kycEdit, 'customer.kyc.fetch', '%', 1),
          (@kycEdit, 'customer.kyc.edit', '%', 1),
          (@kycEdit, 'customer.organization.graphFetch', '%', 1),
          (@kycEdit, 'customer.type.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--KYC Delete role 
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'KYC Delete')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @kycDelete = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@kycDelete, 'KYC Delete', 'KYC Delete', 1, 0, @kycMangementId, 1)     
END
ELSE
     SET @kycDelete = (SELECT actorId FROM [user].[role] WHERE name = 'KYC Delete')

MERGE INTO [user].actorAction AS target
USING
     (VALUES  
          (@kycDelete, 'rule.rule.nav', '%', 1),
          (@kycDelete, 'customer.organization.getByDepth', '%', 1),
          (@kycDelete, 'customer.kycAttribute.list', '%', 1),
          (@kycDelete, 'customer.kyc.get', '%', 1),
          (@kycDelete, 'customer.kyc.fetch', '%', 1),
          (@kycDelete, 'customer.kyc.delete', '%', 1),
          (@kycDelete, 'customer.organization.graphFetch', '%', 1),
          (@kycDelete, 'customer.type.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--KYC Activate/Deactivate role 
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'KYC Activate/Deactivate')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @kycActivate = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@kycActivate, 'KYC Activate/Deactivate', 'KYC Activate/Deactivate', 1, 0, @kycMangementId, 1)     
END
ELSE
     SET @kycActivate = (SELECT actorId FROM [user].[role] WHERE name = 'KYC Activate/Deactivate')

MERGE INTO [user].actorAction AS target
USING
     (VALUES  
          (@kycActivate, 'rule.rule.nav', '%', 1),
          (@kycActivate, 'customer.organization.getByDepth', '%', 1),
          (@kycActivate, 'customer.kycAttribute.list', '%', 1),
          (@kycActivate, 'customer.kyc.get', '%', 1),
          (@kycActivate, 'customer.kyc.fetch', '%', 1),          
          (@kycActivate, 'customer.kyc.changeStatus', '%', 1),
          (@kycActivate, 'customer.organization.graphFetch', '%', 1),
          (@kycActivate, 'customer.type.fetch', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);


--Manage documents:
--Archive document
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Archive Document')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleArchiveDocument = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleArchiveDocument, 'Archive Document', 'Archive Document', 1, 0, @documentMangementId, 1)     
END
ELSE
     SET @roleArchiveDocument = (SELECT actorId FROM [user].[role] WHERE name = 'Archive Document')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          (@roleArchiveDocument, 'document.document.discard', '%', 1),
          (@roleArchiveDocument, 'document.document.get', '%', 1),
          (@roleArchiveDocument, 'document.document.editUnapproved', '%', 1),
          (@roleArchiveDocument, 'document.document.edit', '%', 1),
          (@roleArchiveDocument, 'document.documentTypeClass.fetch', '%', 1),
          (@roleArchiveDocument, 'document.document.archive', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleArchiveDocument THEN
DELETE;

--View achived document
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'View Archived Document')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @roleViewArchivedDocument = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@roleViewArchivedDocument, 'View Archived Document', 'View Archived Document', 1, 0, @documentMangementId, 1)     
END
ELSE
     SET @roleViewArchivedDocument = (SELECT actorId FROM [user].[role] WHERE name = 'View Archived Document')

MERGE INTO [user].actorAction AS target
USING
     (VALUES 
          (@roleViewArchivedDocument, 'document.document.get', '%', 1),
          (@roleViewArchivedDocument, 'document.documentTypeClass.fetch', '%', 1),
          (@roleViewArchivedDocument, 'document.document.viewArchive', '%', 1)
     ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
     INSERT (actorId, actionId, objectId, [level])
     VALUES (actorId, actionId, objectId, [level])
WHEN NOT MATCHED BY source AND target.actorId = @roleViewArchivedDocument THEN
DELETE;
