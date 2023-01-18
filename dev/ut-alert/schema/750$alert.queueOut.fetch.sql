ALTER PROCEDURE [alert].[queueOut.fetch] -- returns the specified count of messages ordered by the priority from the biggest to the lowest
    @port nvarchar(255), -- the port
    @count int, -- the number of the messages that should be returned
	@dateFrom datetime, --From date filter
	@dateTo datetime --To date filter
AS
BEGIN TRY

    SELECT 'messages' resultSetName;

    declare @sql nvarchar(2000) = 'OPEN SYMMETRIC KEY MessageOutContent_Key DECRYPTION BY CERTIFICATE MessageOutContent'
    exec sp_executesql @sql
    select id,recipient, DecryptByKey(content, 1 ,  HashBytes('SHA1', CONVERT(varbinary, id))) as content,
	createdon,statusId,messageInId from [alert].[messageOut] where cast(createdon as date) between
	@dateFrom and @dateTo;
    
END TRY
BEGIN CATCH
DECLARE @CORE_ERROR_FILE_33 sysname='f:\JoboStuff\IBL\Implementation2\ibl_impl_standard\node_modules\ut-alert\schema/750$alert.queueOut.pop.sql' DECLARE @CORE_ERROR_LINE_33 int='34' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_33, @fileLine=@CORE_ERROR_LINE_33, @params = NULL
END CATCH