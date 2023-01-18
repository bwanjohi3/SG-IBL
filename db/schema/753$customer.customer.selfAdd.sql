ALTER PROCEDURE customer.[customer.selfAdd] -- adds a new customer with provided parameters
    @firstName NVARCHAR(50), --first name of the registered user
    @lastName NVARCHAR(50), --last name of the registered user
    @dateOfBirth DATE, --birth date of the registered user
    @gender NVARCHAR(20), --gender of the registered user
    @phoneNumber VARCHAR(50), --phone number of the registered user
    @documentTypeId VARCHAR(20), --document type of the registered user
    @documentNumber VARCHAR(20), --document number of the registered user
    @customerNumber NVARCHAR(20), --customer number of the registered user
    @countryCode CHAR(2) = NULL, -- information about the state of the client
    @lat VARCHAR(50) = NULL, --GPS coordinates of the registered user
    @lng VARCHAR(50) = NULL, --GPS coordinates of the registered user
    @actorDevice [user].actorDeviceTT READONLY, -- deviceId-s
    @mnoId TINYINT = NULL, --Mobile operator of the registered user
    @isDebugMode BIT = 0, --this is param when testing 
    @actorId BIGINT = NULL, -- the id of the customer, that will be created
    @noResultSet BIT = 0, -- a flag to show if result is expected
    @businessUnit BIGINT = NULL, -- organization to assigned customer
    @languageid BIGINT = NULL, -- language for customer 
    @passPolicyId INT = NULL, -- policy which gives customer
    @productId SMALLINT = NULL, -- product which gives account
    @accountName NVARCHAR(255) = NULL, -- name which gives account
    @createByAccount bigint = NULL, -- default user which create account
    @attachment document.attachmentTT READONLY,-- receive the entered fields for attachement for the document
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @callParams XML

--declare table 
DECLARE @customerTT customer.customerTT, @personTT customer.personTT, @jointTT customer.jointTT, @organizationTT customer.organizationTT, @accountTT ledger.accountTT, @emailTT customer.emailTT, @phoneTT customer.phoneTT, @addressTT customer.addressTT, @hashTT [user].hashTT, @documentTT document.documentTT, @actorDeviceTT [user].actorDeviceTT, @attachmentTT document.attachmentTT

DECLARE @DisableAccountMCH bit = 1
DECLARE @personId bigint 
DECLARE @accountId BIGINT
DECLARE @stateId TINYINT
DECLARE @stateCode nvarchar(200)
DECLARE @currency NVARCHAR(200)
DECLARE @ut5Key VARCHAR(100)
DECLARE @normalizedPhone VARCHAR(100)
DECLARE @rolesID bigint = (SELECT actorId FROM [user].[role] r JOIN core.configuration c ON r.name = c.[value] WHERE c.[key] = 'roleIdForSelfAdd')

DECLARE @resultDocument TABLE
(
    documentId BIGINT,
    docSystemId BIGINT
)
DECLARE @today DATETIMEOFFSET = SYSDATETIME()
BEGIN TRY
    --------filling static data----------
    IF @languageid IS NULL
        SET @languageid =
        (
            SELECT value
            FROM core.configuration
            WHERE [key] = 'languageIdSelfAdd'
        )

    IF @passPolicyId IS NULL
        SET @passPolicyId =
        (
            SELECT value
            FROM core.configuration
            WHERE [key] = 'policyIdSelfAdd'
        )

    DECLARE @accountTypeId INT =
    (
        SELECT value
        FROM core.configuration
        WHERE [key] = 'accountTypeIdSelfAdd'
    )

    IF @businessUnit IS NULL
        SET @businessUnit =
        (
            SELECT value
            FROM core.configuration
            WHERE [key] = 'customerbranchSelfAdd'
        )


    IF @productId IS NULL
        SET @productId =
        (
            SELECT value
            FROM core.configuration
            WHERE [key] = 'productIdSelfAdd'
        )

	IF @accountName IS NULL
        SET @accountName = 'selfRegistration'
        
	 IF @createByAccount IS NULL
        SET @createByAccount = (SELECT actorId FROM customer.person WHERE firstName = 'Super' AND lastName = 'Admin')
	 

	 --set account state 
       IF (SELECT minAccountOpeningBalance FROM ledger.product WHERE productId = @productId) = 0
            SET @stateCode = 'active'
       ELSE
            SET @stateCode = 'inactive'

        set @stateID = 
        (
            SELECT s.stateId
            FROM ledger.state AS s
            JOIN core.itemName AS i ON s.itemNameId = i.itemNameId
            WHERE itemCode = @stateCode
        )


        SET  @currency =
        (
            SELECT i.itemCode
            FROM ledger.product AS p
            JOIN core.currency AS c ON c.currencyId = p.currencyId
            JOIN core.itemName AS i ON i.itemNameId = c.itemNameId
		  WHERE productId = @productId
        )


    --checks
    IF EXISTS
    (
        SELECT *
        FROM customer.phone
        WHERE phoneNumber = @phoneNumber
    )
    BEGIN
        RAISERROR('customer.selfAddPhoneDuplicate', 16, 1);
    END

    IF EXISTS
    (
        SELECT *
        FROM customer.person
        WHERE firstName = @firstName
              AND lastName = @lastName
              AND dateOfBirth = @dateOfBirth
    )
    BEGIN
        RAISERROR('customer.selfAddPersonDuplicate', 16, 1);
    END

    IF EXISTS
    (
        SELECT *
        FROM document.document
        WHERE documentNumber = @documentNumber
              AND documentTypeId = @documentTypeId
    )
    BEGIN
        RAISERROR('customer.selfAddDocumentDuplicate', 16, 1);
    END

    IF EXISTS
    (
        SELECT *
        FROM [user].actorDevice AS d
        JOIN @actorDevice AS dd ON d.imei = dd.imei
    )
    BEGIN
        RAISERROR('customer.selfAddImeiDuplicate', 16, 1);
    END

    IF (SELECT COUNT(1) FROM @attachment) > 1
    BEGIN
        RAISERROR('customer.selfAddMoreThanOneAttachment', 16, 1);
    END

    --customer
    IF @customerNumber IS NULL
        SET @customerNumber = ABS(CAST(CAST(NEWID() AS VARBINARY) AS INT))
    --------filling of any data----------
    INSERT INTO @customerTT (customerNumber, customerTypeId, kycId, stateId, statusId, countryId, organizationId, createdOn)
    SELECT @customerNumber,
    (
        SELECT value
        FROM core.configuration
        WHERE [key] = 'customerTypeSelfAdd'
    ),
    (
        SELECT value
        FROM core.configuration
        WHERE [key] = 'customerKycIdSelfAdd'
    ),
    (
        SELECT value
        FROM core.configuration
        WHERE [key] = 'customerStateIdSelfAdd'
    ),
    (
        SELECT value
        FROM core.configuration
        WHERE [key] = 'customerStatusIdSelfAdd'
    ),
    (
        SELECT countryId
        FROM customer.country
        WHERE countryCode = @countryCode
    ), @businessUnit, SYSDATETIMEOFFSET()

    --person
    INSERT INTO @personTT (firstName, lastName, dateOfBirth, gender, isEnabled, isDeleted)
    SELECT @firstName, @lastName, @dateOfBirth, @gender, 1, 0

    --account

        --INSERT INTO @accountTT (ownerId, accountNumber, productId, businessUnitId, accountName, linkedAccount, statusId, isDeleted, createdBy, createdOn)
        --SELECT @actorId, NULL, @productId, @businessUnit, @accountName, 'active', 0, @createByAccount, GETDATE()

    --phone
    INSERT INTO @phoneTT (phoneNumber, phoneTypeId, statusId, mnoId, isPrimary)
    SELECT @phoneNumber,
    (
        SELECT value
        FROM core.configuration
        WHERE [key] = 'phoneTypeIdSelfAdd'
    ),
    (
        SELECT value
        FROM core.configuration
        WHERE [key] = 'phoneStatusIdSelfAdd'
    ),
    (
        SELECT value
        FROM core.configuration
        WHERE [key] = 'mnoSelfAdd'
    ), 1

    --check for normalization phone and whether the phone number is from the allowed mobile network operator
    
    SELECT @ut5Key = m.ut5Key, @normalizedPhone = customer.normalizePhone(p.phoneNumber, c.phonePrefix, 0)
    FROM @phoneTT p
    JOIN customer.mno m ON p.mnoId = m.mnoId
    JOIN customer.country c ON m.countryId = c.countryId
    WHERE c.phonePrefix IS NOT NULL AND p.statusId IN ('active', 'approved') AND p.isPrimary = 1
    
    IF @ut5Key IS NULL OR @normalizedPhone IS NULL 
    BEGIN
        RAISERROR('customer.unsupportedPhoneNumber', 16, 1);
    END

    INSERT INTO @actorDeviceTT (installationId, imei, pushNotificationToken, deviceModel, deviceOS)
    SELECT installationId, imei, pushNotificationToken, deviceModel, deviceOS
    FROM @actorDevice

    --generate pass
    DECLARE @token VARCHAR(200) =  CONVERT(VARCHAR(4), CONVERT(NUMERIC(4, 0), RAND() * 8999) + 1000)


    INSERT INTO @hashTT (type, identifier, algorithm, params, value, failedAttempts, lastAttempt, lastChange, expireDate, isEnabled)
    SELECT 'password', @phoneNumber, 'hash', '{"digest":"sha1"}', LOWER(CONVERT(NVARCHAR(100), HASHBYTES('SHA1', @token), 2)), 0, GETDATE(), GETDATE(), GETDATE(), 1

    DECLARE @template NVARCHAR(200) = 'customer.customer.selfAdd' -- the message template, that will be send to the user
    DECLARE @tranCounter INT = @@tranCount
    IF @tranCounter = 0
    BEGIN TRANSACTION;
    --add actor
    EXEC core.[actor.add] @actorType = 'person',
                          @actorId = @actorId OUT

    UPDATE @customerTT
    SET actorId = @actorId,
        createdBy = @actorId
    UPDATE @personTT
    SET actorId = @actorId
    UPDATE @phoneTT
    SET actorId = @actorId
    UPDATE @actorDeviceTT
    SET actorId = @actorId
    UPDATE @hashTT
    SET actorId = @actorId

    --adderess
    INSERT INTO @addressTT (actorId, value, lat, lng)
    SELECT @actorId, '', @lat, @lng

    INSERT INTO @documentTT (documentTypeId, documentNumber)
    SELECT @documentTypeId, @documentNumber

    --add user
    INSERT INTO [user].[user] (actorId, primaryLanguageId)
    VALUES (@actorId, @languageid)

    --add hash
    INSERT INTO [user].hash (actorId, type, identifier, algorithm, params, value, failedAttempts, expireDate, isEnabled)
    SELECT actorId, type, identifier, algorithm, params, value, failedAttempts, expireDate, isEnabled
    FROM @hashTT

    --customer person add
    INSERT INTO customer.person (actorId, frontEndRecordId, firstName, lastName, nationalId, dateOfBirth, placeOfBirth, nationality, gender, bioId, oldValues, udf, phoneModel, computerModel, isEnabled, isDeleted, maritalStatusId, age, middleName, educationId, employmentId, employmentDate, incomeRangeId, employerName, employerCategoryId)
    SELECT actorId, frontEndRecordId, firstName, lastName, nationalId, dateOfBirth, placeOfBirth, nationality, gender, bioId, oldValues, udf, phoneModel, computerModel, isEnabled, isDeleted, maritalStatusId, age, middleName, educationId, employmentId, employmentDate, incomeRangeId, employerName, employerCategoryId
    FROM @personTT
 
/*
    --customer account add
    INSERT INTO customer.account (actorId, accountTypeId, accountNumber, accountName, statusId, currencyId, balance, accountOpenedOn)
    SELECT @actorId, @accountTypeId, accountNumber, accountName, ISNULL(statusId, 'active'), currencyId, balance, GETDATE()
    FROM @accountTT
*/
    -- ledger account add 

    INSERT INTO ledger.account (ownerId, accountNumber, productId, businessUnitId, accountName, statusId, stateId, isDeleted, createdBy, createdOn)
    SELECT @actorId, '', @productId, @businessUnit, @accountName, 'approved', @stateId, 0, @createByAccount, GETDATE()
   
    SET @accountId = SCOPE_IDENTITY()

    UPDATE ledger.account
    SET accountNumber =  ledger.generateAccountNumber (@currency, @accountId) 
    WHERE accountId = @accountId 

    INSERT INTO ledger.accountPerson (accountId, personId, isDefault)
    SELECT @accountId, @actorId, 1
           
    INSERT INTO [ledger].[balance](accountId, createdBy, createdOn)
    SELECT @accountId, @createByAccount, getdate()

    --add role
    INSERT INTO core.actorHierarchy([subject], predicate, [object], [isDefault])
    SELECT @actorId, 'role', @rolesID, 1

    -- add phone
    INSERT INTO customer.phone (actorId, frontEndRecordId, phoneTypeId, phoneNumber, statusId, oldValues, mnoId, isPrimary)
    SELECT actorId, frontEndRecordId, phoneTypeId, phoneNumber, ISNULL(statusId, 'active'), oldValues, mnoId, isPrimary
    FROM @phoneTT

    --add address
    INSERT INTO customer.address (actorId, value, frontEndRecordId, addressTypeId, statusId, oldValues, city, lat, lng)
    SELECT actorId, value, frontEndRecordId, isnull(addressTypeId, 'home'), ISNULL(statusId, 'active'), oldValues, city, lat, lng
    FROM @addressTT

    -- add that this user is not a staff in actorProperty table
    insert into core.actorProperty(actorId, name, value)
    values(@actorId, 'typeOfUser', 'NonStaff')
   
    EXEC [user].sendNotification @actorId = @actorId,
                                 @username = @phoneNumber,
                                 @channel = NULL,
                                 @type = NULL,
                                 @template = @template,
                                 @rawData = @token,
                                 @success = 0

    --add core.actorHierarchy
    INSERT INTO core.actorHierarchy (subject, predicate, object)
    VALUES (@actorId, 'memberOf', @businessUnit)

    --add customer
    INSERT INTO customer.customer (actorId, frontEndRecordId, customerNumber, customerTypeId, kycId, stateId, statusId, createdBy, createdOn, updatedBy, updatedOn, oldValues, customerCategoryId, dao, description, cbsId, countryId, industryId, sectorId, loanCycle, organizationId, prospectClient, adminFee, udf)
    SELECT actorId, frontEndRecordId, customerNumber, customerTypeId, kycId, stateId, statusId, createdBy, createdOn, updatedBy, updatedOn, oldValues, customerCategoryId, dao, description, cbsId, countryId, industryId, sectorId, loanCycle, organizationId, prospectClient, adminFee, udf
    FROM @customerTT

    --add policy
    IF NOT EXISTS
    (
        SELECT *
        FROM policy.actorPolicy AS p
        WHERE p.actorId = @actorId
    )
        INSERT INTO policy.actorPolicy (actorId, policyId)
        VALUES (@actorId, @passPolicyId)

    -- add document number for this customer
    MERGE INTO document.document
    USING @documentTT d
    ON 1 = 0
        WHEN NOT MATCHED
          THEN INSERT(documentTypeId, statusId, expirationDate, documentNumber, description, createdDate) VALUES (d.documentTypeId, isnull(d.statusId, 'approved'), d.expirationDate, d.documentNumber, d.description, @today)
    OUTPUT INSERTED.documentId, d.documentId
           INTO @resultDocument(documentId, docSystemId);

    INSERT INTO document.actorDocument (actorId, documentId)
    SELECT @actorId, rd.documentId
    FROM @resultDocument AS rd


    INSERT INTO @attachmentTT (contentType, extension, filename, hash, documentId, attachmentSizeId, page)
    SELECT contentType, 
        extension, 
        filename, 
        hash,
        (
            SELECT documentId
            FROM @resultDocument
        ) AS documentId,
        (
            SELECT value
            FROM core.configuration
            WHERE [key] = 'attachmentSizeSelfAdd'
        ) AS attachmentSizeId, 
        1 AS page
    FROM @attachment;

    -- add document attachment for the document
    INSERT INTO document.attachment (contentType, extension, filename, hash, documentId, attachmentSizeId, page)
    SELECT contentType, extension, filename, hash, documentId, attachmentSizeId, page
    FROM @attachmentTT


    EXEC [user].[device.update] @actorDevice = @actorDeviceTT, @noResultSet = 1

    IF @tranCounter = 0
        COMMIT TRANSACTION;

    IF ISNULL(@noResultSet, 0) = 0
    BEGIN
        SELECT 'customer' AS resultSetName
        SELECT actorId, frontEndRecordId, customerNumber, customerTypeId, kycId, stateId, statusId, createdBy, createdOn, updatedBy, updatedOn, oldValues, customerCategoryId, dao, description, cbsId, countryId, industryId, sectorId, loanCycle, organizationId, prospectClient, adminFee, udf
        FROM @customerTT

    END

    IF @isDebugMode = 1
    BEGIN
        SELECT 'debugModePassword' AS resultSetName
	   SELECT @token AS 'otp'
    END

    BEGIN
       SELECT 'account' AS resultSetName;
       SELECT accountId,
            accountNumber
       FROM ledger.account
       where ownerId = @actorId;
    END

    EXEC core.auditCall @procid = @@procId,
                        @params = @callParams
END TRY
BEGIN CATCH
    IF @@tranCount > 0
        ROLLBACK TRANSACTION;
    EXEC core.error
END CATCH;