ALTER PROCEDURE [card].[application.fetch] -- List information for applications
    @filterBy [card].filterByTT READONLY,-- information for filters
    @orderBy [card].orderByTT READONLY,-- information for ordering
    @paging [card].[pagingTT] READONLY,--information for paging
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

SET NOCOUNT ON
    DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
    DECLARE @statusId tinyint
    DECLARE @embossedTypeId tinyint
    DECLARE @productId int
    DECLARE @typeId int
    DECLARE @customerName nvarchar(100)
    DECLARE @customerNumber nvarchar(10)
    DECLARE @applicationId int
    DECLARE @pageSize int = 20
    DECLARE @pageNumber int = 1
    DECLARE @sortBy varchar(50) = null
    DECLARE @sortOrder varchar(4) = null
    DECLARE @currentBranchId bigint
    DECLARE @issuingBranchId bigint
    DECLARE @targetBranchId bigint
    DECLARE @cardnumber varchar(100)
    DECLARE @currentBranchName varchar (100)
    DECLARE @personName nvarchar(100)
    DECLARE @batchName nvarchar(100)
    DECLARE @updatedOn datetime

    SELECT
        @statusId= statusId,
        @embossedTypeId = embossedTypeId,
        @productId = productId,
        @typeId = typeId,
        @customerName = customerName,
        @customerNumber = customerNumber,
        @applicationId = applicationId,
        @currentBranchId = currentBranchId,
        @issuingBranchId = issuingBranchId,
        @targetBranchId = targetBranchId,
        @cardnumber = cardnumber,
        @personName = personName,
        @batchName = batchName
        --@updatedOn = updatedOn
    FROM @filterBy

    SELECT
        @sortBy = [column],
        @sortOrder = [direction]
    FROM @orderBy
    where [column] in ('customerName', 'personName', 'targetBranchName', 'applicationId', 'statusName', 'productName', 'typeNme', 'createdOn', 'embossedTypeName', 'issuingBranchName', 'cardnumber', 'batchName', 'updatedOn')
    and [direction] in ('ASC', 'DESC')
    --select @sortBy as sortBy, @sortOrder as sortOrder

    SELECT
        @pageNumber = ISNULL(pageNumber,1),
        @pageSize = ISNULL([pageSize], 20)
    FROM @paging
    --select @pageNumber as pageNumber ,@pageSize as pageSize

    DECLARE @startRow INT = ( @pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1


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

    declare @statusTable table(statusId tinyint, statusName nvarchar(1000), statusLabel varchar(50))

    --if no filter by status exclude the end statuses
    if @statusId is null 
                AND @customerName IS NULL AND @customerNumber IS NULL AND @applicationId IS NULL 
                AND @cardNumber IS NULL AND @personName IS NULL AND @batchName IS NULL
        insert into @statusTable(statusId, statusName, statusLabel)
        select distinct s.statusId, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, s.statusName as statusLabel
        from [card].[status] s
        left join [card].statusAction sa on sa.fromStatusId = s.statusId or sa.toStatusId = s.statusId and sa.module = 'application'
        LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = 1
        left join [card].statusStartEnd sse on sse.statusId = s.statusId and startendFlag = 1 and sse.module = 'application'
        where  sse.statusId is null and
            (sa.module = 'application' or
            -- when no status in the status action table - means only 1 for status for start
            (sa.[fromStatusId] is null and s.statusId = (select only.statusId from  [card].statusStartEnd only where only.module = 'application' and only.startendFlag = 0))
            )
    else
        insert into @statusTable(statusId, statusName, statusLabel)
        select distinct s.statusId, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, s.statusName as statusLabel
        from [card].[status] s
        LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = @languageId
        where s.statusId = isnull(@statusId, s.statusId)

    IF OBJECT_ID('tempdb..#Application') IS NOT NULL
        DROP TABLE #Application

    CREATE TABLE #Application (
        applicationId int ,
        customerId bigint,
        customerNumber nvarchar(10),
        customerName nvarchar(100),
        personName nvarchar(100),
        targetBranchId bigint,
        targetBranchName nvarchar(100), --customer.organization.organizationName
        issuingBranchId bigint,
        issuingBranchName nvarchar(100),
        statusId tinyint,
        statusName varchar(50), --card.status.statusName
        productId int,
        productName nvarchar(100), --card.cardProduct.name
        embossedTypeId int,
        createdOn datetime2(0),
        embossedTypeName varchar(100), -- card.embossedType.name
        reason nvarchar(100),
        comments nvarchar(1000),
        rowNum int, recordsTotal int,
        cardnumber varchar (20),
        currentBranchName varchar (100),
        batchName nvarchar(100),
        updatedOn datetime2(0),
        typeId int,
        typeName nvarchar(100))


    ;WITH CTE AS
    (
        SELECT  applicationId, customerId, customerNumber,
            customerName, personName, targetBranchId, targetBranchName, issuingBranchId, issuingBranchName,
            statusId, statusName, productId, productName, embossedTypeId, embossedTypeName, createdOn, reason, comments, typeId, typeName,
            ROW_NUMBER() OVER(ORDER BY
                            CASE WHEN @sortOrder = 'ASC' THEN
                                CASE
                                    WHEN @sortBy = 'customerName' THEN a.customerName
                                    WHEN @sortBy = 'personName' THEN a.personName
                                    WHEN @sortBy = 'targetBranchName' THEN a.targetBranchName
                                    WHEN @sortBy = 'applicationId' THEN replicate('0', 20 - len(convert(nvarchar(100),a.applicationId))) + convert(nvarchar(100),a.applicationId)
                                    WHEN @sortBy = 'statusName' THEN a.statusName
                                    WHEN @sortBy = 'productName' THEN a.productName
                                    WHEN @sortBy = 'typeName' THEN a.typeName
                                    WHEN @sortBy = 'createdOn' THEN convert(nvarchar(100), a.createdOn)
                                    WHEN @sortBy = 'embossedTypeName' THEN a.embossedTypeName
                                    WHEN @sortBy = 'issuingBranchName' THEN issuingBranchName
                                    WHEN @sortBy = 'cardnumber' THEN cardnumber
                                    WHEN @sortBy = 'currentBranchName' THEN currentBranchName
                                    WHEN @sortBy = 'personName' THEN personName
                                    WHEN @sortBy = 'batchName' THEN batchName
                                    WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100), a.updatedOn)
                                END
                            END,
                            CASE WHEN @sortOrder = 'DESC' THEN
                                CASE
                                    WHEN @sortBy = 'customerName' THEN a.customerName
                                    WHEN @sortBy = 'personName' THEN a.personName
                                    WHEN @sortBy = 'targetBranchName' THEN a.targetBranchName
                                    WHEN @sortBy = 'applicationId' THEN replicate('0', 20 - len(convert(nvarchar(100),a.applicationId))) + convert(nvarchar(100),a.applicationId)
                                    WHEN @sortBy = 'statusName' THEN a.statusName
                                    WHEN @sortBy = 'productName' THEN a.productName
                                    WHEN @sortBy = 'typeName' THEN a.typeName
                                    WHEN @sortBy = 'createdOn' THEN convert(nvarchar(100), a.createdOn)
                                    WHEN @sortBy = 'embossedTypeName' THEN a.embossedTypeName
                                    WHEN @sortBy = 'issuingBranchName' THEN issuingBranchName
                                    WHEN @sortBy = 'cardnumber' THEN cardnumber
                                    WHEN @sortBy = 'currentBranchName' THEN currentBranchName
                                    WHEN @sortBy = 'personName' THEN personName
                                    WHEN @sortBy = 'batchName' THEN batchName
                                    WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100), a.updatedOn)
                                END
                            END DESC,
                            -- default sorting whne nothing is passed - by updatedOn or createdOn id it not updated
                            CASE WHEN @sortOrder IS NULL THEN convert(nvarchar(100), isnull(a.updatedOn, a.createdOn)) END DESC
                            ) rowNum,
                            COUNT(*) OVER(PARTITION BY 1) AS recordsTotal, cardnumber,currentBranchName, batchName, a.updatedOn
        FROM
        (
            SELECT a.applicationId, a.customerId, a.customerNumber,
                a.customerName, a.personName, a.targetBranchId, o.organizationName AS targetBranchName,
                a.statusId, s.statusName, p.productId, ISNULL(pt.itemNameTranslation, p.name) AS productName, a.embossedTypeId,
                ISNULL(ett.itemNameTranslation, ein.itemName) AS embossedTypeName, a.createdOn, ISNULL(rt.itemNameTranslation, r.name) AS reason, a.comments,
                a.issuingBranchId, org.organizationName as issuingBranchName,
                '******'  AS cardnumber,orga.organizationName AS currentBranchName, bat.batchName AS batchName, a.updatedOn, ct.typeId, ISNULL(ctt.itemNameTranslation, ct.name) as typeName
            FROM [card].[application] a
            JOIN @statusTable s ON a.statusId = s.statusId
            JOIN [card].[product] p ON a.productId = p.productId
            LEFT JOIN [core].itemTranslation pt on pt.itemNameId = p.itemNameId and pt.languageId = @languageid
            JOIN [card].[type] ct ON ct.typeId = a.typeId
            LEFT JOIN [core].itemTranslation ctt ON ctt.itemNameId = ct.itemNameId and ctt.languageId = @languageId
            JOIN [card].embossedType et ON a.embossedTypeId = et.embossedTypeId
            JOIN core.itemName ein on ein.itemNameId = et.itemNameId
            LEFT JOIN core.itemTranslation ett on ett.itemNameId = et.itemNameId and ett.languageId = @languageId
            JOIN customer.organizationsVisibleFor(@userId) cur on cur.actorId = a.branchId
            JOIN customer.organization orga ON orga.actorId = a.branchId
            LEFT JOIN [card].[card] c ON c.applicationId = a.applicationId
            LEFT JOIN [card].number cn on cn.numberId = c.cardId
            left join [card].reason r on r.reasonId = a.reasonId
            LEFT JOIN [core].itemTranslation rt on rt.itemNameId = r.itemNameId and rt.languageId = @languageid
            --
            LEFT JOIN customer.organizationsVisibleFor(@currentBranchId) bu on bu.actorId = a.branchId
            --
            LEFT JOIN customer.organization o ON o.actorId = a.targetBranchId
            LEFT JOIN customer.organization org ON org.actorId = a.issuingBranchId
            LEFT JOIN card.batch bat ON bat.batchId = a.batchId
            WHERE   ( @currentBranchId IS NULL or bu.actorId is NOT NULL)
                AND ( @embossedTypeId IS NULL OR a.embossedTypeId = @embossedTypeId)
                AND ( @productId IS NULL OR a.productId = @productId )
                AND ( @typeId IS NULL OR a.typeId = @productId )
                AND ( @customerName IS NULL OR a.customerName like '%' + @customerName + '%')
                AND ( @customerNumber IS NULL OR a.customerNumber = @customerNumber)
                AND ( @applicationId IS NULL OR a.applicationId = @applicationId )
                AND ( @issuingBranchId IS NULL OR a.issuingBranchId = @issuingBranchId)
                AND ( @targetBranchId IS NULL OR a.targetBranchId = @targetBranchId)
                AND ( @cardNumber IS NULL OR cn.pan = @cardNumber)
                AND ( @personName IS NULL OR a.personName like '%' + @personName + '%')
                AND ( @batchName IS NULL OR bat.batchName like '%' + @batchName + '%')
        )   a

     )

    INSERT INTO #Application( applicationId, customerId, customerNumber,
            customerName, personName, targetBranchId, targetBranchName, issuingBranchId, issuingBranchName,
            statusId, statusName, productId, productName, embossedTypeId, embossedTypeName, createdOn, reason, comments, rowNum, recordsTotal, cardnumber, currentBranchName, batchName, updatedOn,
            typeId, typeName)
    SELECT applicationId, customerId, customerNumber,
            customerName, personName, targetBranchId, targetBranchName, issuingBranchId, issuingBranchName,
            statusId, statusName, productId, productName, embossedTypeId, embossedTypeName, createdOn, reason, comments, rowNum, recordsTotal, cardnumber, currentBranchName, batchName, updatedOn,
            typeId, typeName
    FROM CTE
    WHERE rowNum BETWEEN @startRow AND  @endRow


    SELECT 'applications' AS resultSetName

    SELECT applicationId, customerId, customerNumber,customerName, personName,
        targetBranchId, targetBranchName, issuingBranchId, issuingBranchName, statusId, statusName, productId,
        productName, embossedTypeId, embossedTypeName, createdOn, reason, comments, cardnumber, currentBranchName, batchName, updatedOn,
        typeId, typeName
    FROM #Application a
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName

    SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #Application

    DROP TABLE #Application