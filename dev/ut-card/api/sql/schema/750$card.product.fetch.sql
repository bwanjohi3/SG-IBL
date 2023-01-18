ALTER PROCEDURE [card].[product.fetch] -- this SP gets all existing card Product in DB or selected by binId or bin
    @filterBy [card].filterByTT READONLY,-- information for filters
    @orderBy [card].orderByTT READONLY,-- information for ordering
    @paging [card].[pagingTT] READONLY,--information for paging
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
    SET NOCOUNT ON

    DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    DECLARE @productId int ---the unique reference of card product in UTcard
    DECLARE @name varchar(100) = NULL -- the name of card product
    DECLARE @isActive bit = NULL -- active/unactive product,
    DECLARE @businessUnitId bigint ---the unique reference of buizness unit of product
    DECLARE @pageSize INT --how many rows will be returned per page
    DECLARE @pageNumber INT -- which page number to display
    DECLARE @sortBy VARCHAR(50) = 'updatedOn' -- on which column results to be sorted
    DECLARE @sortOrder VARCHAR(4) = 'DESC'--what kind of sort to be used ascending or descending

    SELECT @ProductId = productId, @name = productName,  @isActive = isActive, @businessUnitId = businessUnitId
    FROM @filterBy
    --select @statusId as statusId, @batchName as batchName

    SELECT @sortBy = [column],
           @sortOrder = [direction]
    FROM @orderBy
    where [column] in ('name', 'description', 'embossedTypeName', 'startDate', 'endDate', 'isActive', 'branchName')
    and [direction] in ('ASC', 'DESC')
    --select @sortBy as sortBy, @sortOrder as sortOrder

    SELECT @pageNumber = ISNULL(pageNumber,1),
       @pageSize = ISNULL([pageSize], 20) FROM @paging
    --select @pageNumber as pageNumber ,@pageSize as pageSize

    DECLARE @startRow INT = (@pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1

    IF OBJECT_ID('tempdb..#Product') IS NOT NULL
    DROP TABLE #Product

    CREATE TABLE #Product (
        productId int, name nvarchar(100), [description] nvarchar(1000), startDate date, endDate date,
        embossedTypeId tinyint, embossedTypeName nvarchar(200), isActive bit, periodicCardFeeId int, periodicCardFeeName nvarchar(50), branchName nvarchar(100),
        accountLinkLimit tinyint, pinRetriesLimit tinyint,
        rowNum INT, recordsTotal INT)


    ;WITH CTE AS
    (
        SELECT productId, name, [description], startDate, endDate,
        embossedTypeId, embossedTypeName, isActive, periodicCardFeeId, periodicCardFeeName,BranchName, updatedOn,
        accountLinkLimit, pinRetriesLimit,
            ROW_NUMBER() OVER(ORDER BY
                            CASE WHEN @sortOrder = 'ASC' THEN
                                CASE
                                    WHEN @sortBy = 'name' THEN p.name
                                    WHEN @sortBy = 'description' THEN p.[description]                                    
                                    WHEN @sortBy = 'startDate' THEN convert(nvarchar(100),p.startDate)
                                    WHEN @sortBy = 'endDate' THEN convert(nvarchar(100),p.endDate)                                    
                                    WHEN @sortBy = 'embossedTypeName' THEN embossedTypeName
                                    WHEN @sortBy = 'isActive' THEN convert(nvarchar(1),p.isActive)                              
                                    WHEN @sortBy = 'branchName' THEN p.branchName
                                END
                            END,
                            CASE WHEN @sortOrder = 'DESC' THEN
                                CASE
                                    WHEN @sortBy = 'name' THEN p.name
                                    WHEN @sortBy = 'description' THEN p.[description]
                                    WHEN @sortBy = 'startDate' THEN convert(nvarchar(100),p.startDate)
                                    WHEN @sortBy = 'endDate' THEN convert(nvarchar(100),p.endDate)                                   
                                    WHEN @sortBy = 'embossedTypeName' THEN embossedTypeName
                                    WHEN @sortBy = 'isActive' THEN convert(nvarchar(1),p.isActive)
                                    WHEN @sortBy = 'branchName' THEN p.branchName
                                    WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100),p.updatedOn)
                                END
                            END DESC) rowNum,
                            COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
        FROM
        (
            SELECT p.productId, isnull(itt.itemNameTranslation, p.name) as name, p.[description], startDate,
                endDate, p.embossedTypeId, isnull(ecin.itemName, ett.itemNameTranslation) as embossedTypeName,    
                p.isActive, p.periodicCardFeeId, pc.Name as periodicCardFeeName, o.organizationName AS branchName, p.updatedOn,
                p.accountLinkLimit, p.pinRetriesLimit
            FROM [card].product p
            LEFT JOIN [core].itemTranslation itt on itt.itemNameId = p.itemNameId and itt.languageId = @languageId           
            JOIN [card].[embossedType] et ON p.embossedTypeId = et.embossedTypeId
            LEFT JOIN core.itemName ecin on et.itemNameId = ecin.itemNameId
            LEFT JOIN core.itemTranslation ett on ett.itemNameId = ecin.itemNameId and ett.languageId = @languageId
            JOIN
            (
                select o.actorId
                from [user].parentOrganizationsForUser(@userId) o

                union

                SELECT o.actorId
                FROM [customer].[organizationsVisibleFor] (@userId) o
            ) po on po.actorId = p.branchId
            JOIN [card].periodicCardFee pc ON pc.periodicCardFeeId = p.periodicCardFeeId
            JOIN customer.organization o ON o.actorId = p.BranchId
            LEFT JOIN customer.organizationsVisibleFor(@businessUnitId) bu on bu.actorId = p.BranchId
            WHERE (@ProductId IS NULL OR p.productId = @ProductId )
                    AND (@name IS NULL OR p.name like '%' + @name + '%')
                    AND (@isActive IS NULL OR p.isActive = @isActive )
                    AND (@businessUnitId IS NULL or bu.actorId is NOT NULL)
        )   p
     )

    INSERT INTO #Product( productId, name, [description], startDate, endDate, embossedTypeId, embossedTypeName, 
                          isActive, periodicCardFeeId, periodicCardFeeName, branchName, accountLinkLimit, pinRetriesLimit, rowNum, recordsTotal )
    SELECT productId, name, [description], startDate, endDate,embossedTypeId, embossedTypeName,
            isActive, periodicCardFeeId, periodicCardFeeName, branchName, accountLinkLimit, pinRetriesLimit, rowNum, recordsTotal
    FROM CTE
    WHERE rowNum BETWEEN @startRow AND  @endRow


    SELECT 'product' AS resultSetName

    SELECT productId, name, [description], startDate, endDate, embossedTypeId, embossedTypeName,
           isActive, periodicCardFeeId, periodicCardFeeName, branchName, accountLinkLimit, pinRetriesLimit, rowNum, recordsTotal
    FROM #Product p
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName

    SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #Product

    DROP TABLE #Product
