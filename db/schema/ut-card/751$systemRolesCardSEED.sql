DECLARE @roleId BIGINT = (SELECT itemNameId FROM [core].[itemName] i JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId WHERE it.[name] = 'roleCategory' AND itemCode = 'card')
DECLARE @userActorAction [user].[actorActionTT]

DECLARE @cardsReadyCardsViewer BIGINT, @readyCardsAllocator BIGINT, @readyCardsDestruct BIGINT, @readyCardsDestructionChecker BIGINT,
        @declineAcceptedCards BIGINT, @declineCardAcceptance BIGINT, @declineCardAllocation BIGINT, @generatePinMail BIGINT,
        @approveAllocation BIGINT, @rejectAllocation BIGINT, @acceptCards BIGINT, @approveAcceptance BIGINT, @rejectSentCards BIGINT,
        @rejectAcceptance BIGINT, @acceptRejectedCards BIGINT, @acceptDeclinedCards BIGINT

---Cards In Production Viewer Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Cards In Production Viewer')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @cardsReadyCardsViewer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@cardsReadyCardsViewer, 'Cards In Production Viewer', 'View Card In Production details.', 1, 0, @roleId, 1)    
END
ELSE
    SET @cardsReadyCardsViewer = (SELECT actorId FROM [user].[role] WHERE name = 'Cards In Production Viewer')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@cardsReadyCardsViewer, 'customer.organization.graphFetch', '%', 1),
                (@cardsReadyCardsViewer, 'customer.organization.list', '%', 1),
                (@cardsReadyCardsViewer, 'card.embossedType.fetch', '%', 1),
                (@cardsReadyCardsViewer, 'card.ownershipType.fetch', '%', 1),
                (@cardsReadyCardsViewer, 'card.config.fetch', '%', 1),
                (@cardsReadyCardsViewer, 'card.card.get', '%', 1),                
                (@cardsReadyCardsViewer, 'card.product.list', '%', 1),
                (@cardsReadyCardsViewer, 'card.cardInProduction.fetch', '%', 1),
                (@cardsReadyCardsViewer, 'card.cardInProduction.get', '%', 1),
                (@cardsReadyCardsViewer, 'card.status.list', '%', 1),
                (@cardsReadyCardsViewer, 'card.reason.list', '%', 1)

---Cards In Production Allocate Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Cards In Production Allocate')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @readyCardsAllocator = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@readyCardsAllocator, 'Cards In Production Allocate', 'Change Cards In Production Allocate location.', 1, 0, @roleId, 1)    
END
ELSE
    SET @readyCardsAllocator = (SELECT actorId FROM [user].[role] WHERE name = 'Cards In Production Allocate')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@readyCardsAllocator, 'customer.organization.graphFetch', '%', 1),
            (@readyCardsAllocator, 'customer.organization.list', '%', 1),
            (@readyCardsAllocator, 'card.embossedType.fetch', '%', 1),
            (@readyCardsAllocator, 'card.ownershipType.fetch', '%', 1),
            (@readyCardsAllocator, 'card.config.fetch', '%', 1),
            (@readyCardsAllocator, 'card.card.get', '%', 1),            
            (@readyCardsAllocator, 'card.product.list', '%', 1),
            (@readyCardsAllocator, 'card.cardInProduction.fetch', '%', 1),
            (@readyCardsAllocator, 'card.cardInProduction.get', '%', 1),
            (@readyCardsAllocator, 'card.card.statusUpdate', '%', 1),
            (@readyCardsAllocator, 'card.card.statusUpdateAllocate', '%', 1),
            (@readyCardsAllocator, 'card.card.statusUpdateAllocateAndChangeBranch', '%', 1),
            (@readyCardsAllocator, 'card.status.list', '%', 1),
            (@readyCardsAllocator, 'card.reason.list', '%', 1)
 
 ---Cards In Production Destruct Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Cards In Production Destruct')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @readyCardsDestruct = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@readyCardsDestruct, 'Cards In Production Destruct', 'Destruct Cards In Production', 1, 0, @roleId, 1)    
END
ELSE
    SET @readyCardsDestruct = (SELECT actorId FROM [user].[role] WHERE name = 'Cards In Production Destruct')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@readyCardsDestruct, 'customer.organization.graphFetch', '%', 1),
            (@readyCardsDestruct, 'customer.organization.list', '%', 1),
            (@readyCardsDestruct, 'card.embossedType.fetch', '%', 1),
            (@readyCardsDestruct, 'card.ownershipType.fetch', '%', 1),
            (@readyCardsDestruct, 'card.config.fetch', '%', 1),
            (@readyCardsDestruct, 'card.card.get', '%', 1),            
            (@readyCardsDestruct, 'card.product.list', '%', 1),
            (@readyCardsDestruct, 'card.cardInProduction.fetch', '%', 1),
            (@readyCardsDestruct, 'card.cardInProduction.get', '%', 1),
            (@readyCardsDestruct, 'card.card.statusUpdate', '%', 1),
            (@readyCardsDestruct, 'card.card.statusUpdateDestruct', '%', 1),
            (@readyCardsDestruct, 'card.status.list', '%', 1),
            (@readyCardsDestruct, 'card.reason.list', '%', 1)


 ---Cards In Production Destruct Checker Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Cards In Production Destruction Checker')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @readyCardsDestructionChecker = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@readyCardsDestructionChecker, 'Cards In Production Destruction Checker', 'Approve/Reject Cards In Production destruction.', 1, 0, @roleId, 1)    
END
ELSE
    SET @readyCardsDestructionChecker = (SELECT actorId FROM [user].[role] WHERE name = 'Cards In Production Destruction Checker')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@readyCardsDestructionChecker, 'customer.organization.graphFetch', '%', 1),
            (@readyCardsDestructionChecker, 'customer.organization.list', '%', 1),
            (@readyCardsDestructionChecker, 'card.embossedType.fetch', '%', 1),
            (@readyCardsDestructionChecker, 'card.ownershipType.fetch', '%', 1),
            (@readyCardsDestructionChecker, 'card.config.fetch', '%', 1),
            (@readyCardsDestructionChecker, 'card.card.get', '%', 1),            
            (@readyCardsDestructionChecker, 'card.product.list', '%', 1),
            (@readyCardsDestructionChecker, 'card.cardInProduction.fetch', '%', 1),
            (@readyCardsDestructionChecker, 'card.cardInProduction.get', '%', 1),
            (@readyCardsDestructionChecker, 'card.card.statusUpdate', '%', 1),
            (@readyCardsDestructionChecker, 'card.card.statusUpdateApproveDestruction', '%', 1),
            (@readyCardsDestructionChecker, 'card.card.statusUpdateDeclineFromPendingDestruction', '%', 1),
            (@readyCardsDestructionChecker, 'card.status.list', '%', 1),
            (@readyCardsDestructionChecker, 'card.reason.list', '%', 1)

 ---Decline Accepted Cards Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Decline Accepted Cards')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @declineAcceptedCards = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@declineAcceptedCards, 'Decline Accepted Cards', 'Decline Accepted Cards.', 1, 0, @roleId, 1)    
END
ELSE
    SET @declineAcceptedCards = (SELECT actorId FROM [user].[role] WHERE name = 'Decline Accepted Cards')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@declineAcceptedCards, 'customer.organization.graphFetch', '%', 1),
            (@declineAcceptedCards, 'customer.organization.list', '%', 1),
            (@declineAcceptedCards, 'card.embossedType.fetch', '%', 1),
            (@declineAcceptedCards, 'card.ownershipType.fetch', '%', 1),
            (@declineAcceptedCards, 'card.config.fetch', '%', 1),
            (@declineAcceptedCards, 'card.card.get', '%', 1),            
            (@declineAcceptedCards, 'card.product.list', '%', 1),
            (@declineAcceptedCards, 'card.cardInProduction.fetch', '%', 1),
            (@declineAcceptedCards, 'card.cardInProduction.get', '%', 1),
            (@declineAcceptedCards, 'card.card.statusUpdate', '%', 1),
            (@declineAcceptedCards, 'card.card.statusUpdateDeclineFromAccepted', '%', 1),            
            (@declineAcceptedCards, 'card.status.list', '%', 1),
            (@declineAcceptedCards, 'card.reason.list', '%', 1)

 ---Decline Card Acceptance Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Decline Card Acceptance')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @declineCardAcceptance = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@declineCardAcceptance, 'Decline Card Acceptance', 'Decline Card Acceptance', 1, 0, @roleId, 1)    
END
ELSE
    SET @declineCardAcceptance = (SELECT actorId FROM [user].[role] WHERE name = 'Decline Card Acceptance')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@declineCardAcceptance, 'customer.organization.graphFetch', '%', 1),
            (@declineCardAcceptance, 'customer.organization.list', '%', 1),
            (@declineCardAcceptance, 'card.embossedType.fetch', '%', 1),
            (@declineCardAcceptance, 'card.ownershipType.fetch', '%', 1),
            (@declineCardAcceptance, 'card.config.fetch', '%', 1),
            (@declineCardAcceptance, 'card.card.get', '%', 1),            
            (@declineCardAcceptance, 'card.product.list', '%', 1),
            (@declineCardAcceptance, 'card.cardInProduction.fetch', '%', 1),
            (@declineCardAcceptance, 'card.cardInProduction.get', '%', 1),
            (@declineCardAcceptance, 'card.card.statusUpdate', '%', 1),
            (@declineCardAcceptance, 'card.card.statusUpdateDeclineFromRejectedAcceptance', '%', 1),            
            (@declineCardAcceptance, 'card.status.list', '%', 1),
            (@declineCardAcceptance, 'card.reason.list', '%', 1)

 ---Decline Card Allocation Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Decline Card Allocation')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @declineCardAllocation = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@declineCardAllocation, 'Decline Card Allocation', 'Decline Card Allocation', 1, 0, @roleId, 1)    
END
ELSE
    SET @declineCardAllocation = (SELECT actorId FROM [user].[role] WHERE name = 'Decline Card Allocation')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@declineCardAllocation, 'customer.organization.graphFetch', '%', 1),
            (@declineCardAllocation, 'customer.organization.list', '%', 1),
            (@declineCardAllocation, 'card.embossedType.fetch', '%', 1),
            (@declineCardAllocation, 'card.ownershipType.fetch', '%', 1),
            (@declineCardAllocation, 'card.config.fetch', '%', 1),
            (@declineCardAllocation, 'card.card.get', '%', 1),            
            (@declineCardAllocation, 'card.product.list', '%', 1),
            (@declineCardAllocation, 'card.cardInProduction.fetch', '%', 1),
            (@declineCardAllocation, 'card.cardInProduction.get', '%', 1),
            (@declineCardAllocation, 'card.card.statusUpdate', '%', 1),
            (@declineCardAllocation, 'card.card.statusUpdateDeclineFromRejectedAllocation', '%', 1),            
            (@declineCardAllocation, 'card.status.list', '%', 1),
            (@declineCardAllocation, 'card.reason.list', '%', 1)

 ---Card Generate PIN Mail Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Generate PIN Mail')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @generatePinMail = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@generatePinMail, 'Card Generate PIN Mail', 'Generate PIN Mail for Card', 1, 0, @roleId, 1)    
END
ELSE
    SET @generatePinMail = (SELECT actorId FROM [user].[role] WHERE name = 'Card Generate PIN Mail')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@generatePinMail, 'customer.organization.graphFetch', '%', 1),
            (@generatePinMail, 'customer.organization.list', '%', 1),
            (@generatePinMail, 'card.embossedType.fetch', '%', 1),
            (@generatePinMail, 'card.ownershipType.fetch', '%', 1),
            (@generatePinMail, 'card.config.fetch', '%', 1),
            (@generatePinMail, 'card.card.get', '%', 1),
            (@generatePinMail, 'card.card.panGet', '%', 1),
            (@generatePinMail, 'card.product.list', '%', 1),
            (@generatePinMail, 'card.cardInProduction.fetch', '%', 1),
            (@generatePinMail, 'card.cardInProduction.get', '%', 1),
            (@generatePinMail, 'card.card.statusUpdate', '%', 1),
            (@generatePinMail, 'card.batch.generatePinMail', '%', 1),                       
            (@generatePinMail, 'card.status.list', '%', 1),
            (@generatePinMail, 'card.reason.list', '%', 1)

 ---Card Approve Allocation Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Approve Allocation')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @approveAllocation = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@approveAllocation, 'Card Approve Allocation', 'Approve Card Allocation', 1, 0, @roleId, 1)    
END
ELSE
    SET @approveAllocation = (SELECT actorId FROM [user].[role] WHERE name = 'Card Approve Allocation')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@approveAllocation, 'customer.organization.graphFetch', '%', 1),
            (@approveAllocation, 'customer.organization.list', '%', 1),
            (@approveAllocation, 'card.embossedType.fetch', '%', 1),
            (@approveAllocation, 'card.ownershipType.fetch', '%', 1),
            (@approveAllocation, 'card.config.fetch', '%', 1),
            (@approveAllocation, 'card.card.get', '%', 1),            
            (@approveAllocation, 'card.product.list', '%', 1),
            (@approveAllocation, 'card.cardInProduction.fetch', '%', 1),
            (@approveAllocation, 'card.cardInProduction.get', '%', 1),
            (@approveAllocation, 'card.card.statusUpdate', '%', 1),
            (@approveAllocation, 'card.card.statusUpdateSend', '%', 1),                        
            (@approveAllocation, 'card.status.list', '%', 1),
            (@approveAllocation, 'card.reason.list', '%', 1)

 ---Card Reject Allocation Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Card Reject Allocation')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @rejectAllocation = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@rejectAllocation, 'Card Reject Allocation', 'Reject Card Allocation', 1, 0, @roleId, 1)    
END
ELSE
    SET @rejectAllocation = (SELECT actorId FROM [user].[role] WHERE name = 'Card Reject Allocation')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@rejectAllocation, 'customer.organization.graphFetch', '%', 1),
            (@rejectAllocation, 'customer.organization.list', '%', 1),
            (@rejectAllocation, 'card.embossedType.fetch', '%', 1),
            (@rejectAllocation, 'card.ownershipType.fetch', '%', 1),
            (@rejectAllocation, 'card.config.fetch', '%', 1),
            (@rejectAllocation, 'card.card.get', '%', 1),            
            (@rejectAllocation, 'card.product.list', '%', 1),
            (@rejectAllocation, 'card.cardInProduction.fetch', '%', 1),
            (@rejectAllocation, 'card.cardInProduction.get', '%', 1),
            (@rejectAllocation, 'card.card.statusUpdate', '%', 1),
            (@rejectAllocation, 'card.card.statusUpdateRejectAllocation', '%', 1),                        
            (@rejectAllocation, 'card.status.list', '%', 1),
            (@rejectAllocation, 'card.reason.list', '%', 1)

 ---Card Accept Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Accept Allocated Cards')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @acceptCards = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@acceptCards, 'Accept Allocated Cards', 'Accept Allocated Cards in Branch', 1, 0, @roleId, 1)    
END
ELSE
    SET @acceptCards = (SELECT actorId FROM [user].[role] WHERE name = 'Accept Allocated Cards')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@acceptCards, 'customer.organization.graphFetch', '%', 1),
            (@acceptCards, 'customer.organization.list', '%', 1),
            (@acceptCards, 'card.embossedType.fetch', '%', 1),
            (@acceptCards, 'card.ownershipType.fetch', '%', 1),
            (@acceptCards, 'card.config.fetch', '%', 1),
            (@acceptCards, 'card.card.get', '%', 1),            
            (@acceptCards, 'card.product.list', '%', 1),
            (@acceptCards, 'card.cardInProduction.fetch', '%', 1),
            (@acceptCards, 'card.cardInProduction.get', '%', 1),
            (@acceptCards, 'card.card.statusUpdate', '%', 1),
            (@acceptCards, 'card.card.statusUpdateAcceptSentCards', '%', 1),                        
            (@acceptCards, 'card.status.list', '%', 1),
            (@acceptCards, 'card.reason.list', '%', 1)

 ---Approve Card Acceptance Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Approve Card Acceptance')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @approveAcceptance = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@approveAcceptance, 'Approve Card Acceptance', 'Approve Allocated Cards in Branch', 1, 0, @roleId, 1)    
END
ELSE
    SET @approveAcceptance = (SELECT actorId FROM [user].[role] WHERE name = 'Approve Card Acceptance')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@approveAcceptance, 'customer.organization.graphFetch', '%', 1),
            (@approveAcceptance, 'customer.organization.list', '%', 1),
            (@approveAcceptance, 'card.embossedType.fetch', '%', 1),
            (@approveAcceptance, 'card.ownershipType.fetch', '%', 1),
            (@approveAcceptance, 'card.config.fetch', '%', 1),
            (@approveAcceptance, 'card.card.get', '%', 1),            
            (@approveAcceptance, 'card.product.list', '%', 1),
            (@approveAcceptance, 'card.cardInProduction.fetch', '%', 1),
            (@approveAcceptance, 'card.cardInProduction.get', '%', 1),
            (@approveAcceptance, 'card.card.statusUpdate', '%', 1),
            (@approveAcceptance, 'card.card.statusUpdateApprove', '%', 1),
            (@approveAcceptance, 'card.card.statusUpdateApproveAcceptance', '%', 1),
            (@approveAcceptance, 'card.status.list', '%', 1),
            (@approveAcceptance, 'card.reason.list', '%', 1)

---Reject Sent Cards Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Reject Sent Cards')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @rejectSentCards = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@rejectSentCards, 'Reject Sent Cards', 'Reject Sent Cards', 1, 0, @roleId, 1)    
END
ELSE
    SET @rejectSentCards = (SELECT actorId FROM [user].[role] WHERE name = 'Reject Sent Cards')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@rejectSentCards, 'customer.organization.graphFetch', '%', 1),
            (@rejectSentCards, 'customer.organization.list', '%', 1),
            (@rejectSentCards, 'card.embossedType.fetch', '%', 1),
            (@rejectSentCards, 'card.ownershipType.fetch', '%', 1),
            (@rejectSentCards, 'card.config.fetch', '%', 1),
            (@rejectSentCards, 'card.card.get', '%', 1),            
            (@rejectSentCards, 'card.product.list', '%', 1),
            (@rejectSentCards, 'card.cardInProduction.fetch', '%', 1),
            (@rejectSentCards, 'card.cardInProduction.get', '%', 1),
            (@rejectSentCards, 'card.card.statusUpdate', '%', 1),
            (@rejectSentCards, 'card.card.statusUpdateRejectSentCards', '%', 1),                        
            (@rejectSentCards, 'card.status.list', '%', 1),
            (@rejectSentCards, 'card.reason.list', '%', 1)

---Reject Card Acceptance Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Reject Card Acceptance')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @rejectAcceptance = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@rejectAcceptance, 'Reject Card Acceptance', 'Reject Card Acceptance', 1, 0, @roleId, 1)    
END
ELSE
    SET @rejectAcceptance = (SELECT actorId FROM [user].[role] WHERE name = 'Reject Card Acceptance')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@rejectAcceptance, 'customer.organization.graphFetch', '%', 1),
            (@rejectAcceptance, 'customer.organization.list', '%', 1),
            (@rejectAcceptance, 'card.embossedType.fetch', '%', 1),
            (@rejectAcceptance, 'card.ownershipType.fetch', '%', 1),
            (@rejectAcceptance, 'card.config.fetch', '%', 1),
            (@rejectAcceptance, 'card.card.get', '%', 1),            
            (@rejectAcceptance, 'card.product.list', '%', 1),
            (@rejectAcceptance, 'card.cardInProduction.fetch', '%', 1),
            (@rejectAcceptance, 'card.cardInProduction.get', '%', 1),
            (@rejectAcceptance, 'card.card.statusUpdate', '%', 1),
            (@rejectAcceptance, 'card.card.statusUpdateRejectAcceptance', '%', 1),                        
            (@rejectAcceptance, 'card.status.list', '%', 1),
            (@rejectAcceptance, 'card.reason.list', '%', 1)

---Accept Rejected Cards Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Accept Rejected Cards')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @acceptRejectedCards = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@acceptRejectedCards, 'Accept Rejected Cards', 'Accept Rejected Cards', 1, 0, @roleId, 1)    
END
ELSE
    SET @acceptRejectedCards = (SELECT actorId FROM [user].[role] WHERE name = 'Accept Rejected Cards')

 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@acceptRejectedCards, 'customer.organization.graphFetch', '%', 1),
            (@acceptRejectedCards, 'customer.organization.list', '%', 1),
            (@acceptRejectedCards, 'card.embossedType.fetch', '%', 1),
            (@acceptRejectedCards, 'card.ownershipType.fetch', '%', 1),
            (@acceptRejectedCards, 'card.config.fetch', '%', 1),
            (@acceptRejectedCards, 'card.card.get', '%', 1),            
            (@acceptRejectedCards, 'card.product.list', '%', 1),
            (@acceptRejectedCards, 'card.cardInProduction.fetch', '%', 1),
            (@acceptRejectedCards, 'card.cardInProduction.get', '%', 1),
            (@acceptRejectedCards, 'card.card.statusUpdate', '%', 1),
            (@acceptRejectedCards, 'card.card.statusUpdateAcceptRejectedCards', '%', 1),                        
            (@acceptRejectedCards, 'card.status.list', '%', 1),
            (@acceptRejectedCards, 'card.reason.list', '%', 1)

---Accept Declined Cards Role
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Accept Declined Cards')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @acceptDeclinedCards = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@acceptDeclinedCards, 'Accept Declined Cards', 'Accept Declined Cards', 1, 0, @roleId, 1)    
END
ELSE
    SET @acceptDeclinedCards = (SELECT actorId FROM [user].[role] WHERE name = 'Accept Declined Cards')
 
	   INSERT INTO @userActorAction (actorId, actionId, objectId, [level])
	    VALUES (@acceptDeclinedCards, 'customer.organization.graphFetch', '%', 1),
            (@acceptDeclinedCards, 'customer.organization.list', '%', 1),
            (@acceptDeclinedCards, 'card.embossedType.fetch', '%', 1),
            (@acceptDeclinedCards, 'card.ownershipType.fetch', '%', 1),
            (@acceptDeclinedCards, 'card.config.fetch', '%', 1),
            (@acceptDeclinedCards, 'card.card.get', '%', 1),            
            (@acceptDeclinedCards, 'card.product.list', '%', 1),
            (@acceptDeclinedCards, 'card.cardInProduction.fetch', '%', 1),
            (@acceptDeclinedCards, 'card.cardInProduction.get', '%', 1),
            (@acceptDeclinedCards, 'card.card.statusUpdate', '%', 1),
            (@acceptDeclinedCards, 'card.card.statusUpdateAcceptDeclinedCards', '%', 1),                        
            (@acceptDeclinedCards, 'card.status.list', '%', 1),
            (@acceptDeclinedCards, 'card.reason.list', '%', 1)

 ;MERGE INTO [user].actorAction t
  USING @userActorAction s
  ON s.actorId = t.actorId AND s.actionId = t.actionId AND s.objectId = t.objectId AND s.[level] = t.[level]
  WHEN NOT MATCHED BY TARGET THEN 
  INSERT (actorId, actionId, objectId, [level])
  VALUES (s.actorId, s.actionId, s.objectId, s.[level]);
