/*DECLARE @bulkManagementId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'bulkManagement')

IF(@bulkManagementId IS NULL)
BEGIN
    DECLARE @itemNameTranslationTT core.itemNameTranslationTT
    DECLARE @meta core.metaDataTT
    DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');
    INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('bulkManagement', 'Manage Bulk Transactions', 'Manage Bulk Transactions')

    EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
        @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta
    SET @bulkManagementId = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'bulkManagement')
END

-- DECLARE @batchCreate BIGINT, @batchEdit BIGINT, @submitBatch BIGINT, @processBatch BIGINT, @deleteBatch BIGINT, 

DECLARE @permissionId BIGINT

--Add/Edit Debit Batch
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add/Edit Debit Batch')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Add/Edit Debit Batch', 'Add/Edit Debit Batch', 1, 0, @bulkManagementId, 1)
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Add/Edit Debit Batch')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
        (@permissionId, 'bulk.transactions.nav', '%', 1),
        (@permissionId, 'bulk.batch.nav', '%', 1),
        (@permissionId, 'bulk.batch.bulkDebit', '%', 1),
        (@permissionId, 'bulk.batch.accountFetch', '%', 1),
        (@permissionId, 'bulk.batch.actionFetch', '%', 1),
        (@permissionId, 'bulk.batch.statusFetch', '%', 1),
        (@permissionId, 'bulk.batch.transactionTypeFetch', '%', 1),
        (@permissionId, 'bulk.batch.add', '%', 1),
        (@permissionId, 'bulk.batch.edit', '%', 1),
        (@permissionId, 'bulk.batch.delete', '%', 1),
        (@permissionId, 'bulk.batch.fetch', '%', 1),
        (@permissionId, 'bulk.batch.get', '%', 1),
        (@permissionId, 'bulk.batch.check', '%', 1),
        (@permissionId, 'bulk.payment.check', '%', 1),
        (@permissionId, 'bulk.batch.statusUpdate', '%', 1),
        (@permissionId, 'bulk.batch.verify', '%', 1),
        (@permissionId, 'bulk.batch.disable', '%', 1),
        (@permissionId, 'bulk.batch.ready', '%', 1),
        (@permissionId, 'bulk.batch.typeFetch', '%', 1),
        (@permissionId, 'bulk.payment.add', '%', 1),
        (@permissionId, 'bulk.payment.edit', '%', 1),
        (@permissionId, 'bulk.payment.fetch', '%', 1),
        (@permissionId, 'bulk.payment.get', '%', 1),
        (@permissionId, 'bulk.payment.statusFetch', '%', 1),
        (@permissionId, 'bulk.payment.statusUpdate', '%', 1),
        (@permissionId, 'ledger.account.fetch', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- Approve/Process Debit batch
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Approve/Process Debit batch')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Approve/Process Debit batch', 'Approve/Process Debit batch', 1, 0, @bulkManagementId, 1)
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Approve/Process Debit batch')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
        (@permissionId, 'bulk.transactions.nav', '%', 1),
        (@permissionId, 'bulk.batch.nav', '%', 1),
        (@permissionId, 'bulk.batch.bulkDebit', '%', 1),
        (@permissionId, 'bulk.batch.accountFetch', '%', 1),
        (@permissionId, 'bulk.batch.actionFetch', '%', 1),
        (@permissionId, 'bulk.batch.statusFetch', '%', 1),
        (@permissionId, 'bulk.batch.transactionTypeFetch', '%', 1),
        (@permissionId, 'bulk.batch.fetch', '%', 1),
        (@permissionId, 'bulk.batch.get', '%', 1),
        (@permissionId, 'bulk.batch.statusUpdate', '%', 1),
        (@permissionId, 'bulk.batch.process', '%', 1),
        (@permissionId, 'bulk.batch.reject', '%', 1),
        (@permissionId, 'bulk.batch.typeFetch', '%', 1),
        (@permissionId, 'bulk.payment.fetch', '%', 1),
        (@permissionId, 'bulk.payment.fetchUnpaid', '%', 1),
        (@permissionId, 'bulk.payment.getForVerification', '%', 1),
        (@permissionId, 'bulk.payment.get', '%', 1),
        (@permissionId, 'bulk.payment.statusFetch', '%', 1),
        (@permissionId, 'bulk.payment.statusUpdate', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);


--Add/Edit Credit Batch
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add/Edit Credit Batch')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Add/Edit Credit Batch', 'Add/Edit Credit Batch', 1, 0, @bulkManagementId, 1)
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Add/Edit Credit Batch')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
        (@permissionId, 'bulk.transactions.nav', '%', 1),
        (@permissionId, 'bulk.batch.nav', '%', 1),
        (@permissionId, 'bulk.batch.bulkCredit', '%', 1),
        (@permissionId, 'bulk.batch.accountFetch', '%', 1),
        (@permissionId, 'bulk.batch.actionFetch', '%', 1),
        (@permissionId, 'bulk.batch.statusFetch', '%', 1),
        (@permissionId, 'bulk.batch.transactionTypeFetch', '%', 1),
        (@permissionId, 'bulk.batch.add', '%', 1),
        (@permissionId, 'bulk.batch.edit', '%', 1),
        (@permissionId, 'bulk.batch.delete', '%', 1),
        (@permissionId, 'bulk.batch.fetch', '%', 1),
        (@permissionId, 'bulk.batch.get', '%', 1),
        (@permissionId, 'bulk.batch.check', '%', 1),
        (@permissionId, 'bulk.payment.check', '%', 1),
        (@permissionId, 'bulk.batch.statusUpdate', '%', 1),
        (@permissionId, 'bulk.batch.verify', '%', 1),
        (@permissionId, 'bulk.batch.disable', '%', 1),
        (@permissionId, 'bulk.batch.ready', '%', 1),
        (@permissionId, 'bulk.batch.typeFetch', '%', 1),
        (@permissionId, 'bulk.payment.add', '%', 1),
        (@permissionId, 'bulk.payment.edit', '%', 1),
        (@permissionId, 'bulk.payment.fetch', '%', 1),
        (@permissionId, 'bulk.payment.get', '%', 1),
        (@permissionId, 'bulk.payment.statusFetch', '%', 1),
        (@permissionId, 'bulk.payment.statusUpdate', '%', 1),
        (@permissionId, 'ledger.account.fetch', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- Approve/Process Credit batch
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Approve/Process Credit batch')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Approve/Process Credit batch', 'Approve/Process Credit batch', 1, 0, @bulkManagementId, 1)
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Approve/Process Credit batch')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
        (@permissionId, 'bulk.transactions.nav', '%', 1),
        (@permissionId, 'bulk.batch.nav', '%', 1),
        (@permissionId, 'bulk.batch.bulkCredit', '%', 1),
        (@permissionId, 'bulk.batch.accountFetch', '%', 1),
        (@permissionId, 'bulk.batch.actionFetch', '%', 1),
        (@permissionId, 'bulk.batch.statusFetch', '%', 1),
        (@permissionId, 'bulk.batch.transactionTypeFetch', '%', 1),
        (@permissionId, 'bulk.batch.fetch', '%', 1),
        (@permissionId, 'bulk.batch.get', '%', 1),
        (@permissionId, 'bulk.batch.statusUpdate', '%', 1),
        (@permissionId, 'bulk.batch.process', '%', 1),
        (@permissionId, 'bulk.batch.reject', '%', 1),
        (@permissionId, 'bulk.batch.typeFetch', '%', 1),
        (@permissionId, 'bulk.payment.fetch', '%', 1),
        (@permissionId, 'bulk.payment.fetchUnpaid', '%', 1),
        (@permissionId, 'bulk.payment.getForVerification', '%', 1),
        (@permissionId, 'bulk.payment.get', '%', 1),
        (@permissionId, 'bulk.payment.statusFetch', '%', 1),
        (@permissionId, 'bulk.payment.statusUpdate', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

--Add/Edit Merchant Credit Batch
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Add/Edit Merchant Credit Batch')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Add/Edit Merchant Credit Batch', 'Add/Edit Merchant Credit Batch', 1, 0, @bulkManagementId, 1)
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Add/Edit Merchant Credit Batch')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
        (@permissionId, 'bulk.transactions.nav', '%', 1),
        (@permissionId, 'bulk.batch.nav', '%', 1),
        (@permissionId, 'bulk.batch.merchantBulkCredit', '%', 1),
        (@permissionId, 'bulk.batch.accountFetch', '%', 1),
        (@permissionId, 'bulk.batch.actionFetch', '%', 1),
        (@permissionId, 'bulk.batch.statusFetch', '%', 1),
        (@permissionId, 'bulk.batch.transactionTypeFetch', '%', 1),
        (@permissionId, 'bulk.batch.add', '%', 1),
        (@permissionId, 'bulk.batch.edit', '%', 1),
        (@permissionId, 'bulk.batch.delete', '%', 1),
        (@permissionId, 'bulk.batch.fetch', '%', 1),
        (@permissionId, 'bulk.batch.get', '%', 1),
        (@permissionId, 'bulk.batch.check', '%', 1),
        (@permissionId, 'bulk.payment.check', '%', 1),
        (@permissionId, 'bulk.batch.statusUpdate', '%', 1),
        (@permissionId, 'bulk.batch.verify', '%', 1),
        (@permissionId, 'bulk.batch.disable', '%', 1),
        (@permissionId, 'bulk.batch.ready', '%', 1),
        (@permissionId, 'bulk.batch.typeFetch', '%', 1),
        (@permissionId, 'bulk.payment.add', '%', 1),
        (@permissionId, 'bulk.payment.edit', '%', 1),
        (@permissionId, 'bulk.payment.fetch', '%', 1),
        (@permissionId, 'bulk.payment.get', '%', 1),
        (@permissionId, 'bulk.payment.statusFetch', '%', 1),
        (@permissionId, 'bulk.payment.statusUpdate', '%', 1),
        (@permissionId, 'ledger.account.fetch', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);

-- Approve/Process Merchant Credit batch
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Approve/Process Merchant Credit batch')
BEGIN
     INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
     SET @permissionId = SCOPE_IDENTITY()
     INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
     VALUES(@permissionId, 'Approve/Process Merchant Credit batch', 'Approve/Process Merchant Credit batch', 1, 0, @bulkManagementId, 1)
END
ELSE
     SET @permissionId = (SELECT actorId FROM [user].[role] WHERE name = 'Approve/Process Merchant Credit batch')

MERGE INTO [user].actorAction AS target
USING
     (VALUES          
        (@permissionId, 'bulk.transactions.nav', '%', 1),
        (@permissionId, 'bulk.batch.nav', '%', 1),
        (@permissionId, 'bulk.batch.merchantBulkCredit', '%', 1),
        (@permissionId, 'bulk.batch.accountFetch', '%', 1),
        (@permissionId, 'bulk.batch.actionFetch', '%', 1),
        (@permissionId, 'bulk.batch.statusFetch', '%', 1),
        (@permissionId, 'bulk.batch.transactionTypeFetch', '%', 1),
        (@permissionId, 'bulk.batch.fetch', '%', 1),
        (@permissionId, 'bulk.batch.statusUpdate', '%', 1),
        (@permissionId, 'bulk.batch.get', '%', 1),
        (@permissionId, 'bulk.batch.process', '%', 1),
        (@permissionId, 'bulk.batch.reject', '%', 1),
        (@permissionId, 'bulk.batch.typeFetch', '%', 1),
        (@permissionId, 'bulk.payment.fetch', '%', 1),
        (@permissionId, 'bulk.payment.fetchUnpaid', '%', 1),
        (@permissionId, 'bulk.payment.getForVerification', '%', 1),
        (@permissionId, 'bulk.payment.get', '%', 1),
        (@permissionId, 'bulk.payment.statusUpdate', '%', 1),
        (@permissionId, 'bulk.payment.statusFetch', '%', 1)
        ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
INSERT (actorId, actionId, objectId, [level])
VALUES (actorId, actionId, objectId, [level]);
*/