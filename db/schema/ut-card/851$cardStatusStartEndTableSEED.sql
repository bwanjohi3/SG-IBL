declare @statusId tinyint, @module varchar(50), @startendFlag bit



---Application module
set @module = 'Application'


   ---start status
set @statusId     = (select statusId from card.status where statusName = 'New')
set @startendFlag = 0
IF NOT EXISTS (select 1 from [card].statusStartEnd where statusId = @statusId and module = @module and startendFlag = @startendFlag)
   INSERT INTO [card].statusStartEnd (statusId, module, startendFlag)
   VALUES ( @statusId ,@module, @startendFlag)
   ---end status
set @statusId     = (select statusId from card.status where statusName = 'Completed')
set @startendFlag = 1
IF NOT EXISTS (select 1 from [card].statusStartEnd where statusId = @statusId and module = @module and startendFlag = @startendFlag)
   INSERT INTO [card].statusStartEnd (statusId, module, startendFlag)
   VALUES ( @statusId ,@module, @startendFlag)

set @statusId     = (select statusId from card.status where statusName = 'Declined')
set @startendFlag = 1
IF NOT EXISTS (select 1 from [card].statusStartEnd where statusId = @statusId and module = @module and startendFlag = @startendFlag)
   INSERT INTO [card].statusStartEnd (statusId, module, startendFlag)
   VALUES ( @statusId ,@module, @startendFlag)


---Batch module
set @module = 'Batch'

    ---start status
set @statusId     = (select statusId from card.status where statusName = 'New')
set @startendFlag = 0
IF NOT EXISTS (select 1 from [card].statusStartEnd where statusId = @statusId and module = @module and startendFlag = @startendFlag)
   INSERT INTO [card].statusStartEnd (statusId, module, startendFlag)
   VALUES ( @statusId ,@module, @startendFlag)

    ---end status
set @statusId     = (select statusId from card.status where statusName = 'Completed')
set @startendFlag = 1
IF NOT EXISTS (select 1 from [card].statusStartEnd where statusId = @statusId and module = @module and startendFlag = @startendFlag)
   INSERT INTO [card].statusStartEnd (statusId, module, startendFlag)
   VALUES ( @statusId ,@module, @startendFlag)

set @statusId     = (select statusId from card.status where statusName = 'Declined')
set @startendFlag = 1
IF NOT EXISTS (select 1 from [card].statusStartEnd where statusId = @statusId and module = @module and startendFlag = @startendFlag)
   INSERT INTO [card].statusStartEnd (statusId, module, startendFlag)
   VALUES ( @statusId ,@module, @startendFlag)


---Cards in production module
set @module = 'Card'

    ---end status
set @statusId     = (select statusId from card.status where statusName = 'Destructed')
set @startendFlag = 1
IF NOT EXISTS (select 1 from [card].statusStartEnd where statusId = @statusId and module = @module and startendFlag = @startendFlag)
   INSERT INTO [card].statusStartEnd (statusId, module, startendFlag)
   VALUES ( @statusId ,@module, @startendFlag)


---Ready cards module
set @module = 'CardInUse'

    ---end status
set @statusId     = (select statusId from card.status where statusName = 'Destructed')
set @startendFlag = 1
IF NOT EXISTS (select 1 from [card].statusStartEnd where statusId = @statusId and module = @module and startendFlag = @startendFlag)
   INSERT INTO [card].statusStartEnd (statusId, module, startendFlag)
   VALUES ( @statusId ,@module, @startendFlag)
