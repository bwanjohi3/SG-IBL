CREATE TABLE [card].[statusAction] -- in this table is put the configuration of the statuses and actions, i.e. from which status with which action the object goes in the the next status
(
    fromStatusId tinyint NOT NULL, --the status in which the object is currently
    actionId tinyint NOT NULL, --what action can be performed
    toStatusId tinyint NOT NULL, --in which status the object will be after the action is performed
    module varchar(50),  -- for which module this configuration is valid - application, batch, card or distributed card
    actionToPerform varchar(50), -- if another things except change of the status is needed, if not it is null
    embossedTypeId tinyint, -- if this configuration is valid for both named and no named objects it is null, if it is only for named = 1, for the no named - 2
    actionOrder tinyint NOT NULL DEFAULT(1), -- the order of the action
    permission varchar(100), -- which SP is called or some "dummy" permission in order to check what actions can perform the logged user
    flagToConfirm BIT DEFAULT(1), --flag whethe there should be confirmation message when this action is performed
    CONSTRAINT [pkCardStatusAction] PRIMARY KEY CLUSTERED (fromStatusId, actionId, toStatusId, module),
    CONSTRAINT fkCardStatusAction_permission FOREIGN KEY(permission) REFERENCES [user].[action] (actionId),
    CONSTRAINT fkCardStatusAction_embossedType FOREIGN KEY(embossedTypeId) REFERENCES [card].embossedType (embossedTypeId),
    CONSTRAINT fkCardStatusAction_actionId FOREIGN KEY(actionId) REFERENCES [card].[action] (actionId),
    CONSTRAINT fkCardStatusAction_fromStatusId FOREIGN KEY(fromStatusId) REFERENCES [card].[status] (statusId),
    CONSTRAINT fkCardStatusAction_toStatusId FOREIGN KEY(toStatusId) REFERENCES [card].[status] (statusId)
)  

