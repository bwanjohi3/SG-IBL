CREATE TABLE [card].[applicationAccount]( --table that stores which accounts are linked to the application
    applicationAccountId [int] IDENTITY(1,1) NOT NULL, --the unique key
    applicationId int NOT NULL, -- the application id
    accountId int NULL, -- account id
    isPrimary bit NULL, -- whether this account is primary
    createdBy bigint NOT NULL, -- who added the account for the application
    createdOn datetime2(0) NOT NULL, -- when the account was added
    updatedOn datetime2(0) NULL, -- when was last updated
    updatedBy bigint NULL, -- who made the last update
    accountNumber varchar(50) NULL, -- the account number
    accountTypeName nvarchar(50) NULL, -- the name of the account (the product)
    currency nvarchar(50) NULL, -- in which currency is this account
    accountOrder tinyint, -- in which order the accounts will appear 
    accountLinkId tinyint, -- as what kind of type the account is linked - savings, current, loan..    
    CONSTRAINT [PK_card_applicationAccount] PRIMARY KEY CLUSTERED (applicationAccountId),
    CONSTRAINT [fk_applicationAccountId_accountLink] FOREIGN KEY(accountLinkId) REFERENCES [card].accountLink (accountLinkId),
    CONSTRAINT [fk_applicationId_application] FOREIGN KEY (applicationId) REFERENCES [card].[application] (applicationId)
)