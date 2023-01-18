ALTER PROCEDURE [card].[report.queueOutFetch] -- returns the specified count of messages ordered by the priority from the biggest to the lowest
    @port nvarchar(255), -- the port
    @count int, -- the number of the messages that should be returned
	@createdFromDate datetime = null, --From date filter
	@createdToDate datetime = null --To date filter
AS
BEGIN TRY

    DECLARE @messageOut TABLE(id BIGINT, port VARCHAR(255), channel VARCHAR(100), recipient VARCHAR(255), content NVARCHAR(MAX),status nvarchar(255),createdon datetime)
    SELECT 'messages' resultSetName;

    declare @sql nvarchar(2000) = 'OPEN SYMMETRIC KEY MessageOutContent_Key DECRYPTION BY CERTIFICATE MessageOutContent'
    exec sp_executesql @sql

    UPDATE m
    SET [statusId] =  [statusId]
    OUTPUT INSERTED.id, INSERTED.port, INSERTED.channel, INSERTED.recipient,  DecryptByKey(INSERTED.content, 1 ,  HashBytes('SHA1', CONVERT(varbinary, INSERTED.id))),ast.name as status,INSERTED.createdOn
    INTO @messageOut (id, port, channel, recipient, content,status,createdon)
    FROM
    (
        SELECT  [id]
        FROM [alert].[messageOut] m
		where cast(m.createdon as date) between
		@createdFromDate and @createdToDate or (@createdFromDate is null or @createdToDate is null)
    ) s
    JOIN [alert].[messageOut] m on s.Id = m.id and m.port = 'sms'
	JOIN [alert].[status] ast on ast.id =m.statusId 
    
    SELECT id, port, channel, recipient, content,status,CONVERT(varchar(10),createdon,3) + ' ' + CONVERT(varchar(10),createdon,8) as createdon
    FROM @messageOut
    
END TRY
BEGIN CATCH
DECLARE @CORE_ERROR_FILE_33 sysname='f:\JoboStuff\IBL\Implementation2\ibl_impl_standard\node_modules\ut-alert\schema/750$alert.queueOut.pop.sql' DECLARE @CORE_ERROR_LINE_33 int='34' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_33, @fileLine=@CORE_ERROR_LINE_33, @params = NULL
END CATCH