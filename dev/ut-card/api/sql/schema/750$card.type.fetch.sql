ALTER PROCEDURE [card].[type.fetch] -- this SP gets all existing card Product in DB or selected by binId or bin
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
    if @languageId is null
        set @languageId = (select [languageId] from [core].[language] where [name] = 'English')

    DECLARE @typeId int ---the unique reference of card type in UTcard
    DECLARE @name varchar(100) = NULL -- the name of card type
    DECLARE @issuerId varchar(50) = NULL -- the issuer of the card
    DECLARE @flow varchar(50) = NULL -- the card flow own/external
    DECLARE @isActive bit = NULL -- active/unactive type,    
    DECLARE @pageSize INT --how many rows will be returned per page
    DECLARE @pageNumber INT -- which page number to display
    DECLARE @sortBy VARCHAR(50) = 'updatedOn' -- on which column results to be sorted
    DECLARE @sortOrder VARCHAR(4) = 'DESC'--what kind of sort to be used ascending or descending

    SELECT
        --@typeId = typeId,
        @name = typeName,
        @isActive = isActive
        --@issuerId = issuerId
    FROM @filterBy   

    SELECT @sortBy = [column],
           @sortOrder = [direction]
    FROM @orderBy
    where [column] in ('name', 'description', 'cardBrandName', 'ownershipTypeName', 'issuerId', 'termMonth', 'generateControlDigit', 'isActive')
    and [direction] in ('ASC', 'DESC')    

    SELECT @pageNumber = ISNULL(pageNumber,1),
           @pageSize = ISNULL([pageSize], 20) FROM @paging

    DECLARE @startRow INT = (@pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1

    IF OBJECT_ID('tempdb..#Type') IS NOT NULL
    DROP TABLE #Type
       
    CREATE TABLE #Type (typeId int, [name] nvarchar(100), description nvarchar(1000), issuerId varchar(50), generateControlDigit bit, isActive bit, cardBrandName varchar(100),
                        flow varchar(50), termMonth int, ownershipTypeName nvarchar(max), rowNum int, recordsTotal int)

    ;WITH CTE AS
    (
        SELECT typeId, [name], description, issuerId, isActive, cardBrandName, flow, generateControlDigit, termMonth, updatedOn, ownershipTypeName,
            ROW_NUMBER() OVER(ORDER BY
                            CASE WHEN @sortOrder = 'ASC' THEN
                                CASE
                                    WHEN @sortBy = 'name' THEN t.name
                                    WHEN @sortBy = 'description' THEN t.description
                                    WHEN @sortBy = 'cardBrandName' THEN t.cardBrandName
                                    WHEN @sortBy = 'ownershipTypeName' THEN t.ownershipTypeName
                                    WHEN @sortBy = 'issuerId' THEN convert(nvarchar(100),t.issuerId)
                                    -- WHEN @sortBy = 'flow' THEN convert(nvarchar(100),t.flow)       
                                    WHEN @sortBy = 'termMonth' THEN convert(nvarchar(100),t.termMonth)
                                    WHEN @sortBy = 'generateControlDigit' THEN convert(nvarchar(1),t.generateControlDigit)
                                    WHEN @sortBy = 'isActive' THEN convert(nvarchar(1),t.isActive)
                                END
                            END,
                            CASE WHEN @sortOrder = 'DESC' THEN
                                CASE
                                    WHEN @sortBy = 'name' THEN t.name
                                    WHEN @sortBy = 'description' THEN t.description
                                    WHEN @sortBy = 'cardBrandName' THEN t.cardBrandName
                                    WHEN @sortBy = 'ownershipTypeName' THEN t.ownershipTypeName
                                    WHEN @sortBy = 'issuerId' THEN convert(nvarchar(100),t.issuerId)
                                    -- WHEN @sortBy = 'flow' THEN convert(nvarchar(100),t.flow)       
                                    WHEN @sortBy = 'termMonth' THEN convert(nvarchar(100),t.termMonth)
                                    WHEN @sortBy = 'generateControlDigit' THEN convert(nvarchar(1),t.generateControlDigit)
                                    WHEN @sortBy = 'isActive' THEN convert(nvarchar(1),t.isActive)
                                    WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(100),t.updatedOn)
                                END
                            END DESC) rowNum,
                            COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
        FROM
        (
            SELECT t.typeId, t.description, t.issuerId, ISNULL(itt.itemNameTranslation, t.name) AS name, ccb.name AS cardBrandName,
                   flow, t.generateControlDigit, t.isActive, termMonth, t.updatedOn, own.ownershipType as ownershipTypeName
            FROM [card].[type] t
            LEFT JOIN [core].itemTranslation itt ON itt.itemNameId = t.itemNameId and itt.languageId = @languageId
            LEFT JOIN [card].cardBrand ccb ON ccb.cardBrandId = t.cardBrandId 
            JOIN ( 
                    SELECT typeId, max(itemNameTranslation) AS ownershipType
                    FROM [card].bin cb
                    JOIN core.itemTranslation itt ON itt.itemNameId = cb.ownershipTypeId and itt.languageId = @languageId
                    GROUP BY typeId
                  ) own ON own.typeId = t.typeId         
            WHERE (@typeId IS NULL OR t.typeId = @typeId )
                    AND (@name IS NULL OR t.name like '%' + @name + '%')
                    AND (@isActive IS NULL OR t.isActive = @isActive )
                    AND (@issuerId IS NULL OR t.issuerId = @issuerId )
                    AND (@flow IS NULL OR t.flow = @flow )                    
        )   t
     )

    INSERT INTO #Type( typeId, [name], description, issuerId, isActive, generateControlDigit, cardBrandName, flow, termMonth, ownershipTypeName, rowNum, recordsTotal )
    SELECT typeId, [name], description, issuerId, isActive, generateControlDigit, cardBrandName, flow, termMonth, ownershipTypeName, rowNum, recordsTotal
    FROM CTE
    WHERE rowNum BETWEEN @startRow AND  @endRow

    SELECT 'type' AS resultSetName
    SELECT typeId, [name], description, issuerId, isActive, generateControlDigit, cardBrandName, flow, termMonth, ownershipTypeName, rowNum, recordsTotal
    FROM #Type p
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName
    SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #Type

    DROP TABLE #Type
