DECLARE @roleID NVARCHAR (200) = (SELECT actorId FROM [user].[role] WHERE name = 'POS - Manage transfers role')

MERGE INTO [core].[configuration] AS target
USING
(VALUES
    ('roleIdForPOS', @roleID, 'Default POS - Manage transfers role')
) AS source ([key], [value], [description])
ON target.[key] = source.[key]
WHEN MATCHED THEN
    UPDATE SET target.[value] = source.[value]
WHEN NOT MATCHED BY TARGET THEN
    INSERT ([key], [value], [description])
    VALUES ([key], [value], [description]);
