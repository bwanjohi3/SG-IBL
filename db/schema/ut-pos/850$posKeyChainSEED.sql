MERGE INTO [pos].[keyChainType] AS target
USING
    (VALUES
        (2, 'Master/Session'),
        (3, 'DUKPT')
    ) AS source ([keyChainTypeId],[name])
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT ([keyChainTypeId],[name])
VALUES ([keyChainTypeId],[name]);
----------------------------------------------------------------------------------------------------------------

MERGE INTO [pos].[keyChainItemType] AS target
USING
    (VALUES
        ('ZMK'),
        ('DEK'),
        ('BDK'),        
        ('KSI'),
        ('ksnDescriptor'),
        ('initialKey')
    ) AS source ([name])
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT ([name])
VALUES ([name]);
-----------------------------------------------------------------------------------------------------------------

DECLARE @dukptId INT = (SELECT keyChainTypeId FROM [pos].[keyChainType] WHERE name = 'DUKPT')

MERGE INTO [pos].[keyChain] AS target
USING
    (VALUES
        ('Key Chain 1', @dukptId),
        ('Key Chain 2', @dukptId)
    ) AS source ([name], [keyChainTypeId])
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT ([name], [keyChainTypeId])
VALUES ([name], [keyChainTypeId]);
-----------------------------------------------------------------------------------------------------------------

DECLARE @iblKeysId INT = (SELECT keyChainId FROM [pos].[keyChain] WHERE name = 'Key Chain 1')
DECLARE @datKeysId INT = (SELECT keyChainId FROM [pos].[keyChain] WHERE name = 'Key Chain 2')

MERGE INTO [pos].[keyChainItem] AS target
USING
    (VALUES
        (@iblKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'ZMK'), 'U47D16FF39F30AE1A6E79C60A96261CB7', '2395A8'),
        (@iblKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'DEK'), 'UD46792286B1AF5E107BBB315A0455EAB', '2395A8'),
        (@iblKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'BDK'), 'U03413C790E79F9D15FC28EAF92896A44', '66E99F'),
        (@iblKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'KSI'), '000001', NULL),
        (@iblKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'ksnDescriptor'), 'A05', NULL),
        (@datKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'ZMK'), 'U47D16FF39F30AE1A6E79C60A96261CB7', '2395A8'),
        (@datKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'DEK'), 'UD46792286B1AF5E107BBB315A0455EAB', '2395A8'),
        (@datKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'BDK'), 'U03413C790E79F9D15FC28EAF92896A44', '66E99F'),
        (@datKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'KSI'), '000001', NULL),
        (@datKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'ksnDescriptor'), 'A05', NULL),
        (@datKeysId, (SELECT keyChainItemTypeId FROM [pos].[keyChainItemType] where name = 'initialKey'), 'UCE8EA5F1D0F862A20F679FAD19E8191B', 'EDDB24')

    ) AS source ([keyChainId], [keyChainItemTypeId], [value], [checkValue])
ON target.[keyChainId] = source.[keyChainId] AND target.[keyChainItemTypeId] = source.[keyChainItemTypeId]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([keyChainId], [keyChainItemTypeId], [value], [checkValue])
VALUES ([keyChainId], [keyChainItemTypeId], [value], [checkValue]);
-----------------------------------------------------------------------------------------------------------------