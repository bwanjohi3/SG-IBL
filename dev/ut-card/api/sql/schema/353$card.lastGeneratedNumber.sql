CREATE TABLE [card].[lastGeneratedNumber]( -- table that stores last encrypted card numbers for each combination - bin and card number contruction
    lastGeneratedNumberId tinyint IDENTITY(1, 1) NOT NULL, -- the unique table key
    cardNumberConstructionId int NOT NULL, -- foreign key to the table that defines the way the card number is contructed
    binId int NOT NULL, -- foreign key to the table that defines bins in the system
    branchId bigint, -- foreigh key to the table with branches, if this card is dependenta of the branch
    [next] int NOT NULL, -- the last generated encrypted number
    CONSTRAINT pkCardLastGeneratedNumber PRIMARY KEY CLUSTERED (lastGeneratedNumberId),
    CONSTRAINT uqCardLastGeneratedNumber UNIQUE (binId, cardNumberConstructionId, branchId),
    CONSTRAINT fkLastGeneratedNumber_cardNumberConstructionId FOREIGN KEY(cardNumberConstructionId) REFERENCES [card].cardNumberConstruction (cardNumberConstructionId),
    CONSTRAINT fkLastGeneratedNumber_cardBinId FOREIGN KEY(binId) REFERENCES [card].bin (binId),
    CONSTRAINT fkLastGeneratedNumber_customerOrganizationId FOREIGN KEY(branchId) REFERENCES customer.organization (actorId)
)