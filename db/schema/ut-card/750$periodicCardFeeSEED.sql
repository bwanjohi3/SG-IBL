IF NOT EXISTS (SELECT 1 FROM [card].periodicCardFee WHERE name ='Daily')
BEGIN
    INSERT INTO [card].periodicCardFee(periodicCardFeeId, name)
    VALUES (1, 'Daily')
END
IF NOT EXISTS (SELECT 1 FROM [card].periodicCardFee WHERE name ='Weekly')
BEGIN
    INSERT INTO [card].periodicCardFee(periodicCardFeeId, name)
    VALUES (2, 'Weekly')
END
IF NOT EXISTS (SELECT 1 FROM [card].periodicCardFee WHERE name ='Monthly')
BEGIN
    INSERT INTO [card].periodicCardFee(periodicCardFeeId, name)
    VALUES (3, 'Monthly')
END
IF NOT EXISTS (SELECT 1 FROM [card].periodicCardFee WHERE name ='Annual')
BEGIN
    INSERT INTO [card].periodicCardFee(periodicCardFeeId, name)
    VALUES (4, 'Annual')
END