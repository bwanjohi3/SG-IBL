declare @from tinyint, @to tinyint, @action tinyint

set @from = (select statusId from card.status where statusName = 'New')
set @action = (select actionId from card.action where actionName = 'Update')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @from and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @from, 'Batch', 'Update', null, 1, 'card.batch.statusUpdateEdit')

set @from = (select statusId from card.status where statusName = 'New')
set @action = (select actionId from card.action where actionName = 'Reject')
set @to = (select statusId from card.status where statusName = 'Rejected')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'Reject', null, 3, 'card.batch.statusUpdateReject')

set @from = (select statusId from card.status where statusName = 'New')
set @action = (select actionId from card.action where actionName = 'Approve')
set @to = (select statusId from card.status where statusName = 'Approved')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'Approve', null, 2, 'card.batch.statusUpdateApprove')

set @from = (select statusId from card.status where statusName = 'New')
set @action = (select actionId from card.action where actionName = 'Decline')
set @to = (select statusId from card.status where statusName = 'Declined')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'DeclineBatch', null, 4, 'card.batch.statusUpdateDecline')

------------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Approved')
set @action = (select actionId from card.action where actionName = 'Reject')
set @to = (select statusId from card.status where statusName = 'Rejected')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'Reject', null, 11, 'card.batch.statusUpdateReject')

set @from = (select statusId from card.status where statusName = 'Approved')
set @action = (select actionId from card.action where actionName = 'SentToProduction')
set @to = (select statusId from card.status where statusName = 'Production')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'SentToProduction', null, 10, 'card.batch.statusUpdateSendToProduction')

set @from = (select statusId from card.status where statusName = 'Approved')
set @action = (select actionId from card.action where actionName = 'Decline')
set @to = (select statusId from card.status where statusName = 'Declined')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'DeclineBatch', null, 12, 'card.batch.statusUpdateDecline')

-----------------------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Rejected')
set @action = (select actionId from card.action where actionName = 'Update')
set @to = (select statusId from card.status where statusName = 'New')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId,actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'Update', null, 20, 'card.batch.statusUpdateEdit')

set @from = (select statusId from card.status where statusName = 'Rejected')
set @action = (select actionId from card.action where actionName = 'Decline')
set @to = (select statusId from card.status where statusName = 'Declined')


if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'DeclineBatch', null, 21, 'card.batch.statusUpdateDecline')

-----------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Production')
set @action = (select actionId from card.action where actionName = 'Complete')
set @to = (select statusId from card.status where statusName = 'Completed')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'BatchComplete', null, 30, 'card.batch.statusUpdateCompleted')

set @from = (select statusId from card.status where statusName = 'Production')
set @action = (select actionId from card.action where actionName = 'Download')
set @to = (select statusId from card.status where statusName = 'Production')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'Download', null, 31, 'card.batch.download')

set @from = (select statusId from card.status where statusName = 'Production')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')
set @to = (select statusId from card.status where statusName = 'Production')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'GeneratePIN', null, 32, 'card.batch.generatePinMail')

set @from = (select statusId from card.status where statusName = 'Production')
set @action = (select actionId from card.action where actionName = 'Decline')
set @to = (select statusId from card.status where statusName = 'Declined')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'DeclineBatch', null, 33, 'card.batch.statusUpdateDecline')

---------------------------------------------------------------------------------------------------------------
set @from = (select statusId from card.status where statusName = 'Completed')
set @action = (select actionId from card.action where actionName = 'GeneratePIN')
set @to = (select statusId from card.status where statusName = 'Completed')

if not exists (select * from card.statusAction where fromStatusId = @from and actionId = @action and toStatusId = @to and module = 'Batch')
    insert into card.statusAction (fromStatusId, actionId, toStatusId, module, actionToPerform, embossedTypeId, actionOrder, permission)
    values (@from, @action, @to, 'Batch', 'GeneratePIN', null, 40, 'card.batch.generatePinMail')