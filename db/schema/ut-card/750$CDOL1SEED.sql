DECLARE @ID int

IF NOT EXISTS(SELECT * FROM [card].[cdol1Profile] WHERE cdol1ProfileName = 'IBL CDOL') BEGIN
    INSERT INTO [card].[cdol1Profile] (cdol1ProfileName) values('IBL CDOL')
    SET @id=SCOPE_IDENTITY()
    INSERT INTO [card].[cdol1ProfileData] (cdol1ProfileId, tag, len, [order]) values
    (@id, N'9F02', 6, 1),

(@id, N'9F03', 6, 2),

(@id, N'9F1A', 2, 3),

(@id, N'95', 5, 4),

(@id, N'5F2A', 2, 5),

(@id, N'9A', 3, 6),

(@id, N'9C', 1, 7),

(@id, N'9F37', 4, 8),

(@id, N'82', 2, 9),

(@id, N'9F36', 2, 10),

(@id, N'9F10', 32, 11)

END