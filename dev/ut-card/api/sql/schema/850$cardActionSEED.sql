IF NOT EXISTS(SELECT * FROM [core].[language] WHERE iso2Code = 'en')
BEGIN
    INSERT INTO [core].[language] ([languageId], [iso2Code], [name], [locale]) VALUES((SELECT COUNT(languageId)+1 FROM [core].[language]), 'en', 'English', 'en_GB')
END

declare @itemTypeId int = (select itemTypeId from core.itemtype where name = 'cardAction')
declare @languageId int = (select [languageId] from [core].[language] where [name] = 'English')

declare @itemNameId bigint

if @itemTypeId is null
begin
    insert into [core].[itemType](alias, name, [description], [table], keyColumn, nameColumn)
    values('cardAction', 'cardAction', 'cardAction', 'card.action', 'actionId', 'actionName')

    set @itemTypeId = Scope_identity()
end

-------------------------------------
declare @actionDisplayName nvarchar(150) = 'Approve'
declare @actionName varchar(50) = 'ApproveNoNamed'
declare @actionDescription varchar(50) = 'Approve No Named'
declare @actionDescriptionName nvarchar(150) = 'Approve No Named'

set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------

set @actionName = 'Reject'
set @actionDisplayName = 'Reject'
set @actionDescription  = 'Reject'
set @actionDescriptionName = 'Reject'

set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------

set @actionName = 'Update' set @actionDisplayName = 'Save'
set @actionDescription  = 'Save' set @actionDescriptionName = 'Save'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
    else if (select itemNameTranslation from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId) != @actionDisplayName
        update core.itemTranslation
        set itemNameTranslation = @actionDisplayName
        where itemNameId = @itemNameId and languageId = @languageId
END

-------------------------------------------------------------

set @actionName = 'ApproveNamed' set @actionDisplayName = 'Approve'
set @actionDescription  = 'Approve Named' set @actionDescriptionName = 'Approve Named'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'CreateBatch' set @actionDisplayName = 'Create Batch'
set @actionDescription  = 'Create Batch' set @actionDescriptionName = 'Create Batch'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'RemoveFromBatch' set @actionDisplayName = 'Remove From Batch'
set @actionDescription  = 'Remove From Batch' set @actionDescriptionName = 'Remove From Batch'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Decline' set @actionDisplayName = 'Decline'
set @actionDescription  = 'Decline' set @actionDescriptionName = 'Decline'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------



set @actionName = 'RejectDestruction' set @actionDisplayName = 'Reject Destruction'
set @actionDescription  = 'Reject Destruction' set @actionDescriptionName = 'Reject Destruction'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Approve' set @actionDisplayName = 'Approve'
set @actionDescription  = 'Approve' set @actionDescriptionName = 'Approve'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Decline' set @actionDisplayName = 'Decline'
set @actionDescription  = 'Decline' set @actionDescriptionName = 'Decline'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'SentToProduction' set @actionDisplayName = 'Send to Production'
set @actionDescription  = 'Send to Production' set @actionDescriptionName = 'Send to Production'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Complete' set @actionDisplayName = 'Complete'
set @actionDescription  = 'Complete' set @actionDescriptionName = 'Complete'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END

-------------------------------------------------------------

set @actionName = 'Destruct' set @actionDisplayName = 'Destruct'
set @actionDescription  = 'Destruct' set @actionDescriptionName = 'Destruct'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'ApproveDestruction' set @actionDisplayName = 'Approve'
set @actionDescription  = 'Approve Destruction' set @actionDescriptionName = 'Approve Destruction'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Allocate' set @actionDisplayName = 'Allocate'
set @actionDescription  = 'Allocate' set @actionDescriptionName = 'Allocate'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END


-------------------------------------------------------------


set @actionName = 'Send' set @actionDisplayName = 'Send'
set @actionDescription  = 'Send' set @actionDescriptionName = 'Send'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'RejectCards' set @actionDisplayName = 'Reject'
set @actionDescription  = 'Reject Cards' set @actionDescriptionName = 'Reject Cards'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'AcceptCards' set @actionDisplayName = 'Accept'
set @actionDescription  = 'Accept Cards' set @actionDescriptionName = 'Accept Cards'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'ApproveCardAcceptance' set @actionDisplayName = 'Approve'
set @actionDescription  = 'Approve Card Acceptance' set @actionDescriptionName = 'Approve Card Acceptance'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END

-------------------------------------------------------------

set @actionName = 'RejectActivation' set @actionDisplayName = 'Reject'
set @actionDescription  = 'Reject Activation' set @actionDescriptionName = 'Reject Activation'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Activate' set @actionDisplayName = 'Activate'
set @actionDescription  = 'Activate' set @actionDescriptionName = 'Activate'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Block' set @actionDisplayName = 'Block'
set @actionDescription  = 'Block' set @actionDescriptionName = 'Block'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Hot' set @actionDisplayName = 'Hot'
set @actionDescription  = 'Hot' set @actionDescriptionName = 'Hot'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------


set @actionName = 'Deactivate' set @actionDisplayName = 'Deactivate'
set @actionDescription  = 'Deactivate' set @actionDescriptionName = 'Deactivate'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END

-------------------------------------------------------------

set @actionName = 'ApproveDeactivation' set @actionDisplayName = 'Approve'
set @actionDescription  = 'Approve Deactivation' set @actionDescriptionName = 'Approve Deactivation'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END


-------------------------------------------------------------
set @actionName = 'ApproveActivate' set @actionDisplayName = 'Approve'
set @actionDescription  = 'Approve Activate' set @actionDescriptionName = 'Approve Activate'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------
set @actionName = 'AddToBatch' set @actionDisplayName = 'Add To Batch'
set @actionDescription  = 'Add To Batch' set @actionDescriptionName = 'Add To Batch'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END

-------------------------------------------------------------
set @actionName = 'Download' set @actionDisplayName = 'Download'
set @actionDescription  = 'Download' set @actionDescriptionName = 'Download'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END

-------------------------------------------------------------
set @actionName = 'GeneratePIN' set @actionDisplayName = 'Generate PIN Mails'
set @actionDescription  = 'Generate PIN Mails' set @actionDescriptionName = 'Generate PIN Mails'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END

-------------------------------------------------------------
set @actionName = 'SaveChanges' set @actionDisplayName = 'Save Changes'
set @actionDescription  = 'Save Changes' set @actionDescriptionName = 'Save Changes'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END

-------------------------------------------------------------
set @actionName = 'Accept' set @actionDisplayName = 'Accept'
set @actionDescription  = 'Accept' set @actionDescriptionName = 'Accept'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
-------------------------------------------------------------
--set @actionName = 'DeclineNoName' set @actionDisplayName = 'Decline No Name'
--set @itemNameId = null
--set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

--if @itemNameId is null
--BEGIN
--    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
--    if @itemNameId is null
--    begin
--        insert into core.itemName (itemTypeId, itemName)
--        values (@itemTypeId, @actionName)

--        set @itemNameId = scope_identity()
--    end

--    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
--        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation)
--        values (@languageId, @itemNameId, @actionDisplayName)

--    insert into [card].[action] (itemNameId, actionName)
--    values (@itemNameId, @actionName)
--END
--else
--BEGIN
--    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
--        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation)
--        values (@languageId, @itemNameId, @actionDisplayName)
--END


----------------------------------------------------------------------------------------------------------------


set @actionName = 'ResetPINRetries' set @actionDisplayName = 'Reset PIN Retries'
set @actionDescription  = 'Reset PIN Retries' set @actionDescriptionName = 'Reset PIN Retries'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END

-------------------------------------------------------------



set @actionName = 'RejectDeactivation' set @actionDisplayName = 'Reject'
set @actionDescription  = 'Reject Deactivation' set @actionDescriptionName = 'Reject Deactivation'
set @itemNameId = null
set @itemNameId =  (select itemNameId from [card].[action] where actionname = @actionName)

if @itemNameId is null
BEGIN
    set @itemNameId = (select itemNameId from core.itemName where [itemName] = @actionName and itemTypeId = @itemTypeId)
    if @itemNameId is null
    begin
        insert into core.itemName (itemTypeId, itemName, itemDescription)
        values (@itemTypeId, @actionName, @actionDescription)

        set @itemNameId = scope_identity()
    end

    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)

    insert into [card].[action] (itemNameId, actionName)
    values (@itemNameId, @actionName)
END
else
BEGIN
    if not exists (select * from core.itemTranslation where itemNameId = @itemNameId and languageId = @languageId)
        insert into [core].[itemTranslation](languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        values (@languageId, @itemNameId, @actionDisplayName, @actionDescriptionName)
END
