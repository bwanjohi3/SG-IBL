CREATE TABLE [card].ownershipType ( --table that stores information about product ownership type    
    [ownershipTypeId] bigint NOT NULL, -- foreign key yo itemName for link type
    CONSTRAINT pkcardOwnershipType PRIMARY KEY CLUSTERED (ownershipTypeId ASC),
    CONSTRAINT fkCardOwnershipType_CoreItemName FOREIGN KEY(ownershipTypeId) REFERENCES [core].[itemName] (itemNameId)
)
