ALTER PROCEDURE [card].[report.listOfCards] --creates a report for details of the cards in the system
    @createdFromDate date, -- card created start date
    @createdToDate date, -- card created end date
    @activatedFromDate date, -- card activated start date
    @activatedToDate date, -- card activated end date
    @expirationFromDate date, -- card expires start date
    @expirationToDate date, -- card expires end date
    @destructionFromDate date, -- card destructed start date
    @destructionToDate date, -- card destructed end date
    @statusId int, -- filter by card status id
    @productId int, -- filter by product id
    @branchId int, -- filter by branch id
    @pageNumber int, -- page number for result
    @pageSize int, -- page size of result
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
SET NOCOUNT ON

DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0

EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
    BEGIN
       RETURN 55555
    END

DECLARE @languageId BIGINT = (SELECT languageId
                          FROM [core].[language] cl
                          JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                          WHERE us.[actorId] = @userId)

IF @pageNumber IS NULL
    SET @pageNumber = 1

IF @pagesize IS NULL
    SET @pageSize = 25

DECLARE @startRow INT = (@pageNumber - 1) * @pageSize + 1
DECLARE @endRow INT = @startRow + @pageSize - 1
DECLARE @destructedId TINYINT = (SELECT statusId from [card].[status] WHERE [statusName] = 'Destructed')

IF @destructionFromDate IS NOT NULL OR @destructionToDate IS NOT NULL
    SET @destructionToDate = dateadd (d, 1, @destructionToDate)

IF OBJECT_ID('tempdb..#newCardsPerPeriod') IS NOT NULL
    DROP TABLE #newCardsPerPeriod

;WITH CTE AS
    (
       SELECT  c.cardNumber AS [cardNumber], o.organizationName AS [bu], customerNumber AS [clientNumber],
             c.customerName AS [clientName], pr.[name] AS [product], ISNULL(itt.itemNameTranslation, s.statusName) AS [status],
             u.identifier AS [createdBy], c.creationDate AS [createdOn],
             u1.identifier AS [activatedBy], c.activationDate AS [activatedOn], c.expirationDate AS [expirationDate],
             u2.identifier AS [updatedBy], convert(varchar(19), c.updatedOn, 120) AS [updatedOn], ISNULL(it.itemNameTranslation, r.name) as [reason], c.comments as [description],
             ca.accountNumber as [primaryAccountNumber]
             ,ROW_NUMBER() OVER(ORDER BY c.cardNumber) as RowNum
             ,COUNT(*) OVER(PARTITION BY 1) AS recordsTotal

       FROM [card].[card] c
       JOIN [card].[status] s ON s.statusId = c.statusId
       LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and @languageId = itt.languageId
       JOIN [card].[product] pr on pr.productId = c.productId
       JOIN [customer].organization o ON o.actorId = c.currentBranchId
       JOIN [user].hash u ON u.actorId = c.createdBy and u.type = 'password'
       LEFT JOIN [user].hash u1 ON u1.actorId = c.activatedBy and u1.type = 'password'
       LEFT JOIN [user].hash u2 ON u2.actorId = c.updatedBy and u2.type = 'password'
       LEFT JOIN [card].reason r ON r.reasonId = c.reasonId
       LEFT JOIN [core].itemTranslation it on it.itemNameId = r.itemNameId and @languageId = it.languageId
       left join [card].cardAccount ca on c.cardId = ca.cardId and ca.isPrimary = 1

       WHERE (@createdFromDate IS NULL OR  creationDate>= @createdFromDate)
          AND (@createdToDate IS NULL OR  creationDate<= @createdToDate)
          AND (@activatedFromDate IS NULL OR  activationDate>= @activatedFromDate)
          AND (@activatedToDate IS NULL OR  activationDate<= @activatedToDate)
          AND (@expirationFromDate IS NULL OR  expirationDate>= @expirationFromDate)
          AND (@expirationToDate IS NULL OR  expirationDate<= @expirationToDate)
          AND (@destructionFromDate IS NULL OR  (c.updatedOn >= @destructionFromDate AND c.statusId = @destructedId))
          AND (@destructionToDate IS NULL OR  (c.updatedOn < @destructionToDate AND c.statusId = @destructedId))
          AND (@statusId  IS NULL OR c.statusId = @statusId)
          AND (@productId IS NULL OR c.productId = @productId)
          AND (@branchId  IS NULL OR c.currentBranchId = @branchId)
    )


SELECT [cardNumber], [bu], [clientNumber], [clientName],[product], [status],
      [createdBy], [createdOn], [activatedBy], [activatedOn], [expirationDate], updatedBy, updatedOn,
      reason, [description], [primaryAccountNumber], RowNum, recordsTotal
INTO #newCardsPerPeriod
FROM cte
WHERE RowNum BETWEEN @startRow AND @endRow


SELECT 'newCardsPerPeriod' AS resultSetName

SELECT [bu], [cardNumber], [clientNumber], [clientName],[product], [status],
      [createdBy], [createdOn], [activatedBy], [activatedOn], [expirationDate], [primaryAccountNumber],
	  [updatedBy], [updatedOn], [reason], [description]
FROM  #newCardsPerPeriod
ORDER BY rowNum

SELECT 'pagination' AS resultSetName

SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
FROM #newCardsPerPeriod

DROP TABLE #newCardsPerPeriod