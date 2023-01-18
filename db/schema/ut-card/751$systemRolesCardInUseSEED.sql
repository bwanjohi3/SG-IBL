DECLARE @roleId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'card')
DECLARE @userActorAction [user].[actorActionTT]

DECLARE @cardsInUseViewer BIGINT,  @cardViewer BIGINT, @cardsInUseHot BIGINT, @cardsInUseDeactivate BIGINT, @cardsInUseResetPINRetries BIGINT,
        @cardsInUseDestruct BIGINT, @cardsInUseDestructChecker BIGINT, @cardsInUseActivate BIGINT, @cardsInUseApproveActivate BIGINT,
        @approveDeactivation BIGINT, @rejectActivation BIGINT, @generatePinMail BIGINT, @cardsInUseEdit BIGINT

---Card In Use Viewer Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Viewer')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseViewer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseViewer, 'Card CardsInUse Viewer', 'View cards in use details.', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseViewer = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Viewer')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardsInUseViewer, 'customer.organization.graphFetch', '%', 1),
            (@cardsInUseViewer, 'customer.organization.list', '%', 1),
            (@cardsInUseViewer, 'card.embossedType.fetch', '%', 1),
            (@cardsInUseViewer, 'card.ownershipType.fetch', '%', 1),
            (@cardsInUseViewer, 'card.config.fetch', '%', 1),
            (@cardsInUseViewer, 'card.card.get', '%', 1),            
            (@cardsInUseViewer, 'card.product.list', '%', 1),
            (@cardsInUseViewer, 'card.cardInUse.fetch', '%', 1),
            (@cardsInUseViewer, 'card.cardInUse.get', '%', 1),
            (@cardsInUseViewer, 'card.account.search', '%', 1),
            (@cardsInUseViewer, 'card.account.searchCustom', '%', 1),
            (@cardsInUseViewer, 'card.documentType.list', '%', 1),
            (@cardsInUseViewer, 'card.reason.list', '%', 1),
            (@cardsInUseViewer, 'card.status.list', '%', 1) 
            
---Card In Use Hot Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Hot')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseHot = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseHot, 'Card CardsInUse Hot', 'Set card to Hot status', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseHot = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Hot')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardsInUseHot, 'customer.organization.graphFetch', '%', 1),
                (@cardsInUseHot, 'customer.organization.list', '%', 1),
                (@cardsInUseHot, 'card.embossedType.fetch', '%', 1),
                (@cardsInUseHot, 'card.ownershipType.fetch', '%', 1),
                (@cardsInUseHot, 'card.config.fetch', '%', 1),
                (@cardsInUseHot, 'card.card.get', '%', 1),                
                (@cardsInUseHot, 'card.product.list', '%', 1),
                (@cardsInUseHot, 'card.cardInUse.fetch', '%', 1),
                (@cardsInUseHot, 'card.cardInUse.get', '%', 1),
                (@cardsInUseHot, 'card.account.search', '%', 1),
                (@cardsInUseHot, 'card.account.searchCustom', '%', 1),
                (@cardsInUseHot, 'card.documentType.list', '%', 1),
                (@cardsInUseHot, 'card.reason.list', '%', 1),
                (@cardsInUseHot, 'card.cardInUse.statusUpdate', '%', 1),
                (@cardsInUseHot, 'card.cardInUse.statusUpdateHOT', '%', 1),
                (@cardsInUseHot, 'card.status.list', '%', 1) 

 ---Card In Use  Reset PIN rertries Role 
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Reset PIN Retries')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseResetPINRetries = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseResetPINRetries, 'Card CardsInUse Reset PIN Retries', 'Reset PIN rertries for card', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseResetPINRetries = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Reset PIN Retries')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardsInUseResetPINRetries, 'customer.organization.graphFetch', '%', 1),
            (@cardsInUseResetPINRetries, 'customer.organization.list', '%', 1),
            (@cardsInUseResetPINRetries, 'card.embossedType.fetch', '%', 1),
            (@cardsInUseResetPINRetries, 'card.ownershipType.fetch', '%', 1),
            (@cardsInUseResetPINRetries, 'card.config.fetch', '%', 1),
            (@cardsInUseResetPINRetries, 'card.card.get', '%', 1),
            (@cardsInUseResetPINRetries, 'card.product.list', '%', 1),
            (@cardsInUseResetPINRetries, 'card.cardInUse.fetch', '%', 1),
            (@cardsInUseResetPINRetries, 'card.cardInUse.get', '%', 1),
            (@cardsInUseResetPINRetries, 'card.account.search', '%', 1),
            (@cardsInUseResetPINRetries, 'card.account.searchCustom', '%', 1),
            (@cardsInUseResetPINRetries, 'card.documentType.list', '%', 1),
            (@cardsInUseResetPINRetries, 'card.reason.list', '%', 1),
            (@cardsInUseResetPINRetries, 'card.cardInUse.statusUpdate', '%', 1),
            (@cardsInUseResetPINRetries, 'card.cardInUse.ResetPINRetries', '%', 1),
            (@cardsInUseResetPINRetries, 'card.status.list', '%', 1) 


 ---Card In Use Deactivate Role 
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Deactivate')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseDeactivate = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseDeactivate, 'Card CardsInUse Deactivate', 'Set card to Inactive status', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseDeactivate = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Deactivate')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardsInUseDeactivate, 'customer.organization.graphFetch', '%', 1),
            (@cardsInUseDeactivate, 'customer.organization.list', '%', 1),
            (@cardsInUseDeactivate, 'card.embossedType.fetch', '%', 1),
            (@cardsInUseDeactivate, 'card.ownershipType.fetch', '%', 1),
            (@cardsInUseDeactivate, 'card.config.fetch', '%', 1),
            (@cardsInUseDeactivate, 'card.card.get', '%', 1),            
            (@cardsInUseDeactivate, 'card.product.list', '%', 1),
            (@cardsInUseDeactivate, 'card.cardInUse.fetch', '%', 1),
            (@cardsInUseDeactivate, 'card.cardInUse.get', '%', 1),
            (@cardsInUseDeactivate, 'card.account.search', '%', 1),
            (@cardsInUseDeactivate, 'card.account.searchCustom', '%', 1),
            (@cardsInUseDeactivate, 'card.documentType.list', '%', 1),
            (@cardsInUseDeactivate, 'card.reason.list', '%', 1),
            (@cardsInUseDeactivate, 'card.cardInUse.statusUpdate', '%', 1),
            (@cardsInUseDeactivate, 'card.cardInUse.statusUpdateDeactivate', '%', 1),
            (@cardsInUseDeactivate, 'card.status.list', '%', 1) 

 
 ---Card In Use Deactivation Checker Role 
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Active Card Deactivation Checker')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @approveDeactivation = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@approveDeactivation, 'Active Card Deactivation Checker', 'Approve/Reject Active Card Deactivation', 1, 0, @roleId, 1)    
END
ELSE
    SET @approveDeactivation = (SELECT actorId FROM [user].[role] WHERE name = 'Active Card Deactivation Checker')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@approveDeactivation, 'customer.organization.graphFetch', '%', 1),
            (@approveDeactivation, 'customer.organization.list', '%', 1),
            (@approveDeactivation, 'card.embossedType.fetch', '%', 1),
            (@approveDeactivation, 'card.ownershipType.fetch', '%', 1),
            (@approveDeactivation, 'card.config.fetch', '%', 1),
            (@approveDeactivation, 'card.card.get', '%', 1),            
            (@approveDeactivation, 'card.product.list', '%', 1),
            (@approveDeactivation, 'card.cardInUse.fetch', '%', 1),
            (@approveDeactivation, 'card.cardInUse.get', '%', 1),
            (@approveDeactivation, 'card.account.search', '%', 1),
            (@approveDeactivation, 'card.account.searchCustom', '%', 1),
            (@approveDeactivation, 'card.documentType.list', '%', 1),
            (@approveDeactivation, 'card.reason.list', '%', 1),
            (@approveDeactivation, 'card.cardInUse.statusUpdate', '%', 1),
            (@approveDeactivation, 'card.cardInUse.statusUpdateApproveDeactivation', '%', 1),
            (@approveDeactivation, 'card.cardInUse.statusUpdateRejectDeactivation', '%', 1),
            (@approveDeactivation, 'card.status.list', '%', 1) 

 ---Card In Use Destruct Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Destruct')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseDestruct = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseDestruct, 'Card CardsInUse Destruct', 'Set card to Pending Destruction status', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseDestruct = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Destruct')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardsInUseDestruct, 'customer.organization.graphFetch', '%', 1),
            (@cardsInUseDestruct, 'customer.organization.list', '%', 1),
            (@cardsInUseDestruct, 'card.embossedType.fetch', '%', 1),
            (@cardsInUseDestruct, 'card.ownershipType.fetch', '%', 1),
            (@cardsInUseDestruct, 'card.config.fetch', '%', 1),
            (@cardsInUseDestruct, 'card.card.get', '%', 1),            
            (@cardsInUseDestruct, 'card.product.list', '%', 1),
            (@cardsInUseDestruct, 'card.cardInUse.fetch', '%', 1),
            (@cardsInUseDestruct, 'card.cardInUse.get', '%', 1),
            (@cardsInUseDestruct, 'card.account.search', '%', 1),
            (@cardsInUseDestruct, 'card.account.searchCustom', '%', 1),
            (@cardsInUseDestruct, 'card.documentType.list', '%', 1),
            (@cardsInUseDestruct, 'card.reason.list', '%', 1),
            (@cardsInUseDestruct, 'card.cardInUse.statusUpdate', '%', 1),         
            (@cardsInUseDestruct, 'card.cardInUse.statusUpdateDestructFromHot', '%', 1),
            (@cardsInUseDestruct, 'card.cardInUse.statusUpdateDestructFromInactive', '%', 1),
            (@cardsInUseDestruct, 'card.cardInUse.statusUpdateDestructFromAccepted', '%', 1),
            (@cardsInUseDestruct, 'card.status.list', '%', 1) 


 ---Card In Use Destruction Checker Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Destruction Checker')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseDestructChecker = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseDestructChecker, 'Card CardsInUse Destruction Checker', 'Approve/Reject Card in Use Destruction', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseDestructChecker = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Destruction Checker')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardsInUseDestructChecker, 'customer.organization.graphFetch', '%', 1),
            (@cardsInUseDestructChecker, 'customer.organization.list', '%', 1),
            (@cardsInUseDestructChecker, 'card.embossedType.fetch', '%', 1),
            (@cardsInUseDestructChecker, 'card.ownershipType.fetch', '%', 1),
            (@cardsInUseDestructChecker, 'card.config.fetch', '%', 1),
            (@cardsInUseDestructChecker, 'card.card.get', '%', 1),
            (@cardsInUseDestructChecker, 'card.product.list', '%', 1),
            (@cardsInUseDestructChecker, 'card.cardInUse.fetch', '%', 1),
            (@cardsInUseDestructChecker, 'card.cardInUse.get', '%', 1),
            (@cardsInUseDestructChecker, 'card.account.search', '%', 1),
            (@cardsInUseDestructChecker, 'card.account.searchCustom', '%', 1),
            (@cardsInUseDestructChecker, 'card.documentType.list', '%', 1),
            (@cardsInUseDestructChecker, 'card.reason.list', '%', 1),
            (@cardsInUseDestructChecker, 'card.cardInUse.statusUpdate', '%', 1),
            (@cardsInUseDestructChecker, 'card.cardInUse.statusUpdateApproveDestruction', '%', 1),
            (@cardsInUseDestructChecker, 'card.cardInUse.statusUpdateRejectDestruction', '%', 1),
            (@cardsInUseDestructChecker, 'card.status.list', '%', 1)

---Card In Use Activate Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Activate')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseActivate = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseActivate, 'Card CardsInUse Activate', 'Set card to Pending Activation status', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseActivate = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Activate')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	        VALUES (@cardsInUseActivate, 'customer.organization.graphFetch', '%', 1),
                (@cardsInUseActivate, 'customer.organization.list', '%', 1),
                (@cardsInUseActivate, 'card.embossedType.fetch', '%', 1),
                (@cardsInUseActivate, 'card.ownershipType.fetch', '%', 1),
                (@cardsInUseActivate, 'card.config.fetch', '%', 1),
                (@cardsInUseActivate, 'card.card.get', '%', 1),                
                (@cardsInUseActivate, 'card.product.list', '%', 1),
                (@cardsInUseActivate, 'card.cardInUse.fetch', '%', 1),
                (@cardsInUseActivate, 'card.cardInUse.get', '%', 1),
                (@cardsInUseActivate, 'card.account.search', '%', 1),
                (@cardsInUseActivate, 'card.account.searchCustom', '%', 1),
                (@cardsInUseActivate, 'card.documentType.list', '%', 1),
                (@cardsInUseActivate, 'card.documentCard.edit', '%', 1), 
                (@cardsInUseActivate, 'card.reason.list', '%', 1),
                (@cardsInUseActivate, 'card.cardInUse.statusUpdate', '%', 1),
                (@cardsInUseActivate, 'card.cardInUse.statusUpdateActivate', '%', 1),             
                (@cardsInUseActivate, 'card.status.list', '%', 1) 

---Card In Use Approve Activation Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Approve Activation')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseApproveActivate = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseApproveActivate, 'Card CardsInUse Approve Activation', 'Approve Card Activation', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseApproveActivate = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Approve Activation')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	        VALUES (@cardsInUseApproveActivate, 'customer.organization.graphFetch', '%', 1),
                (@cardsInUseApproveActivate, 'customer.organization.list', '%', 1),
                (@cardsInUseApproveActivate, 'card.embossedType.fetch', '%', 1),
                (@cardsInUseApproveActivate, 'card.ownershipType.fetch', '%', 1),
                (@cardsInUseApproveActivate, 'card.config.fetch', '%', 1),
                (@cardsInUseApproveActivate, 'card.card.get', '%', 1),                
                (@cardsInUseApproveActivate, 'card.product.list', '%', 1),
                (@cardsInUseApproveActivate, 'card.cardInUse.fetch', '%', 1),
                (@cardsInUseApproveActivate, 'card.cardInUse.get', '%', 1),
                (@cardsInUseApproveActivate, 'card.account.search', '%', 1),
                (@cardsInUseApproveActivate, 'card.account.searchCustom', '%', 1),
                (@cardsInUseApproveActivate, 'card.documentType.list', '%', 1),
                (@cardsInUseApproveActivate, 'card.documentCard.edit', '%', 1), 
                (@cardsInUseApproveActivate, 'card.reason.list', '%', 1),
                (@cardsInUseApproveActivate, 'card.cardInUse.statusUpdate', '%', 1),                                
                (@cardsInUseApproveActivate, 'card.cardInUse.statusUpdateApproveActivate', '%', 1),
                (@cardsInUseApproveActivate, 'card.status.list', '%', 1) 


---Card In Use Reject Activation Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Reject Card Activation')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @rejectActivation = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@rejectActivation, 'Reject Card Activation', 'Reject Card Activation', 1, 0, @roleId, 1)    
END
ELSE
    SET @rejectActivation = (SELECT actorId FROM [user].[role] WHERE name = 'Reject Card Activation')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	        VALUES (@rejectActivation, 'customer.organization.graphFetch', '%', 1),
                (@rejectActivation, 'customer.organization.list', '%', 1),
                (@rejectActivation, 'card.config.fetch', '%', 1),
                (@rejectActivation, 'card.embossedType.fetch', '%', 1),
                (@rejectActivation, 'card.ownershipType.fetch', '%', 1),
                (@rejectActivation, 'card.card.get', '%', 1),                
                (@rejectActivation, 'card.product.list', '%', 1),
                (@rejectActivation, 'card.cardInUse.fetch', '%', 1),
                (@rejectActivation, 'card.cardInUse.get', '%', 1),
                (@rejectActivation, 'card.account.search', '%', 1),
                (@rejectActivation, 'card.account.searchCustom', '%', 1),
                (@rejectActivation, 'card.documentType.list', '%', 1),
                (@rejectActivation, 'card.documentCard.edit', '%', 1), 
                (@rejectActivation, 'card.reason.list', '%', 1),
                (@rejectActivation, 'card.cardInUse.statusUpdate', '%', 1),                                
                (@rejectActivation, 'card.cardInUse.statusUpdateRejectActivation', '%', 1),
                (@rejectActivation, 'card.status.list', '%', 1) 

 ---Active Cards Generate PIN Mail Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Generate PIN Mail Active Cards')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @generatePinMail = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@generatePinMail, 'Generate PIN Mail Active Cards', 'Generate PIN Mail for Active Card', 1, 0, @roleId, 1)    
END
ELSE
    SET @generatePinMail = (SELECT actorId FROM [user].[role] WHERE name = 'Generate PIN Mail Active Cards')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@generatePinMail, 'customer.organization.graphFetch', '%', 1),
            (@generatePinMail, 'customer.organization.list', '%', 1),
            (@generatePinMail, 'card.embossedType.fetch', '%', 1),
            (@generatePinMail, 'card.ownershipType.fetch', '%', 1),
            (@generatePinMail, 'card.config.fetch', '%', 1),
            (@generatePinMail, 'card.card.get', '%', 1),
            (@generatePinMail, 'card.card.panGet', '%', 1),
            (@generatePinMail, 'card.product.list', '%', 1),
            (@generatePinMail, 'card.cardInUse.fetch', '%', 1),
            (@generatePinMail, 'card.cardInUse.get', '%', 1),
            (@generatePinMail, 'card.account.search', '%', 1),
            (@generatePinMail, 'card.account.searchCustom', '%', 1),
            (@generatePinMail, 'card.documentType.list', '%', 1),
            (@generatePinMail, 'card.documentCard.edit', '%', 1), 
            (@generatePinMail, 'card.reason.list', '%', 1),
            (@generatePinMail, 'card.batch.generatePinMail', '%', 1),         
            (@generatePinMail, 'card.status.list', '%', 1) 

---Card In Use Edit Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card CardsInUse Edit')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsInUseEdit = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsInUseEdit, 'Card CardsInUse Edit', 'Edit Active Cards', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsInUseEdit = (SELECT actorId FROM [user].[role] WHERE name = 'Card CardsInUse Edit')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	        VALUES (@cardsInUseEdit, 'customer.organization.graphFetch', '%', 1),
                (@cardsInUseEdit, 'customer.organization.list', '%', 1),
                (@cardsInUseEdit, 'card.embossedType.fetch', '%', 1),
                (@cardsInUseEdit, 'card.ownershipType.fetch', '%', 1),
                (@cardsInUseEdit, 'card.config.fetch', '%', 1),
                (@cardsInUseEdit, 'card.card.get', '%', 1),                
                (@cardsInUseEdit, 'card.product.list', '%', 1),
                (@cardsInUseEdit, 'card.cardInUse.fetch', '%', 1),
                (@cardsInUseEdit, 'card.cardInUse.get', '%', 1),
                (@cardsInUseEdit, 'card.account.search', '%', 1),
                (@cardsInUseEdit, 'card.account.searchCustom', '%', 1),
                (@cardsInUseEdit, 'card.documentType.list', '%', 1),
                (@cardsInUseEdit, 'card.documentCard.edit', '%', 1), 
                (@cardsInUseEdit, 'card.reason.list', '%', 1),
                (@cardsInUseEdit, 'card.cardInUse.statusUpdate', '%', 1),                                
                (@cardsInUseEdit, 'card.cardInUse.statusUpdateEdit', '%', 1),
                (@cardsInUseEdit, 'card.status.list', '%', 1)

 ;MERGE INTO [user].actorAction t
  USING @userActorAction s
  ON s.actorId = t.actorId AND s.actionId = t.actionId AND s.objectId = t.objectId AND s.[level] = t.[level]
  WHEN NOT MATCHED BY TARGET THEN 
  INSERT (actorId, actionId, objectId, [level])
  VALUES (s.actorId, s.actionId, s.objectId, s.[level]);
