declare @from tinyint, @to tinyint, @action tinyint

set @from = (select statusId from card.status where statusName = 'Accepted')
set @action = (select actionId from card.action where actionName = 'Activate')
set @to = (select statusId from card.status where statusName = 'PendingActivation')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 1, 'card.cardInUse.statusUpdateActivate')

set @from = (select statusId from card.status where statusName = 'Accepted')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')
set @to = (select statusId from card.status where statusName = 'Accepted')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', 'GeneratePIN', 2, 'card.batch.generatePinMail')

set @from = (select statusId from card.status where statusName = 'Accepted')
set @action = (select actionId from card.action where actionName = 'Destruct')
set @to = (select statusId from card.status where statusName = 'PendingDestruction')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 3, 'card.cardInUse.statusUpdateDestructFromAccepted')

----------------------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'PendingActivation')
set @action = (select actionId from card.action where actionName = 'ApproveActivate')
set @to = (select statusId from card.status where statusName = 'Active')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', 'Activate', 10, 'card.cardInUse.statusUpdateApproveActivate')

set @from = (select statusId from card.status where statusName = 'PendingActivation')
set @action = (select actionId from card.action where actionName = 'Hot')
set @to = (select statusId from card.status where statusName = 'HOT')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', 'Hot', 11, 'card.cardInUse.statusUpdateHOT')

set @from = (select statusId from card.status where statusName = 'PendingActivation')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')
set @to = (select statusId from card.status where statusName = 'PendingActivation')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', 'GeneratePIN', 12, 'card.batch.generatePinMail')

set @from = (select statusId from card.status where statusName = 'PendingActivation')
set @action = (select actionId from card.action where actionName = 'RejectActivation')
set @to = (select statusId from card.status where statusName = 'PendingActivation')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', 'RejectActivation', 13, 'card.cardInUse.statusUpdateRejectActivation')	

-------------------------------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Active')
set @action = (select actionId from card.action where actionName = 'Update')
set @to = (select statusId from card.status where statusName = 'Active')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', 'Update', 20, 'card.cardInUse.statusUpdateEdit')

set @from = (select statusId from card.status where statusName = 'Active')
set @action = (select actionId from card.action where actionName = 'Hot')
set @to = (select statusId from card.status where statusName = 'HOT')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 21, 'card.cardInUse.statusUpdateHOT')

set @from = (select statusId from card.status where statusName = 'Active')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')
set @to = (select statusId from card.status where statusName = 'Active')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', 'GeneratePIN', 22, 'card.batch.generatePinMail')

set @from = (select statusId from card.status where statusName = 'Active')
set @action = (select actionId from card.action where actionName = 'Deactivate')
set @to = (select statusId from card.status where statusName = 'PendingDeactivation')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 23, 'card.cardInUse.statusUpdateDeactivate')

------------------------------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'PendingDestruction')
set @action = (select actionId from card.action where actionName = 'RejectDestruction')
set @to = (select statusId from card.status where statusName = 'PendingDestruction')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 31, 'card.cardInUse.statusUpdateRejectDestruction')

set @from = (select statusId from card.status where statusName = 'PendingDestruction')
set @action = (select actionId from card.action where actionName = 'ApproveDestruction')
set @to = (select statusId from card.status where statusName = 'Destructed')
if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 30, 'card.cardInUse.statusUpdateApproveDestruction')

-----------------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'HOT')
set @action = (select actionId from card.action where actionName = 'Activate')
set @to = (select statusId from card.status where statusName = 'PendingActivation')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 40, 'card.cardInUse.statusUpdateActivate')

set @from = (select statusId from card.status where statusName = 'HOT')
set @action = (select actionId from card.action where actionName = 'Destruct')
set @to = (select statusId from card.status where statusName = 'PendingDestruction')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 41, 'card.cardInUse.statusUpdateDestructFromHot')

---------------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Inactive')
set @action = (select actionId from card.action where actionName = 'Destruct')
set @to = (select statusId from card.status where statusName = 'PendingDestruction')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 51, 'card.cardInUse.statusUpdateDestructFromInactive')

set @from = (select statusId from card.status where statusName = 'Inactive')
set @action = (select actionId from card.action where actionName = 'Activate')
set @to = (select statusId from card.status where statusName = 'PendingActivation')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 50, 'card.cardInUse.statusUpdateActivate')

----------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'PendingDeactivation')
set @action = (select actionId from card.action where actionName = 'RejectDeactivation')
set @to = (select statusId from card.status where statusName = 'Active')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 61, 'card.cardInUse.statusUpdateRejectDeactivation')

set @from = (select statusId from card.status where statusName = 'PendingDeactivation')
set @action = (select actionId from card.action where actionName = 'ApproveDeactivation')
set @to = (select statusId from card.status where statusName = 'Inactive')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', null, 60, 'card.cardInUse.statusUpdateApproveDeactivation')

set @from = (select statusId from card.status where statusName = 'Active')
set @action = (select actionId from card.action where actionName = 'ResetPINRetries')
set @to = (select statusId from card.status where statusName = 'Active')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'CardInUse')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'CardInUse', 'ResetPINRetries', 42, 'card.cardInUse.ResetPINRetries')