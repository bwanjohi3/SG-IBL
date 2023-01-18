CREATE TABLE [card].cardBrand( --table that stores information about all card brand
    cardBrandId int IDENTITY(1,1) NOT NULL, -- id of card brand
    name varchar(100) NOT NULL, -- name of card brand
 CONSTRAINT pkcardBrand PRIMARY KEY CLUSTERED (cardBrandId ASC)
)
