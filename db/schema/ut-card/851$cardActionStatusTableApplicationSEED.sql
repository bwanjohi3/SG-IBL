declare @from tinyint, @to tinyint, @action tinyint

set @from = (select statusId from card.status where statusName = 'New')
set @action = (select actionId from card.action where actionName = 'Update')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @from and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @from, 'Application', 'Update', 1,'card.application.statusUpdateEdit')

set @from = (select statusId from card.status where statusName = 'New')
set @to = (select statusId from card.status where statusName = 'Approved')
set @action = (select actionId from card.action where actionName = 'ApproveNamed')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'Approve', 1, 2,'card.application.statusUpdateApproveName')

set @from = (select statusId from card.status where statusName = 'New')
set @to = (select statusId from card.status where statusName = 'Completed')
set @action = (select actionId from card.action where actionName =  'ApproveNoNamed')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'ApproveNoName', 2, 2, 'card.application.statusUpdateApproveNoName')

set @from = (select statusId from card.status where statusName = 'New')
set @to = (select statusId from card.status where statusName = 'Rejected')
set @action = (select actionId from card.action where actionName =  'Reject')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'Reject', 3, 'card.application.statusUpdateReject')

set @from = (select statusId from card.status where statusName = 'New')
set @to = (select statusId from card.status where statusName = 'Declined')
set @action = (select actionId from card.action where actionName =  'Decline')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'Decline', 5, 'card.application.statusUpdateDecline')

-----------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Rejected')
set @to = (select statusId from card.status where statusName = 'New')
set @action = (select actionId from card.action where actionName =  'Update')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'Update', null, 10, 'card.application.statusUpdateEdit')

set @from = (select statusId from card.status where statusName = 'Rejected')
set @to = (select statusId from card.status where statusName = 'Declined')
set @action = (select actionId from card.action where actionName = 'Decline')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'Decline', null, 11, 'card.application.statusUpdateDecline')

------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Approved')
set @to = (select statusId from card.status where statusName = 'Completed')
set @action = (select actionId from card.action where actionName =  'CreateBatch')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'CreateBatch', 1, 20, 'card.application.statusUpdateCreateBatch')

set @from = (select statusId from card.status where statusName = 'Approved')
set @to = (select statusId from card.status where statusName = 'Completed')
set @action = (select actionId from card.action where actionName =  'AddToBatch')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'AddToBatch', 1, 21, 'card.application.statusUpdateAddToBatch')

set @from = (select statusId from card.status where statusName = 'Approved')
set @to = (select statusId from card.status where statusName = 'Rejected')
set @action = (select actionId from card.action where actionName =  'Reject')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'Reject', 1, 23, 'card.application.statusUpdateReject')

set @from = (select statusId from card.status where statusName = 'Approved')
set @action = (select actionId from card.action where actionName = 'Decline')
set @to = (select statusId from card.status where statusName = 'Declined')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', NULL, 1, 24, 'card.application.statusUpdateDecline')

------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Completed')
set @to = (select statusId from card.status where statusName = 'Approved')
set @action = (select actionId from card.action where actionName =  'RemoveFromBatch')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Application')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Application', 'RemoveFromBatch', 1, 30, 'card.application.statusUpdateRemoveFromBatch')