IF NOT EXISTS (SELECT 1 FROM [card].cardBrand WHERE Name ='Master Card')
BEGIN
    INSERT INTO [card].cardBrand(Name)
    VALUES ('Master Card')
END