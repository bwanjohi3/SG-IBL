ALTER PROCEDURE [card].[bin.fetch] -- this SP gets all existing bins in DB or selected by binId or bin
    @filterBy [card].filterByTT READONLY,-- information for filters
    @orderBy [card].orderByTT READONLY,-- information for ordering
    @paging [card].[pagingTT] READONLY,--information for paging
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

        -- checks if the user has a right to make the operation
    DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @languageId BIGINT = (SELECT languageId
                            FROM [core].[language] cl
                            JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                            WHERE us.[actorId] = @userId)

    DECLARE @startBin VARCHAR (8) = NULL-- bin value
    DECLARE @endBin VARCHAR (8) = NULL-- bin value
    DECLARE @description NVARCHAR (100) = NULL --bin description
    DECLARE @isActive BIT = NULL -- active/unactive product
    DECLARE @pageSize INT =20 --how many rows will be returned per page
    DECLARE @pageNumber INT = 1-- which page number to display
    DECLARE @sortBy VARCHAR(50) = 'updatedOn' -- on which column results to be sorted
    DECLARE @sortOrder VARCHAR(4) = 'DESC'--what kind of sort to be used ascending or descending

    SELECT  @startBin = startBin, @endBin = endBin, @isActive = isActive, @description = [description]
    FROM @filterBy

    SELECT @sortBy = [column],
           @sortOrder = [direction]
    FROM @orderBy
    where [column] in ('binId', 'startBin', 'endBin', 'description', 'isActive')
    and [direction] in ('ASC', 'DESC')

    SELECT @pageNumber = ISNULL(pageNumber,1),
        @pageSize = ISNULL([pageSize], 20) FROM @paging


    DECLARE @startRow INT = (@pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1

    IF OBJECT_ID('tempdb..#Bin') IS NOT NULL
    DROP TABLE #Bin

    CREATE TABLE #Bin (binId INT, startBin CHAR(8), endBin CHAR(8), [description] VARCHAR(100), isActive BIT, ownershipTypeId bigint, ownershipTypeName nvarchar(max), rowNum INT, recordsTotal INT)

    ;WITH CTE AS
    (
        SELECT binId, startBin, endBin, [description], isActive, updatedOn, ownershipTypeId, ownershipTypeName,
            ROW_NUMBER() OVER(ORDER BY
                            CASE WHEN @sortOrder = 'ASC' THEN
                                CASE
                                    WHEN @sortBy = 'startBin' THEN convert(varchar(100), b.startBin)
                                    WHEN @sortBy = 'endBin' THEN convert(varchar(100), b.endBin)
                                    WHEN @sortBy = 'description' THEN b.[description]
                                    WHEN @sortBy = 'isActive' THEN convert(varchar(100),b.isActive)
                                    WHEN @sortBy = 'binId' THEN replicate('0', 20 - len(convert(nvarchar(100),b.binId))) + convert(nvarchar(100),b.binId)
                                 END
                            END,
                            CASE WHEN @sortOrder = 'DESC' THEN
                                CASE
                                    WHEN @sortBy = 'startBin' THEN convert(varchar(100), b.startBin)
                                    WHEN @sortBy = 'endBin' THEN convert(varchar(100), b.endBin)
                                    WHEN @sortBy = 'description' THEN b.[description]
                                    WHEN @sortBy = 'isActive' THEN convert(varchar(100),b.isActive)
                                    WHEN @sortBy = 'binId' THEN replicate('0', 20 - len(convert(nvarchar(100),b.binId))) + convert(nvarchar(100),b.binId)
                                    WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100),b.updatedOn)
                                END
                            END DESC) rowNum,
                            COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
        FROM
            (
                SELECT b.binId, b.startBin, b.endBin, ISNULL(it.itemNameTranslation, itn.itemName) as [description], b.isActive, b.updatedOn, b.ownershipTypeId, ISNULL(oit.itemNameTranslation, oin.itemName) as ownershipTypeName
                FROM [card].bin b
                JOIN [core].itemName itn ON itn.itemNameId = b.itemNameId
	            LEFT JOIN [core].itemTranslation it ON it.itemNameId = b.itemNameId and it.languageId = @languageid
                JOIN [core].itemName oin ON oin.itemNameId = b.ownershipTypeId
	            LEFT JOIN [core].itemTranslation oit ON oit.itemNameId = b.ownershipTypeId and oit.languageId = @languageid
                WHERE (@startBin IS NULL OR startBin = @startBin)
                AND (@endBin IS NULL OR endBin = @endBin)
                AND (@isActive IS NULL OR isActive = @isActive)
                AND (@description IS NULL OR [description] LIKE '%' + @description + '%')
            ) b
    )

    INSERT INTO #Bin(binId, startBin, endBin, [description], isActive, ownershipTypeId, ownershipTypeName, rowNum, recordsTotal)
    SELECT binId, startBin, endBin, [description], isActive, ownershipTypeId, ownershipTypeName, rowNum, recordsTotal
    FROM CTE
    WHERE rowNum BETWEEN @startRow AND  @endRow

    SELECT 'bin' AS resultSetName
    SELECT binId, startBin, endBin, [description], isActive, ownershipTypeId, ownershipTypeName
    FROM #Bin
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName
    SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #Bin

    DROP TABLE #Bin
