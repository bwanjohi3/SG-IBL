ALTER PROCEDURE [card].[batch.list] --batch displayed in submitted type id
    @embossedTypeId TINYINT  --submitted type id
AS

SELECT DISTINCT b.batchId, b.batchName 
FROM [card].embossedType ct
JOIN [card].batch b ON b.embossedTypeId = ct.embossedTypeId
JOIN [card].statusStartEnd sse ON sse.StatusId = b.statusId
WHERE sse.startendFlag = 0
    and sse.module ='batch'
    and ct.embossedTypeId = @embossedTypeId




