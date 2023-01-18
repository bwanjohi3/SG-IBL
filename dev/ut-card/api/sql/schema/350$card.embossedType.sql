CREATE TABLE [card].embossedType(--table that stores information about type of card in batch: no Name or Name
    embossedTypeId tinyint IDENTITY(1, 1) NOT NULL, -- id of embossed type
    [itemNameId] bigint NOT NULL, -- name of batch name
 CONSTRAINT [PK_embossedType] PRIMARY KEY CLUSTERED (embossedTypeId)
 )