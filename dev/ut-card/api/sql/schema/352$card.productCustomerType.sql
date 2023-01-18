CREATE TABLE [card].[productCustomerType] -- table that stores configuration which product is available for which customer type
(
    productCustomerTypeId int IDENTITY (1,1) not null, -- id of the product account type
    productId int NOT NULL, -- id of the product
    customerTypeId int not null , -- id of the customer type
    CONSTRAINT [pkProductCustomerTypeId] PRIMARY KEY CLUSTERED (productCustomerTypeId),
    CONSTRAINT fkProductCustomerType_Product FOREIGN KEY(productId) REFERENCES [card].[product] (productId)
)



