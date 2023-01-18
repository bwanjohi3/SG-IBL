CREATE TABLE [card].periodicCardFee( -- table that stores information when fee is charged for card product
    periodicCardFeeId int NOT NULL, -- product fee id
    [name] nvarchar(50) NOT NULL, -- fee charge period 
 CONSTRAINT PK_periodicCardFee PRIMARY KEY CLUSTERED (periodicCardFeeId)
 )
