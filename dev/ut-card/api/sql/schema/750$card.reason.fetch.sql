ALTER PROCEDURE [card].[reason.fetch] -- this SP gets all existing card reasons in DB by the module
    @filterBy [card].filterByTT READONLY, -- filters for reasons
    @orderBy [card].orderByTT READONLY, -- information for ordering
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

    DECLARE @pageSize INT = 20
    DECLARE @pageNumber INT = 1
    DECLARE @sortBy VARCHAR(50)  = null
    DECLARE @sortOrder VARCHAR(4) = null
    DECLARE @languageId BIGINT = isnull((SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId), (select [languageId] from [core].[language] where [name] = 'English'))

    SELECT @sortBy = [column], @sortOrder = [direction]
    FROM @orderBy
    where [column] in ('module', 'actionName', 'reasonName', 'isActive','updatedOn')
        and [direction] in ('ASC', 'DESC')

    DECLARE @module varchar(20), -- for which module to return - application, batch or card
        @isActive bit, -- the status of the card reason 1-Active,  0-Inactive
        @reasonName nvarchar(255), --the description of the card reason
        @actId tinyint --the action that requires card reason

    SELECT @module = module, @isActive = isActive, @reasonName = reasonName, @actId = actionId
    from @filterBy

    SELECT @pageNumber = ISNULL(pageNumber,1),
       @pageSize = ISNULL([pageSize], 20) FROM @paging


    DECLARE @startRow INT = ( @pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1

      IF OBJECT_ID('tempdb..#Reason') IS NOT NULL
       DROP TABLE #Reason

    CREATE TABLE #Reason (reasonId tinyint, module varchar(20), reasonName nvarchar(max), actionName nvarchar(max),
                     isActive bit, [code] varchar(30), updatedOn datetime2(0), rowNum INT, recordsTotal INT )

    ;WITH CTE  AS
    (
         SELECT reasonId , reasonName, module, isActive, code, actionName, updatedOn,
               ROW_NUMBER() OVER (ORDER BY
                                    CASE WHEN @sortOrder = 'ASC' THEN
                                        CASE
                                        WHEN @sortBy = 'module' THEN  convert(nvarchar(1000), module)
                                        WHEN @sortBy = 'actionName' THEN  convert(nvarchar(1000), actionName)
                                        WHEN @sortBy = 'reasonName' THEN reasonName
                                        WHEN @sortBy = 'isActive' THEN convert(nvarchar(1000), isActive)
                                        WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(1000), updatedOn)
                                        END
                                    END,
                                    CASE WHEN @sortOrder = 'DESC' THEN
                                        CASE
                                        WHEN @sortBy = 'module' THEN  convert(nvarchar(1000), module)
                                        WHEN @sortBy = 'actionName' THEN  convert(nvarchar(1000), actionName)
                                        WHEN @sortBy = 'reasonName' THEN reasonName
                                        WHEN @sortBy = 'isActive' THEN convert(nvarchar(1000), isActive)
                                        WHEN @sortBy = 'updatedOn' THEN convert(nvarchar(1000), updatedOn)
                                        END
                                    END DESC,
                                    -- default sorting whne nothing is passed - by updatedOn or createdOn id it not updated
                                    CASE WHEN @sortOrder IS NULL THEN convert(nvarchar(100), isnull(updatedOn, createdOn)) END DESC ) rowNum,
                 COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
        FROM
        (
            SELECT reasonId, ISNULL(it.itemNameTranslation, itn.itemName) as reasonName, module, isActive, code, updatedOn, createdOn,
                STUFF ((SELECT ', ' +  ISNULL(itt.itemDescriptionTranslation, itn.itemDescription)
                              from [card].reasonAction b
                              join [card].[action] a on b.actionId = a.actionid
                              JOIN [core].itemName itn ON itn.itemNameId = a.itemNameId
                              LEFT JOIN [core].itemTranslation itt on itt.itemNameId = a.itemNameId and itt.languageId = @languageId
                              where b.reasonId = r.reasonId
                              order by itt.itemNameTranslation
                              for xml path ('') ),1,2,'') as actionName
            FROM [card].reason r
            JOIN [core].itemName itn ON itn.itemNameId = r.itemNameId
            LEFT JOIN [core].itemTranslation it on it.itemNameId = r.itemNameId and @languageId = it.languageId
            WHERE  isDeleted = 0
                and (@isActive IS NULL or r.isActive = @isActive)
                and (@module IS NULL OR r.module = @module)
                and (@reasonName IS NULL OR it.itemNameTranslation like '%' + @reasonName + '%')
                and (@actId IS NULL OR exists (select * from [card].reasonAction where actionId = @actId and reasonId = r.reasonId))

        ) as r
    )


    INSERT INTO #Reason(reasonId, module, reasonName, actionName, isActive, code, updatedOn, rowNum, recordsTotal)
    SELECT  reasonId, module, reasonName, actionName, isActive, code, updatedOn, rowNum, recordsTotal
    FROM CTE
    WHERE rowNum BETWEEN @startRow AND  @endRow


    SELECT 'cardReason' AS resultSetName

    SELECT   reasonId, module, reasonName, isActive, code, actionName, updatedOn
    FROM #Reason
    ORDER BY rowNum


    SELECT 'pagination' AS resultSetName

    SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #Reason

    DROP TABLE #Reason