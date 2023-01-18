DECLARE @itemTypeId BIGINT
-- country
SET @itemTypeId = (SELECT itemTypeId FROM [core].itemType WHERE name='country')
IF @itemTypeId IS NULL
BEGIN
    INSERT INTO [core].itemType([alias], [name], [description], [table], [keyColumn], [nameColumn])
    VALUES ('country', 'country', 'country', 'country', 'countryId', 'countryId')
    SET @itemTypeId = SCOPE_IDENTITY()
END
IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'USA' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'USA', 'USA', null, null, 1, null)
END
-- region
SET @itemTypeId = (SELECT itemTypeId FROM [core].itemType WHERE name='region')
IF @itemTypeId IS NULL
BEGIN
    INSERT INTO [core].itemType([alias], [name], [description], [table], [keyColumn], [nameColumn])
    VALUES ('region', 'region', 'region', 'region', 'regionId', 'regionId')
    SET @itemTypeId = SCOPE_IDENTITY()
END
IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'West' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'West', 'West', null, null, 1, null)
END
-- city
SET @itemTypeId = (SELECT itemTypeId FROM [core].itemType WHERE name='city')
IF @itemTypeId IS NULL
BEGIN
    INSERT INTO [core].itemType([alias], [name], [description], [table], [keyColumn], [nameColumn])
    VALUES ('city', 'city', 'city', 'city', 'cityId', 'cityId')
    SET @itemTypeId = SCOPE_IDENTITY()
END
IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'Seattle' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'Seattle', 'Seattle', null, null, 1, null)
END
IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'Redmond' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'Redmond', 'Redmond', null, null, 1, null)
END
IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'San Francisco' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'San Francisco', 'San Francisco', null, null, 1, null)
END
-- channel
SET @itemTypeId = (SELECT itemTypeId FROM [core].itemType WHERE name='channel')
IF @itemTypeId IS NULL
BEGIN
    INSERT INTO [core].itemType([alias], [name], [description], [table], [keyColumn], [nameColumn])
    VALUES ('channel', 'channel', 'channel', 'channel', 'channelId', 'channelId')
    SET @itemTypeId = SCOPE_IDENTITY()
END
IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'USSD / SMS' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'USSD / SMS', 'USSD / SMS', null, null, 1, null)
END
IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'Self service app' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'Self service app', 'Self service app', null, null, 1, null)
END
IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'Third Party' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'Third Party', 'Third Party', null, null, 1, null)
END