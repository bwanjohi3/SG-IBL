CREATE TABLE [card].[reason]( --table for card reasons
    [reasonId] [tinyint] IDENTITY(1,1) NOT NULL, -- the id of the reason
    [code] [varchar](30) NULL, -- the code of the reason
    [name] nvarchar(255), --the reason name
    itemNameId bigint null, --the link to the reason's name, translated
    [createdBy] [bigint] not NULL, -- the user that created it
    createdOn datetime2(0), -- whne was created
    isActive bit not null default(1), -- flag whether this reason is still in use or is marked inactive
    updatedOn datetime2(0) NULL, --when was the last update
    updatedBy bigint NULL, --who made the last modification
    module varchar(20) NOT NULL default('Application'),  --for what module is valid this reason, can be application, batch or card
    isDeleted bit not null default(0), -- flag whether this reason is still in use or is marked inactive
    CONSTRAINT pkCardReason PRIMARY KEY CLUSTERED  (reasonId) ,
    CONSTRAINT fk_CrardReason_CoreItemName FOREIGN KEY(itemNameId) REFERENCES [core].[itemName] (itemNameId)
)

