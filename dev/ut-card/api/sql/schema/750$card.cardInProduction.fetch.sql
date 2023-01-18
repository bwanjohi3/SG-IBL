ALTER PROCEDURE [card].[cardInProduction.fetch] -- List information for ready cards
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
DECLARE @cardNumber varchar(100)
DECLARE @customerName nvarchar(100)
DECLARE @personName nvarchar(100)
DECLARE @customerNumber nvarchar(10)
DECLARE @cardHolderName nvarchar(100)
DECLARE @pageSize int = 20
DECLARE @pageNumber int = 1
DECLARE @sortBy varchar(50) = null
DECLARE @sortOrder varchar(4) = null

declare @statusTable table(statusId tinyint, statusName nvarchar(1000), statusLabel varchar(50))


DECLARE @languageId BIGINT = (SELECT languageId
                    FROM [core].[language] cl
                    JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                    WHERE us.[actorId] = @userId)

DECLARE @embossedTypeId tinyint = (SELECT embossedTypeId FROM [card].[embossedType] et
                        join core.itemName itn on itn.itemNameId = et.itemNameId
                        join core.itemType it on it.itemTypeId = itn.itemTypeId
                        WHERE itemCode = 'Named' and it.alias = 'embossedType')

SELECT @statusId = statusId,
    @targetBranchId = targetBranchId,
    @currentBranchId = currentBranchId,
    @issuingBranchId = issuingBranchId,
    @productId = productId,
    @typeId = typeId,
    @batchName = batchName,
    @cardNumber = cardNumber,
    @customerName = customerName,
    @customerNumber = customerNumber,
    @cardHolderName = cardHolderName,
    @personName = personName
FROM @filterBy

SELECT
    @sortBy = [column],
    @sortOrder = [direction]
FROM @orderBy
where [column] in ('productName', 'cardNumber', 'acceptanceDate', 'expirationDate', 'generatedPinMails', 'statusName', 'targetBranchName', 'currentBranchName', 'issuingBranchName', 'batchName', 'updatedOn', 'typeName')
and [direction] in ('ASC', 'DESC')

SELECT @pageNumber = ISNULL(pageNumber,1),
    @pageSize = ISNULL([pageSize], 20)
FROM @paging

DECLARE @startRow INT = ( @pageNumber - 1) * @pageSize + 1
DECLARE @endRow INT = @startRow + @pageSize - 1


--if no filter by status and no filter by input field exclude the end statuses
if @statusId is null and @batchName is null and @customerName is null and @customerNumber is null and @cardNumber is null and @personName is null and @cardHolderName is null
    insert into @statusTable(statusId, statusName, statusLabel)
    select distinct s.statusId, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, s.statusName as statusLabel
    from [card].[status] s
    join [card].statusAction sa on sa.fromStatusId = s.statusId or sa.toStatusId = s.statusId
    LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = @languageId
    left join [card].statusStartEnd sse on sse.statusId = s.statusId and startendFlag = 1
    where sa.module = 'card' and sse.statusId is null
else
    insert into @statusTable(statusId, statusName, statusLabel)
    select distinct s.statusId, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, s.statusName as statusLabel
    from [card].[status] s
    join [card].statusAction sa on sa.fromStatusId = s.statusId or sa.toStatusId = s.statusId
    LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = @languageId
    left join [card].statusStartEnd sse on sse.statusId = s.statusId and startendFlag = 1
    where sa.module = 'card' and ((@statusId is null and sse.id is null) or s.statusId = @statusId)


IF OBJECT_ID('tempdb..#Card') IS NOT NULL
    DROP TABLE #Card

CREATE TABLE #Card (
    cardId bigint ,
    productName nvarchar(100), --card.cardProduct.name
    cardNumber varchar(50),
    acceptanceDate date,
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
    typeName nvarchar(100))


;WITH CTE AS
(
    SELECT   cardId, productName, typeName, cardNumber, acceptanceDate, expirationDate, generatedPinMails,
    targetBranchName, statusId, statusName, statusLabel, currentBranchName, issuingBranchName, activationDate, updatedOn, batchName,
        ROW_NUMBER() OVER(ORDER BY
                        CASE WHEN @sortOrder = 'ASC' THEN
                            CASE
                                WHEN @sortBy = 'productName' THEN c.productName
                                WHEN @sortBy = 'typeName' THEN c.typeName
                                WHEN @sortBy = 'cardNumber' THEN c.cardNumber
                                WHEN @sortBy = 'acceptanceDate' THEN convert(nvarchar(100), c.acceptanceDate)
                                WHEN @sortBy = 'expirationDate' THEN convert(nvarchar(100), c.expirationDate)
                                WHEN @sortBy = 'generatedPinMails' THEN replicate('0', 20 - len(convert(nvarchar(100),c.generatedPinMails))) + convert(nvarchar(100),c.generatedPinMails)
                                WHEN @sortBy = 'statusName' THEN c.statusName
                                WHEN @sortBy = 'targetBranchName' THEN c.targetBranchName
                                WHEN @sortBy = 'issuingBranchName' THEN c.issuingBranchName
                                WHEN @sortBy = 'currentBranchName' THEN c.currentBranchName
                                WHEN @sortBy = 'batchName' THEN c.batchName
                                WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100), c.updatedOn)
                            END
                        END,
                        CASE WHEN @sortOrder = 'DESC' THEN
                            CASE
                                WHEN @sortBy = 'productName' THEN c.productName
                                WHEN @sortBy = 'typeName' THEN c.typeName
                                WHEN @sortBy = 'cardNumber' THEN c.cardNumber
                                WHEN @sortBy = 'acceptanceDate' THEN convert(nvarchar(100), c.acceptanceDate)
                                WHEN @sortBy = 'expirationDate' THEN convert(nvarchar(100), c.expirationDate)
                                WHEN @sortBy = 'generatedPinMails' THEN replicate('0', 20 - len(convert(nvarchar(100),c.generatedPinMails))) + convert(nvarchar(100),c.generatedPinMails)
                                WHEN @sortBy = 'statusName' THEN c.statusName
                                WHEN @sortBy = 'targetBranchName' THEN c.targetBranchName
                                WHEN @sortBy = 'issuingBranchName' THEN c.issuingBranchName
                                WHEN @sortBy = 'currentBranchName' THEN c.currentBranchName
                                WHEN @sortBy = 'batchName' THEN c.batchName
                                WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100), c.updatedOn)
                            END
                        END DESC,
                        -- default sorting whne nothing is passed - by updatedOn or createdOn id it not updated
                        CASE WHEN @sortOrder IS NULL THEN convert(nvarchar(100), isnull(c.updatedOn, c.createdOn)) END DESC
                   ) rowNum,
                   COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
    FROM
    (
        SELECT c.cardId, p.name AS productName, t.name as typeName,
                '******' AS cardNumber, c.acceptanceDate, c.expirationDate, c.generatedPinMails,
                o.organizationName AS targetBranchName, c.statusId, s.statusName AS statusName, statusLabel,
                co.organizationName AS currentBranchName, cor.organizationName AS issuingBranchName,
                c.activationDate, c.updatedOn, c.createdOn, b.batchName
        FROM [card].[card] c
        JOIN @statusTable s ON c.statusId = s.statusId
        JOIN [card].[type] t ON t.typeId = c.typeId
        LEFT JOIN [card].[product] p ON c.productId = p.productId
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
            --show customer card only if it is named
            AND ( c.embossedTypeId = @embossedTypeId or c.customerNumber is null)
            AND ( @targetBranchId IS NULL OR c.targetBranchId = @targetBranchId )
            AND ( @cardNumber IS NULL OR cn.pan = @cardNumber )
            AND ( @issuingBranchId IS NULL OR c.issuingBranchId = @issuingBranchId)
            AND ( @batchName IS NULL OR b.batchName like '%' + @batchName + '%')
            AND ( @customerName IS NULL OR c.customerName like '%' + @customerName +'%' )
            AND ( @personName IS NULL OR c.personName like '%' + @personName +'%' )
            AND ( @customerNumber IS NULL OR c.customerNumber = @customerNumber )
    )  c
)

INSERT INTO #Card( cardId, productName, typeName, cardNumber, acceptanceDate, expirationDate, generatedPinMails,
    targetBranchName, statusId, statusName, statusLabel, rowNum, recordsTotal, activationDate, currentBranchName, issuingBranchName, updatedOn, batchName )
SELECT cardId, productName, typeName, cardNumber, acceptanceDate, expirationDate, generatedPinMails,
    targetBranchName, statusId, statusName, statusLabel, rowNum, recordsTotal, activationDate, currentBranchName, issuingBranchName, updatedOn, batchName
FROM CTE
WHERE rowNum BETWEEN @startRow AND  @endRow


SELECT 'cards' AS resultSetName

SELECT cardId, productName, typeName, cardNumber, acceptanceDate, expirationDate, generatedPinMails,
    targetBranchName, statusId, statusName, statusLabel, activationDate, currentBranchName, issuingBranchName, updatedOn, batchName
FROM #Card c
ORDER BY rowNum

SELECT 'pagination' AS resultSetName

SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
FROM #Card

DROP TABLE #Card