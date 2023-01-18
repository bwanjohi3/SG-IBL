CREATE TABLE [card].cardNumberConstruction( -- table that defines the way card numbers method of generation
    cardNumberConstructionId int NOT NULL, -- the unique table key
    [description] nvarchar(100) NOT NULL, -- the description shown in the UI for example 16 - BIN + BU + Seq Number
    [cardLength] tinyint, -- how long (how many digits) will have
    pattern varchar(100), -- the pattern used for generation, example: bin-buCode-sequenceNumber
 CONSTRAINT [PK_cardNumberConstruction] PRIMARY KEY CLUSTERED (cardNumberConstructionId ASC)
)