DECLARE @sg BIGINT = (select actorId from customer.organization where organizationName = 'IBL')
DECLARE @languageid INT = (SELECT [languageId] FROM [core].[language] where [name] = 'English')
DECLARE @passPolicyId INT = (select policyID from policy.policy where name = 'STD')

--- card roles
DECLARE @cardAdmin BIGINT, @customerService BIGINT, @customerServiceSupervisor BIGINT, @backOffice BIGINT, @backOfficeSupervisor BIGINT, @viewer BIGINT

--get system roles

--applications
DECLARE @applicationViewRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Viewer')
DECLARE @createNoNameApplicationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card No Name Application Create')
DECLARE @createNameApplicationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Named Application Create')
DECLARE @approveNoNameApplicationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card No Name Application Approve')
DECLARE @approveNameApplicationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Named Application Approve')
DECLARE @declineApplicationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Decline')
DECLARE @rejectApplicationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Reject')
DECLARE @editApplicationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Edit')
DECLARE @namedBatchCreateRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Create Named Batch')
DECLARE @removeFromBatchRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Remove From Batch')

--batch
DECLARE @batchViewRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Viewer')
DECLARE @cardBatchEditRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Edit')
DECLARE @cardBatchDeclineRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Decline')
DECLARE @cardBatchSendToProductionRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Send to Production')
DECLARE @cardBatchCompleteProductionRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Complete Production')
DECLARE @cardBatchCreateRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card No Name Batch Create')
DECLARE @cardBatchDownloadRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Download')
DECLARE @cardBatchApproveRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Approve')
DECLARE @cardBatchRejectRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Reject')
DECLARE @cardBatchPINRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Generate PIN Mail')

--cards in production
DECLARE @cardsReadyCardsViewRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Cards In Production Viewer')
DECLARE @cardsReadyCardsAllocateRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Cards In Production Allocate')
DECLARE @cardsReadyCardsApproveAllocationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Approve Allocation')
DECLARE @cardsReadyCardsRejectAllocationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Reject Allocation')
DECLARE @cardsReadyCardsDeclineAllocationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Decline Card Allocation')
DECLARE @cardsReadyCardsDestructRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Cards In Production Destruct')
DECLARE @cardsReadyCardsDestructCheckerRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Cards In Production Destruction Checker')
DECLARE @cardsReadyCardsDeclineAcceptedRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Decline Accepted Cards')
DECLARE @cardsReadyCardsDeclineAcceptanceRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Decline Card Acceptance')
DECLARE @cardsReadyCardsApproveAcceptanceRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Approve Card Acceptance')
DECLARE @cardsReadyCardsAcceptAllocationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Accept Allocated Cards')
DECLARE @cardsReadyCardsRejectSentCardsRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Reject Sent Cards')
DECLARE @cardsReadyCardsRejectCardAcceptanceRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Reject Card Acceptance')
DECLARE @cardsReadyCardsAcceptRejectedCardsRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Accept Rejected Cards')
DECLARE @cardsReadyCardsAcceptDeclinedCardsRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Accept Declined Cards')
DECLARE @cardsReadyCardsPINRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Generate PIN Mail')

--cards in use
DECLARE @cardsInUseViewRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Viewer')
DECLARE @cardsInUsePendingActivationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Activate')
DECLARE @cardsInUseRejectActivationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Reject Card Activation')
DECLARE @cardsInUseApproveActivationRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Approve Activation')
DECLARE @cardsInUseHotRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Hot')
DECLARE @cardsInUseDeactivateRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Deactivate')
DECLARE @cardsInUseDeactivationCheckerRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Active Card Deactivation Checker')
DECLARE @cardsInUseDestructRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Destruct')
DECLARE @cardsInUseDestructCheckerRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Destruction Checker')
DECLARE @cardsInUseResetPINretriesRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Reset PIN Retries')
DECLARE @cardsInUseGeneratePINRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Generate PIN Mail Active Cards')
DECLARE @cardsInUseEditRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Edit')

--card products
DECLARE @cardsProductViewRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Product Viewer')
DECLARE @cardsProductManageRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Product Manager')

--card reasons
DECLARE @cardsReasonViewRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Reason Viewer')
DECLARE @cardsReasonManageRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Reason Manager')

--card bins
DECLARE @cardsBinViewRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card BIN Viewer')
DECLARE @cardsBinManageRole BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card BIN Manager')

--reports
DECLARE @cardsReports BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Card Reports')

-- Card Administrator Role

if NOT EXISTS(select * from [user].[role] where name = 'Card Management Administrator Maker')
BEGIN
    insert into core.actor(actorType, isEnabled) values('role', 1)
    set @cardAdmin = SCOPE_IDENTITY()
    insert into [user].[role](actorId, name, description, isEnabled, isDeleted) values(@cardAdmin, 'Card Management Administrator Maker', 'role for card admin module', 1, 0)

END
else
    set @cardAdmin = (select actorId from [user].[role] where name = 'Card Management Administrator Maker')
--------

-- Card Maker Role

if NOT EXISTS(select * from [user].[role] where name = 'Customer Service')
BEGIN
    insert into core.actor(actorType, isEnabled) values('role', 1)
    set @customerService = SCOPE_IDENTITY()
    insert into [user].[role](actorId, name, description, isEnabled, isDeleted) values(@customerService, 'Customer Service', 'role for card maker', 1, 0)

END
else
    set @customerService = (select actorId from [user].[role] where name = 'Customer Service')
--------

-- Card Checker Role

if NOT EXISTS(select * from [user].[role] where name = 'Customer Service Supervisor')
BEGIN
    insert into core.actor(actorType, isEnabled) values('role', 1)
    set @customerServiceSupervisor = SCOPE_IDENTITY()
    insert into [user].[role](actorId, name, description, isEnabled, isDeleted) values(@customerServiceSupervisor, 'Customer Service Supervisor', 'role for card checker', 1, 0)

END
else
    set @customerServiceSupervisor = (select actorId from [user].[role] where name = 'Customer Service Supervisor')
--------

-- Batch Checker Role

if NOT EXISTS(select * from [user].[role] where name = 'Back Office Supervisor')
BEGIN
    insert into core.actor(actorType, isEnabled) values('role', 1)
    set @backOfficeSupervisor = SCOPE_IDENTITY()
    insert into [user].[role](actorId, name, description, isEnabled, isDeleted) values(@backOfficeSupervisor, 'Back Office Supervisor', 'role for batch checker', 1, 0)

END
else
    set @backOfficeSupervisor = (select actorId from [user].[role] where name = 'Back Office Supervisor')
--------

-- Batch Maker Role

if NOT EXISTS(select * from [user].[role] where name = 'Back Office')
BEGIN
    insert into core.actor(actorType, isEnabled) values('role', 1)
    set @backOffice = SCOPE_IDENTITY()
    insert into [user].[role](actorId, name, description, isEnabled, isDeleted) values(@backOffice, 'Back Office', 'role for batch maker', 1, 0)

END
else
    set @backOffice = (select actorId from [user].[role] where name = 'Back Office')
--------

-- Viewer Role

if NOT EXISTS(select * from [user].[role] where name = 'Viewer')
BEGIN
    insert into core.actor(actorType, isEnabled) values('role', 1)
    set @viewer = SCOPE_IDENTITY()
    insert into [user].[role](actorId, name, description, isEnabled, isDeleted) values(@viewer, 'Viewer', 'role for view only', 1, 0)

END
else
    set @viewer = (select actorId from [user].[role] where name = 'Viewer')
--------

-- add roles and BUs to roles
MERGE INTO core.actorHierarchy AS target
USING
    (VALUES
        -- Card Administrator Role
        (@cardAdmin, 'visibleFor', @sg),
        (@cardAdmin, 'role', @cardsProductManageRole),
        (@cardAdmin, 'role', @cardsReasonManageRole),
        (@cardAdmin, 'role', @cardsBinManageRole),
        (@cardAdmin, 'role', @cardsReports),

        -- Card Maker Role
        (@customerService, 'visibleFor', @sg),
        (@customerService, 'role', @createNoNameApplicationRole),
        (@customerService, 'role', @createNameApplicationRole),
        (@customerService, 'role', @editApplicationRole),
        (@customerService, 'role', @cardsReadyCardsRejectSentCardsRole),
        (@customerService, 'role', @cardsReadyCardsAcceptAllocationRole),
        (@customerService, 'role', @cardsReadyCardsDeclineAcceptedRole),
        (@customerService, 'role', @cardsReadyCardsDestructRole),
        (@customerService, 'role', @cardsInUsePendingActivationRole),
        (@customerService, 'role', @cardsInUseHotRole),
        (@customerService, 'role', @cardsInUseDeactivateRole),
        (@customerService, 'role', @cardsInUseDestructRole),
        (@customerService, 'role', @cardsInUseEditRole),

        -- Card Checker Role
        (@customerServiceSupervisor, 'visibleFor', @sg),
        (@customerServiceSupervisor, 'role', @approveNoNameApplicationRole),
        (@customerServiceSupervisor, 'role', @approveNameApplicationRole),
        (@customerServiceSupervisor, 'role', @declineApplicationRole),
        (@customerServiceSupervisor, 'role', @rejectApplicationRole),
        (@customerServiceSupervisor, 'role', @cardsReadyCardsApproveAcceptanceRole),
        (@customerServiceSupervisor, 'role', @cardsReadyCardsDeclineAcceptanceRole),
        (@customerServiceSupervisor, 'role', @cardsReadyCardsRejectCardAcceptanceRole),
        (@customerServiceSupervisor, 'role', @cardsReadyCardsAcceptRejectedCardsRole),
        (@customerServiceSupervisor, 'role', @cardsReadyCardsAcceptDeclinedCardsRole),
        (@customerServiceSupervisor, 'role', @cardsReadyCardsPINRole),
        (@customerServiceSupervisor, 'role', @cardsReadyCardsDestructCheckerRole),
        (@customerServiceSupervisor, 'role', @cardsInUseApproveActivationRole),
        (@customerServiceSupervisor, 'role', @cardsInUseRejectActivationRole),
        (@customerServiceSupervisor, 'role', @cardsInUseHotRole),
        (@customerServiceSupervisor, 'role', @cardsInUseDeactivationCheckerRole),
        (@customerServiceSupervisor, 'role', @cardsInUseDestructCheckerRole),
        (@customerServiceSupervisor, 'role', @cardsInUseResetPINretriesRole),
        (@customerServiceSupervisor, 'role', @cardsInUseGeneratePINRole),

        -- Batch Checker Role
        (@backOfficeSupervisor, 'visibleFor', @sg),
        (@backOfficeSupervisor, 'role', @cardBatchDeclineRole),
        (@backOfficeSupervisor, 'role', @cardBatchCompleteProductionRole),
        (@backOfficeSupervisor, 'role', @cardBatchDownloadRole),
        (@backOfficeSupervisor, 'role', @cardBatchApproveRole),
        (@backOfficeSupervisor, 'role', @cardBatchRejectRole),
        (@backOfficeSupervisor, 'role', @cardBatchPINRole),
        (@backOfficeSupervisor, 'role', @cardsReadyCardsApproveAllocationRole),
        (@backOfficeSupervisor, 'role', @cardsReadyCardsRejectAllocationRole),
        (@backOfficeSupervisor, 'role', @cardsReadyCardsDeclineAllocationRole),
        (@backOfficeSupervisor, 'role', @cardBatchEditRole),

         -- Batch Maker Role
        (@backOffice, 'visibleFor', @sg),
        (@backOffice, 'role', @namedBatchCreateRole),
        (@backOffice, 'role', @removeFromBatchRole),
        (@backOffice, 'role', @cardBatchEditRole),
        (@backOffice, 'role', @cardBatchDeclineRole),
        (@backOffice, 'role', @cardBatchSendToProductionRole),
        (@backOffice, 'role', @cardBatchCreateRole),
        (@backOffice, 'role', @cardsReadyCardsAllocateRole),

        -- viewer Role
        (@viewer, 'visibleFor', @sg),
        (@viewer, 'role', @applicationViewRole),
        (@viewer, 'role', @batchViewRole),
        (@viewer, 'role', @cardsReadyCardsViewRole),
        (@viewer, 'role', @cardsInUseViewRole),
        (@viewer, 'role', @cardsProductViewRole),
        (@viewer, 'role', @cardsReasonViewRole),
        (@viewer, 'role', @cardsBinViewRole)

    ) AS source ([subject], predicate, [object])
ON target.[subject] = source.[subject] AND target.[object] = source.[object]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([subject], predicate, [object])
VALUES ([subject], predicate, [object]);

-- assign access policy to roles
MERGE INTO [policy].[actorPolicy] AS target
USING
    (VALUES
        (@cardAdmin, @passPolicyId),
        (@customerService, @passPolicyId),
        (@customerServiceSupervisor, @passPolicyId),
        (@backOffice, @passPolicyId),
        (@backOfficeSupervisor, @passPolicyId)
    ) AS source (actorId, policyId)
ON target.actorId = source.actorId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, policyId)
VALUES (actorId, policyId);

--create card admin user
declare @cardAdminUser bigint

IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='CardAdmin')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @cardAdminUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@cardAdminUser, @languageid)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @cardAdminUser, null, null, 'Card', 'Admin', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @cardAdminUser,'password','CardAdmin','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object,isDefault)
    VALUES(@cardAdminUser, 'role', @cardAdmin,1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@cardAdminUser, 'memberOf', @sg)

END
ELSE
    SET @cardAdminUser = (SELECT actorId FROM [user].hash WHERE identifier='CardAdmin')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @cardAdminUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@cardAdminUser, @passPolicyId)



-------------
--create customer service user

declare @customerServiceUser bigint

IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='CustomerService')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @customerServiceUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@customerServiceUser, @languageid)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @customerServiceUser, null, null, 'Customer', 'Service', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @customerServiceUser,'password','CustomerService','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object,isDefault)
    VALUES(@customerServiceUser, 'role', @customerService,1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@customerServiceUser, 'memberOf', @sg)

END
ELSE
    SET @customerServiceUser = (SELECT actorId FROM [user].hash WHERE identifier='CustomerService')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @customerServiceUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@customerServiceUser, @passPolicyId)


-------------------
--create customer service supervisor user

declare @customerServiceSupervisorUser bigint

IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='CustomerServiceSupervisor')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @customerServiceSupervisorUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@customerServiceSupervisorUser, @languageid)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @customerServiceSupervisorUser, null, null, 'Customer', 'ServiceSupervisor', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @customerServiceSupervisorUser,'password','CustomerServiceSupervisor','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object,isDefault)
    VALUES(@customerServiceSupervisorUser, 'role', @customerServiceSupervisor,1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@customerServiceSupervisorUser, 'memberOf', @sg)

END
ELSE
    SET @customerServiceSupervisorUser = (SELECT actorId FROM [user].hash WHERE identifier='CustomerServiceSupervisor')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @customerServiceSupervisorUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@customerServiceSupervisorUser, @passPolicyId)


-------------------
--create back office supervisor user

declare @backOfficeSupervisorUser bigint

IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='BackOfficeSupervisor')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @backOfficeSupervisorUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@backOfficeSupervisorUser, @languageid)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @backOfficeSupervisorUser, null, null, 'Back', 'OfficeSupervisor', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @backOfficeSupervisorUser,'password','BackOfficeSupervisor','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object,isDefault)
    VALUES(@backOfficeSupervisorUser, 'role', @backOfficeSupervisor,1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@backOfficeSupervisorUser, 'memberOf', @sg)

END
ELSE
    SET @backOfficeSupervisorUser = (SELECT actorId FROM [user].hash WHERE identifier='BackOfficeSupervisor')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @backOfficeSupervisorUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@backOfficeSupervisorUser, @passPolicyId)



-------------------
--create back office user

declare @backOfficeUser bigint

IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='BackOffice')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @backOfficeUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@backOfficeUser, @languageid)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @backOfficeUser, null, null, 'Back', 'Office', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @backOfficeUser,'password','BackOffice','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object,isDefault)
    VALUES(@backOfficeUser, 'role', @backOffice,1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@backOfficeUser, 'memberOf', @sg)

END
ELSE
    SET @backOfficeUser = (SELECT actorId FROM [user].hash WHERE identifier='BackOffice')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @backOfficeUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@backOfficeUser, @passPolicyId)


-------------------
--create viewer user

declare @viewerUser bigint

IF NOT EXISTS(SELECT * FROM [user].hash WHERE identifier='Viewer')
BEGIN
    INSERT INTO [core].[actor] (actorType, isEnabled) VALUES('person', 1)
    set @viewerUser = SCOPE_IDENTITY()

    INSERT INTO [user].[user](actorId, primaryLanguageId)  VALUES(@viewerUser, @languageid)

    INSERT INTO [customer].[person](actorId,bioId,frontEndRecordId,firstName,lastName,nationalId,dateOfBirth,placeOfBirth,nationality,gender, isDeleted, isEnabled)
    SELECT @viewerUser, null, null, 'Viewer', 'User', null, getdate(), null, null, 'F', 0, 1

    INSERT INTO [user].[hash]
    SELECT @viewerUser,'password','Viewer','pbkdf2','{"salt":"3e2ed876-14d1-4b4b-a72a-7790813d0227","iterations":100000,"keylen":512,"digest":"sha512"}',
            '8e8230b08e6f62abfd5e6c3b3b7b839ffa165d0cc6e478bde6970ab83bdd8e8d0b3f97290392929aee6e5ef03b7f34dc1f59260d2dc76d896a22f4b92c4b5f73ab344045947a2b0957f9c5b6c76cad45fade00675e5a4a2153725a8b555375dd581a9a2214be32cfbcfb95a310bba7aef3b6bc9595bfbee3c5a6e7497427006c344cf7a56381edce702acbf07baf6e11dbbad3b5a477387aac4b3ce9c5c2abe7537c6eba9e235d88a073578d09c50c4c39ea41506f536c6c96fa2e03ecba3308a509eb0fcee8d90d746f7bb7dff5c353a2fa539b69d7fcd7391e37c89ea823efe6fee0185004376c055e21b7573c16a96f80c412d6ddfe734a95863d6d5054cbf6700885c60bd34827193ef188a24f138b6fd87560cb90a59007143fdb9cad2988266242766cdf6a9bdd1dec152783c7e7b9103115b294045a53fab6e8b8a29b845948789e11861dc03e5721d4251291c47b64eb3fc20c9bf0fb51bf9248814df7f89da740febcab23f9be21351457bc61dbb487b2f5c724c2025cad5a68b2754b50e14712ac91045289ac2ccc6e1a3d483e1fd2f7083ddae8616d5613416ea4969ce6b85c07a5b136c63399dac5e519455b01e02798bed15d461c5342afbf4363784875934f2a263c0904707efd03cdd10bb1716ca89cc22defe457b5901e4659c62906f1d7350ff2b3fb9492ba456e487f0cd0eb28158f3b94b438d777c13c'
            ,0, getdate(),getdate(),'01-01-2222',1

    INSERT INTO core.actorHierarchy(subject, predicate, object,isDefault)
    VALUES(@viewerUser, 'role', @viewer,1)

    if @sg is not null
        insert into core.actorHierarchy(subject, predicate, object) values(@viewerUser, 'memberOf', @sg)

END
ELSE
    SET @viewerUser = (SELECT actorId FROM [user].hash WHERE identifier='Viewer')

IF NOT EXISTS (select * from [policy].[actorPolicy] p where p.actorId = @viewerUser)
    INSERT INTO [policy].[actorPolicy] ([actorId], policyId) VALUES(@viewerUser, @passPolicyId)


