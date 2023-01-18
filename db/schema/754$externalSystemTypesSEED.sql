IF NOT EXISTS (SELECT 1 FROM [core].[externalSystemType] WHERE [name] = 'LDAP')
    INSERT INTO [core].[externalSystemType] ([name], [key], isBranchUnique, isSingleUser) values ('LDAP', 'ldap', 1, 1)

IF NOT EXISTS (SELECT 1 FROM [core].[externalSystemType] WHERE [name] = 'CBS')
    INSERT INTO [core].[externalSystemType] ([name], [key], [depthKey], isBranchUnique, isSingleUser) values ('CBS', 'cbs', 'CBSforBranchesDepth', 1, 0)

IF NOT EXISTS (SELECT 1 FROM [core].[externalSystemType] WHERE [name] = 'SMTP')
    INSERT INTO [core].[externalSystemType] ([name], [key], isBranchUnique, isSingleUser) values ('SMTP', 'smtp', 1, 1)

IF NOT EXISTS (SELECT 1 FROM [core].[externalSystemType] WHERE [name] = 'SMS')
    INSERT INTO [core].[externalSystemType] ([name], [key], isBranchUnique, isSingleUser) values ('SMS', 'sms', 0, 0)