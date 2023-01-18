declare @from tinyint, @to tinyint, @action tinyint

set @from = (select statusId from card.status where statusName = 'Accepted')
set @to = (select statusId from card.status where statusName = 'PendingAllocation')
set @action = (select actionId from card.action where actionName = 'Allocate')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'Allocate', 1, 'card.card.statusUpdateAllocate')

set @from = (select statusId from card.status where statusName = 'Accepted')
set @to = (select statusId from card.status where statusName = 'Declined')
set @action = (select actionId from card.action where actionName =  'Decline')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 3, 'card.card.statusUpdateDeclineFromAccepted')

set @from = (select statusId from card.status where statusName = 'Accepted')
set @to = (select statusId from card.status where statusName = 'Accepted')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'GeneratePIN', 2, 'card.batch.generatePinMail')

--------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'PendingDestruction')
set @to = (select statusId from card.status where statusName = 'Declined')
set @action = (select actionId from card.action where actionName =  'Decline')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 51, 'card.card.statusUpdateDeclineFromPendingDestruction')

set @from = (select statusId from card.status where statusName = 'PendingDestruction')
set @to = (select statusId from card.status where statusName = 'Destructed')
set @action = (select actionId from card.action where actionName = 'ApproveDestruction')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 50, 'card.card.statusUpdateApproveDestruction')

--------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'PendingAllocation')
set @to = (select statusId from card.status where statusName = 'RejectedAllocation')
set @action = (select actionId from card.action where actionName = 'Reject')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 7, 'card.card.statusUpdateRejectAllocation')

set @from = (select statusId from card.status where statusName = 'PendingAllocation')
set @to = (select statusId from card.status where statusName = 'Sent')
set @action = (select actionId from card.action where actionName = 'Send')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'ChangeCurrentBranch', 5, 'card.card.statusUpdateSend')

set @from = (select statusId from card.status where statusName = 'PendingAllocation')
set @to = (select statusId from card.status where statusName = 'PendingAllocation')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'GeneratePIN', 6, 'card.batch.generatePinMail')

--------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'RejectedAllocation')
set @to = (select statusId from card.status where statusName = 'PendingAllocation')
set @action = (select actionId from card.action where actionName = 'Allocate')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'Allocate', 60, 'card.card.statusUpdateAllocate')

set @from = (select statusId from card.status where statusName = 'RejectedAllocation')
set @to = (select statusId from card.status where statusName = 'Declined')
set @action = (select actionId from card.action where actionName = 'Decline')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 62, 'card.card.statusUpdateDeclineFromRejectedAllocation')
 
 set @from = (select statusId from card.status where statusName = 'RejectedAllocation')
set @to = (select statusId from card.status where statusName = 'RejectedAllocation')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'GeneratePIN', 61, 'card.batch.generatePinMail')

--------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Sent')
set @to = (select statusId from card.status where statusName = 'RejectedAcceptance')
set @action = (select actionId from card.action where actionName = 'RejectCards')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 22, 'card.card.statusUpdateRejectSentCards')
 
 set @from = (select statusId from card.status where statusName = 'Sent')
set @to = (select statusId from card.status where statusName = 'PendingAcceptance')
set @action = (select actionId from card.action where actionName = 'AcceptCards')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 20, 'card.card.statusUpdateAcceptSentCards') 
 
set @from = (select statusId from card.status where statusName = 'Sent')
set @to = (select statusId from card.status where statusName = 'Sent')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'GeneratePIN', 21, 'card.batch.generatePinMail')

--------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'RejectedAcceptance')
set @to = (select statusId from card.status where statusName = 'Declined')
set @action = (select actionId from card.action where actionName = 'Decline')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 45, 'card.card.statusUpdateDeclineFromRejectedAcceptance')

set @from = (select statusId from card.status where statusName = 'RejectedAcceptance')
set @to = (select statusId from card.status where statusName = 'PendingAllocation')
set @action = (select actionId from card.action where actionName = 'Allocate')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'Allocate', 41, 'card.card.statusUpdateAllocateRejectedCards')


set @from = (select statusId from card.status where statusName = 'RejectedAcceptance')
set @to = (select statusId from card.status where statusName = 'PendingAcceptance')
set @action = (select actionId from card.action where actionName = 'AcceptCards')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 40, 'card.card.statusUpdateAcceptRejectedCards') 

set @from = (select statusId from card.status where statusName = 'RejectedAcceptance')
set @to = (select statusId from card.status where statusName = 'RejectedAcceptance')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'GeneratePIN', 42, 'card.batch.generatePinMail')

--------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'PendingAcceptance')
set @to = (select statusId from card.status where statusName = 'Accepted')
set @action = (select actionId from card.action where actionName = 'ApproveCardAcceptance')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'ApproveCardAcceptance', 30, 'card.card.statusUpdateApprove') 

set @from = (select statusId from card.status where statusName = 'PendingAcceptance')
set @to = (select statusId from card.status where statusName = 'RejectedAcceptance')
set @action = (select actionId from card.action where actionName = 'RejectCards')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 32, 'card.card.statusUpdateRejectAcceptance')

set @from = (select statusId from card.status where statusName = 'PendingAcceptance')
set @to = (select statusId from card.status where statusName = 'PendingAcceptance')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', 'GeneratePIN', 31, 'card.batch.generatePinMail')

--------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Declined')
set @to = (select statusId from card.status where statusName = 'PendingDestruction')
set @action = (select actionId from card.action where actionName = 'Destruct')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 81, 'card.card.statusUpdateDestruct')

set @from = (select statusId from card.status where statusName = 'Declined')
set @to = (select statusId from card.status where statusName = 'Accepted')
set @action = (select actionId from card.action where actionName = 'Accept')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Card')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Card', null, 80, 'card.card.statusUpdateAcceptDeclinedCards') 

------------------------------------------------------------------------