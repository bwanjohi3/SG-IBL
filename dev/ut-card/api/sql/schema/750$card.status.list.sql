ALTER PROCEDURE [card].[status.list] -- returns all statuses by module
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS

DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @languageId BIGINT = isnull((SELECT languageId
                                    FROM [core].[language] cl
                                    JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                                    WHERE us.[actorId] = @userId), isnull((SELECT languageId FROM @meta), (SELECT languageId FROM core.[language] WHERE [name] = 'English')))

SELECT 'Application' AS resultSetName

SELECT DISTINCT statusId, statusLabel, statusName
FROM
(
    SELECT sa.toStatusId AS statusId, toSt.statusName AS statusLabel, ISNULL(ittTo.itemNameTranslation, itnTo.itemName) AS statusName
    FROM [card].statusAction sa
    join [card].[status] toSt ON toSt.statusId = toStatusId
    JOIN core.itemName itnTo ON  itnTo.itemNameId = toSt.itemNameId
    LEFT JOIN core.itemTranslation ittTo ON ittTo.itemNameId = toSt.itemNameId and ittTo.languageId = @languageId
    WHERE module = 'Application'

    UNION ALL

    SELECT sa.fromStatusId, fromst.statusName AS statusLabel, ISNULL(ittFrom.itemNameTranslation, itnFrom.itemName) AS statusName
    FROM [card].statusAction sa
    join [card].[status] fromSt ON fromSt.statusId = fromStatusId
    JOIN core.itemName itnFrom ON  itnFrom.itemNameId = fromSt.itemNameId
    LEFT JOIN core.itemTranslation ittFrom ON ittFrom.itemNameId = fromSt.itemNameId and ittFrom.languageId = @languageId
    WHERE module = 'Application'
) a
ORDER BY statusLabel

SELECT 'Batch' AS resultSetName

SELECT DISTINCT statusId, statusLabel, statusName
FROM
(
    SELECT sa.toStatusId AS statusId, toSt.statusName AS statusLabel, ISNULL(ittTo.itemNameTranslation, itnTo.itemName) AS statusName
    FROM [card].statusAction sa
    join [card].[status] toSt ON toSt.statusId = toStatusId
    JOIN core.itemName itnTo ON  itnTo.itemNameId = toSt.itemNameId
    LEFT JOIN core.itemTranslation ittTo ON ittTo.itemNameId = toSt.itemNameId and ittTo.languageId = @languageId
    WHERE module = 'Batch'

    UNION ALL

    SELECT sa.fromStatusId, fromst.statusName AS statusLabel, ISNULL(ittFrom.itemNameTranslation, itnFrom.itemName) AS statusName
    FROM [card].statusAction sa
    join [card].[status] fromSt ON fromSt.statusId = fromStatusId
    JOIN core.itemName itnFrom ON  itnFrom.itemNameId = fromSt.itemNameId
    LEFT JOIN core.itemTranslation ittFrom ON ittFrom.itemNameId = fromSt.itemNameId and ittFrom.languageId = @languageId
    WHERE module = 'Batch'
) b
ORDER BY statusLabel

SELECT 'Card' AS resultSetName

SELECT DISTINCT statusId, statusLabel, statusName
FROM
(
    SELECT sa.toStatusId AS statusId, toSt.statusName AS statusLabel, ISNULL(ittTo.itemNameTranslation, itnTo.itemName) AS statusName
    FROM [card].statusAction sa
    join [card].[status] toSt ON toSt.statusId = toStatusId
    JOIN core.itemName itnTo ON  itnTo.itemNameId = toSt.itemNameId
    LEFT JOIN core.itemTranslation ittTo ON ittTo.itemNameId = toSt.itemNameId and ittTo.languageId = @languageId
    WHERE module = 'Card'

    UNION ALL

    SELECT sa.fromStatusId, fromst.statusName AS statusLabel, ISNULL(ittFrom.itemNameTranslation, itnFrom.itemName) AS statusName
    FROM [card].statusAction sa
    join [card].[status] fromSt ON fromSt.statusId = fromStatusId
    JOIN core.itemName itnFrom ON  itnFrom.itemNameId = fromSt.itemNameId
    LEFT JOIN core.itemTranslation ittFrom ON ittFrom.itemNameId = fromSt.itemNameId and ittFrom.languageId = @languageId
    WHERE module = 'Card'
) c
ORDER BY statusLabel

SELECT 'CardInUse' AS resultSetName

SELECT DISTINCT statusId, statusLabel, statusName
FROM
(
    SELECT sa.toStatusId AS statusId, toSt.statusName AS statusLabel, ISNULL(ittTo.itemNameTranslation, itnTo.itemName) AS statusName
    FROM [card].statusAction sa
    join [card].[status] toSt ON toSt.statusId = toStatusId
    JOIN core.itemName itnTo ON  itnTo.itemNameId = toSt.itemNameId
    LEFT JOIN core.itemTranslation ittTo ON ittTo.itemNameId = toSt.itemNameId and ittTo.languageId = @languageId
    WHERE module = 'CardInUse'

    UNION ALL

    SELECT sa.fromStatusId, fromst.statusName AS statusLabel, ISNULL(ittFrom.itemNameTranslation, itnFrom.itemName) AS statusName
    FROM [card].statusAction sa
    join [card].[status] fromSt ON fromSt.statusId = fromStatusId
    JOIN core.itemName itnFrom ON  itnFrom.itemNameId = fromSt.itemNameId
    LEFT JOIN core.itemTranslation ittFrom ON ittFrom.itemNameId = fromSt.itemNameId and ittFrom.languageId = @languageId
    WHERE module = 'CardInUse'
) cin
ORDER BY statusLabel
