DECLARE @roleId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'card')
DECLARE @userActorAction [user].[actorActionTT]

DECLARE @cardProductViewer BIGINT, @cardProductManager BIGINT
DECLARE @cardReasonViewer BIGINT, @cardReasonManager BIGINT
DECLARE @cardBinViewer BIGINT, @cardBinManager BIGINT
DECLARE @cardReports BIGINT
---Card Product Viewer Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Product Viewer')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardProductViewer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardProductViewer, 'Card Product Viewer', 'View Card Product details.', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardProductViewer = (SELECT actorId FROM [user].[role] WHERE name = 'Card Product Viewer')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardProductViewer, 'customer.organization.graphFetch', '%', 1),
            (@cardProductViewer, 'card.embossedType.fetch', '%', 1),
            (@cardProductViewer, 'card.ownershipType.fetch', '%', 1),
            (@cardProductViewer, 'card.config.fetch', '%', 1),            
            (@cardProductViewer, 'card.cardNumberConstruction.fetch', '%', 1),
            (@cardProductViewer, 'card.bin.fetch', '%', 1),
            (@cardProductViewer, 'card.periodicCardFee.fetch', '%', 1),
            (@cardProductViewer, 'card.customerType.list', '%', 1),
            (@cardProductViewer, 'card.accountType.list', '%', 1),
            (@cardProductViewer, 'card.product.fetch', '%', 1),
            (@cardProductViewer, 'card.product.get', '%', 1),
            (@cardProductViewer, 'card.status.list', '%', 1),
            (@cardProductViewer, 'card.reason.list', '%', 1),
            (@cardProductViewer, 'card.cipher.list', '%', 1),
            (@cardProductViewer, 'transfer.partner.list', '%', 1)

---Card Product Manager Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Product Manager')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardProductManager = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardProductManager, 'Card Product Manager', 'Create/Edit Card Products', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardProductManager = (SELECT actorId FROM [user].[role] WHERE name = 'Card Product Manager')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardProductManager, 'customer.organization.graphFetch', '%', 1),
            (@cardProductManager, 'card.embossedType.fetch', '%', 1),
            (@cardProductManager, 'card.ownershipType.fetch', '%', 1),
            (@cardProductManager, 'card.brand.fetch', '%', 1),
            (@cardProductManager, 'card.config.fetch', '%', 1),            
            (@cardProductManager, 'card.cardNumberConstruction.fetch', '%', 1),
            (@cardProductManager, 'card.bin.fetch', '%', 1),
            (@cardProductManager, 'card.periodicCardFee.fetch', '%', 1),
            (@cardProductManager, 'card.customerType.list', '%', 1),
            (@cardProductManager, 'card.accountType.list', '%', 1),
            (@cardProductManager, 'card.product.fetch', '%', 1),
            (@cardProductManager, 'card.product.get', '%', 1),
            (@cardProductManager, 'card.status.list', '%', 1),
            (@cardProductManager, 'card.product.add', '%', 1),
            (@cardProductManager, 'card.product.edit', '%', 1),
            (@cardProductManager, 'card.product.statusUpdate', '%', 1),
            (@cardProductManager, 'card.product.list', '%', 1),
            (@cardProductManager, 'card.reason.list', '%', 1),
            (@cardProductManager, 'card.cipher.list', '%', 1),
            (@cardProductManager, 'transfer.partner.list', '%', 1)



 ---Card Reason Viewer Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Reason Viewer')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardReasonViewer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardReasonViewer, 'Card Reason Viewer', 'View Card Reason details.', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardReasonViewer = (SELECT actorId FROM [user].[role] WHERE name = 'Card Reason Viewer')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardReasonViewer, 'customer.organization.graphFetch', '%', 1),
            (@cardReasonViewer, 'card.embossedType.fetch', '%', 1),
            (@cardReasonViewer, 'card.ownershipType.fetch', '%', 1),
            (@cardReasonViewer, 'card.config.fetch', '%', 1),
            (@cardReasonViewer, 'card.reason.fetch', '%', 1),
            (@cardReasonViewer, 'card.reason.get', '%', 1),
            (@cardReasonViewer, 'card.status.list', '%', 1),
            (@cardReasonViewer, 'card.reason.list', '%', 1),
            (@cardReasonViewer, 'card.moduleAction.list', '%', 1)

 ---Card Reason Manager Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Reason Manager')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardReasonManager = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardReasonManager, 'Card Reason Manager', 'Create/Edit Card Reasons.', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardReasonManager = (SELECT actorId FROM [user].[role] WHERE name = 'Card Reason Manager')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardReasonManager, 'customer.organization.graphFetch', '%', 1),
            (@cardReasonManager, 'card.config.fetch', '%', 1),
            (@cardReasonManager, 'card.embossedType.fetch', '%', 1),
            (@cardReasonManager, 'card.ownershipType.fetch', '%', 1),
            (@cardReasonManager, 'card.reason.fetch', '%', 1),
            (@cardReasonManager, 'card.reason.get', '%', 1),
            (@cardReasonManager, 'card.status.list', '%', 1),
            (@cardReasonManager, 'card.reason.list', '%', 1),
            (@cardReasonManager, 'card.moduleAction.list', '%', 1),
            (@cardReasonManager, 'card.reason.add', '%', 1),
            (@cardReasonManager, 'card.reason.edit', '%', 1),
            (@cardReasonManager, 'card.reason.delete', '%', 1),
            (@cardReasonManager, 'card.reason.statusUpdate', '%', 1)

 ---Card BIN Viewer Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card BIN Viewer')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardBinViewer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardBinViewer, 'Card BIN Viewer', 'View Card BIN details.', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardBinViewer = (SELECT actorId FROM [user].[role] WHERE name = 'Card BIN Viewer')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardBinViewer, 'customer.organization.graphFetch', '%', 1),
            (@cardBinViewer, 'card.config.fetch', '%', 1),
            (@cardBinViewer, 'card.embossedType.fetch', '%', 1),
            (@cardBinViewer, 'card.ownershipType.fetch', '%', 1),
            (@cardBinViewer, 'card.bin.fetch', '%', 1),
            (@cardBinViewer, 'card.bin.get', '%', 1),
            (@cardBinViewer, 'card.status.list', '%', 1),
            (@cardBinViewer, 'card.reason.list', '%', 1),
            (@cardBinViewer, 'card.moduleAction.list', '%', 1)

 ---Card BIN Manager Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card BIN Manager')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardBinManager = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardBinManager, 'Card BIN Manager', 'Create/Edit Card BINs', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardBinManager = (SELECT actorId FROM [user].[role] WHERE name = 'Card BIN Manager')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardBinManager, 'customer.organization.graphFetch', '%', 1),
            (@cardBinManager, 'card.config.fetch', '%', 1),
            (@cardBinManager, 'card.embossedType.fetch', '%', 1),
            (@cardBinManager, 'card.ownershipType.fetch', '%', 1),
            (@cardBinManager, 'card.bin.fetch', '%', 1),
            (@cardBinManager, 'card.bin.get', '%', 1),
            (@cardBinManager, 'card.status.list', '%', 1),
            (@cardBinManager, 'card.reason.list', '%', 1),
            (@cardBinManager, 'card.moduleAction.list', '%', 1),
            (@cardBinManager, 'card.bin.add', '%', 1),
            (@cardBinManager, 'card.bin.edit', '%', 1)

---Card Reports Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Reports')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardReports = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardReports, 'Card Reports', 'View Card Reports.', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardReports = (SELECT actorId FROM [user].[role] WHERE name = 'Card Reports')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardReports, 'customer.organization.graphFetch', '%', 1), 
            (@cardReports, 'customer.organization.list', '%', 1),           
            (@cardReports, 'card.config.fetch', '%', 1),            
            (@cardReports, 'card.status.list', '%', 1),
            (@cardReports, 'card.product.list', '%', 1),
            (@cardReports, 'card.moduleAction.list', '%', 1),
            (@cardReports, 'card.report.listOfCards', '%', 1),
            (@cardReports, 'card.report.export', '%', 1),
            (@cardReports, 'card.report.transfer', '%', 1)

 ;MERGE INTO [user].actorAction t
  USING @userActorAction s
  ON s.actorId = t.actorId AND s.actionId = t.actionId AND s.objectId = t.objectId AND s.[level] = t.[level]
  WHEN NOT MATCHED BY TARGET THEN 
  INSERT (actorId, actionId, objectId, [level])
  VALUES (s.actorId, s.actionId, s.objectId, s.[level]);