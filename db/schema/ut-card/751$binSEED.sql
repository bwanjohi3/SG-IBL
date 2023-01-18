declare @bin [card].binTT, @meta core.metaDataTT
declare @sa bigint = (select actorId from [user].[hash] where identifier = 'sa' and type = 'password')
insert into @meta ([auth.actorId], method, languageId) values (@sa, '', 1)

declare @startbinvalue char(6) = '377441'
declare @endbinvalue char(6) = '377441'
declare @description varchar(100) = 'American Express Black Card (New Zealand)'
declare @ownerShipTypeId bigint = (select ownershipTypeId from card.ownershipType 
                                 JOIN core.itemName cin ON cin.itemNameId = ownershipTypeId
                                 WHERE itemCode = 'own')

insert into @bin(startBin, endBin, [description], ownershipTypeId)
values (@startbinvalue, @endbinvalue, @description, @ownerShipTypeId)

if not exists (select * from [card].bin where startBin = @startbinvalue and endBin = @endbinvalue)
    exec [card].[bin.add] @bin, @meta 
   
delete from @bin

SET @startbinvalue = '502256'
SET @endbinvalue = '502256'
SET @description = 'SOFTWARE GROUP HSM'
SET @ownerShipTypeId = (select ownershipTypeId from card.ownershipType 
                                 JOIN core.itemName cin ON cin.itemNameId = ownershipTypeId
                                 WHERE itemCode = 'own')

insert into @bin(startBin, endBin, [description], ownershipTypeId)
values (@startbinvalue, @endbinvalue, @description, @ownerShipTypeId)

if not exists (select * from [card].bin where startBin = @startbinvalue and endBin = @endbinvalue)
    exec [card].[bin.add] @bin, @meta 
   
delete from @bin

SET @startbinvalue  = '377445'
SET @endbinvalue = '377449'
SET @description  = 'BMW American Express Card (New Zealand)'
set @ownerShipTypeId = (select ownershipTypeId from card.ownershipType 
                                 JOIN core.itemName cin ON cin.itemNameId = ownershipTypeId
                                 WHERE itemCode = 'external')

insert into @bin(startBin, endBin, [description], ownershipTypeId)
values (@startbinvalue, @endbinvalue, @description, @ownerShipTypeId)

if not exists (select * from [card].bin where startBin = @startbinvalue and endBin = @endbinvalue)
    exec [card].[bin.add] @bin, @meta