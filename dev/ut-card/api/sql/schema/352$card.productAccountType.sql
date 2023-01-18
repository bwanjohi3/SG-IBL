CREATE TABLE [card].[productAccountType] -- table that stores configuration which product is available for which account type
(
    productAccountTypeId int IDENTITY (1,1) not null, -- id of the product account type
    productId int NOT NULL, -- id of the product
    accountTypeId int not null , -- id of the account type
    CONSTRAINT [pkProductAccountTypeId] PRIMARY KEY CLUSTERED (productAccountTypeId),
    CONSTRAINT fkProductAccountType_Product FOREIGN KEY(productId) REFERENCES [card].[product] (productId)
)


