CREATE TABLE [pos].[keyChainItem](
    keyChainItemId INT IDENTITY(1, 1) NOT NULL,
    keyChainId INT NOT NULL,
    keyChainItemTypeId INT NOT NULL,
    value VARCHAR(33) NOT NULL,
    checkValue VARCHAR(6),
    CONSTRAINT [pkKeyChainItem] PRIMARY KEY CLUSTERED (keyChainItemId ASC),    
    CONSTRAINT fkKeyChainItem_keyChainId FOREIGN KEY(keyChainId) REFERENCES [pos].[keyChain] (keyChainId),
    CONSTRAINT fkKeyChainItem_itemTypeId FOREIGN KEY(keyChainItemTypeId) REFERENCES [pos].[keyChainItemType] (keyChainItemTypeId)
)
