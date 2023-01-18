CREATE TABLE [card].[application]( -- this table stores information about all applications
    applicationId int IDENTITY, -- id of the application
    customerId bigint NULL, -- id of the customer 
    customerNumber nvarchar(10) NULL, -- customer number
    customerName nvarchar(100) NULL, -- name of the customer
    holderName nvarchar(30) NULL, -- name that will be printed on the card
    targetBranchId bigint NULL, -- id of the branch where the card will be delivered
    branchId BIGINT NOT NULL, -- the branch of the user (teller) that created the application
    statusId tinyint NOT NULL, -- status of the application
    batchId int NULL, -- id of the batch that will produce the card
    productId int NULL, -- card product
    typeId int NULL, -- card type
    createdBy bigint NOT NULL, -- the user who created the application
    createdOn datetime2(0) NOT NULL, -- the creation date of the application
    updatedOn datetime2(0) NULL, -- the last modification date of the application
    updatedBy bigint NULL, -- the user who last updated the application
    personId bigint NULL, -- id of the person who will be using the card
    personNumber nvarchar(10) NULL, -- person number
    personName nvarchar(100) NULL, -- name of the person who will be using the card
    embossedTypeId tinyint NOT NULL, -- application type ,i.e name/no name
    reasonId tinyint, -- reject/decline reason
    comments nvarchar(1000) NULL, -- reject/decline user comments
    previousStatusId tinyint, -- previous state of the application
    issuingBranchId bigint NULL, -- id of the branch that issued the application
    makerComments nvarchar(MAX) NULL, -- comments for application updates
    CONSTRAINT PK_card_application PRIMARY KEY CLUSTERED (applicationId),
    CONSTRAINT fkapplication_statusId FOREIGN KEY(statusId) REFERENCES [card].[status] (statusId),
    CONSTRAINT fkapplication_embossedTypeId  FOREIGN KEY(embossedTypeId) REFERENCES [card].embossedType (embossedTypeId),
    CONSTRAINT fkApplication_reasonId FOREIGN KEY (reasonId) REFERENCES [card].reason (reasonId),
    CONSTRAINT fkApplication_product FOREIGN KEY (productId) REFERENCES [card].product (productId),
    CONSTRAINT fkApplication_typeId FOREIGN KEY (typeId) REFERENCES [card].type (typeId),
    CONSTRAINT fkApplication_StatusPreviousId FOREIGN KEY (previousStatusId) REFERENCES [card].[status] (statusId),
    CONSTRAINT fkApplication_batchId FOREIGN KEY (batchId) REFERENCES [card].[batch] (batchId)
)