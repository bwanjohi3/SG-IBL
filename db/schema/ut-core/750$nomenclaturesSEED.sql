--currency
DECLARE @itemTypeId BIGINT = (SELECT itemTypeId FROM [core].itemType WHERE name='currency')
UPDATE [core].itemName SET isEnabled=0 WHERE itemTypeId=@itemTypeId AND itemName NOT IN('USD', 'LRD')

UPDATE [core].itemName SET isEnabled=1 WHERE itemTypeId=@itemTypeId AND itemName IN('USD', 'LRD')
