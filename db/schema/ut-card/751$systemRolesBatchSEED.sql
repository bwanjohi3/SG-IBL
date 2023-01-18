DECLARE @roleId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'card')
DECLARE @userActorAction [user].[actorActionTT]

DECLARE @batchViewer BIGINT, @batchEditRole bigint, @batchDeclineRole bigint, @sendToProduction bigint
, @acceptProduction bigint, @createBatch bigint, @downloadBatch bigint, @approveBatch bigint, @rejectBatch bigint, @generatePinMail bigint

---Batch Viewer Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Viewer')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @batchViewer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@batchViewer, 'Card Batch Viewer', 'View batch details.', 1, 0, @roleId, 1)
END
ELSE
    SET @batchViewer = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Viewer')


	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@batchViewer, 'core.translation.fetch', '%', 1),
            (@batchViewer, 'customer.organization.list', '%', 1),
            (@batchViewer, 'card.embossedType.fetch', '%', 1),
            (@batchViewer, 'card.ownershipType.fetch', '%', 1),
            (@batchViewer, 'card.config.fetch', '%', 1),
            (@batchViewer, 'card.batch.get', '%', 1),
            (@batchViewer, 'card.batch.fetch', '%', 1),
            (@batchViewer, 'card.product.list', '%', 1),
            (@batchViewer, 'card.reason.list', '%', 1),
            (@batchViewer, 'card.status.list', '%', 1)


---Card Batch Edit Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Edit')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @batchEditRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@batchEditRole, 'Card Batch Edit', 'Batch Edit in Card', 1, 0, @roleId, 1)
END
ELSE
    SET @batchEditRole = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Edit')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@batchEditRole, 'core.translation.fetch', '%', 1),
                (@batchEditRole, 'customer.organization.list', '%', 1),
                (@batchEditRole, 'card.embossedType.fetch', '%', 1),
                (@batchEditRole, 'card.ownershipType.fetch', '%', 1),
                (@batchEditRole, 'card.product.list', '%', 1),
                (@batchEditRole, 'card.batch.fetch', '%', 1),
                (@batchEditRole, 'card.config.fetch', '%', 1),
                (@batchEditRole, 'card.batch.get', '%', 1),
                (@batchEditRole, 'card.batch.statusUpdate', '%', 1),
                (@batchEditRole, 'card.batch.statusUpdateEdit', '%', 1),
                (@batchEditRole, 'card.reason.list', '%', 1),
                (@batchEditRole, 'card.product.get', '%', 1),
                (@batchEditRole, 'card.status.list', '%', 1)


---Card Batch Decline Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Decline')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @batchDeclineRole = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@batchDeclineRole, 'Card Batch Decline', 'Batch Decline in Card', 1, 0, @roleId, 1)
END
ELSE
    SET @batchDeclineRole = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Decline')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@batchDeclineRole, 'core.translation.fetch', '%', 1),
                (@batchDeclineRole, 'customer.organization.list', '%', 1),
                (@batchDeclineRole, 'card.embossedType.fetch', '%', 1),
                (@batchDeclineRole, 'card.ownershipType.fetch', '%', 1),
                (@batchDeclineRole, 'card.product.list', '%', 1),
                (@batchDeclineRole, 'card.batch.fetch', '%', 1),
                (@batchDeclineRole, 'card.config.fetch', '%', 1),
                (@batchDeclineRole, 'card.batch.get', '%', 1),
                (@batchDeclineRole, 'card.batch.statusUpdate', '%', 1),
                (@batchDeclineRole, 'card.batch.statusUpdateDecline', '%', 1),
                (@batchDeclineRole, 'card.reason.list', '%', 1),
                (@batchDeclineRole, 'card.status.list', '%', 1)


---Card Batch Send to Production Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Send to Production')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @sendToProduction = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@sendToProduction, 'Card Batch Send to Production', 'Batch Send to Production Card', 1, 0, @roleId, 1)
END
ELSE
    SET @sendToProduction = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Send to Production')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@sendToProduction, 'core.translation.fetch', '%', 1),
                (@sendToProduction, 'customer.organization.list', '%', 1),
                (@sendToProduction, 'card.embossedType.fetch', '%', 1),
                (@sendToProduction, 'card.ownershipType.fetch', '%', 1),
                (@sendToProduction, 'card.product.list', '%', 1),
                (@sendToProduction, 'card.batch.fetch', '%', 1),
                (@sendToProduction, 'card.config.fetch', '%', 1),
                (@sendToProduction, 'card.batch.get', '%', 1),
                (@sendToProduction, 'card.batch.statusUpdate', '%', 1),
                (@sendToProduction, 'card.batch.statusUpdateSendToProduction', '%', 1),
                (@sendToProduction, 'card.reason.list', '%', 1),
                (@sendToProduction, 'pan.number.generate', '%', 1),
                (@sendToProduction, 'card.batch.check', '%', 1),
                (@sendToProduction, 'card.generated.add', '%', 1),
                (@sendToProduction, 'card.status.list', '%', 1)



---Card Batch Complete Production Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Complete Production')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @acceptProduction = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@acceptProduction, 'Card Batch Complete Production', 'Batch Complete Card Production', 1, 0, @roleId, 1)
END
ELSE
    SET @acceptProduction = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Complete Production')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@acceptProduction, 'core.translation.fetch', '%', 1),
                (@acceptProduction, 'customer.organization.list', '%', 1),
                (@acceptProduction, 'card.embossedType.fetch', '%', 1),
                (@acceptProduction, 'card.ownershipType.fetch', '%', 1),
                (@acceptProduction, 'card.product.list', '%', 1),
                (@acceptProduction, 'card.batch.fetch', '%', 1),
                (@acceptProduction, 'card.config.fetch', '%', 1),
                (@acceptProduction, 'card.batch.get', '%', 1),
                (@acceptProduction, 'card.batch.statusUpdate', '%', 1),
                (@acceptProduction, 'card.batch.statusUpdateCompleted', '%', 1),
                (@acceptProduction, 'card.reason.list', '%', 1),
                (@acceptProduction, 'card.status.list', '%', 1)



---Card Create No Name Batch Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card No Name Batch Create')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @createBatch = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@createBatch, 'Card No Name Batch Create', 'No Name Batch Create', 1, 0, @roleId, 1)
END
ELSE
    SET @createBatch = (SELECT actorId FROM [user].[role] WHERE name = 'Card No Name Batch Create')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@createBatch, 'core.translation.fetch', '%', 1),
                (@createBatch, 'customer.organization.list', '%', 1),
                (@createBatch, 'card.embossedType.fetch', '%', 1),
                (@createBatch, 'card.ownershipType.fetch', '%', 1),
                (@createBatch, 'card.product.list', '%', 1),
                (@createBatch, 'card.batch.fetch', '%', 1),
                (@createBatch, 'card.config.fetch', '%', 1),
                (@createBatch, 'card.batch.addNoNameBatch', '%', 1),
                (@createBatch, 'card.reason.list', '%', 1),
                (@createBatch, 'card.status.list', '%', 1)

---Card Batch Download Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Download')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @downloadBatch = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@downloadBatch, 'Card Batch Download', 'Download the file for card production', 1, 0, @roleId, 1)
END
ELSE
    SET @downloadBatch = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Download')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@downloadBatch, 'customer.organization.list', '%', 1),
            (@downloadBatch, 'card.embossedType.fetch', '%', 1),
            (@downloadBatch, 'card.ownershipType.fetch', '%', 1),
            (@downloadBatch, 'card.config.fetch', '%', 1),
            (@downloadBatch, 'card.batch.get', '%', 1),
            (@downloadBatch, 'card.batch.fetch', '%', 1),
            (@downloadBatch, 'card.product.list', '%', 1),
            (@downloadBatch, 'card.reason.list', '%', 1),
            (@downloadBatch, 'card.status.list', '%', 1),
            (@downloadBatch, 'card.batch.download', '%', 1),
            (@downloadBatch, 'card.batch.downloadCustom', '%', 1),
            (@downloadBatch, 'card.batch.statusUpdate', '%', 1),
            (@downloadBatch, 'card.batch.embosserFileGet', '%', 1)

---Card Batch Approve Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Approve')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @approveBatch = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@approveBatch, 'Card Batch Approve', 'Batch Approve', 1, 0, @roleId, 1)
END
ELSE
    SET @approveBatch = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Approve')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@approveBatch, 'customer.organization.list', '%', 1),
                (@approveBatch, 'core.translation.fetch', '%', 1),
                (@approveBatch, 'card.embossedType.fetch', '%', 1),
                (@approveBatch, 'card.ownershipType.fetch', '%', 1),
                (@approveBatch, 'card.product.list', '%', 1),
                (@approveBatch, 'card.batch.fetch', '%', 1),
                (@approveBatch, 'card.config.fetch', '%', 1),
                (@approveBatch, 'card.batch.get', '%', 1),
                (@approveBatch, 'card.batch.statusUpdate', '%', 1),
                (@approveBatch, 'card.batch.statusUpdateApprove', '%', 1),
                (@approveBatch, 'card.reason.list', '%', 1),
                (@approveBatch, 'card.status.list', '%', 1)

---Card Batch Reject Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Reject')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @rejectBatch = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@rejectBatch, 'Card Batch Reject', 'Batch Reject', 1, 0, @roleId, 1)
END
ELSE
    SET @rejectBatch = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Reject')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@rejectBatch, 'core.translation.fetch', '%', 1),
                (@rejectBatch, 'customer.organization.list', '%', 1),
                (@rejectBatch, 'card.embossedType.fetch', '%', 1),
                (@rejectBatch, 'card.ownershipType.fetch', '%', 1),
                (@rejectBatch, 'card.product.list', '%', 1),
                (@rejectBatch, 'card.batch.fetch', '%', 1),
                (@rejectBatch, 'card.config.fetch', '%', 1),
                (@rejectBatch, 'card.batch.get', '%', 1),
                (@rejectBatch, 'card.batch.statusUpdate', '%', 1),
                (@rejectBatch, 'card.batch.statusUpdateReject', '%', 1),
                (@rejectBatch, 'card.reason.list', '%', 1),
                (@rejectBatch, 'card.status.list', '%', 1)

---Card Batch Generate PIN Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Batch Generate PIN Mail')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @generatePinMail = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@generatePinMail, 'Card Batch Generate PIN Mail', 'Batch Generate PIN Mail', 1, 0, @roleId, 1)
END
ELSE
    SET @generatePinMail = (SELECT actorId FROM [user].[role] WHERE name = 'Card Batch Generate PIN Mail')

    INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@generatePinMail, 'core.translation.fetch', '%', 1),
                (@generatePinMail, 'customer.organization.list', '%', 1),
                (@generatePinMail, 'card.status.list', '%', 1),
                (@generatePinMail, 'card.embossedType.fetch', '%', 1),
                (@generatePinMail, 'card.ownershipType.fetch', '%', 1),
                (@generatePinMail, 'card.product.list', '%', 1),
                (@generatePinMail, 'card.batch.fetch', '%', 1),
                (@generatePinMail, 'card.config.fetch', '%', 1),
                (@generatePinMail, 'card.batch.get', '%', 1),
                (@generatePinMail, 'card.batch.generatePinMail', '%', 1),
                (@generatePinMail, 'card.reason.list', '%', 1),
                (@generatePinMail, 'card.batch.statusUpdate', '%', 1),
                (@generatePinMail, 'card.batch.pansGet', '%', 1),
                (@generatePinMail, 'card.card.panGet', '%', 1)

 ;MERGE INTO [user].actorAction t
  USING @userActorAction s
  ON s.actorId = t.actorId AND s.actionId = t.actionId AND s.objectId = t.objectId AND s.[level] = t.[level]
  WHEN NOT MATCHED BY TARGET THEN
  INSERT (actorId, actionId, objectId, [level])
  VALUES (s.actorId, s.actionId, s.objectId, s.[level]);
