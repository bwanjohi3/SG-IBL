CREATE TABLE [card].[reasonAction]( --table that defines the reasons for which actions are valid
    [reasonActionId] [int] IDENTITY(1, 1), -- the id
    [reasonId] [tinyint] NOT NULL, -- the id of the reason
    [actionId] tinyint NOT NULL, -- the id of the action for which the reason refers to
    [createdBy] [bigint] not NULL, -- the user that created it
    createdOn datetime2(0), -- when is created
    updatedOn datetime2(0), --when was the last update
    updatedBy bigint NULL, --who made the last modification
    CONSTRAINT pkCardReasonAction PRIMARY KEY CLUSTERED  (reasonActionId),
    CONSTRAINT fkCardReasonAction_actionId FOREIGN KEY(actionId) REFERENCES [card].[action] (actionId),
    CONSTRAINT fkCardReasonAction_reasonId FOREIGN KEY(reasonId) REFERENCES [card].[reason] (reasonId)
)