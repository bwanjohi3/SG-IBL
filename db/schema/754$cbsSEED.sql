-------------------------- CBS seed

DECLARE @cbsItemNameId int = (SELECT itemnameid FROM [core].[itemName] WHERE itemName = 'cbs')

MERGE INTO [core].[cbs] AS target
USING
    (VALUES        
        (3, 'Senegal', 't24/senegal', @cbsItemNameId),
        (33, 'Madagascar', 't24/madagascar', @cbsItemNameId),
        (34, 'Ivory Coast', 't24/cote d''Ivoire', @cbsItemNameId),
        (35, 'Mali','t24/mali',  @cbsItemNameId),
        (36, 'Tunisia', 't24/tunisia', @cbsItemNameId),
        (37, 'Nigeria', 't24/nigeria', @cbsItemNameId)
    ) AS source (cbsId, name, ut5Key, itemNameId)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (cbsId, name, ut5Key, itemNameId)
VALUES (cbsId, name, ut5Key, itemNameId);