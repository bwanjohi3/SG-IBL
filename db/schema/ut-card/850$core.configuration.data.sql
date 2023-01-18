
IF NOT EXISTS(SELECT * FROM [core].[configuration] WHERE [key]='allowedPinRetries') BEGIN
    INSERT INTO [core].[configuration] ([key], [value], [description]) VALUES('allowedPinRetries', '3', 'Aallowed wrong PIN retries')
END
ELSE UPDATE   [core].[configuration] SET value=3 WHERE [key]='allowedPinRetries'

