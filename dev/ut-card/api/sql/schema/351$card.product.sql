CREATE TABLE [card].product( --table that stores information about all card Product
    productId int IDENTITY(1000,1) NOT NULL, -- id of card Product
    [name] nvarchar(100) NOT NULL, -- name of Product
    itemNameId bigint null, --the link to the product's name, translated
    [description] nvarchar(1000) NULL, -- description of Product    
    branchId bigint NOT NULL, -- product is available for this branchId
    startDate date NOT NULL, -- start Date of activity of Product
    endDate date NULL,-- end Date of Product if NULL then the Product is active
    embossedTypeId tinyint NOT NULL, -- whether this product is for named otr it is for no named card
    createdBy bigint NOT NULL, --the id of the user, that created the Product
    createdOn datetime2(7) NOT NULL,-- the exact time the user was created
    updatedBy bigint NULL, --the id of the user, that updated the product
    updatedOn datetime2(7) NULL,-- the exact time the user was updated,
    isActive bit NOT NULL DEFAULT(1), -- active/unactive
    periodicCardFeeId int NULL, -- id of apply periodic card fee
    accountLinkLimit tinyint NOT NULL, -- how many accounts can be linked.
    pinRetriesLimit tinyint NOT NULL, -- limit of pin retries for cards
    pinRetriesDailyLimit tinyint NULL, -- how many incorrect PIN retries will lock the card for a day

    /*
    cardTypeId int NOT NULL, -- id of Card type
    binId int NOT NULL,-- id of Bin
    cardNumberConstructionId int NOT NULL, -- id of card number construction    
    ownershipTypeId BIGINT NOT NULL, -- whether the product is for own card
    termMonth int NULL, -- term Month of card,   
    cipher varchar(50) NULL, -- default cipher used to encrypt pan, pvk, decimalisation, pinoffset
    pvk varchar(64) NULL, -- default pvk
    cvk varchar(64) NULL, -- default CVV key
    decimalisation varchar(32) NULL, -- default decimalisation table
    flow varchar(50) NULL, -- ATM screen flow
    issuerId varchar(50) NOT NULL, -- issuer of the card, must be present in transfer.partner for integration with the partner
    cvv1 bit not null default(0), -- whether cards with this product will have such code
    cvv2 bit not null default(0), -- whether cards with this product will have such code
    icvv bit not null default(0), -- whether cards with this product will have such code
    cavv bit not null default(0), -- whether cards with this product will have such code
    serviceCode1 tinyint, -- card service code
    serviceCode2 tinyint, -- card service code
    serviceCode3 tinyint, -- card service code
    */

    CONSTRAINT pkproduct PRIMARY KEY CLUSTERED (productId ASC),    
    CONSTRAINT fkproduct_periodicCardFeeId FOREIGN KEY(periodicCardFeeId) REFERENCES [card].periodicCardFee (periodicCardFeeId),
    CONSTRAINT fk_product_CoreItemName FOREIGN KEY(itemNameId) REFERENCES [core].[itemName] (itemNameId),
    CONSTRAINT fkproduct_embossedTypeId FOREIGN KEY(embossedTypeId) REFERENCES [card].embossedType (embossedTypeId),
    CONSTRAINT fkproduct_createdById FOREIGN KEY(createdBy) REFERENCES [core].actor (actorId),
    CONSTRAINT fkproduct_updatedById FOREIGN KEY(updatedBy) REFERENCES [core].actor (actorId)      
)