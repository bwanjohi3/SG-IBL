ALTER PROCEDURE [card].[pinMailerFile.fetch] -- lists all organizations
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

SELECT 'pinMailerFile' AS resultSetName

SELECT
    [id], [name], [pinMailerFile], [pinLinkFile], [batchId], [count], [createdOn], [status]
FROM [card].[pinMailerFile]
ORDER BY [id] DESC
