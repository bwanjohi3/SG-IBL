CREATE TABLE [card].[status] ( -- table that stores card statuses
    statusId tinyint  IDENTITY(1, 1) NOT NULL, -- card status id
    itemNameId bigint NOT NULL, --the link to the status name, translated
    statusName varchar(50) NOT NULL, -- card status name
    CONSTRAINT [pkCardStatus] PRIMARY KEY CLUSTERED (statusId),
    CONSTRAINT [fk_CrardStatus_CoreItemName] FOREIGN KEY(itemNameId) REFERENCES [core].[itemName] (itemNameId)
)  