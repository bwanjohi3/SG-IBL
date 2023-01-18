declare @reason [card].reasonTT, @meta core.metaDataTT, @action core.arrayNumberList 
declare @rejectActionId tinyint = (select actionId from card.action where actionName =  'Reject')
declare @declineActionId tinyint = (select actionId from card.action where actionName =  'Decline')
declare @hotActionId tinyint = (select actionId from card.action where actionName =  'Hot')
declare @destructActionId tinyint = (select actionId from card.action where actionName =  'Destruct')
declare @deactivateActionId tinyint = (select actionId from card.action where actionName =  'Deactivate')

declare @sa bigint = (select actorId from [user].[hash] where identifier = 'sa' and type = 'password')
insert into @meta ([auth.actorId], method, languageId) values (@sa, '', 1)

declare @reasonName nvarchar(100) = 'Missing attachement'
declare @code varchar(30) = 'AR-Missing Documents'
declare @module varchar(20) = 'Application'

insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

insert into @action values(@rejectActionId)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta

set @reasonName = 'Error in Cardholder Name'
set @code = 'AR-Personal Data Error'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta


set @reasonName = 'Error in Person name'
set @code = 'AR-Personal Data Error'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta


--------------------
--Batches
----------------

set @reasonName = 'Change Target Business Unit'
set @code = 'BR-Business Unit'
set @module = 'Batch'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta

set @reasonName = 'Batch too large, please remove some applications'
set @code = 'BR-Batch Size'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta


set @reasonName = 'Batch too small, please add more applications'
set @code = 'BR-Batch Size'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta

--------------------
--Cards
----------------

set @reasonName = 'Plastic card is broken'
set @code = 'DR-Damaged'
set @module = 'Card'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta

set @reasonName = 'Cardholder name is not correct'
set @code = 'CR-Card Data'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta


set @reasonName = 'Card Porduct is not correct'
set @code = 'CR-Card Data'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta

set @reasonName = 'Card expiration date is wrong'
set @code = 'CR-Card Data'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta

set @reasonName = 'Counterfeit Capture'
set @code = 'DR-Damaged'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta

-----


set @reasonName = 'Generic Capture'
set @code = 'RR-Other'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta


set @reasonName = 'Lost Card Capture'
set @code = 'DR-Damaged'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta




set @reasonName = 'Cancelled Card Capture'
set @code = 'DR-Damaged'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta

set @reasonName = 'Counterfeit Decline'
set @code = 'RR-Other'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta



set @reasonName = 'Counterfeit Capture'
set @code = 'DR-Damaged'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta

set @reasonName = 'Generic Decline'
set @code = 'RR-Other'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta

--Decline

delete from @action
insert into @action values(@declineActionId)


set @reasonName = 'Expired Card Capture'
set @code = 'DR-Expired'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta



set @reasonName = 'Stolen Card Capture'
set @code = 'DR-Damaged'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta



set @reasonName = 'Expired Card Decline'
set @code = 'RR-Expired'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta



set @reasonName = 'Lost Card Decline'
set @code = 'RR-Damaged'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta



set @reasonName = 'Stolen Card Decline'
set @code = 'RR-Damaged'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta



set @reasonName = 'Fraud Decline'
set @code = 'RR-Damaged'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta

-----------------

--Desctruct Cards

----------------

set @reasonName = 'damaged'
set @code = 'D'


delete from @action
insert into @action values(@destructActionId)

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
 

set @reasonName = 'expired'
set @code = 'E'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    

set @reasonName = 'renewal request'
set @code = 'RQ'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta



---------

--HotCardReasons

---------


set @reasonName = 'Counterfeit Capture'
set @code = 'CC'
set @module = 'CardInUse'

delete from @action
insert into @action values(@HotActionId)

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta


    
set @reasonName = 'Expired Card Capture'
set @code = 'EC'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
set @reasonName = 'Generic Capture'
set @code = 'GC'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
set @reasonName = 'Lost Card Capture'
set @code = 'LC'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
set @reasonName = 'Stolen Card Capture'
set @code = 'SC'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
set @reasonName = 'Cancelled Card Capture'
set @code = 'CN'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    


---------

--InactiveCardReasons

---------

set @reasonName = 'Counterfeit Decline'
set @code = 'CD'


delete from @action
insert into @action values(@DeactivateActionId)

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
set @reasonName = 'Expired Card Decline'
set @code = 'ED'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
set @reasonName = 'Generic Decline'
set @code = 'GD'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
set @reasonName = 'Lost Card Decline'
set @code = 'LD'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
set @reasonName = 'Stolen Card Decline'
set @code = 'SD'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    
    
---------

--DestructionReasons

---------


set @reasonName = 'damaged'
set @code = 'D'


delete from @action
insert into @action values(@DestructActionId)

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)




if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
 

set @reasonName = 'expired'
set @code = 'E'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta
    

set @reasonName = 'renewal request'
set @code = 'RQ'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)


if not exists (select * from [card].reason where name = @reasonName and module = @module)
    exec [card].[reason.add] @reason, @action, @meta



---------
--Decline Batch Reasons
---------

delete from @action
insert into @action values(@declineActionId)
set @module = 'Batch'


set @reasonName = 'Lost Cards Batch Decline'
set @code = 'LC-Lost'


delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta



set @reasonName = 'Batch Decline'
set @code = 'BD'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta

---------
--Decline Application Reasons
---------
set @module = 'Application'

set @reasonName = 'Application Decline'
set @code = 'AD'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta


set @reasonName = 'Total Application Error'
set @code = 'AP - Total Error'

delete from @reason
insert into @reason(code, name, isActive, createdBy, createdOn, module)
values (@code, @reasonName, 1, @sa, getdate(), @module)

if not exists (select * from [card].reason where name = @reasonName and module = @module)
exec [card].[reason.add] @reason, @action, @meta