DECLARE @ConstraintName nvarchar(200) -- variable is used to assign default constraint name

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'areAllCardsGenerated' and Object_ID = Object_ID(N'card.batch'))
BEGIN
  ALTER TABLE [card].batch ADD [areAllCardsGenerated] BIT NOT NULL DEFAULT(1)
END 

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'acceptanceDate' and Object_ID = Object_ID(N'card.card'))
BEGIN
  ALTER TABLE [card].card ADD acceptanceDate DATE NULL
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'pinRetriesDailyLimit' and Object_ID = Object_ID(N'card.product'))
BEGIN
  ALTER TABLE [card].product ADD pinRetriesDailyLimit tinyint NOT NULL DEFAULT 3
END
--------------------------------------------------------------------------------------------------------------------------------------------
/*update card.product table - remove all columns that move to card.type table*/
IF EXISTS (select 1 from sys.objects where [name] = 'cardType' AND SCHEMA_ID = SCHEMA_ID (N'card'))
    BEGIN 
        -- insert all rows from cardType into cardBrand
        SET IDENTITY_INSERT [card].cardBrand ON;
        INSERT INTO [card].cardBrand (cardBrandId, [name])
        SELECT ct.cardTypeId, ct.[name] FROM [card].cardType ct
            LEFT JOIN [card].cardBrand cb on cb.cardBrandId = ct.cardTypeId
        WHERE cb.[name] IS NULL
        SET IDENTITY_INSERT [card].cardBrand OFF;

        -- drop foreign keys refering to cardType and drop table
        IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fkproduct_typeId')
            BEGIN
                ALTER TABLE [card].[product] DROP CONSTRAINT fkproduct_typeId
                DROP TABLE [card].cardType
            END      
    END
   
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fkproduct_bin')
    BEGIN
        ALTER TABLE [card].[product] DROP CONSTRAINT fkproduct_bin        
    END     

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fkproduct_typeId')
    BEGIN
        ALTER TABLE [card].[product] DROP CONSTRAINT fkproduct_typeId        
    END 

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fkproduct_typeId')
    BEGIN
        ALTER TABLE [card].[product] DROP CONSTRAINT fkproduct_typeId        
    END
  
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fkproduct_ownershipTypeId')
    BEGIN
        ALTER TABLE [card].[product] DROP CONSTRAINT fkproduct_ownershipTypeId        
    END
    
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fkproduct_cardNumberConstructionId')
    BEGIN
        ALTER TABLE [card].[product] DROP CONSTRAINT fkproduct_cardNumberConstructionId        
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'cvv1' and Object_ID = Object_ID(N'card.product'))
    BEGIN
        --Drop default value constraint    
        SELECT @ConstraintName = Name FROM SYS.DEFAULT_CONSTRAINTS
        WHERE PARENT_OBJECT_ID = OBJECT_ID('card.product')
        AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns
                                WHERE NAME = N'cvv1'
                                AND object_id = OBJECT_ID(N'card.product'))

        IF @ConstraintName IS NOT NULL
            BEGIN
                EXEC ('ALTER TABLE card.product DROP CONSTRAINT ' + @ConstraintName)
            END
         ALTER TABLE [card].product DROP COLUMN cvv1
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'cvv2' and Object_ID = Object_ID(N'card.product'))
    BEGIN
        --Drop default value constraint    
    SELECT @ConstraintName = Name FROM SYS.DEFAULT_CONSTRAINTS
    WHERE PARENT_OBJECT_ID = OBJECT_ID('card.product')
    AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns
                            WHERE NAME = N'cvv2'
                            AND object_id = OBJECT_ID(N'card.product'))

    IF @ConstraintName IS NOT NULL
        BEGIN
            EXEC ('ALTER TABLE card.product DROP CONSTRAINT ' + @ConstraintName)
        END
      ALTER TABLE [card].product DROP COLUMN cvv2
    END  

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'icvv' and Object_ID = Object_ID(N'card.product'))
    BEGIN
        --Drop default value constraint    
    SELECT @ConstraintName = Name FROM SYS.DEFAULT_CONSTRAINTS
    WHERE PARENT_OBJECT_ID = OBJECT_ID('card.product')
    AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns
                            WHERE NAME = N'icvv'
                            AND object_id = OBJECT_ID(N'card.product'))

    IF @ConstraintName IS NOT NULL
        BEGIN
            EXEC ('ALTER TABLE card.product DROP CONSTRAINT ' + @ConstraintName)
        END      
      ALTER TABLE [card].product DROP COLUMN icvv
    END  

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'cavv' and Object_ID = Object_ID(N'card.product'))
    BEGIN
       --Drop default value constraint    
    SELECT @ConstraintName = Name FROM SYS.DEFAULT_CONSTRAINTS
    WHERE PARENT_OBJECT_ID = OBJECT_ID('card.product')
    AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns
                            WHERE NAME = N'cavv'
                            AND object_id = OBJECT_ID(N'card.product'))

    IF @ConstraintName IS NOT NULL
        BEGIN
            EXEC ('ALTER TABLE card.product DROP CONSTRAINT ' + @ConstraintName)
        END   
      ALTER TABLE [card].product DROP COLUMN cavv
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'cardTypeId' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN cardTypeId
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'binId' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN binId
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'cardNumberConstructionId' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN cardNumberConstructionId
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'ownershipTypeId' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN ownershipTypeId
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'termMonth' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN termMonth
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'cipher' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN cipher
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'pvk' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN pvk
    END 
  
IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'cvk' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN cvk
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'decimalisation' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN decimalisation
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'flow' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN flow
    END  
  
IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'issuerId' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN issuerId
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'serviceCode1' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN serviceCode1
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'serviceCode2' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN serviceCode2
    END       
     
IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'serviceCode3' and Object_ID = Object_ID(N'card.product'))
    BEGIN       
      ALTER TABLE [card].product DROP COLUMN serviceCode3
    END
--------------------------------------------------------------------------------------------------------------------------------------------
/*update card.application table - add typeId*/
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'typeId' AND OBJECT_ID = OBJECT_ID ('card.application'))
    BEGIN
        ALTER TABLE [card].[application] ADD typeId int NULL
    END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkApplication_typeId')
    BEGIN 
        ALTER TABLE [card].[application] ADD CONSTRAINT fkApplication_typeId FOREIGN KEY(typeId) REFERENCES [card].[type] ([typeId])
    END   
--------------------------------------------------------------------------------------------------------------------------------------------
/*update card.batch table - remove productId and add typeId*/
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'typeId' AND OBJECT_ID = OBJECT_ID ('card.batch'))
    BEGIN
        ALTER TABLE [card].[batch] ADD typeId int NULL
    END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkbatch_typeId')
    BEGIN 
        ALTER TABLE [card].[batch] ADD CONSTRAINT fkbatch_typeId FOREIGN KEY(typeId) REFERENCES [card].[type] ([typeId])
    END 
    
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fkbatch_productId')
    BEGIN
        ALTER TABLE [card].[batch] DROP CONSTRAINT fkbatch_productId        
    END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'productId' and Object_ID = Object_ID(N'card.batch'))
    BEGIN       
      ALTER TABLE [card].[batch] DROP COLUMN productId
    END   
--------------------------------------------------------------------------------------------------------------------------------------------
/*update card.card table - add typeId, mkac, ivac*/
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'typeId' AND OBJECT_ID = OBJECT_ID ('card.card'))
    BEGIN
        ALTER TABLE [card].[card] ADD typeId int NULL
    END
 
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkCard_CardType')
    BEGIN 
        ALTER TABLE [card].[card] ADD CONSTRAINT fkCard_CardType FOREIGN KEY(typeId) REFERENCES [card].[type] ([typeId])
    END
    
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'mkac' AND OBJECT_ID = OBJECT_ID ('card.card'))
    BEGIN
        ALTER TABLE [card].[card] ADD mkac varchar(64) NULL
    END
 
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'ivac' AND OBJECT_ID = OBJECT_ID ('card.card'))
    BEGIN
        ALTER TABLE [card].[card] ADD ivac varchar(64) NULL
    END
--------------------------------------------------------------------------------------------------------------------------------------------
/*update card.bin table*/    
IF EXISTS( SELECT 1 FROM sys.objects WHERE Name = N'uc_Bin' )
    BEGIN
        ALTER TABLE  [card].[bin] DROP CONSTRAINT uc_Bin
    END  

IF EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'bin' AND OBJECT_ID = OBJECT_ID ('card.bin'))
    BEGIN
         exec sp_rename 'card.bin.bin', 'startBin', 'COLUMN'
    END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'endBin' AND OBJECT_ID = OBJECT_ID ('card.bin'))
    BEGIN
        ALTER TABLE  [card].[bin] ADD endBin varchar(6) NULL
    END 

IF NOT EXISTS( SELECT 1 FROM sys.objects WHERE Name = N'uc_startBin' )
    BEGIN
        ALTER TABLE  [card].[bin] ADD CONSTRAINT uc_startBin UNIQUE (startBin ASC)
    END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'ownershipTypeId' AND OBJECT_ID = OBJECT_ID ('card.bin'))
    BEGIN
        ALTER TABLE  [card].[bin] ADD ownershipTypeId BIGINT NULL
    END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_CardBin_ownershipTypeId')
    BEGIN 
        ALTER TABLE [card].[bin] ADD CONSTRAINT fk_CardBin_ownershipTypeId FOREIGN KEY(ownershipTypeId) REFERENCES [card].ownershipType(ownershipTypeId)
    END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'typeId' AND OBJECT_ID = OBJECT_ID ('card.bin'))
    BEGIN
        ALTER TABLE  [card].[bin] ADD typeId INT NULL
    END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_CardBin_typeId')
    BEGIN 
        ALTER TABLE [card].[bin] ADD CONSTRAINT fk_CardBin_typeId FOREIGN KEY(typeId) REFERENCES [card].[type](typeId)
    END
--------------------------------------------------------------------------------------------------------------------------------------------        
--SELECT * FROM sys.foreign_keys WHERE referenced_object_id = Object_ID(N'card.cardType') --name = 'fkproduct_typeId'
--SELECT * FROM sys.objects where  Object_ID = Object_ID(N'card.cardType')
