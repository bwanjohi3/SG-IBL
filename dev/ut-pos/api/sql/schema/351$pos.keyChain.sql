    CREATE TABLE [pos].[keyChain](
    keyChainId INT IDENTITY(1, 1) NOT NULL,
    name NVARCHAR (50) NOT NULL,
    keyChainTypeID INT NOT NULL,
    CONSTRAINT [pkKeyChain] PRIMARY KEY CLUSTERED (keyChainId ASC),
    CONSTRAINT [ukKeyChainName] UNIQUE (name ASC),
    CONSTRAINT fkKeyChain_keyChainTypeID FOREIGN KEY(keyChainTypeID) REFERENCES [pos].[keyChainType] (keyChainTypeID)
)
