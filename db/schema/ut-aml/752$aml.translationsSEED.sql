declare @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');
declare @frLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'fr');
declare @cnLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'cn');
declare @itemName nvarchar(200)
declare @itemNameId [bigint] = 1
declare @itemNameTranslation nvarchar(max)
declare @itemTypeTextId [int] = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'text');

IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'List Management')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'List Management');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'List Management')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId) AND @itemNameId iS not null
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'List Management');
END


IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'Create List')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'Create List');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'Create List') 
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)AND @itemNameId iS not null
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'Create List');
END

IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'Filter by')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'Filter by');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'Filter by')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId) AND @itemNameId iS not null
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'Filter by');
END




IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'Download')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'Download');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'Download')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId) AND @itemNameId iS not null
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'Download');
END

IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'Schedule')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'Schedule');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'Schedule')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId) AND @itemNameId iS not null
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'Schedule');
END


IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'Last Import')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'Last Import');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'Last Import')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId) AND @itemNameId iS not null
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'Last Import');
END

IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'Edit')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'Edit');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'Edit')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId) AND @itemNameId iS not null
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'Edit');
END


IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'Delete')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'Delete');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'Delete')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)AND @itemNameId iS not null
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'Delete');
END

IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'aml.setupList.check.fileDisplayNameIsUnique')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'aml.setupList.check.fileDisplayNameIsUnique');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'aml.setupList.check.fileDisplayNameIsUnique')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'aml.setupList.check.fileDisplayNameIsUnique');
END


IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'aml.setupList.check.fileNameIsUnique')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'aml.setupList.check.fileNameIsUnique');
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = 'aml.setupList.check.fileNameIsUnique')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'aml.setupList.check.fileNameIsUnique');
END





SET @itemName='aml.import.status.no.data.yet'
SET @itemNameTranslation='There is no available aml list import statuses yet'
IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = @itemName)
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, @itemName);
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = @itemName)
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, @itemNameTranslation);
END
SET @itemName=NULL
SET @itemNameTranslation=NULL



SET @itemName='aml.setupList.check.incorrectFillAutoUploadFields'
SET @itemNameTranslation='aml.setupList.check.incorrectFillAutoUploadFields'
IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = @itemName)
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, @itemName);
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = @itemName)
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, @itemNameTranslation);
END
SET @itemName=NULL
SET @itemNameTranslation=NULL


SET @itemName='aml.import.status.cannot.start.import.process'
SET @itemNameTranslation='Cannot start requested importing process'
IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = @itemName)
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, @itemName);
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = @itemName)
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, @itemNameTranslation);
END
SET @itemName=NULL
SET @itemNameTranslation=NULL


SET @itemName='aml.import.status.cannot.stop.import.process'
SET @itemNameTranslation='Cannot stop requested importing process'
IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = @itemName)
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, @itemName);
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = @itemName)
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, @itemNameTranslation);
END
SET @itemName=NULL
SET @itemNameTranslation=NULL


SET @itemName='aml.file.store.cannot.create.file'
SET @itemNameTranslation='Cannot create file on server file system'
IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = @itemName)
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, @itemName);
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = @itemName)
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, @itemNameTranslation);
END
SET @itemName=NULL
SET @itemNameTranslation=NULL

SET @itemName='aml.file.store.cannot.delete.file'
SET @itemNameTranslation='Cannot delete file on server file system'
IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = @itemName)
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, @itemName);
END
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeTextId and itemName = @itemName)
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, @itemNameTranslation);
END
SET @itemName=NULL
SET @itemNameTranslation=NULL