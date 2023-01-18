ALTER PROCEDURE [card].[cardInUse.fetch] -- List information for cards in use
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @orderBy card.orderByTT READONLY, -- information for ordering
    @filterBy card.filterByTT READONLY, -- information for filters
    @paging card.pagingTT READONLY -- information for paging
AS
SET NOCOUNT ON

DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
DECLARE @statusId tinyint
DECLARE @targetBranchId bigint, @currentBranchId bigint, @issuingBranchId bigint
DECLARE @productId int
DECLARE @typeId int
DECLARE @batchName nvarchar(100)
DECLARE @customerName nvarchar(100)
DECLARE @personName nvarchar(100)
DECLARE @customerNumber nvarchar(10)
DECLARE @cardHolderName nvarchar(100)
DECLARE @cardNumber varchar(100)
DECLARE @pageSize int = 1
DECLARE @pageNumber int = 20
DECLARE @sortBy varchar(50) = null
DECLARE @sortOrder varchar(4) = null

declare @statusTable table(statusId tinyint, statusName nvarchar(1000), statusLabel varchar(50))


DECLARE @languageId BIGINT = (SELECT languageId
                    FROM [core].[language] cl
                    JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                    WHERE us.[actorId] = @userId)

SELECT @statusId = statusId,
    @targetBranchId = targetBranchId,
    @currentBranchId = currentBranchId,
    @issuingBranchId = issuingBranchId,
    @productId = productId,
    @typeId = typeId,
    @batchName = batchName,
    @customerName = customerName,
    @customerNumber = customerNumber,
    @cardHolderName = cardHolderName,
    @personName = personName,
    @cardNumber = cardNumber
FROM @filterBy

SELECT @sortBy = [column],
    @sortOrder = [direction]
FROM @orderBy
where [column] in ('customerName', 'productName', 'typeName', 'cardHolderName', 'personName', 'cardNumber', 'expirationDate', 'generatedPinMails', 'activationDate',
            'statusName', 'targetBranchName', 'currentBranchName', 'issuingBranchName', 'batchName', 'updatedOn', 'temporaryLockEndDate')
    and [direction] in ('ASC', 'DESC')

SELECT @pageNumber = ISNULL(pageNumber,1),
    @pageSize = ISNULL([pageSize], 20)
FROM @paging

DECLARE @startRow INT = ( @pageNumber - 1) * @pageSize + 1
DECLARE @endRow INT = @startRow + @pageSize - 1


--if no filter by status exclude the end statuses
if @statusId is null and @customerName is null and @customerNumber is null and @cardNumber is null and @personName is null and @cardHolderName is null
    insert into @statusTable(statusId, statusName, statusLabel)
    select distinct s.statusId, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, s.statusName as statusLabel
    from [card].[status] s
    join [card].statusAction sa on sa.fromStatusId = s.statusId or sa.toStatusId = s.statusId
    LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = @languageId
    left join [card].statusStartEnd sse on sse.statusId = s.statusId and startendFlag = 1
    where sa.module = 'CardInUse' and sse.statusId is null
else
    insert into @statusTable(statusId, statusName, statusLabel)
    select distinct s.statusId, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, s.statusName as statusLabel
    from [card].[status] s
    LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = @languageId
    where s.statusId = isnull(@statusId, s.statusId)


IF OBJECT_ID('tempdb..#CardInUse') IS NOT NULL
    DROP TABLE #CardInUse

CREATE TABLE #CardInUse (
    cardId bigint ,
    customerName nvarchar(100),
    customerNumber nvarchar(10),
    productName nvarchar(100), --card.cardProduct.name
    typeName nvarchar(100),
    cardHolderName nvarchar(100),
    personName nvarchar(100),
    cardNumber varchar(50),
    expirationDate date,
    generatedPinMails tinyint,
    targetBranchName nvarchar(100), --customer.organization.organizationName
    statusId tinyint,
    statusLabel varchar(50),
    statusName nvarchar(500), --card.status.statusName
    rowNum int,
    recordsTotal int,
    activationDate date,
    currentBranchName nvarchar(100),
    updatedOn datetime2(0),
    issuingBranchName nvarchar(100),
    batchName nvarchar(100),
    temporaryLockEndDate datetime2(0))


;WITH CTE AS
(
    SELECT   cardId, customerName, customerNumber, productName, typeName,
    cardHolderName,cardNumber, expirationDate, generatedPinMails,
    targetBranchName, statusId, statusName, statusLabel, personName, currentBranchName, 
    issuingBranchName, activationDate, updatedOn, batchName, temporaryLockEndDate,
        ROW_NUMBER() OVER(ORDER BY
                        CASE WHEN @sortOrder = 'ASC' THEN
                            CASE
                                WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100), c.updatedOn)
                                WHEN @sortBy = 'customerName' THEN c.customerName
                                WHEN @sortBy = 'productName' THEN c.productName
                                WHEN @sortBy = 'typeName' THEN c.typeName
                                WHEN @sortBy = 'cardHolderName' THEN c.cardHolderName
                                WHEN @sortBy = 'personName' THEN c.personName
                                WHEN @sortBy = 'cardNumber' THEN c.cardNumber
                                WHEN @sortBy = 'expirationDate' THEN convert(nvarchar(100), c.expirationDate)
                                WHEN @sortBy = 'activationDate' THEN convert(nvarchar(100), c.activationDate)
                                WHEN @sortBy = 'generatedPinMails' THEN replicate('0', 20 - len(convert(nvarchar(100),c.generatedPinMails))) + convert(nvarchar(100),c.generatedPinMails)
                                WHEN @sortBy = 'statusName' THEN c.statusName
                                WHEN @sortBy = 'issuingBranchName' THEN c.issuingBranchName
                                WHEN @sortBy = 'currentBranchName' THEN c.currentBranchName
                                WHEN @sortBy = 'targetBranchName' THEN c.targetBranchName
                                WHEN @sortBy = 'temporaryLockEndDate' THEN CONVERT(NVARCHAR(50), c.temporaryLockEndDate, 121)
                            END
                        END,
                        CASE WHEN @sortOrder = 'DESC' THEN
                            CASE
                                WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100), c.updatedOn)
                                WHEN @sortBy = 'customerName' THEN c.customerName
                                WHEN @sortBy = 'productName' THEN c.productName
                                WHEN @sortBy = 'typeName' THEN c.typeName
                                WHEN @sortBy = 'cardHolderName' THEN c.cardHolderName
                                WHEN @sortBy = 'personName' THEN c.personName
                                WHEN @sortBy = 'cardNumber' THEN c.cardNumber
                                WHEN @sortBy = 'expirationDate' THEN convert(nvarchar(100), c.expirationDate)
                                WHEN @sortBy = 'activationDate' THEN convert(nvarchar(100), c.activationDate)
                                WHEN @sortBy = 'generatedPinMails' THEN replicate('0', 20 - len(convert(nvarchar(100),c.generatedPinMails))) + convert(nvarchar(100),c.generatedPinMails)
                                WHEN @sortBy = 'statusName' THEN c.statusName
                                WHEN @sortBy = 'issuingBranchName' THEN c.issuingBranchName
                                WHEN @sortBy = 'currentBranchName' THEN c.currentBranchName
                                WHEN @sortBy = 'targetBranchName' THEN c.targetBranchName
                                WHEN @sortBy = 'temporaryLockEndDate' THEN CONVERT(NVARCHAR(50), c.temporaryLockEndDate, 121)
                            END
                        END DESC,
                        -- default sorting whne nothing is passed - by updatedOn or createdOn id it not updated
                        CASE WHEN @sortOrder IS NULL THEN convert(nvarchar(100), isnull(c.updatedOn, c.createdOn)) END DESC
                        ) rowNum,
                        COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
    FROM
    (
        SELECT c.cardId, c.customerName, c.customerNumber, p.name AS productName, t.name as typeName, c.cardHolderName, 
                '******' AS cardNumber, c.expirationDate, c.generatedPinMails, o.organizationName AS targetBranchName, 
                c.statusId, s.statusName AS statusName, statusLabel, c.personName,
                co.organizationName AS currentBranchName,  cor.organizationName AS issuingBranchName,
            c.activationDate, c.updatedOn, c.createdOn, b.batchName,
            CASE WHEN c.pinRetriesLastInvalid >= dateadd(day, -1, getdate()) AND c.pinRetries < c.pinRetriesLImit AND c.pinRetriesDailyLimit <= c.pinRetriesDaily  THEN dateadd(day, 1, pinRetriesLastInvalid)
                 ELSE NULL END AS temporaryLockEndDate
        FROM [card].[card] c
        JOIN @statusTable s ON c.statusId = s.statusId
        JOIN [card].[product] p ON c.productId = p.productId
        JOIN [card].[type] t ON c.typeId = t.typeId
        JOIN [card].number cn on cn.numberId = c.cardId
        LEFT JOIN [card].[batch] b ON b.batchId = c.batchId
        --
        join customer.organizationsVisibleFor(@userId) cur on cur.actorId = c.currentBranchId
        --
        LEFT JOIN customer.organizationsVisibleFor(@currentBranchId) bu on bu.actorId = c.currentBranchId
        LEFT JOIN customer.organization o ON o.actorId = c.targetBranchId
        LEFT JOIN customer.organization co ON co.actorId = c.currentBranchId
        LEFT JOIN customer.organization cor ON cor.actorId = c.issuingBranchId
        WHERE (@currentBranchId IS NULL or bu.actorId is NOT NULL)
            AND ( @productId IS NULL OR c.productId = @productId )
            AND ( @typeId IS NULL OR c.typeId = @typeId )
            AND ( @customerName IS NULL OR c.customerName like '%' + @customerName +'%' )
            AND ( @personName IS NULL OR c.personName like '%' + @personName +'%' )
            --show only asssigned to customer card in the list for cards in use
            AND ( c.customerNumber is not null)
            AND ( @targetBranchId IS NULL OR c.targetBranchId = @targetBranchId )
            --AND ( @currentBranchId IS NULL OR c.currentBranchId = @currentBranchId )
            AND ( @customerNumber IS NULL OR c.customerNumber = @customerNumber )
            AND ( @cardHolderName IS NULL OR c.cardHolderName like '%' + @cardHolderName + '%')
            AND ( @cardNumber IS NULL OR cn.pan = @cardNumber )
            AND ( @issuingBranchId IS NULL OR c.issuingBranchId = @issuingBranchId)
    )  c
)

INSERT INTO #CardInUse( cardId, customerName, customerNumber, productName, typeName, cardHolderName,
    cardNumber, expirationDate, generatedPinMails,targetBranchName, statusId, statusName, 
    statusLabel, rowNum, recordsTotal, personName, activationDate, currentBranchName, 
    issuingBranchName, updatedOn, batchName, temporaryLockEndDate)
SELECT cardId, customerName, customerNumber, productName, typeName, cardHolderName,cardNumber, 
    expirationDate, generatedPinMails, targetBranchName, statusId, statusName, 
    statusLabel, rowNum, recordsTotal, personName, activationDate, currentBranchName, 
    issuingBranchName, updatedOn, batchName, temporaryLockEndDate
FROM CTE
WHERE rowNum BETWEEN @startRow AND  @endRow


SELECT 'cards' AS resultSetName

SELECT cardId, customerName, customerNumber, productName, typeName, targetBranchName, statusId, 
    cardHolderName,cardNumber, expirationDate, generatedPinMails, statusName, statusLabel, 
    personName, activationDate, currentBranchName, issuingBranchName, updatedOn, batchName, temporaryLockEndDate
FROM #CardInUse c
ORDER BY rowNum

SELECT 'pagination' AS resultSetName

SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
FROM #CardInUse

DROP TABLE #CardInUse