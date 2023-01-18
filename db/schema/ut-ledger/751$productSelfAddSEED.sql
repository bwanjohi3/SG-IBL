IF EXISTS (SELECT * FROM ledger.product WHERE name = 'selfAdd')
    BEGIN
     UPDATE ledger.product
     SET name = 'selfRegistration'
     WHERE name = 'selfAdd'
    END

    BEGIN TRY
    IF NOT EXISTS (SELECT value FROM core.configuration WHERE [key] = 'customerbranchSelfAdd')
     RAISERROR('ThereAreNotAllTheNecessaryParameters', 16, 1);

 IF NOT EXISTS (SELECT * FROM ledger.product WHERE name = 'selfRegistration')
    BEGIN 
        DECLARE @currencyId int = (SELECT value FROM core.configuration WHERE [key] = 'currencyIdSelfAdd')

        DECLARE @periodicFeeId bigint = (SELECT itemNameId FROM [core].[itemName] WHERE itemName LIKE 'Monthly')

        DECLARE @businessUnit bigint = (SELECT value FROM core.configuration WHERE [key] = 'customerbranchSelfAdd')

        DECLARE @customerTypeId int = (SELECT customerTypeNumber FROM [customer].[customerType] WHERE customerTypeId = 'individual')

        DECLARE @productTypeId  bigint = (SELECT pt.productTypeId 
                                    FROM ledger.productType pt 
                                    JOIN core.itemName a ON a.itemNameId = pt.productTypeId
                                    WHERE itemname = 'mwallet')

        DECLARE @languageId bigint = (select c.[value] FROM core.configuration c WHERE [key] = 'languageIdSelfAdd')

        DECLARE @customerCategoryId int = (SELECT customerCategoryId FROM [customer].[customerCategory] WHERE name = 'Customer')
 
        DECLARE @minAccountOpeningBalance money = 20

        DECLARE @userId bigint = (SELECT actorId FROM [user].[hash] WHERE identifier='sa')

        DECLARE @kycId smallint = (SELECT cast (value AS  smallint) FROM core.configuration WHERE [key] = 'customerKycIdSelfAdd')

        DECLARE @productId smallint 
        DECLARE @currentVersion bigint 
        DECLARE @productName nvarchar (200) = 'selfRegistration'
 
        declare @product ledger.productTT 
        insert into @product (name, itemNameId, productCode, customerTypeId, businessUnitId, currencyId, productTypeId, startDate, endDate, minCustomerAge, maxCustomerAge, minAccountBalance, maxAccountBalance, minAccountOpeningBalance, accountDormantDays, accountPendingDays, periodicFeeId, statusId, isEnabled, isDeleted, createdBy, createdOn, updatedBy, updatedOn)

        values(@productName, NULL, NULL, @customerTypeId, @businessUnit, @currencyId, @productTypeId, DATEADD (DD,-1,GETDATE()), NULL, NULL, NULL, NULL, NULL, @minAccountOpeningBalance, NULL, NULL, @periodicFeeId,'approved' , 1, 0, @userId, getdate (), NULL, getdate ())

        declare @kyc core.arrayNumberList
        insert into @kyc select @kycId

        declare @customerCategory core.arrayNumberList
        insert into @customerCategory SELECT @customerCategoryId

        DECLARE  @productGroupCode NVARCHAR(10) = (SELECT cin.itemCode 
                                                      FROM [core].[itemName] cin
                                            JOIN [core].[itemName] cinn ON cin.itemNameId = cinn.parentItemNameId
                                                      WHERE cinn.itemNameId = @productTypeId)
        DECLARE  @productTypeCode NVARCHAR(10) = (SELECT itemCode 
                                                       FROM [core].[itemName] cin
                                                       WHERE cin.itemNameId = @productTypeId)
        DECLARE @productCodeNumber INT = (SELECT lastProductNumber FROM [ledger].[productType] WHERE productTypeId = @productTypeId) + 1

        DECLARE @productCode NVARCHAR(20) = @productGroupCode + @productTypeCode + REPLICATE('0', 4 - LEN(CONVERT(NVARCHAR(10), @productCodeNumber))) + CONVERT(NVARCHAR(10), @productCodeNumber)
    
        declare @itemNameId bigint = (
       
       select i.itemNameId
            from core.itemName i 
          join core.itemType it ON it.itemTypeId = i.itemTypeId
            JOIN @product p ON i.itemName = p.name AND p.businessUnitId = i.organizationId 
            WHERE alias = 'accountProduct'
          AND i.isEnabled = 1)
          
        BEGIN TRANSACTION
            UPDATE t
            SET lastProductNumber = @productCodeNumber
            FROM [ledger].[productType] t
            WHERE productTypeId = @productTypeId

          IF @itemNameId IS NULL 
          BEGIN 
            insert into core.itemName(itemTypeId, itemName, organizationId, isEnabled)
            select itemTypeId, p.name, businessUnitId, 1
            from core.itemType
            cross apply @product p
            WHERE alias = 'accountProduct'

            set @itemNameId = SCOPE_IDENTITY()
          END 

          IF NOT EXISTS (SELECT * FROM core.itemTranslation it WHERE itemNameTranslation = @productName AND itemNameId = @itemNameId AND it.languageId = @languageId )
          BEGIN 
            insert into core.itemTranslation (languageId, itemNameId, itemNameTranslation)
            select @languageId, @itemNameId, name
            from  @product
          END 

            INSERT INTO [ledger].[product]([name], itemNameId, productCode, customerTypeId, businessUnitId, currencyId, productTypeId, startDate, endDate, minCustomerAge, maxCustomerAge, minAccountBalance, maxAccountBalance, minAccountOpeningBalance, accountDormantDays, accountPendingDays, periodicFeeId, isEnabled, isDeleted, createdBy, createdOn, statusId, updatedOn, updatedBy)
            SELECT [name], @itemNameId, @productCode, customerTypeId, businessUnitId, currencyId, productTypeId, 
                    startDate, endDate, minCustomerAge, maxCustomerAge, minAccountBalance, maxAccountBalance, minAccountOpeningBalance, 
                    accountDormantDays, accountPendingDays, periodicFeeId, 1, 0, @userId, GETDATE(), 'approved', getdate() ,@userId
            FROM @product

            SET @productId = SCOPE_IDENTITY()

            INSERT INTO [ledger].[productKyc](productId, kycId)
            SELECT @productId, [value]
            FROM @kyc

            INSERT INTO [ledger].[productCustomerCategory](productId, customerCategoryId)
            SELECT @productId, [value]
            FROM @customerCategory
       COMMIT TRANSACTION
    
        if @productId is not null 
        BEGIN
            MERGE INTO [core].[configuration] AS target
            USING 
            (
                VALUES ('productIdSelfAdd', @productId, 'Default product for self registration')
            ) AS source ([key], [value], [description])
            ON target.[key] = source.[key] 
            WHEN MATCHED THEN 
                UPDATE SET target.[value] = source.[value]
            WHEN NOT MATCHED BY TARGET THEN
                INSERT ([key], [value], [description])
                VALUES ([key], [value], [description]);
        END

    END 
        
    END TRY
    BEGIN CATCH
     IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION
 RAISERROR('ThereAreNotAllTheNecessaryParameters', 16, 1);

END CATCH

