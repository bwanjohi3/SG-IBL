IF NOT EXISTS(SELECT 1 FROM [core].[throttleLimit] WHERE [name] = N'user.identity.registerClient')
BEGIN
    INSERT INTO [core].[throttleLimit] ([name], [attempts], [duration], [durationType])
	VALUES (N'user.identity.registerClient', 3, 1, 'hour');
END
