ALTER PROCEDURE [card].[batch.fetch]  -- List information for batches
    @filterBy [card].filterByTT READONLY,-- information for filters
    @orderBy [card].orderByTT READONLY,-- information for ordering
    @paging [card].[pagingTT] READONLY,--information for paging
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
SET NOCOUNT ON
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

DECLARE @statusId tinyint
DECLARE @typeId int
DECLARE @batchName nvarchar(100)
DECLARE @currentBranchId bigint
DECLARE @targetBranchId bigint
DECLARE @issuingBranchId bigint
DECLARE @pageSize INT = 20
DECLARE @pageNumber INT = 1
DECLARE @sortBy VARCHAR(50) = null
DECLARE @sortOrder VARCHAR(4)= null
DECLARE @languageId BIGINT = (SELECT languageId
                                    FROM [core].[language] cl
                                    JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                                    WHERE us.[actorId] = @userId)
SELECT  @statusId = statusId,
       @batchName = batchName,
       @currentBranchId = currentBranchId,
       @issuingBranchId = issuingBranchId,
       @typeId = typeId,
       @targetBranchId = targetBranchId
FROM @filterBy
--select @statusId as statusId, @batchName as batchName

    SELECT @sortBy = [column],
           @sortOrder = [direction]
    FROM @orderBy
    where [column] in ('batchName', 'batchStatus', 'numberOfCards', 'generatedPinMails', 'batchDateCreated', 'batchDateSent',
                   'downloads', 'embossedTypeName', 'statusId','issuingBranchName', 'typeName', 'currentBranchName', 'targetBranchName' )
    and [direction] in ('ASC', 'DESC')
    --select @sortBy as sortBy, @sortOrder as sortOrder

SELECT @pageNumber = ISNULL(pageNumber,1),
       @pageSize = ISNULL([pageSize], 20) FROM @paging
--select @pageNumber as pageNumber ,@pageSize as pageSize

DECLARE @startRow INT = ( @pageNumber - 1) * @pageSize + 1
DECLARE @endRow INT = @startRow + @pageSize - 1

DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
     EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
     IF @return != 0
      BEGIN
         RETURN 55555
     END

declare @statusTable table(statusId tinyint, statusName nvarchar(1000), statusLabel varchar(50))

--if no filter by status exclude the end statuses
if @statusId is null and @batchName is null 
    insert into @statusTable(statusId, statusName, statusLabel)
    select distinct s.statusId, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, s.statusName as statusLabel
    from [card].[status] s
    join [card].statusAction sa on sa.fromStatusId = s.statusId or sa.toStatusId = s.statusId
    LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = @languageId
    left join [card].statusStartEnd sse on sse.statusId = s.statusId and startendFlag = 1
    where sa.module = 'batch' and sse.statusId is null
else
    insert into @statusTable(statusId, statusName, statusLabel)
    select distinct s.statusId, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, s.statusName as statusLabel
    from [card].[status] s
    LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = @languageId
    where s.statusId = isnull(@statusId, s.statusId)

IF OBJECT_ID('tempdb..#Batch') IS NOT NULL
    DROP TABLE #Batch

CREATE TABLE #Batch (
    batchId int,
    batchName nvarchar(100),
    numberOfCards int,
    branchId int,
    currentBranchName nvarchar(100),
    targetBranchId int,
    targetBranchName nvarchar(100),
    issuingBranchId bigint,
    issuingBranchName nvarchar(100),
    typeId int,
    typeName nvarchar(100),
    generatedPinMails int,
    createdOn datetime2(7),
    sentOn datetime2(7),
    downloads int NULL,
    embossedTypeId tinyint,
    embossedTypeName varchar(100),
    statusId int,
    statusName nvarchar(100),
    updatedOn datetime2(7),
    areAllCardsGenerated BIT,
    rowNum INT, recordsTotal INT)

;WITH CTE AS
(
    SELECT batchId, batchName, numberOfCards, typeId, branchId, targetBranchId, targetBranchName, issuingBranchId, issuingBranchName, generatedPinMails, createdOn, sentOn,
        downloads, embossedTypeId, embossedTypeName, statusId, statusName, typeName, currentBranchName, updatedOn, areAllCardsGenerated,
        ROW_NUMBER() OVER(ORDER BY
                        CASE WHEN @sortOrder = 'ASC' THEN
                            CASE
                                WHEN @sortBy = 'batchName' THEN b.batchName
                                WHEN @sortBy = 'batchStatus' THEN b.statusName
                                WHEN @sortBy = 'numberOfCards' THEN convert(nvarchar(100),b.numberOfCards)
                                WHEN @sortBy = 'generatedPinMails' THEN convert(nvarchar(100),b.generatedPinMails)
                                WHEN @sortBy = 'batchDateCreated' THEN convert(nvarchar(100),b.createdOn)
                                WHEN @sortBy = 'batchDateSent' THEN convert(nvarchar(100),b.sentOn)
                                WHEN @sortBy = 'downloads' THEN convert(nvarchar(100),b.downloads)
                                WHEN @sortBy = 'embossedTypeName' THEN embossedTypeName
                                WHEN @sortBy = 'issuingBranchName' THEN issuingBranchName
                                WHEN @sortBy = 'currentBranchName' THEN currentBranchName
                                WHEN @sortBy = 'targetBranchName' THEN targetBranchName
                                WHEN @sortBy = 'typeName' THEN typeName
                                WHEN @sortBy = 'statusId' THEN convert(nvarchar(100),b.statusId)
                            END
                        END,
                        CASE WHEN @sortOrder = 'DESC' THEN
                            CASE
                               WHEN @sortBy = 'batchName' THEN b.batchName
                                WHEN @sortBy = 'batchStatus' THEN b.statusName
                                WHEN @sortBy = 'numberOfCards' THEN convert(nvarchar(10),b.numberOfCards)
                                WHEN @sortBy = 'generatedPinMails' THEN convert(nvarchar(10),b.generatedPinMails)
                                WHEN @sortBy = 'batchDateCreated' THEN convert(nvarchar(100),b.createdOn)
                                WHEN @sortBy = 'batchDateSent' THEN convert(nvarchar(100),b.sentOn)
                                WHEN @sortBy = 'downloads' THEN convert(nvarchar(100),b.downloads)
                                WHEN @sortBy = 'embossedTypeName' THEN embossedTypeName
                                WHEN @sortBy = 'issuingBranchName' THEN issuingBranchName
                                WHEN @sortBy = 'currentBranchName' THEN currentBranchName
                                WHEN @sortBy = 'targetBranchName' THEN targetBranchName
                                WHEN @sortBy = 'typeName' THEN typeName
                                WHEN @sortBy = 'statusId' THEN convert(nvarchar(100),b.statusId)
                                WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100),b.updatedOn)
                            END
                        END DESC,
                        -- default sorting whne nothing is passed - by updatedOn or createdOn id it not updated
                        CASE WHEN @sortOrder IS NULL THEN convert(nvarchar(100), isnull(b.updatedOn, createdOnWithTime)) END DESC
                   ) rowNum,
                   COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
    FROM
    (
        SELECT b.batchId, b.batchName, b.numberOfCards, b.typeId, b.branchId, b.targetBranchId, b.issuingBranchId, b.generatedPinMails, CAST(b.createdOn AS DATE) AS createdOn, b.sentOn,
                b.downloads, b.embossedTypeId, ISNULL(ett.itemNameTranslation, ein.itemName) as embossedTypeName, b.statusId, bs.statusName, o1.organizationName as targetBranchName, o.organizationName as issuingBranchName,
                ISNULL(itt.itemNameTranslation, t.name) as typeName, b.updatedOn, o2.organizationName as currentBranchName, b.createdOn as createdOnWithTime, areAllCardsGenerated as areAllCardsGenerated
        FROM [card].batch b
        JOIN @statusTable bs ON bs.StatusId = b.StatusId
        JOIN [card].embossedType et ON et.embossedTypeId = b.embossedTypeId
        JOIN core.itemName ein on ein.itemNameId = et.itemNameId
        LEFT JOIN core.itemTranslation ett on ett.itemNameId = et.itemNameId and ett.languageId = @languageId
        JOIN customer.organizationsVisibleFor(@userId) cur ON cur.actorId = b.branchId
        LEFT JOIN [card].type t ON t.typeId = b.typeId
        LEFT JOIN [core].itemTranslation itt ON itt.itemNameId = t.itemNameId and itt.languageId = @languageId
        LEFT JOIN customer.organization o ON o.actorId = b.issuingBranchId
        LEFT JOIN customer.organization o1 ON o1.actorId = b.targetBranchId
        LEFT JOIN customer.organization o2 ON o2.actorId = b.branchId
        WHERE (@batchName IS NULL OR b.batchName like '%' + @batchName + '%')
            AND (@issuingBranchId IS NULL OR b.issuingBranchId = @issuingBranchId)
            AND (@typeId IS NULL OR b.typeId = @typeId)
            AND (@targetBranchId IS NULL OR b.targetBranchId = @targetBranchId)
            AND (@currentBranchId IS NULL OR b.branchId = @currentBranchId)
    ) as  b

 )

INSERT INTO #Batch( batchId, batchName, numberOfCards, typeId, typeName, branchId, currentBranchName, targetBranchId, targetBranchName, issuingBranchId, issuingBranchName, generatedPinMails, createdOn, sentOn,
        downloads, embossedTypeId, embossedTypeName, statusId, statusName, updatedOn, areAllCardsGenerated, rowNum, recordsTotal )
SELECT batchId, batchName, numberOfCards, typeId, typeName, branchId, currentBranchName, targetBranchId, targetBranchName, issuingBranchId, issuingBranchName, generatedPinMails, createdOn, sentOn,
        downloads, embossedTypeId, embossedTypeName, statusId, statusName, updatedOn, areAllCardsGenerated, rowNum, recordsTotal
FROM CTE
WHERE rowNum BETWEEN @startRow AND  @endRow


SELECT 'batch' AS resultSetName

SELECT batchId as id, batchName, numberOfCards, typeId, typeName, branchId, currentBranchName, targetBranchId, targetBranchName, issuingBranchId, issuingBranchName, generatedPinMails, createdOn as batchDateCreated, sentOn as batchDateSent,
        downloads, embossedTypeId, embossedTypeName, statusId , statusName AS batchStatus, updatedOn, areAllCardsGenerated
FROM #Batch b
ORDER BY rowNum

SELECT 'pagination' AS resultSetName

SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
FROM #Batch

DROP TABLE #Batch