
-- /*** LDAP ***/

-- DECLARE @externalSystemLdapId int = (SELECT [externalSystemTypeId] FROM [core].[externalSystemType] WHERE [name] = 'LDAP')
-- DECLARE @externalSystemAttributes [core].externalSystemAttributesTT


-- ---------------------------------------------------------------------------------------------------------------
-- --Define attributes for the external system type--
-- ---------------------------------------------------------------------------------------------------------------
-- INSERT INTO @externalSystemAttributes ([externalSystemTypeId], [attributeName], defaultValue, isReadOnly, isMandatory)
-- VALUES (@externalSystemLdapId, 'distinguishedName', NULL, 0, 1),
--         (@externalSystemLdapId, 'userSearchBase', NULL, 0, 1),
--         (@externalSystemLdapId, 'authSearchFilter', NULL, 0, 0),
--         (@externalSystemLdapId, 'importSearchFilter', NULL, 0, 0),
--         (@externalSystemLdapId, 'identifier', NULL, 0, 1),
--         (@externalSystemLdapId, 'email', NULL, 0, 1),
--         (@externalSystemLdapId, 'firstName', NULL, 0, 1),
--         (@externalSystemLdapId, 'lastName', NULL, 0, 1)


--  ;MERGE INTO [core].[externalSystemAttributes] t
--   USING @externalSystemAttributes s
--   ON s.[externalSystemTypeId] = t.[externalSystemTypeId] AND s.[attributeName] = t.[attributeName]
--   WHEN NOT MATCHED BY TARGET THEN 
--   INSERT ([externalSystemTypeId], [attributeName], defaultValue, isReadOnly, isMandatory)
--   VALUES (s.[externalSystemTypeId], s.[attributeName],s.defaultValue, s.isReadOnly, s.isMandatory);



-- ---------------------------------------------------------------------------------------------------------------
-- --Insert values for each attribute--
-- ---------------------------------------------------------------------------------------------------------------

-- DECLARE @externalSystemAttributesValues [core].externalSystemAttributesValuesTT
-- DECLARE @externalSystemId int = (SELECT [externalSystemId] FROM [core].[externalSystem] WHERE [name] = 'LDAP Bulgaria')
-- DECLARE @distinguishedName INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'distinguishedName')
-- DECLARE @userSearchBase INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'userSearchBase')
-- DECLARE @authSearchFilter INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'authSearchFilter')
-- DECLARE @importSearchFilter INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'importSearchFilter')
-- DECLARE @username INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'identifier')
-- DECLARE @email INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'email')
-- DECLARE @firstName INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'firstName')
-- DECLARE @lastName INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'lastName')

-- INSERT INTO @externalSystemAttributesValues ([externalSystemId], [attributeId], [value])
-- VALUES (@externalSystemId, @distinguishedName, 'CN=testuser_2,OU=Users,OU=access_bank,DC=sg-test,DC=local'),
--     (@externalSystemId, @userSearchBase, 'OU=access_bank,DC=sg-test,DC=local'),
--     (@externalSystemId, @authSearchFilter, 'CN=Administrator, CN=Users'),
--     (@externalSystemId, @importSearchFilter, 'sAMAccountName=@username@'),
--     (@externalSystemId, @username, 'cn'),
--     (@externalSystemId, @email, 'mail'),
--     (@externalSystemId, @firstName, 'givenName'),
--     (@externalSystemId, @lastName, 'name')


--  ;MERGE INTO [core].[externalSystemAttributesValues] t
--   USING @externalSystemAttributesValues s
--   ON s.[externalSystemId] = t.[externalSystemId] AND s.[attributeId] = t.[attributeId]
--   WHEN NOT MATCHED BY TARGET THEN 
--   INSERT ([externalSystemId], [attributeId], [value])
--   VALUES (s.[externalSystemId], s.[attributeId], s.[value]);


-- /*** SMS ***/

-- DECLARE @externalSystemSmsId int = (SELECT [externalSystemTypeId] FROM [core].[externalSystemType] WHERE [name] = 'SMS')
-- DELETE @externalSystemAttributes 


-- ---------------------------------------------------------------------------------------------------------------
-- --Define attributes for the external system type--
-- ---------------------------------------------------------------------------------------------------------------
-- INSERT INTO @externalSystemAttributes ([externalSystemTypeId], [attributeName], defaultValue, isReadOnly, isMandatory)
-- VALUES (@externalSystemSmsId, 'apiKey', NULL, 0, 0),
--         (@externalSystemSmsId, 'listen', NULL, 0, 0),
--         (@externalSystemSmsId, 'systemType', NULL, 0, 0),
--         (@externalSystemSmsId, 'systemId', NULL, 0, 0),
--         (@externalSystemSmsId, 'provider', NULL, 0, 1),
--         (@externalSystemSmsId, 'sender', NULL, 0, 0)

--  ;MERGE INTO [core].[externalSystemAttributes] t
--   USING @externalSystemAttributes s
--   ON s.[externalSystemTypeId] = t.[externalSystemTypeId] AND s.[attributeName] = t.[attributeName]
--   WHEN NOT MATCHED BY TARGET THEN 
--   INSERT ([externalSystemTypeId], [attributeName], defaultValue, isReadOnly, isMandatory)
--   VALUES (s.[externalSystemTypeId], s.[attributeName],s.defaultValue, s.isReadOnly, s.isMandatory);


-- /*** SMTP ***/

-- DECLARE @externalSystemSmtpId int = (SELECT [externalSystemTypeId] FROM [core].[externalSystemType] WHERE [name] = 'SMTP')
-- DELETE @externalSystemAttributes 


-- ---------------------------------------------------------------------------------------------------------------
-- --Define attributes for the external system type--
-- ---------------------------------------------------------------------------------------------------------------
-- INSERT INTO @externalSystemAttributes ([externalSystemTypeId], [attributeName], defaultValue, isReadOnly, isMandatory)
-- VALUES (@externalSystemSmtpId, 'service', 'gmail', 0, 1)

--  ;MERGE INTO [core].[externalSystemAttributes] t
--   USING @externalSystemAttributes s
--   ON s.[externalSystemTypeId] = t.[externalSystemTypeId] AND s.[attributeName] = t.[attributeName]
--   WHEN NOT MATCHED BY TARGET THEN 
--   INSERT ([externalSystemTypeId], [attributeName], defaultValue, isReadOnly, isMandatory)
--   VALUES (s.[externalSystemTypeId], s.[attributeName],s.defaultValue, s.isReadOnly, s.isMandatory);


-- ---------------------------------------------------------------------------------------------------------------
-- --Insert values for each attribute--
-- ---------------------------------------------------------------------------------------------------------------

-- DELETE FROM  @externalSystemAttributesValues
-- SET @externalSystemId = (SELECT [externalSystemId] FROM [core].[externalSystem] WHERE [name] = 'SMTP Gmail')
-- DECLARE @smtpService INT = (SELECT [attributeId] FROM [core].[externalSystemAttributes] WHERE [attributeName] = 'service')


-- INSERT INTO @externalSystemAttributesValues ([externalSystemId], [attributeId], [value])
-- VALUES (@externalSystemId, @smtpService, 'gmail')


--  ;MERGE INTO [core].[externalSystemAttributesValues] t
--   USING @externalSystemAttributesValues s
--   ON s.[externalSystemId] = t.[externalSystemId] AND s.[attributeId] = t.[attributeId]
--   WHEN NOT MATCHED BY TARGET THEN 
--   INSERT ([externalSystemId], [attributeId], [value])
--   VALUES (s.[externalSystemId], s.[attributeId], s.[value]);