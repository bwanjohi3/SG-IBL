ALTER PROCEDURE [atm].[cashPosition]
    @terminalId VARCHAR(8) = NULL,
    @terminalName VARCHAR(40) = NULL,
    @transferCurrency NVARCHAR(3) = NULL,
    @pageSize INT = 25,                       -- how many rows will be returned per page
    @pageNumber INT = 1,                      -- which page number to display
    @meta core.metaDataTT READONLY            -- information for the user that makes the operation
AS
    DECLARE @callParams XML
    DECLARE @startRow INT
    DECLARE @endRow INT
BEGIN TRY


     -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
--    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta

    SET @startRow = (@pageNumber - 1) * @pageSize + 1
    SET @endRow = @startRow + @pageSize - 1

    SET @callParams = ( SELECT  @terminalId AS terminalId, 
                                @terminalName AS terminalName, 
                                @transferCurrency AS transferCurrency,
                                @pageSize AS pageSize,
                                @pageNumber AS pageNumber,
                                (SELECT * from @meta rows FOR XML AUTO, TYPE) AS meta 
                        FOR XML RAW('params'),TYPE)

    IF OBJECT_ID('tempdb..#atmDetails') IS NOT NULL
    BEGIN
        DROP TABLE #atmDetails
    END

    ;WITH atmDetails AS  
        (  
        SELECT
            t.sortOrder,
            t.terminalId,
            t.terminalName,
            t.cassette1Currency,
            t.cassette1Denomination,
            t.cassette2Currency,
            t.cassette2Denomination,
            t.cassette3Currency,
            t.cassette3Denomination,
            t.cassette4Currency,
            t.cassette4Denomination,
            t.cassette1Amount,
            t.cassette2Amount,
            t.cassette3Amount,
            t.cassette4Amount,
            t.rejected1,
            t.rejected2,
            t.rejected3,
            t.rejected4,
            t.cassette1RejectedAmount,
            t.cassette2RejectedAmount,
            t.cassette3RejectedAmount,
            t.cassette4RejectedAmount,
            t.notes1,
            t.notes2,
            t.notes3,
            t.notes4,
            t.cassette1Amount + t.cassette1RejectedAmount AS cassette1TotalAmount,
            t.cassette2Amount + t.cassette2RejectedAmount AS cassette2TotalAmount,
            t.cassette3Amount + t.cassette3RejectedAmount AS cassette3TotalAmount,
            t.cassette4Amount + t.cassette4RejectedAmount AS cassette4TotalAmount,
            t.totalAvailable,
            t.totalRejected,
            t.total,
            ROW_NUMBER() OVER (ORDER BY t.sortOrder) AS rowNum,
            COUNT(*) OVER (PARTITION BY 1) AS recordsTotal
        FROM [atm].[vSupplyStatus] t
        WHERE (@terminalId IS NULL OR @terminalId = t.terminalId)
        AND (@terminalName IS NULL OR @terminalName = t.terminalName)
        AND (@transferCurrency IS NULL OR @transferCurrency IN (cassette1Currency, cassette2Currency, cassette3Currency, cassette4Currency ))
    )
    SELECT *    
    INTO #atmDetails
    FROM atmDetails 
    WHERE rowNum BETWEEN @startRow AND @endRow    

    SELECT 'cashPosition' AS resultSetName

    SELECT
        t.rowNum,
        t.recordsTotal,
        t.terminalId,
        t.terminalName,
        t.cassette1Denomination,
        t.cassette1Currency,
        t.cassette1Amount,
        t.rejected1,
        t.cassette1RejectedAmount,
        t.notes1,
        cassette1TotalAmount,
        t.cassette2Denomination,
        t.cassette2Currency,
        t.cassette2Amount,
        t.rejected2,
        t.cassette2RejectedAmount,
        t.notes2,
        cassette2TotalAmount,
        t.cassette3Denomination,
        t.cassette3Currency,
        t.cassette3Amount,
        t.rejected3,
        t.cassette3RejectedAmount,
        t.notes3,
        cassette3TotalAmount,
        t.cassette4Denomination,
        t.cassette4Currency,
        t.cassette4Amount,
        t.rejected4,
        t.cassette4RejectedAmount,
        t.notes4,
        cassette4TotalAmount,
        t.totalAvailable,
        t.totalRejected,
        t.total 
    FROM #atmDetails t
    ORDER BY t.rowNum

    SELECT 'pagination' AS resultSetName

    SELECT TOP 1 
        @pageSize AS pageSize,
        recordsTotal AS recordsTotal,
        @pageNumber AS pageNumber,
        (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #atmDetails

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC [core].[error]
    RETURN 55555
END CATCH