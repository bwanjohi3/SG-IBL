CREATE TABLE [card].[bin]( -- table that stores bins
    binId int IDENTITY(1,1) NOT NULL, -- bin id
    startBin varchar(8) NOT NULL, -- bin code range start
    endBin varchar(8) NOT NULL, -- bin code range end
    ownershipTypeId BIGINT NOT NULL, -- whether the bin range is for own card or not
    [description] nvarchar(100) NULL, -- bin description
    createdBy int, -- user that created the bin
    createdOn datetime2(0), -- whne was created
    updatedBy bigint, --who made the last modification
    updatedOn datetime2(0), --when was the last update    
    isActive bit NOT NULL default(1), -- flag whether this bin is still in use or is marked inactive
    itemNameId bigint, --the link to the bin's description, translated
    typeId int, -- the card type assigned to bin(range)
    CONSTRAINT PK_card_bin_binId PRIMARY KEY CLUSTERED (binId),
    CONSTRAINT uc_startBinEndBin UNIQUE (startBin ASC),
    CONSTRAINT fk_CardBin_CoreItemName FOREIGN KEY(itemNameId) REFERENCES [core].[itemName] (itemNameId),
    CONSTRAINT fk_CardBin_ownershipTypeId FOREIGN KEY(ownershipTypeId) REFERENCES [card].ownershipType(ownershipTypeId),
    CONSTRAINT fk_CardBin_typeId FOREIGN KEY(typeId) REFERENCES [card].[type](typeId)
)