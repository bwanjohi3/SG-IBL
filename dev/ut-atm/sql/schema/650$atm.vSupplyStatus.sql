ALTER VIEW [atm].[vSupplyStatus]
AS
WITH CTE AS (
    SELECT
        t.terminalId,
        t.[address] + ISNULL(t.[city], '') + ISNULL(t.[state], '') + ISNULL(t.[country], '') as terminalName,
        t.cassette1Currency,
        t.cassette1Denomination,
        t.cassette2Currency,
        t.cassette2Denomination,
        t.cassette3Currency,
        t.cassette3Denomination,
        t.cassette4Currency,
        t.cassette4Denomination,
        ISNULL(sc.notes1, 0) * t.cassette1Denomination [cassette1Amount],
        ISNULL(sc.notes2, 0) * t.cassette2Denomination [cassette2Amount],
        ISNULL(sc.notes3, 0) * t.cassette3Denomination [cassette3Amount],
        ISNULL(sc.notes4, 0) * t.cassette4Denomination [cassette4Amount],
        sc.rejected1,
        sc.rejected2,
        sc.rejected3,
        sc.rejected4,
        ISNULL(sc.rejected1, 0) * t.cassette1Denomination [cassette1RejectedAmount],
        ISNULL(sc.rejected2, 0) * t.cassette2Denomination [cassette2RejectedAmount],
        ISNULL(sc.rejected3, 0) * t.cassette3Denomination [cassette3RejectedAmount],
        ISNULL(sc.rejected4, 0) * t.cassette4Denomination [cassette4RejectedAmount],
        sc.notes1,
        sc.notes2,
        sc.notes3,
        sc.notes4,
        ROW_NUMBER() OVER (ORDER BY t.terminalId)   AS [rowNum]
    FROM
        [atm].[terminal] t
    LEFT JOIN
        [atm].[supplyCounters] sc on t.actorId = sc.atmId
)
SELECT
    t.terminalId,
    t.terminalName,
    t.cassette1Denomination,
    t.cassette2Denomination,
    t.cassette3Denomination,
    t.cassette4Denomination,
    t.cassette1Currency,
    t.cassette2Currency,
    t.cassette3Currency,
    t.cassette4Currency,
    t.cassette1Amount,
    t.cassette2Amount,
    t.cassette3Amount,
    t.cassette4Amount,
    CAST(t.rejected1 AS NVARCHAR(20)) AS rejected1,
    CAST(t.rejected2 AS NVARCHAR(20)) AS rejected2,
    CAST(t.rejected3 AS NVARCHAR(20)) AS rejected3,
    CAST(t.rejected4 AS NVARCHAR(20)) AS rejected4,
    t.cassette1RejectedAmount,
    t.cassette2RejectedAmount,
    t.cassette3RejectedAmount,
    t.cassette4RejectedAmount,
    CAST(t.notes1 AS NVARCHAR(20)) AS notes1,
    CAST(t.notes2 AS NVARCHAR(20)) AS notes2,
    CAST(t.notes3 AS NVARCHAR(20)) AS notes3,
    CAST(t.notes4 AS NVARCHAR(20)) AS notes4,
    totalAvailable = stuff(( select ', ' + CAST(SUM(ISNULL(cc.cassetteAmount, 0)) AS NVARCHAR(20)) + ' ' + cc.cassetteCurrency 
                FROM (  SELECT t.cassette1Currency AS cassetteCurrency, t.cassette1Amount AS cassetteAmount
                        UNION ALL
                        SELECT t.cassette2Currency AS cassetteCurrency, t.cassette2Amount AS cassetteAmount
                        UNION ALL
                        SELECT t.cassette3Currency AS cassetteCurrency, t.cassette3Amount AS cassetteAmount
                        UNION ALL
                        SELECT t.cassette4Currency AS cassetteCurrency, t.cassette4Amount AS cassetteAmount
                    ) cc
                    GROUP BY cc.cassetteCurrency for xml path('')), 1, 2, ''
                    ),
    totalRejected = stuff(( select ', ' + CAST(SUM(ISNULL(cc.cassetteRejectedAmount, 0)) AS NVARCHAR(20)) + ' ' + cc.cassetteCurrency 
                FROM (  SELECT t.cassette1Currency AS cassetteCurrency, t.cassette1RejectedAmount AS cassetteRejectedAmount
                        UNION ALL
                        SELECT t.cassette2Currency AS cassetteCurrency, t.cassette2RejectedAmount AS cassetteRejectedAmount
                        UNION ALL
                        SELECT t.cassette3Currency AS cassetteCurrency, t.cassette3RejectedAmount AS cassetteRejectedAmount
                        UNION ALL
                        SELECT t.cassette4Currency AS cassetteCurrency, t.cassette4RejectedAmount AS cassetteRejectedAmount
                    ) cc
                    GROUP BY cc.cassetteCurrency for xml path('')), 1, 2, ''
                    ),
    total = stuff(( select ', ' + CAST((SUM(ISNULL(cc.cassetteRejectedAmount, 0)) + SUM(ISNULL(cc.cassetteAmount, 0))) AS NVARCHAR(20)) + ' ' + cc.cassetteCurrency 
                FROM (  SELECT t.cassette1Currency AS cassetteCurrency, t.cassette1RejectedAmount AS cassetteRejectedAmount, t.cassette1Amount AS cassetteAmount
                        UNION ALL
                        SELECT t.cassette2Currency AS cassetteCurrency, t.cassette2RejectedAmount AS cassetteRejectedAmount, t.cassette2Amount AS cassetteAmount
                        UNION ALL
                        SELECT t.cassette3Currency AS cassetteCurrency, t.cassette3RejectedAmount AS cassetteRejectedAmount, t.cassette3Amount AS cassetteAmount
                        UNION ALL
                        SELECT t.cassette4Currency AS cassetteCurrency, t.cassette4RejectedAmount AS cassetteRejectedAmount, t.cassette4Amount AS cassetteAmount
                    ) cc
                    GROUP BY cc.cassetteCurrency for xml path('')), 1, 2, ''
                    ),
    1000000000 + [rowNum] AS sortOrder
FROM CTE t
UNION ALL
SELECT
    N'Total ' + ISNULL(it.itemName, N'no currency') AS terminalId,
    NULL AS terminalName,
    NULL AS cassette1Denomination,
    NULL AS cassette2Denomination,
    NULL AS cassette3Denomination,
    NULL AS cassette4Denomination,
    it.itemName AS cassette1Currency,
    it.itemName AS cassette2Currency,
    it.itemName AS cassette3Currency,
    it.itemName AS cassette4Currency,
    SUM(CASE WHEN it.itemName = c.cassette1Currency THEN ISNULL(c.cassette1Amount, 0) ELSE 0 END) AS cassette1Amount,
    SUM(CASE WHEN it.itemName = c.cassette2Currency THEN ISNULL(c.cassette2Amount, 0) ELSE 0 END) AS cassette2Amount,
    SUM(CASE WHEN it.itemName = c.cassette3Currency THEN ISNULL(c.cassette3Amount, 0) ELSE 0 END) AS cassette3Amount,
    SUM(CASE WHEN it.itemName = c.cassette4Currency THEN ISNULL(c.cassette4Amount, 0) ELSE 0 END) AS cassette4Amount,
    rejected1 = stuff(( select ', ' + CAST(SUM(ISNULL(rejected1, 0)) AS NVARCHAR(20)) + 'x' + CAST(c.cassette1Denomination AS NVARCHAR(20)) 
                FROM CTE c
                WHERE c.cassette1Currency = it.itemName 
                GROUP BY c.cassette1Denomination for xml path('')), 1, 2, ''),
    rejected2 = stuff(( select ', ' + CAST(SUM(ISNULL(rejected2, 0)) AS NVARCHAR(20)) + 'x' + CAST(c.cassette2Denomination AS NVARCHAR(20))
                FROM CTE c
                WHERE c.cassette2Currency = it.itemName 
                GROUP BY c.cassette2Denomination for xml path('')), 1, 2, ''),
    rejected3 = stuff(( select ', ' + CAST(SUM(ISNULL(rejected3, 0)) AS NVARCHAR(20)) + 'x' + CAST(c.cassette3Denomination AS NVARCHAR(20))
                FROM CTE c
                WHERE c.cassette3Currency = it.itemName 
                GROUP BY c.cassette3Denomination for xml path('')), 1, 2, ''),
    rejected4 = stuff(( select ', ' + CAST(SUM(ISNULL(rejected4, 0)) AS NVARCHAR(20)) + 'x' + CAST(c.cassette4Denomination AS NVARCHAR(20))
                FROM CTE c
                WHERE c.cassette4Currency = it.itemName 
                GROUP BY c.cassette4Denomination for xml path('')), 1, 2, ''),
    SUM(CASE WHEN it.itemName = c.cassette1Currency THEN ISNULL(c.cassette1RejectedAmount, 0) ELSE 0 END) AS cassette1RejectedAmount,
    SUM(CASE WHEN it.itemName = c.cassette2Currency THEN ISNULL(c.cassette2RejectedAmount, 0) ELSE 0 END) AS cassette2RejectedAmount,
    SUM(CASE WHEN it.itemName = c.cassette3Currency THEN ISNULL(c.cassette3RejectedAmount, 0) ELSE 0 END) AS cassette3RejectedAmount,
    SUM(CASE WHEN it.itemName = c.cassette4Currency THEN ISNULL(c.cassette4RejectedAmount, 0) ELSE 0 END) AS cassette4RejectedAmount,
    notes1 = stuff(( select ', ' + CAST(SUM(ISNULL(notes1, 0)) AS NVARCHAR(20)) + N'x' + CAST(c.cassette1Denomination AS NVARCHAR(20))
             FROM CTE c
             WHERE c.cassette1Currency = it.itemName 
             GROUP BY c.cassette1Denomination for xml path('')), 1, 2, ''),
    notes2 = stuff(( select ', ' + CAST(SUM(ISNULL(notes2, 0)) AS NVARCHAR(20)) + N'x' + CAST(c.cassette2Denomination AS NVARCHAR(20))
             FROM CTE c
             WHERE c.cassette2Currency = it.itemName 
             GROUP BY c.cassette2Denomination for xml path('')), 1, 2, ''),
    notes2 = stuff(( select ', ' + CAST(SUM(ISNULL(notes3, 0)) AS NVARCHAR(20)) + N'x' + CAST(c.cassette3Denomination AS NVARCHAR(20))
             FROM CTE c
             WHERE c.cassette3Currency = it.itemName 
             GROUP BY c.cassette3Denomination for xml path('')), 1, 2, ''),
    notes2 = stuff(( select ', ' + CAST(SUM(ISNULL(notes4, 0)) AS NVARCHAR(20)) + N'x' + CAST(c.cassette4Denomination AS NVARCHAR(20))
             FROM CTE c
             WHERE c.cassette4Currency = it.itemName 
             GROUP BY c.cassette4Denomination for xml path('')), 1, 2, ''),
    totalAvailable = CAST(
            SUM(CASE WHEN it.itemName = c.cassette1Currency THEN ISNULL(c.cassette1Amount, 0) ELSE 0 END) + 
            SUM(CASE WHEN it.itemName = c.cassette2Currency THEN ISNULL(c.cassette2Amount, 0) ELSE 0 END) +
            SUM(CASE WHEN it.itemName = c.cassette3Currency THEN ISNULL(c.cassette3Amount, 0) ELSE 0 END) +
            SUM(CASE WHEN it.itemName = c.cassette4Currency THEN ISNULL(c.cassette4Amount, 0) ELSE 0 END) 
            AS NVARCHAR(50)) + ' ' + it.itemName,
    totalRejected = CAST(
            SUM(CASE WHEN it.itemName = c.cassette1Currency THEN ISNULL(c.cassette1RejectedAmount, 0) ELSE 0 END) + 
            SUM(CASE WHEN it.itemName = c.cassette2Currency THEN ISNULL(c.cassette2RejectedAmount, 0) ELSE 0 END) +
            SUM(CASE WHEN it.itemName = c.cassette3Currency THEN ISNULL(c.cassette3RejectedAmount, 0) ELSE 0 END) +
            SUM(CASE WHEN it.itemName = c.cassette4Currency THEN ISNULL(c.cassette4RejectedAmount, 0) ELSE 0 END) 
            AS NVARCHAR(50)) + ' ' + it.itemName,
    total = CAST(
            SUM(CASE WHEN it.itemName = c.cassette1Currency THEN ISNULL(c.cassette1Amount, 0) + ISNULL(c.cassette1RejectedAmount, 0) ELSE 0 END) + 
            SUM(CASE WHEN it.itemName = c.cassette2Currency THEN ISNULL(c.cassette2Amount, 0) + ISNULL(c.cassette2RejectedAmount, 0) ELSE 0 END) +
            SUM(CASE WHEN it.itemName = c.cassette3Currency THEN ISNULL(c.cassette3Amount, 0) + ISNULL(c.cassette3RejectedAmount, 0) ELSE 0 END) +
            SUM(CASE WHEN it.itemName = c.cassette4Currency THEN ISNULL(c.cassette4Amount, 0) + ISNULL(c.cassette4RejectedAmount, 0) ELSE 0 END) 
            AS NVARCHAR(50)) + ' ' + it.itemName,
   2000000001 AS sortOrder
FROM 
    CTE c
LEFT JOIN 
    core.itemName it ON it.itemTypeId = 1                              -- currency
                     AND (  it.itemName = c.cassette1Currency 
                        OR  it.itemName = c.cassette2Currency 
                        OR  it.itemName = c.cassette3Currency 
                        OR  it.itemName = c.cassette4Currency 
                     )
GROUP BY it.itemName
-- ORDER BY sortOrder
