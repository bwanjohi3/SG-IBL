CREATE TABLE [card].[action] (  --table for card actions
    actionId tinyint IDENTITY(1, 1) NOT NULL, -- the id of the action
    itemNameId bigint NOT NULL, --the link to the action's name, translated
    actionName varchar(50) NOT NULL, -- the action name
    CONSTRAINT [pkCardAction] PRIMARY KEY CLUSTERED (actionId),
    CONSTRAINT [fkCrardAction_CoreItemName] FOREIGN KEY(itemNameId) REFERENCES [core].[itemName] (itemNameId)
)