declare @itemTypeId int = (select itemTypeId from core.itemtype where name = 'cardProduct')
if @itemTypeId is null
begin
    insert into [core].[itemType](alias, name, [description], [table], keyColumn, nameColumn)
    values('cardProduct', 'cardProduct', 'Card Product', 'card.product', 'productId', 'name')
end


set @itemTypeId  = (select itemTypeId from core.itemtype where name = 'cardReasonApplication')
if @itemTypeId is null
begin
    insert into [core].[itemType](alias, name, [description])
    values('cardReasonApplication', 'cardReasonApplication', 'Card Reason for Application')
end

set @itemTypeId  = (select itemTypeId from core.itemtype where name = 'cardReasonBatch')
if @itemTypeId is null
begin
    insert into [core].[itemType](alias, name, [description])
    values('cardReasonBatch', 'cardReasonBatch', 'Card Reason for Batch')
end

set @itemTypeId  = (select itemTypeId from core.itemtype where name = 'cardReasonCard')
if @itemTypeId is null
begin
    insert into [core].[itemType](alias, name, [description])
    values('cardReasonCard', 'cardReasonCard', 'Card Reason for Card')
end

set @itemTypeId  = (select itemTypeId from core.itemtype where name = 'cardReasonCardInUse')
if @itemTypeId is null
begin
    insert into [core].[itemType](alias, name, [description])
    values('cardReasonCardInUse', 'cardReasonCardInUse', 'Card Reason for Card In Use')
end

set @itemTypeId  = (select itemTypeId from core.itemtype where name = 'cardBin')
if @itemTypeId is null
begin
    insert into [core].[itemType](alias, name, [description])
    values('cardBin', 'cardBin', 'Card Bin')
end

set @itemTypeId  = (select itemTypeId from core.itemtype where name = 'cardType')
if @itemTypeId is null
begin
    insert into [core].[itemType](alias, name, [description])
    values('cardType', 'cardType', 'Card Type')
end