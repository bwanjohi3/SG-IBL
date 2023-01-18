DECLARE @mobileClient BIGINT, @mobileAgent BIGINT, @mobileClientUser BIGINT, @mobileAgentUser BIGINT
DECLARE @teller BIGINT, @merchant BIGINT
DECLARE @sg bigint = (select actorId from customer.organization where organizationName = 'IBL')
DECLARE @enLanguageId int = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en')
DECLARE @passPolicyId int = (select policyID from policy.policy where name = 'STD')
DECLARE @transferCreate BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Create Transactions' AND isSystem = 1)
DECLARE @transferReverse BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Reverse Transactions' AND isSystem = 1)
DECLARE @transferReject BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Reject Transactions' AND isSystem = 1)
DECLARE @transferCancel BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Cancel Transactions' AND isSystem = 1)
DECLARE @transferReport BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Extract transaction reports' AND isSystem = 1)

DECLARE @SA bigint = (select actorId from [user].hash where identifier = 'sa' and type = 'password')

---------PREDEFINED ROLES

--define role mobile client
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'MobileClient')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @mobileClient = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@mobileClient, 'MobileClient', 'role for mobile client', 1, 0)
END
ELSE
    SET @mobileClient = (SELECT actorId FROM [user].[role] WHERE name = 'MobileClient')

--define role mobile agent
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'MobileAgent')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @mobileAgent = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@mobileAgent, 'MobileAgent', 'role for mobile agent', 1, 0)
END
ELSE
    SET @mobileAgent = (SELECT actorId FROM [user].[role] WHERE name = 'MobileAgent')

--define role teller
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Teller')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @teller = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@teller, 'Teller', 'role for teller', 1, 0)
END
ELSE
    SET @teller = (SELECT actorId FROM [user].[role] WHERE name = 'Teller')

--define role merchant
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Merchant')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @merchant = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted) VALUES(@merchant, 'Merchant', 'role for merchant', 1, 0)
END
ELSE
    SET @merchant = (SELECT actorId FROM [user].[role] WHERE name = 'Merchant')

-- add roles and BUs to roles
MERGE INTO core.actorHierarchy AS target
USING
    (VALUES  
        --role MobileClient
        (@mobileClient, 'visibleFor', @sg),
        (@mobileClient, 'role', @transferCreate),
        (@mobileClient, 'role', @transferReject),        
        --role MobileAgent
        (@mobileAgent, 'visibleFor', @sg),
        (@mobileAgent, 'role', @transferCreate),
        (@mobileAgent, 'role', @transferReject),
        (@mobileAgent, 'role', @transferCancel),
        --role Teller
        (@teller, 'visibleFor', @sg),
        (@teller, 'role', @transferCreate),
        (@teller, 'role', @transferReject),
        (@teller, 'role', @transferCancel),
        (@teller, 'role', @transferReverse),
        (@teller, 'role', @transferReport),
        --role Merchant
        (@merchant, 'visibleFor', @sg),
        (@merchant, 'role', @transferCreate),
        (@merchant, 'role', @transferReject),
        (@merchant, 'role', @transferCancel)

    ) AS source ([subject], predicate, [object])
ON target.[subject] = source.[subject] AND target.[object] = source.[object]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([subject], predicate, [object])
VALUES ([subject], predicate, [object]);

MERGE INTO [user].actorAction AS target
USING
    (VALUES        
        (@mobileClient, 'module_transactions', '%', 1),
		(@mobileClient, 'fr_settings_grid', '%', 1),
        (@mobileClient, 'fr_dashboard_grid', '%', 1),
        (@mobileClient, 'fr_change_password', '%', 1),
        (@mobileClient, 'fr_login_up_btn_create_account', '%', 1),
        (@mobileClient, 'mwallet_balance_inquiry', '%', 1),
        (@mobileClient, 'mwallet_mini_statement', '%', 1),
        (@mobileClient, 'mwallet_wallet_to_wallet', '%', 1),
        (@mobileClient, 'mwallet_pull_from_linked_account', '%', 1),
        (@mobileClient, 'mwallet_push_to_linked_account', '%', 1),
        (@mobileClient, 'transaction.execute', '%', 1),
        (@mobileClient, 'transaction.validate', '%', 1),
        (@mobileClient, 'integration.account.fetch', '%', 1),
        (@mobileClient, 'db/rule.decision.lookup', '%', 1),
        (@mobileClient, 'user.device.update', '%', 1),
        (@mobileClient, 'user.oobAuthorization.start', '%', 1),
        (@mobileClient, 'user.hash.add', '%', 1),
        (@mobileClient, 'user.hash.replace', '%', 1),
        (@mobileClient, 'user.hash.check', '%', 1),
        (@mobileClient, 'ledger.userAccount.get', '%', 1),
        (@mobileClient, 'core.translation.byLanguageFetch', '%', 1),

        (@mobileAgent, 'module_customer_management', '%', 1),
		(@mobileAgent, 'module_transactions', '%', 1),
        (@mobileAgent, 'customer_module_fr_kyc_product_select', '%', 1),
        (@mobileAgent, 'mwallet_cash_in', '%', 1),
        (@mobileAgent, 'mwallet_cash_out', '%', 1),
        (@mobileAgent, 'transaction.execute', '%', 1),
        (@mobileAgent, 'transaction.validate', '%', 1),
        (@mobileAgent, 'integration.account.fetch', '%', 1),
        (@mobileAgent, 'user.device.update', '%', 1),
        (@mobileAgent, 'user.oobAuthorization.start', '%', 1),
        (@mobileAgent, 'user.hash.add', '%', 1),
        (@mobileAgent, 'user.hash.replace', '%', 1),
        (@mobileAgent, 'user.hash.check', '%', 1),
        (@mobileAgent, 'transfer.view.foreignAccounts', '%', 1),
        (@mobileAgent, 'ledger.userAccount.get', '%', 1),
        (@mobileAgent, 'core.translation.byLanguageFetch', '%', 1),

        (@teller, 'transaction.execute', '%', 1),
        (@teller, 'transaction.reverse', '%', 1),
        (@teller, 'transaction.validate', '%', 1),
        (@teller, 'transfer.push.reverse', '%', 1),
        (@teller, 'transfer.view.foreignAccounts', '%', 1),
        (@teller, 'ledger.userAccount.get', '%', 1),
        (@teller, 'core.translation.byLanguageFetch', '%', 1),

        (@merchant, 'transaction.execute', '%', 1),
        (@merchant, 'transaction.validate', '%', 1),
        (@merchant, 'transfer.view.foreignAccounts', '%', 1),
        (@merchant, 'ledger.userAccount.get', '%', 1),
        (@merchant, 'core.translation.byLanguageFetch', '%', 1)

    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
	INSERT (actorId, actionId, objectId, [level])
	VALUES (actorId, actionId, objectId, [level]);

-- assign access policy to roles
MERGE INTO [policy].[actorPolicy] AS target
USING
    (VALUES
        (@mobileClient, @passPolicyId),
        (@mobileAgent, @passPolicyId),
        (@teller, @passPolicyId),
        (@merchant, @passPolicyId)
    ) AS source (actorId, policyId)
ON target.actorId = source.actorId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, policyId)
VALUES (actorId, policyId);

---------PREDEFINED USERS

IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='mobileClient')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @mobileClientUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@mobileClientUser, @enLanguageId)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @mobileClientUser, null, null, 'Mobile', 'Client', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @mobileClientUser,'password','mobileClient','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object, isDefault)
    VALUES(@mobileClientUser, 'role', @mobileClient, 1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@mobileClientUser, 'memberOf', @sg)

    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@mobileClientUser, @passPolicyId)
END
ELSE
    SET @mobileClientUser = (SELECT actorId FROM [user].hash WHERE identifier='mobileClient')

IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='mobileAgent')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @mobileAgentUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@mobileAgentUser, @enLanguageId)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @mobileAgentUser, null, null, 'Mobile', 'Agent', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @mobileAgentUser,'password','mobileAgent','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object, isDefault)
    VALUES(@mobileAgentUser, 'role', @mobileAgent, 1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@mobileAgentUser, 'memberOf', @sg)

    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@mobileAgentUser, @passPolicyId)
END
ELSE
    SET @mobileAgentUser = (SELECT actorId FROM [user].hash WHERE identifier='mobileAgent')


declare @tellerUser bigint
IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='tellerUser')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @tellerUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@tellerUser, @enLanguageId)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @tellerUser, null, null, 'User', 'Teller', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @tellerUser,'password','tellerUser','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object, isDefault)
    VALUES(@tellerUser, 'role', @teller, 1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@tellerUser, 'memberOf', @sg)
END
ELSE
    SET @tellerUser = (SELECT actorId FROM [user].hash WHERE identifier='tellerUser')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @tellerUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@tellerUser, @passPolicyId)
