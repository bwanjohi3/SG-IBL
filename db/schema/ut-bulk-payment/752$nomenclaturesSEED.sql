--operation

/*MERGE INTO
    core.itemName AS target
USING
    (VALUES
       ('bulkDebit', 'Bulk debit'),
       ('bulkCredit', 'Bulk credit'),
       ('merchantBulkCredit', 'Merchant bulk credit')
    ) AS source (itemCode, itemName)
JOIN
	core.itemType t on t.alias='operation'
ON
    target.itemCode = source.itemCode AND target.itemTypeId = t.itemTypeId

WHEN
    NOT MATCHED BY TARGET THEN
INSERT
    (itemTypeId, itemCode, itemName)
VALUES
    (t.itemTypeId, source.itemCode, source.itemName);*/
