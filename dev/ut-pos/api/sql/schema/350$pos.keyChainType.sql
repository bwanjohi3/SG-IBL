CREATE TABLE [pos].[keyChainType](
    keyChainTypeId INT NOT NULL,
    name NVARCHAR(50) NOT NULL,
    CONSTRAINT [pkKeyChainType] PRIMARY KEY CLUSTERED (keyChainTypeId ASC),
    CONSTRAINT [ukKeyChainTypeName] UNIQUE (name ASC)
)
