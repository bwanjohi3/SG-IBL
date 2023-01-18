CREATE TABLE [pos].[keyChainItemType](
    keyChainItemTypeId INT IDENTITY(1, 1) NOT NULL,
    name NVARCHAR (50) NOT NULL,
    CONSTRAINT [pkKeyChainItemType] PRIMARY KEY CLUSTERED (keyChainItemTypeId ASC),
    CONSTRAINT [ukKeyChainItemTypeName] UNIQUE (name ASC)
)
