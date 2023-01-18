CREATE TABLE [card].[type]( --table that stores information about all card Types
    typeId int IDENTITY(1000,1) NOT NULL, -- id of card Type
    name nvarchar(100) NOT NULL, -- name of Type
    [description] nvarchar(1000) NULL, -- description of card Type
    issuerId varchar(50) NOT NULL, -- issuer of the card, must be present in transfer.partner for integration with the partner
    cardBrandId int NULL, -- id of Card brand
    flow varchar(50) NULL, -- ATM screen flow
    cardNumberConstructionId int NULL, -- id of card number construction
    isActive bit NOT NULL DEFAULT(1), -- active/unactive
    termMonth int NULL, -- term Month of card,
    itemNameId bigint null, --the link to the type's name, translated
    cipher varchar(50) NULL, -- default cipher used to encrypt pan, pvk, decimalisation, pinoffset
    pvk varchar(64) NULL, -- default pvk
    cvk varchar(64) NULL, -- default CVV key
    cryptogramMethodIndex int NULL, -- dropdown element index
    cryptogramMethodName varchar(2) NULL, -- HSM command code
    schemeId int NULL, -- schemeId for ARQC generation command to HSM
    mkac varchar(64) NULL, -- default ICC key
    ivac varchar(64) NULL, -- default ICC initial vector
    applicationInterchangeProfile varchar(4) NULL, -- EMV application Interchange Profile
    cdol1ProfileId int NULL, -- CDOL1 profile ID
    decimalisation varchar(32) NULL, -- default decimalisation table
    cvv1 bit not null default(0), -- whether cards with this type will have such code
    cvv2 bit not null default(0), -- whether cards with this type will have such code
    icvv bit not null default(0), -- whether cards with this type will have such code
    serviceCode1 tinyint, -- card service code
    serviceCode2 tinyint, -- card service code
    serviceCode3 tinyint, -- card service code
    generateControlDigit bit NULL, -- whether the last digit should be a check sum or it is e sequential number
    emvRequestTags varchar(1000), -- EMV tags for request for external cards
    emvResponseTags varchar(1000), -- EMV tags for response for external cards
    createdBy bigint NOT NULL, --the id of the user, that created the Type
    createdOn datetime2(7) NOT NULL,-- the exact time the user was created
    updatedBy bigint NULL, --the id of the user, that updated the type
    updatedOn datetime2(7) NULL,-- the exact time the user was updated,
    CONSTRAINT pktype PRIMARY KEY CLUSTERED (typeId ASC),
    CONSTRAINT fktype_CoreItemName FOREIGN KEY(itemNameId) REFERENCES [core].[itemName] (itemNameId),
    CONSTRAINT fktype_cardNumberConstructionId FOREIGN KEY(cardNumberConstructionId) REFERENCES [card].cardNumberConstruction (cardNumberConstructionId),
    CONSTRAINT fktype_cardBrandId FOREIGN KEY(cardBrandId) REFERENCES [card].cardBrand(cardBrandId),
    CONSTRAINT fktype_createdById FOREIGN KEY(createdBy) REFERENCES [core].actor (actorId),
    CONSTRAINT fktype_updatedById FOREIGN KEY(updatedBy) REFERENCES [core].actor (actorId),
    CONSTRAINT fktype_cdol1Profile FOREIGN KEY(cdol1ProfileId) REFERENCES [card].cdol1Profile (cdol1ProfileId)
)
-- TODO: add all FKs
