CREATE TABLE [card].[cardAccount](  --table that stores which accounts are linked to the card
    cardAccountId int IDENTITY,  --the table's unique key
    cardId bigint NOT NULL, -- the id of the card
    accountId int, -- account id
    accountNumber varchar(50) NULL, -- the account number
    accountTypeName nvarchar(50) NULL, -- the name of the account (the product)
    currency nvarchar(50) NULL, -- in which currency is this account
    isPrimary bit NULL, -- whether this account is primary
    createdBy bigint NOT NULL, -- who added the account for the card
    createdOn datetime2(0) NOT NULL, -- when the account was added
    updatedOn datetime2(0) NULL, -- when was last updated
    updatedBy bigint NULL, -- who made the last update    
    accountOrder tinyint, -- in which order the accounts will appear 
    accountLinkId tinyint, -- as what kind of type the account is linked - savings, current, loan..    
    CONSTRAINT pkCardAccount PRIMARY KEY CLUSTERED (cardAccountId),
    CONSTRAINT fkCardAccount_Card FOREIGN KEY (cardId) REFERENCES [card].[card] (cardId),
    CONSTRAINT fkCardAccount_Account FOREIGN KEY (accountId) REFERENCES customer.account (accountId),
    CONSTRAINT fkCardAccount_AccountLinkId FOREIGN KEY(accountLinkId) REFERENCES [card].accountLink (accountLinkId)
)