DECLARE @userMakerAdmin bigint, @userChecker bigint, @contentAdmin bigint, @roleMakerAdmin BIGINT, @roleChecker BIGINT
DECLARE @kycViewer bigint, @kycManager bigint,  @buMaker bigint, @buChecker bigint, @auditor bigint
DECLARE @sg bigint = (select actorId from customer.organization where organizationName = 'IBL')
DECLARE @enLanguageId int = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en')
DECLARE @passPolicyId int = (select policyID from policy.policy where name = 'STD')
DECLARE @userAddUser BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Add user' AND isSystem = 1)
DECLARE @userDeleteUser BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Delete user' AND isSystem = 1)
DECLARE @userEditUser BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Edit user' AND isSystem = 1)
DECLARE @userLockUser BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Lock / unlock user' AND isSystem = 1)
DECLARE @userApproveUser BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize changes (Approve/Reject)' AND isSystem = 1)
DECLARE @userClear BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Clear unsuccessful login attempts' AND isSystem = 1)
DECLARE @roleAdd BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Add Role' AND isSystem = 1)
DECLARE @roleDelete BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Delete Role' AND isSystem = 1)
DECLARE @roleEdit BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Role' AND isSystem = 1)
DECLARE @roleLock BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Lock / Unlock Role' AND isSystem = 1)
DECLARE @roleApprove BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Role Changes (Approve/Reject)' AND isSystem = 1)
DECLARE @kycView BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'KYC View' AND isSystem = 1)
DECLARE @kycAdd BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'KYC Add' AND isSystem = 1)
DECLARE @kycEdit BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'KYC Edit' AND isSystem = 1)
DECLARE @kycDelete BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'KYC Delete' AND isSystem = 1)
DECLARE @kycActivate BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'KYC Activate/Deactivate' AND isSystem = 1)
DECLARE @buAdd BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Add Business Unit' AND isSystem = 1)
DECLARE @buEdit BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Edit Business Unit' AND isSystem = 1)
DECLARE @buDelete BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Delete Business Unit' AND isSystem = 1)
DECLARE @buLock BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Lock / Unlock Business Unit' AND isSystem = 1)
DECLARE @buApprove BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Authorize Business Unit Changes (Approve/Reject)' AND isSystem = 1)
DECLARE @auditConfiguration BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'View/Edit Audit Log  Configuration' AND isSystem = 1)
DECLARE @auditReport BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'View Audit Log Report' AND isSystem = 1)
DECLARE @SA bigint = (select actorId from [user].hash where identifier = 'sa' and type = 'password')
DECLARE @anonymous bigint = (select actorId from [user].hash where identifier = 'anonymous' and type = 'password')
-- add permissions to BU Software Group
MERGE INTO [user].actorAction AS target
USING
    (VALUES        
        (@sg, 'core.language.fetch', N'%', 1),
        (@sg, 'core.itemTranslation.fetch', N'%', 1),
		(@sg, 'core.translation.fetch', N'%', 1),
        (@sg, 'user.user.languageChange', N'%', 1),
        (@sg, 'user.details.get', N'%', 1),
        (@sg, 'customer.phone.get', N'%', 1),
        (@sg, 'identity.changePassword', N'%', 1),
        (@sg, 'user.changePassword', N'%', 1),
        (@sg, 'user.identity.get', N'%', 1),
        (@sg, 'core.externalSystemByName.get', N'%', 1),
        (@sg, 'user.externalUserForLoggedUser.update', N'%', 1),
        (@sg, 'user.identity.checkPolicy', N'%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- add BU to ananomous user
IF NOT EXISTS(SELECT * FROM core.actorHierarchy WHERE [subject] = @anonymous AND predicate = 'memberOf' AND [object] = @sg)
    INSERT INTO core.actorHierarchy([subject], predicate, [object]) VALUES(@anonymous, 'memberOf', @sg)
-- add BU to SA user
IF NOT EXISTS(SELECT * FROM core.actorHierarchy WHERE [subject] = @SA AND predicate = 'memberOf' AND [object] = @sg)
    INSERT INTO core.actorHierarchy([subject], predicate, [object]) VALUES(@SA, 'memberOf', @sg)
IF (SELECT primaryLanguageId FROM [user].[user] WHERE actorId = @SA) IS NULL
BEGIN
    UPDATE u
    SET primaryLanguageId = @enLanguageId
    FROM [user].[user] u
    WHERE actorId = @SA
END

IF NOT EXISTS(SELECT * FROM [policy].[actorPolicy] WHERE actorId = @SA)
BEGIN
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@SA, @passPolicyId)
END
---------PREDEFINED ROLES
--define maker role
if NOT EXISTS(select * from [user].[role] where name = 'UserMakerAdmin')
BEGIN
    insert into core.actor(actorType, isEnabled) values('role', 1)
    set @userMakerAdmin = SCOPE_IDENTITY()
    insert into [user].[role](actorId, name, description, isEnabled, isDeleted) values(@userMakerAdmin, 'UserMakerAdmin', 'role for user admin module', 1, 0)
END
else
    set @userMakerAdmin = (select actorId from [user].[role] where name = 'UserMakerAdmin')

--define checker role
if NOT EXISTS(select * from [user].[role] where name = 'UserCheckerAdmin')
BEGIN
    insert into core.actor(actorType, isEnabled) values('role', 1)
    set @userChecker = SCOPE_IDENTITY()
    insert into [user].[role](actorId, name, description, isEnabled, isDeleted) values(@userChecker, 'UserCheckerAdmin', 'role for user admin module (Checker)', 1, 0)
END
else
    set @userChecker = (select actorId from [user].[role] where name = 'UserCheckerAdmin')

--define role maker role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'RoleMakerAdmin')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleMakerAdmin = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@roleMakerAdmin, 'RoleMakerAdmin', 'role for role admin module (Maker)', 1, 0)
END
ELSE
    SET @roleMakerAdmin = (SELECT actorId FROM [user].[role] WHERE name = 'RoleMakerAdmin')

--define role checker role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'RoleCheckerAdmin')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @roleChecker = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@roleChecker, 'RoleCheckerAdmin', 'role for role admin module (Checker)', 1, 0)
END
ELSE
    SET @roleChecker = (SELECT actorId FROM [user].[role] WHERE name = 'RoleCheckerAdmin')

--define BU maker role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'BusinessUnitMakerAdmin')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @buMaker = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@buMaker, 'BusinessUnitMakerAdmin', 'role for business unit admin module (Maker)', 1, 0)
END
ELSE
    SET @buMaker = (SELECT actorId FROM [user].[role] WHERE name = 'BusinessUnitMakerAdmin')

--define BU checker role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'BusinessUnitCheckerAdmin')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @buChecker = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@buChecker, 'BusinessUnitCheckerAdmin', 'role for business unit admin module (Checker)', 1, 0)
END
ELSE
    SET @buChecker = (SELECT actorId FROM [user].[role] WHERE name = 'BusinessUnitCheckerAdmin')

--define role kyc view role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'KycViewer')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @kycViewer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@kycViewer, 'KycViewer', 'role for view KYC Levels', 1, 0)
END
ELSE
    SET @kycViewer = (SELECT actorId FROM [user].[role] WHERE name = 'KycViewer')

--define role kyc manager role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'KycManager')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @kycManager = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@kycManager, 'KycManager', 'role for manage KYC Levels', 1, 0)
END
ELSE
    SET @kycManager = (SELECT actorId FROM [user].[role] WHERE name = 'KycManager')


--define role kyc manager role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'auditor')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @auditor = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@auditor, 'Auditor', 'role for manage audit configuration and its reports', 1, 0)
END
ELSE
    SET @auditor = (SELECT actorId FROM [user].[role] WHERE name = 'auditor')

-- add roles and BUs to roles
MERGE INTO core.actorHierarchy AS target
USING
    (VALUES        
        --user maker role
        (@userMakerAdmin, 'visibleFor', @sg),
        (@userMakerAdmin, 'role', @userAddUser),
        (@userMakerAdmin, 'role', @userEditUser),
        (@userMakerAdmin, 'role', @userLockUser),
        (@userMakerAdmin, 'role', @userDeleteUser),
        (@userMakerAdmin, 'role', @userClear),
        --user checker role
        (@userChecker, 'visibleFor', @sg),
        (@userChecker, 'role', @userApproveUser),
        --role maker role
        (@roleMakerAdmin, 'visibleFor', @sg),
        (@roleMakerAdmin, 'role', @roleAdd),
        (@roleMakerAdmin, 'role', @roleEdit),
        (@roleMakerAdmin, 'role', @roleLock),
        (@roleMakerAdmin, 'role', @roleDelete),
        --role checker role
        (@roleChecker, 'visibleFor', @sg),
        (@roleChecker, 'role', @roleApprove),
        --bu maker role
        (@buMaker, 'visibleFor', @sg),
        (@buMaker, 'role', @buAdd),
        (@buMaker, 'role', @buEdit),
        (@buMaker, 'role', @buLock),
        (@buMaker, 'role', @buDelete),
        --bu checker role
        (@buChecker, 'visibleFor', @sg),
        (@buChecker, 'role', @buApprove),
        --role kyc view role
        (@kycViewer, 'visibleFor', @sg),
        (@kycViewer, 'role', @kycView),
        --role kyc manager role
        (@kycManager, 'visibleFor', @sg),
        (@kycManager, 'role', @kycAdd),
        (@kycManager, 'role', @kycEdit),
        (@kycManager, 'role', @kycDelete),
        (@kycManager, 'role', @kycActivate),
        -- role auditor role
        (@auditor, 'visibleFor', @sg),
        (@auditor, 'role', @auditConfiguration),
        (@auditor, 'role', @auditReport)
    ) AS source ([subject], predicate, [object])
ON target.[subject] = source.[subject] AND target.[object] = source.[object]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([subject], predicate, [object])
VALUES ([subject], predicate, [object]);

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@roleMakerAdmin, 'user.role.fetch', '%', 1),
        (@roleMakerAdmin, 'user.role.get', '%', 1),
		(@roleMakerAdmin, 'user.role.add', '%', 1),
        (@roleMakerAdmin, 'user.role.grant', '%', 1),
		(@roleMakerAdmin, 'user.role.delete', '%', 1),
		(@roleMakerAdmin, 'user.role.edit', '%', 1),
		(@roleMakerAdmin, 'user.role.discard', '%', 1),
		(@roleMakerAdmin, 'user.role.grantUnapproved', '%', 1),
		(@roleMakerAdmin, 'user.role.lock', '%', 1),

		(@roleChecker, 'user.role.fetch', '%', 1),
        (@roleChecker, 'user.role.get', '%', 1),
		(@roleChecker, 'user.role.grantUnapproved', '%', 1),
        (@roleChecker, 'user.role.grant', '%', 1),
		(@roleChecker, 'user.role.approve', '%', 1),
        (@roleChecker, 'user.role.reject', '%', 1),

		(@userMakerAdmin, 'user.user.fetch', '%', 1),
        (@userMakerAdmin, 'user.user.get', '%', 1),
		(@userMakerAdmin, 'user.role.grantUnapproved', '%', 1),
        (@userMakerAdmin, 'user.role.grant', '%', 1),
		(@userMakerAdmin, 'user.user.discard', '%', 1),
        (@userMakerAdmin, 'user.user.add', '%', 1),
		(@userMakerAdmin, 'user.user.edit', '%', 1),
        (@userMakerAdmin, 'user.user.delete', '%', 1),
		(@userMakerAdmin, 'user.user.lock', '%', 1),
		(@userMakerAdmin, 'user.hash.clearAttempts', '%', 1),

        (@userChecker, 'user.user.fetch', '%', 1),
        (@userChecker, 'user.user.get', '%', 1),
		(@userChecker, 'user.role.grantUnapproved', '%', 1),
        (@userChecker, 'user.role.grant', '%', 1),
		(@userChecker, 'user.user.approve', '%', 1),
        (@userChecker, 'user.user.reject', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
	INSERT (actorId, actionId, objectId, [level])
	VALUES (actorId, actionId, objectId, [level]);

-- assign access policy to roles
MERGE INTO [policy].[actorPolicy] AS target
USING
    (VALUES        
        (@userMakerAdmin, @passPolicyId),
        (@userChecker, @passPolicyId),
        (@roleMakerAdmin, @passPolicyId),
        (@roleChecker, @passPolicyId),
        (@buMaker, @passPolicyId),
        (@buChecker, @passPolicyId),
        (@kycViewer, @passPolicyId),
        (@kycManager, @passPolicyId),
        (@auditor, @passPolicyId)
    ) AS source (actorId, policyId)
ON target.actorId = source.actorId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, policyId)
VALUES (actorId, policyId);

---------PREDEFINED USERS
declare @uaUser bigint
IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='userMakerAdmin')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @uaUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@uaUser, @enLanguageId)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @uaUser, null, null, 'User Maker', 'Admin', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @uaUser,'password','userMakerAdmin','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object, isDefault)
    VALUES(@uaUser, 'role', @userMakerAdmin, 1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@uaUser, 'memberOf', @sg)

END
ELSE
    SET @uaUser = (SELECT actorId FROM [user].hash WHERE identifier='userMakerAdmin')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @uaUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@uaUser, @passPolicyId)


declare @uaCheckerUser bigint
IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='userCheckerAdmin')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @uaCheckerUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@uaCheckerUser, @enLanguageId)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @uaCheckerUser, null, null, 'User Checker', 'Admin', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @uaCheckerUser,'password','userCheckerAdmin','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object, isDefault)
    VALUES(@uaCheckerUser, 'role', @userChecker,1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@uaCheckerUser, 'memberOf', @sg)

END
ELSE
    SET @uaCheckerUser = (SELECT actorId FROM [user].hash WHERE identifier='userCheckerAdmin')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @uaCheckerUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@uaCheckerUser, @passPolicyId)

