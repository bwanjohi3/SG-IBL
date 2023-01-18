DECLARE @accountUSD VARCHAR(100) = '00117541327560102'
DECLARE @accountLRD VARCHAR(100) = '00117531327550101'
MERGE INTO core.configuration AS target
USING
    (VALUES ('MCaccountUSD', @accountUSD, 'USD account for External NI ')
    ) AS source ([key], value, description)
ON target.[key] = source.[key]

WHEN NOT MATCHED BY TARGET THEN
INSERT ([key], value, description)
VALUES ([key], @accountUSD, description);

MERGE INTO core.configuration AS target
USING
    (VALUES ('MCaccountLRD', @accountLRD, 'LRD account for External NI')
    ) AS source ([key], value, description)
ON target.[key] = source.[key]

WHEN NOT MATCHED BY TARGET THEN
INSERT ([key], value, description)
VALUES ([key], @accountLRD, description);