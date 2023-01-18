CREATE TABLE [card].[number]( -- table that stores encrypted card numbers
    numberId BIGINT IDENTITY(1000, 1) NOT NULL, -- the unique key
    last4Digits varchar(4) NULL, --the last 4 digits if the card in plain text
    pan varchar(100) NOT NULL, -- the encrypted number
    cardNumberConstructionId int NOT NULL, -- foreign key to the table that defines the way the card number is contructed
    binId int NOT NULL, -- foreign key to the table that defines bins in the system
    branchId bigint, -- foreigh key to the table with branches, if this card is dependenta of the branch
    isUsed bit NOT NULL, -- flag showing whether the card number is already used or it is still free
    CONSTRAINT pkCardNumber PRIMARY KEY CLUSTERED (numberId),
    CONSTRAINT fkNumber_cardNumberConstructionId FOREIGN KEY(cardNumberConstructionId) REFERENCES [card].cardNumberConstruction (cardNumberConstructionId),
    CONSTRAINT fkNumber_cardBinId FOREIGN KEY(binId) REFERENCES [card].bin (binId),
    CONSTRAINT fkNumber_customerOrganizationId FOREIGN KEY(branchId) REFERENCES customer.organization (actorId),
    CONSTRAINT ukNumber_panUnique UNIQUE(pan) 	
)