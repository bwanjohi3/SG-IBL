DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('card', 'Card Management', 'Card Management')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'roleCategory', @meta = @meta

DECLARE @roleId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'card')
DECLARE @userActorAction [user].[actorActionTT]
DECLARE @applicationViewer BIGINT, @declineApplication BIGINT, @rejectApplication BIGINT, @editApplication BIGINT, @createNamedBatch BIGINT, @removeFromBatch BIGINT
DECLARE @creatorNamedApplication BIGINT, @approveNamedApplication BIGINT, @creatorNoNameApplication BIGINT, @approveNoNameApplication BIGINT

---Card Application Viewer Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Application Viewer')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @applicationViewer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@applicationViewer, 'Card Application Viewer', 'View application details.', 1, 0, @roleId, 1)    
END
ELSE
    SET @applicationViewer = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Viewer')
 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@applicationViewer, 'customer.organization.graphFetch', '%', 1),
            (@applicationViewer, 'customer.organization.list', '%', 1),
            (@applicationViewer, 'card.config.fetch', '%', 1),
            (@applicationViewer, 'card.application.get', '%', 1),
            (@applicationViewer, 'card.account.search', '%', 1),
            (@applicationViewer, 'card.account.searchCustom', '%', 1),
            (@applicationViewer, 'card.application.fetch', '%', 1),
            (@applicationViewer, 'card.product.list', '%', 1),
            (@applicationViewer, 'card.embossedType.fetch', '%', 1),
            (@applicationViewer, 'card.ownershipType.fetch', '%', 1),
            (@applicationViewer, 'card.reason.list', '%', 1),
            (@applicationViewer, 'card.product.get', '%', 1),            
            (@applicationViewer, 'card.status.list', '%', 1) 

 ---Card No Name Application Creator

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card No Name Application Create')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @creatorNoNameApplication = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@creatorNoNameApplication, 'Card No Name Application Create', 'Create No Name Applications', 1, 0, @roleId, 1)    
END
ELSE
    SET @creatorNoNameApplication = (SELECT actorId FROM [user].[role] WHERE name = 'Card No Name Application Create')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@creatorNoNameApplication, 'customer.organization.graphFetch', '%', 1),
            (@creatorNoNameApplication, 'customer.organization.list', '%', 1),
            (@creatorNoNameApplication, 'card.config.fetch', '%', 1),
            (@creatorNoNameApplication, 'card.application.get', '%', 1),
            (@creatorNoNameApplication, 'card.application.fetch', '%', 1),
            (@creatorNoNameApplication, 'card.product.list', '%', 1),
            (@creatorNoNameApplication, 'card.embossedType.fetch', '%', 1),
            (@creatorNoNameApplication, 'card.ownershipType.fetch', '%', 1),
            (@creatorNoNameApplication, 'card.card.search', '%', 1),
            (@creatorNoNameApplication, 'card.customer.search', '%', 1),
            (@creatorNoNameApplication, 'card.person.search', '%', 1),
            (@creatorNoNameApplication, 'card.account.search', '%', 1),            
            (@creatorNoNameApplication, 'card.account.searchCustom', '%', 1),
            (@creatorNoNameApplication, 'card.noNameApplication.add', '%', 1),
            (@creatorNoNameApplication, 'card.reason.list', '%', 1),
            (@creatorNoNameApplication, 'card.product.get', '%', 1),
            (@creatorNoNameApplication, 'card.documentType.list', '%', 1),
            (@creatorNoNameApplication, 'card.documentApplication.add', '%', 1),
            (@creatorNoNameApplication, 'document.document.add', '%', 1),
            (@creatorNoNameApplication, 'document.attachment.add', '%', 1),
			(@creatorNoNameApplication, 'card.issueType.fetch', '%', 1),
			(@creatorNoNameApplication, 'card.customer.searchTSS', '%', 1),
			(@creatorNoNameApplication, 'card.account.searchTSS', '%', 1),
			(@creatorNoNameApplication, 'card.type.list', '%', 1),
			(@creatorNoNameApplication, 'card.person.searchTSS', '%', 1),
            (@creatorNoNameApplication, 'card.status.list', '%', 1)

 ---Card Named Application Creator

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Named Application Create')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @creatorNamedApplication = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@creatorNamedApplication, 'Card Named Application Create', 'Create Named Card Applications', 1, 0, @roleId, 1)    
END
ELSE
    SET @creatorNamedApplication = (SELECT actorId FROM [user].[role] WHERE name = 'Card Named Application Create')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@creatorNamedApplication, 'customer.organization.graphFetch', '%', 1),
            (@creatorNamedApplication, 'customer.organization.list', '%', 1),
            (@creatorNamedApplication, 'card.config.fetch', '%', 1),
            (@creatorNamedApplication, 'card.application.get', '%', 1),
            (@creatorNamedApplication, 'card.application.fetch', '%', 1),
            (@creatorNamedApplication, 'card.product.list', '%', 1),
            (@creatorNamedApplication, 'card.embossedType.fetch', '%', 1),
            (@creatorNamedApplication, 'card.ownershipType.fetch', '%', 1),
            (@creatorNamedApplication, 'card.card.search', '%', 1),
            (@creatorNamedApplication, 'card.account.search', '%', 1),            
            (@creatorNamedApplication, 'card.account.searchCustom', '%', 1),
            (@creatorNamedApplication, 'card.customer.search', '%', 1),
            (@creatorNamedApplication, 'card.person.search', '%', 1),
            (@creatorNamedApplication, 'card.application.add', '%', 1),
            (@creatorNamedApplication, 'card.reason.list', '%', 1),
            (@creatorNamedApplication, 'card.product.get', '%', 1),
            (@creatorNamedApplication, 'card.documentType.list', '%', 1),
            (@creatorNamedApplication, 'card.documentApplication.add', '%', 1),
            (@creatorNamedApplication, 'document.document.add', '%', 1),
            (@creatorNamedApplication, 'document.attachment.add', '%', 1),
			(@creatorNamedApplication, 'card.type.list', '%', 1),
            (@creatorNamedApplication, 'card.status.list', '%', 1)

---Card No Name Application Approve

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card No Name Application Approve')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @approveNoNameApplication = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@approveNoNameApplication, 'Card No Name Application Approve', 'Approve No Name Applications', 1, 0, @roleId, 1)    
END
ELSE
    SET @approveNoNameApplication = (SELECT actorId FROM [user].[role] WHERE name = 'Card No Name Application Approve')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@approveNoNameApplication, 'customer.organization.graphFetch', '%', 1),
            (@approveNoNameApplication, 'customer.organization.list', '%', 1),
            (@approveNoNameApplication, 'card.config.fetch', '%', 1),
            (@approveNoNameApplication, 'card.application.get', '%', 1),
            (@approveNoNameApplication, 'card.application.fetch', '%', 1),
            (@approveNoNameApplication, 'card.product.list', '%', 1),
            (@approveNoNameApplication, 'card.embossedType.fetch', '%', 1),
			(@approveNoNameApplication, 'card.type.list', '%', 1),
            (@approveNoNameApplication, 'card.ownershipType.fetch', '%', 1),
            (@approveNoNameApplication, 'card.reason.list', '%', 1),
            (@approveNoNameApplication, 'card.product.get', '%', 1),            
            (@approveNoNameApplication, 'card.status.list', '%', 1),
            (@approveNoNameApplication, 'card.account.search', '%', 1),
            (@approveNoNameApplication, 'card.account.searchCustom', '%', 1),
            (@approveNoNameApplication, 'card.application.statusUpdateApproveNoName', '%', 1),
            (@approveNoNameApplication, 'card.application.statusUpdate', '%', 1)  
            
---Card Named Application Approve

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Named Application Approve')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @approveNamedApplication = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@approveNamedApplication, 'Card Named Application Approve', 'Approve Named Applications', 1, 0, @roleId, 1)    
END
ELSE
    SET @approveNamedApplication = (SELECT actorId FROM [user].[role] WHERE name = 'Card Named Application Approve')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@approveNamedApplication, 'customer.organization.graphFetch', '%', 1),
            (@approveNamedApplication, 'customer.organization.list', '%', 1),
            (@approveNamedApplication, 'card.config.fetch', '%', 1),
            (@approveNamedApplication, 'card.application.get', '%', 1),
            (@approveNamedApplication, 'card.application.fetch', '%', 1),
            (@approveNamedApplication, 'card.product.list', '%', 1),
            (@approveNamedApplication, 'card.embossedType.fetch', '%', 1),
            (@approveNamedApplication, 'card.ownershipType.fetch', '%', 1),
            (@approveNamedApplication, 'card.reason.list', '%', 1),
            (@approveNamedApplication, 'card.product.get', '%', 1),            
            (@approveNamedApplication, 'card.status.list', '%', 1),
            (@approveNamedApplication, 'card.application.statusUpdateApproveName', '%', 1),
            (@approveNamedApplication, 'card.application.statusUpdate', '%', 1) ,
            (@approveNamedApplication, 'card.account.search', '%', 1),
            (@approveNamedApplication, 'card.account.searchCustom', '%', 1)
                     

---Card Application Decline Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Application Decline')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @declineApplication = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@declineApplication, 'Card Application Decline', 'Decline applications', 1, 0, @roleId, 1)    
END
ELSE
    SET @declineApplication = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Decline')
 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@declineApplication, 'customer.organization.graphFetch', '%', 1),
            (@declineApplication, 'customer.organization.list', '%', 1),
            (@declineApplication, 'card.config.fetch', '%', 1),
            (@declineApplication, 'card.application.get', '%', 1),
            (@declineApplication, 'card.application.fetch', '%', 1),
            (@declineApplication, 'card.product.list', '%', 1),
            (@declineApplication, 'card.embossedType.fetch', '%', 1),
            (@declineApplication, 'card.ownershipType.fetch', '%', 1),
            (@declineApplication, 'card.reason.list', '%', 1),
            (@declineApplication, 'card.product.get', '%', 1),            
            (@declineApplication, 'card.status.list', '%', 1),
            (@declineApplication, 'card.application.statusUpdateDecline', '%', 1),
            (@declineApplication, 'card.application.statusUpdate', '%', 1) ,
            (@declineApplication, 'card.account.search', '%', 1),
            (@declineApplication, 'card.account.searchCustom', '%', 1)

---Card Application Reject Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Application Reject')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @rejectApplication = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@rejectApplication, 'Card Application Reject', 'Reject applications', 1, 0, @roleId, 1)    
END
ELSE
    SET @rejectApplication = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Reject')
 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@rejectApplication, 'customer.organization.graphFetch', '%', 1),
            (@rejectApplication, 'customer.organization.list', '%', 1),
            (@rejectApplication, 'card.config.fetch', '%', 1),
            (@rejectApplication, 'card.application.get', '%', 1),
            (@rejectApplication, 'card.application.fetch', '%', 1),
            (@rejectApplication, 'card.product.list', '%', 1),
            (@rejectApplication, 'card.embossedType.fetch', '%', 1),
            (@rejectApplication, 'card.ownershipType.fetch', '%', 1),
            (@rejectApplication, 'card.reason.list', '%', 1),
            (@rejectApplication, 'card.product.get', '%', 1),            
            (@rejectApplication, 'card.status.list', '%', 1),
            (@rejectApplication, 'card.application.statusUpdateReject', '%', 1),
            (@rejectApplication, 'card.application.statusUpdate', '%', 1),
            (@rejectApplication, 'card.account.search', '%', 1),
            (@rejectApplication, 'card.account.searchCustom', '%', 1)

---Card Named Application Edit

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Application Edit')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @editApplication = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@editApplication, 'Card Application Edit', 'Edit Card Applications', 1, 0, @roleId, 1)    
END
ELSE
    SET @editApplication = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Edit')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@editApplication, 'customer.organization.graphFetch', '%', 1),
            (@editApplication, 'customer.organization.list', '%', 1),
            (@editApplication, 'card.config.fetch', '%', 1),
            (@editApplication, 'card.application.get', '%', 1),
            (@editApplication, 'card.application.fetch', '%', 1),
            (@editApplication, 'card.product.list', '%', 1),
            (@editApplication, 'card.embossedType.fetch', '%', 1),
            (@editApplication, 'card.ownershipType.fetch', '%', 1),
            (@editApplication, 'card.card.search', '%', 1),
            (@editApplication, 'card.customer.search', '%', 1),
            (@editApplication, 'card.person.search', '%', 1),
            (@editApplication, 'card.account.search', '%', 1),
            (@editApplication, 'card.account.searchCustom', '%', 1),            
            (@editApplication, 'card.documentApplication.edit', '%', 1),
            (@editApplication, 'card.reason.list', '%', 1),
            (@editApplication, 'card.product.get', '%', 1),
            (@editApplication, 'card.documentType.list', '%', 1),
            (@editApplication, 'card.application.statusUpdateEdit', '%', 1),
            (@editApplication, 'card.application.statusUpdate', '%', 1),
            (@editApplication, 'document.document.add', '%', 1),
            (@editApplication, 'document.attachment.add', '%', 1),
            (@editApplication, 'card.status.list', '%', 1)

---Card Create Named Batch Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Create Named Batch')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @createNamedBatch = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@createNamedBatch, 'Create Named Batch', 'Create Named Batch', 1, 0, @roleId, 1)    
END
ELSE
    SET @createNamedBatch = (SELECT actorId FROM [user].[role] WHERE name = 'Create Named Batch')
 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@createNamedBatch, 'customer.organization.graphFetch', '%', 1),
            (@createNamedBatch, 'customer.organization.list', '%', 1),
            (@createNamedBatch, 'card.config.fetch', '%', 1),
            (@createNamedBatch, 'card.application.get', '%', 1),
            (@createNamedBatch, 'card.application.fetch', '%', 1),
            (@createNamedBatch, 'card.product.list', '%', 1),
            (@createNamedBatch, 'card.batch.list', '%', 1),
            (@createNamedBatch, 'card.embossedType.fetch', '%', 1),
            (@createNamedBatch, 'card.ownershipType.fetch', '%', 1),
            (@createNamedBatch, 'card.reason.list', '%', 1),
            (@createNamedBatch, 'card.product.get', '%', 1),            
            (@createNamedBatch, 'card.status.list', '%', 1),
            (@createNamedBatch, 'card.account.search', '%', 1),
            (@createNamedBatch, 'card.account.searchCustom', '%', 1),
            (@createNamedBatch, 'card.application.statusUpdateAddToBatch', '%', 1),
            (@createNamedBatch, 'card.application.statusUpdateCreateBatch', '%', 1),
            (@createNamedBatch, 'card.application.statusUpdate', '%', 1)

---Card Application Remove from Batch Role

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Application Remove From Batch')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @removeFromBatch = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@removeFromBatch, 'Card Application Remove From Batch', 'Remove Application From Batch', 1, 0, @roleId, 1)    
END
ELSE
    SET @removeFromBatch = (SELECT actorId FROM [user].[role] WHERE name = 'Card Application Remove From Batch')
 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@removeFromBatch, 'customer.organization.graphFetch', '%', 1),
            (@removeFromBatch, 'customer.organization.list', '%', 1),
            (@removeFromBatch, 'card.config.fetch', '%', 1),
            (@removeFromBatch, 'card.application.get', '%', 1),
            (@removeFromBatch, 'card.application.fetch', '%', 1),
            (@removeFromBatch, 'card.product.list', '%', 1),
            (@removeFromBatch, 'card.embossedType.fetch', '%', 1),
            (@removeFromBatch, 'card.ownershipType.fetch', '%', 1),
            (@removeFromBatch, 'card.reason.list', '%', 1),
            (@removeFromBatch, 'card.product.get', '%', 1),            
            (@removeFromBatch, 'card.status.list', '%', 1),           
            (@removeFromBatch, 'card.application.statusUpdateRemoveFromBatch', '%', 1),
            (@removeFromBatch, 'card.application.statusUpdate', '%', 1),
            (@removeFromBatch, 'card.account.search', '%', 1),
            (@removeFromBatch, 'card.account.searchCustom', '%', 1)

 ;MERGE INTO [user].actorAction t
  USING @userActorAction s
  ON s.actorId = t.actorId AND s.actionId = t.actionId AND s.objectId = t.objectId AND s.[level] = t.[level]
  WHEN NOT MATCHED BY TARGET THEN 
  INSERT (actorId, actionId, objectId, [level])
  VALUES (s.actorId, s.actionId, s.objectId, s.[level]);