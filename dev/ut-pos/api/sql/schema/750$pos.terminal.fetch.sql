ALTER PROCEDURE [pos].[terminal.fetch]
    @pageSize INT = 25,
    @pageNumber INT = 1,
    @meta core.metaDataTT READONLY -- information for the user that makes the operation    
    
AS
SET NOCOUNT ON;

DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

IF OBJECT_ID('tempdb..#PosTerminals') IS NOT NULL
    DROP TABLE #PosTerminals

;WITH terminalsCTE AS
(
    SELECT 
        t.actorId, 
        t.terminalNumber,
        t.[name], t.terminalSerial,
        t.merchantName,
        t.terminalBrandModelId, 
        t.[location],
        t.[adminPassword],
        t.[description],
        t.active,
        t.currVersion,
        -- paging columns
        ROW_NUMBER() OVER (ORDER BY t.actorId) rowNum,
        COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
    FROM pos.terminal t
)

SELECT actorId, terminalNumber, [name], terminalSerial, merchantName, terminalBrandModelId, [location], [adminPassword],[description], active, currVersion, rowNum, recordsTotal
INTO #PosTerminals
FROM terminalsCTE tCTE
WHERE rowNum BETWEEN ((@pageNumber - 1) * @pageSize) + 1 AND @pageSize * (@pageNumber)

SELECT 'terminals' AS resultSetName

SELECT t.actorId AS terminalId, t.terminalNumber, t.[name], t.terminalSerial, t.merchantName, t.terminalBrandModelId, t.[location], t.[adminPassword],t.[description], t.active, t.currVersion       
FROM #PosTerminals t
ORDER BY rowNum

SELECT 'pagination' AS resultSetName

SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
FROM #PosTerminals


