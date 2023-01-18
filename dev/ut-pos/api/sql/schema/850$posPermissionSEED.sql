DECLARE @posActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name = 'pos')

IF @posActionCategoryId IS NULL
BEGIN
    INSERT INTO [user].[actionCategory](name)
    VALUES ('pos')

    SET @posActionCategoryId = SCOPE_IDENTITY()
END

DECLARE @action [user].[actionTT]

INSERT INTO @action ([actionId], [actionCategoryId], [description], [valueMap])

VALUES ('pos.application.add', @posActionCategoryId, 'pos.application.add', '{}')
    , ('pos.application.edit', @posActionCategoryId, 'pos.application.edit', '{}')
    , ('pos.application.get', @posActionCategoryId, 'pos.application.get', '{}')
    , ('pos.application.fetch', @posActionCategoryId, 'pos.application.fetch', '{}')
    , ('pos.binList.add', @posActionCategoryId, 'pos.binList.add', '{}')
    , ('pos.binList.edit', @posActionCategoryId, 'pos.binList.edit', '{}')
    , ('pos.binList.get', @posActionCategoryId, 'pos.binList.get', '{}')
    , ('pos.binList.fetch', @posActionCategoryId, 'pos.binList.fetch', '{}')
    , ('pos.application.statusUpdate', @posActionCategoryId, 'pos.application.statusUpdate', '{}')
    , ('pos.brandModel.add', @posActionCategoryId, 'pos.brandModel.add', '{}')
    , ('pos.brandModel.edit', @posActionCategoryId, 'pos.brandModel.edit', '{}')
    , ('pos.brandModel.get', @posActionCategoryId, 'pos.brandModel.get', '{}')
    , ('pos.brandModel.list', @posActionCategoryId, 'pos.brandModel.list', '{}')
    , ('pos.keyChainList.list', @posActionCategoryId, 'pos.keyChainList.list', '{}')
    , ('pos.terminal.add', @posActionCategoryId, 'pos.terminal.add', '{}')
    , ('pos.terminal.edit', @posActionCategoryId, 'pos.terminal.edit', '{}')
    , ('pos.terminal.get', @posActionCategoryId, 'pos.terminal.get', '{}')
    , ('pos.terminal.info', @posActionCategoryId, 'pos.terminal.info', '{}')
    , ('pos.terminal.fetch', @posActionCategoryId, 'pos.terminal.fetch', '{}')
    , ('pos.terminal.nextId', @posActionCategoryId, 'pos.terminal.nextId', '{}')
    , ('pos.organization.list', @posActionCategoryId, 'pos.organization.list', '{}')
    , ('pos.parameter.list', @posActionCategoryId, 'pos.parameter.list', '{}');

MERGE INTO [user].[action] AS dd
USING
(
    SELECT [actionId], [actionCategoryId], [description], [valueMap]
    FROM @action
) d ON dd.actionId = d.actionId

WHEN NOT MATCHED BY TARGET THEN
    INSERT ([actionId], [actionCategoryId], [description], [valueMap])
    VALUES ([actionId], [actionCategoryId], [description], [valueMap]);
