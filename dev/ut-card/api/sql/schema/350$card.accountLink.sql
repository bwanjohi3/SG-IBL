CREATE TABLE [card].accountLink ( --table that stores information about account link type
    accountLinkId tinyint IDENTITY(1,1) NOT NULL, -- id of link type
    [itemNameId] bigint NOT NULL, -- foreign key yo itemName for link type
    CONSTRAINT pkcardAccountLink PRIMARY KEY CLUSTERED (accountLinkId ASC),
    CONSTRAINT fkCardAccountLink_CoreItemName FOREIGN KEY(itemNameId) REFERENCES [core].[itemName] (itemNameId)
)
