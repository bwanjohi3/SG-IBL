/*declare @orgId bigint = (select actorId from customer.organization where organizationName = 'Bulgaria') 
declare @sa bigint = (select actorId from [user].hash where identifier = 'sa')
declare @esId int
declare @euId bigint
DECLARE @systemTypeId INT
SET @systemTypeId = (SELECT [externalSystemTypeId] FROM [core].[externalSystemType] WHERE [name] = 'CBS')
IF @orgId is not null --and @sa is not null
BEGIN 
    set @esId = ( SELECT externalSystemId FROM [core].[externalSystem] WHERE  name = 't24/bulgaria')
    IF @esId is null
    begin
        set @esId = 1 + isnull(( SELECT max(externalSystemId) FROM [core].[externalSystem]), 0)
	    
        INSERT INTO [core].externalSystem(externalSystemId, name, link, organizationId, isActive, isDeleted, dateCreated, externalSystemTypeId)
	    VALUES (@esId, 't24/bulgaria', null, @orgId, 1, 0, getDate(), @systemTypeId)
    end
    
    set @euId = (select externalUserId from [user].externalUser where externalSystemId = @esId and userName = 'SOFTWAREGROUP')
    if @euId is null
    begin 
        insert into [user].externalUser(externalSystemId, userAlias, userName, password, cryptArgs, isGeneric, isActive, isDeleted, dateCreated, createdBy, isSystem)
        values(@esId, 'SOFTWAREGROUP', 'SOFTWAREGROUP', 'da15c0bf65dba407a116a38fe9f33128', '{"algorithm":"aes192","dataEnc":"utf8","encryptedEnc":"hex"}', 1, 1, 0, getdate(), @sa, 0)

        set @euId = SCOPE_IDENTITY()
    end


    if not exists (select * from [user].userToExternalUser where userid = @sa and externalUserId = @euId)
        insert into [user].userToExternalUser (userId, externalUserId, isActive, createdBy, dateCreated)
        values (@sa, @euId, 1, @sa, getdate())
   
END

set @orgId = (select actorId from customer.organization where organizationName = 'Australia') 

IF @orgId is not null 
BEGIN     
    set @esId = ( SELECT externalSystemId FROM [core].[externalSystem] WHERE  name = 't24/australia')
    IF @esId is null
    begin
        set @esId = 1 + isnull(( SELECT max(externalSystemId) FROM [core].[externalSystem]), 0)

	    INSERT INTO [core].externalSystem(externalSystemId, name, link, organizationId, isActive, isDeleted, dateCreated, externalSystemTypeId)
	    VALUES (@esId, 't24/australia', null, @orgId, 1, 0, getDate(), @systemTypeId)        
    end
    
    set @euId = (select externalUserId from [user].externalUser where externalSystemId = @esId and userName = 'SOFTWAREGROUP')
    if @euId is null
    begin 
        insert into [user].externalUser(externalSystemId, userAlias, userName, password, cryptArgs, isGeneric, isActive, isDeleted, dateCreated, createdBy, isSystem)
        values(@esId, 'SOFTWAREGROUP', 'SOFTWAREGROUP', 'da15c0bf65dba407a116a38fe9f33128', '{"algorithm":"aes192","dataEnc":"utf8","encryptedEnc":"hex"}', 1, 1, 0, getdate(), @sa, 0)

        set @euId = SCOPE_IDENTITY()
    end  
END

SET @systemTypeId = (SELECT [externalSystemTypeId] FROM [core].[externalSystemType] WHERE [name] = 'SMS')
set @orgId = (select actorId from customer.organization where organizationName = 'Bulgaria') 

IF @orgId is not null 
BEGIN
    set @esId = ( SELECT externalSystemId FROM [core].[externalSystem] WHERE  name = 'sms/bulgaria')
    IF @esId is null
    begin
        set @esId = 1 + isnull(( SELECT max(externalSystemId) FROM [core].[externalSystem]), 0)
	    
        INSERT INTO [core].externalSystem(externalSystemId, name, link, organizationId, isActive, isDeleted, dateCreated, externalSystemTypeId)
	    VALUES (@esId, 'sms/bulgaria', null, @orgId, 1, 0, getDate(), @systemTypeId)
    end
END
   
set @orgId = (select actorId from customer.organization where organizationName = 'Australia') 

IF @orgId is not null 
BEGIN
    set @esId = ( SELECT externalSystemId FROM [core].[externalSystem] WHERE  name = 'sms/australia')
    IF @esId is null
    begin
        set @esId = 1 + isnull(( SELECT max(externalSystemId) FROM [core].[externalSystem]), 0)

	    INSERT INTO [core].externalSystem(externalSystemId, name, link, organizationId, isActive, isDeleted, dateCreated, externalSystemTypeId)
	    VALUES (@esId, 'sms/australia', null, @orgId, 1, 0, getDate(), @systemTypeId)        
    end

END

set @orgId = (select actorId from customer.organization where organizationName = 'Bulgaria') 

SET @systemTypeId = (SELECT [externalSystemTypeId] FROM [core].[externalSystemType] WHERE [name] = 'LDAP')

IF @orgId is not null 
BEGIN     
    set @esId = ( SELECT externalSystemId FROM [core].[externalSystem] WHERE  name = 'LDAP Bulgaria')
    IF @esId is null
    begin
        set @esId = 1 + isnull(( SELECT max(externalSystemId) FROM [core].[externalSystem]), 0)

	    INSERT INTO [core].externalSystem(externalSystemId, name, link, organizationId, isActive, isDeleted, dateCreated, externalSystemTypeId, hostNameIp, port, isVisible, serverTimeout)
	    VALUES (@esId, 'LDAP Bulgaria', null, @orgId, 1, 0, getDate(), @systemTypeId, '192.168.133.100', 389, 0, 10)        
    end
    
    set @euId = (select externalUserId from [user].externalUser where externalSystemId = @esId and userName = 'LDAPBulgaria')
    if @euId is null
    begin 
        insert into [user].externalUser(externalSystemId, userAlias, userName, password, cryptArgs, isGeneric, isActive, isDeleted, dateCreated, createdBy, isSystem)
        values(@esId, 'LDAP Bulgaria', 'LDAPBulgaria', 'da15c0bf65dba407a116a38fe9f33128', '{"algorithm":"aes192","dataEnc":"utf8","encryptedEnc":"hex"}', 1, 1, 0, getdate(), @sa, 1)

        set @euId = SCOPE_IDENTITY()
    end  
END


set @orgId = (select actorId from customer.organization where organizationName = 'Software Group') 

SET @systemTypeId = (SELECT [externalSystemTypeId] FROM [core].[externalSystemType] WHERE [name] = 'SMTP')

IF @orgId is not null 
BEGIN     
    set @esId = ( SELECT externalSystemId FROM [core].[externalSystem] WHERE  name = 'SMTP Gmail')
    IF @esId is null
    begin
        set @esId = 1 + isnull(( SELECT max(externalSystemId) FROM [core].[externalSystem]), 0)

	    INSERT INTO [core].externalSystem(externalSystemId, name, link, organizationId, isActive, isDeleted, dateCreated, externalSystemTypeId, hostNameIp, isVisible)
	    VALUES (@esId, 'SMTP Gmail', null, @orgId, 1, 0, getDate(), @systemTypeId, 'smtp://smtp.gmail.com', 1)        
    end
    
    set @euId = (select externalUserId from [user].externalUser where externalSystemId = @esId and userName = 'sgteamtux@gmail.com')
    if @euId is null
    begin 
        insert into [user].externalUser(externalSystemId, userAlias, userName, password, cryptArgs, isGeneric, isActive, isDeleted, dateCreated, createdBy, isSystem)
        values(@esId, 'SMTP SG', 'sgteamtux@gmail.com', '412fa9c0deb26b168cef6572d0af75ca', '{"algorithm":"aes192","dataEnc":"utf8","encryptedEnc":"hex"}', 1, 1, 0, getdate(), @sa, 1)

        set @euId = SCOPE_IDENTITY()
    end  
END
*/