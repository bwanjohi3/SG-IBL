IF NOT EXISTS (SELECT 1 FROM [card].cardNumberConstruction WHERE cardNumberConstructionId = 1)
BEGIN
    INSERT INTO [card].cardNumberConstruction(cardNumberConstructionId, [Description], cardLength, pattern)
    VALUES (1, '12 - BIN + Seq Number', 12, 'bin-sequenceNumber')
END
IF NOT EXISTS (SELECT 1 FROM [card].cardNumberConstruction WHERE cardNumberConstructionId = 2)
BEGIN
    INSERT INTO [card].cardNumberConstruction(cardNumberConstructionId, [Description], cardLength, pattern)
    VALUES (2, '16 - BIN + BU + Seq Number', 16, 'bin-buCode-sequenceNumber')
END