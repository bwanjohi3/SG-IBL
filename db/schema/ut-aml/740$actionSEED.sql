MERGE INTO [user].[actionCategory] AS target
USING
    (VALUES		
        ('aml', 'aml', 'amlId', 'name')
    ) AS source (name, [table], keyColumn, displayColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, [table], keyColumn, displayColumn)
VALUES (name, [table], keyColumn, displayColumn);

DECLARE @amlActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='aml')


-- AML

IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.list.home')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.list.home', @amlActionCategoryId, N'aml.list.home', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.import.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.import.fetch', @amlActionCategoryId, N'aml.import.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.import.stop')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.import.stop', @amlActionCategoryId, N'aml.import.stop', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.import.start')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.import.start', @amlActionCategoryId, N'aml.import.start', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setupList.edit')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setupList.edit', @amlActionCategoryId, N'aml.setupList.edit', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setupList.add')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setupList.add', @amlActionCategoryId, N'aml.setupList.add', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setupList.get')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setupList.get', @amlActionCategoryId, N'aml.setupList.get', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setupList.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setupList.fetch', @amlActionCategoryId, N'aml.setupList.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setupList.delete')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setupList.delete', @amlActionCategoryId, N'aml.setupList.delete', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.manualSearch.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.manualSearch.fetch', @amlActionCategoryId, N'aml.manualSearch.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.manualSearch.get')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.manualSearch.get', @amlActionCategoryId, N'aml.manualSearch.get', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.conflicts.management.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.conflicts.management.fetch', @amlActionCategoryId, N'aml.conflicts.management.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.conflicts.management.get')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.conflicts.management.get', @amlActionCategoryId, N'aml.conflicts.management.get', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.fetch', @amlActionCategoryId, N'aml.monitoring.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.start')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.start', @amlActionCategoryId, N'aml.monitoring.start', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.stop')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.stop', @amlActionCategoryId, N'aml.monitoring.stop', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.scheduler.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.scheduler.fetch', @amlActionCategoryId, N'aml.monitoring.scheduler.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.scheduler.add')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.scheduler.add', @amlActionCategoryId, N'aml.monitoring.scheduler.add', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.scheduler.setting.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.scheduler.setting.fetch', @amlActionCategoryId, N'aml.monitoring.scheduler.setting.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.results.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.results.fetch', @amlActionCategoryId, N'aml.monitoring.results.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.results.get')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.results.get', @amlActionCategoryId, N'aml.monitoring.results.get', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.import.update')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.import.update', @amlActionCategoryId, N'aml.import.update', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.manualSearch.exportCSV')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.manualSearch.exportCSV', @amlActionCategoryId, N'aml.manualSearch.exportCSV', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setting.timeUnit.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setting.timeUnit.fetch', @amlActionCategoryId, N'aml.setting.timeUnit.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setting.country.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setting.country.fetch', @amlActionCategoryId, N'aml.setting.country.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setting.conflicts.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setting.conflicts.fetch', @amlActionCategoryId, N'aml.setting.conflicts.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.settingConflicts.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.settingConflicts.fetch', @amlActionCategoryId, N'aml.settingConflicts.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.conflicts.management.exportCSV')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.conflicts.management.exportCSV', @amlActionCategoryId, N'aml.conflicts.management.exportCSV', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.conflicts.management.changeStatus')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.conflicts.management.changeStatus', @amlActionCategoryId, N'aml.conflicts.management.changeStatus', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.conflicts.management.discard')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.conflicts.management.discard', @amlActionCategoryId, N'aml.conflicts.management.discard', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.results.matches.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.results.matches.fetch', @amlActionCategoryId, N'aml.monitoring.results.matches.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.results.exportCSV')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.results.exportCSV', @amlActionCategoryId, N'aml.monitoring.results.exportCSV', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.results.changeStatus')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.results.changeStatus', @amlActionCategoryId, N'aml.monitoring.results.changeStatus', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.results.setting.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.results.setting.fetch', @amlActionCategoryId, N'aml.monitoring.results.setting.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoring.results.matches.history.fetch')
BEGIN
    INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoring.results.matches.history.fetch', @amlActionCategoryId, N'aml.monitoring.results.matches.history.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.changeConflictStatus')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.changeConflictStatus', @amlActionCategoryId, N'aml.changeConflictStatus', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.changeMatchStatus')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.changeMatchStatus', @amlActionCategoryId, N'aml.changeMatchStatus', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.country.fetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.country.fetch', @amlActionCategoryId, N'aml.country.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.discardConflict')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.discardConflict', @amlActionCategoryId, N'aml.discardConflict', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.import.edit')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.import.edit', @amlActionCategoryId, N'aml.import.edit', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.importError.add')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.importError.add', @amlActionCategoryId, N'aml.importError.add', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.importWhatcher')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.importWhatcher', @amlActionCategoryId, N'aml.importWhatcher', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoringSchedulerAdd')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoringSchedulerAdd', @amlActionCategoryId, N'aml.monitoringSchedulerAdd', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoringSchedulerFetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoringSchedulerFetch', @amlActionCategoryId, N'aml.monitoringSchedulerFetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoringSchedulerSettingFetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoringSchedulerSettingFetch', @amlActionCategoryId, N'aml.monitoringSchedulerSettingFetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoringWhatcher')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoringWhatcher', @amlActionCategoryId, N'aml.monitoringWhatcher', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.rawDataConflict.fetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.rawDataConflict.fetch', @amlActionCategoryId, N'aml.rawDataConflict.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.rawDataCustomerMatch.fetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.rawDataCustomerMatch.fetch', @amlActionCategoryId, N'aml.rawDataCustomerMatch.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.rawDataCustomerMatchByCustomer.fetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.rawDataCustomerMatchByCustomer.fetch', @amlActionCategoryId, N'aml.rawDataCustomerMatchByCustomer.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.rawDataCustomerMatchHistory.fetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.rawDataCustomerMatchHistory.fetch', @amlActionCategoryId, N'aml.rawDataCustomerMatchHistory.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.timeUnit.get')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.timeUnit.get', @amlActionCategoryId, N'aml.timeUnit.get', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setupList.addFile')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setupList.addFile', @amlActionCategoryId, N'aml.setupList.addFile', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.fetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.fetch', @amlActionCategoryId, N'aml.notification.fetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.changeStatus')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.changeStatus', @amlActionCategoryId, N'aml.notification.changeStatus', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.get')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.get', @amlActionCategoryId, N'aml.notification.get', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.edit')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.edit', @amlActionCategoryId, N'aml.notification.edit', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.delete')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.delete', @amlActionCategoryId, N'aml.notification.delete', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.userSearch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.userSearch', @amlActionCategoryId, N'aml.notification.userSearch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.roleSearch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.roleSearch', @amlActionCategoryId, N'aml.notification.roleSearch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.userSearch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.userSearch', @amlActionCategoryId, N'aml.notification.userSearch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.roleSearch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.roleSearch', @amlActionCategoryId, N'aml.notification.roleSearch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.user.search')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.user.search', @amlActionCategoryId, N'aml.notification.user.search', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.notification.role.search')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.notification.role.search', @amlActionCategoryId, N'aml.notification.role.search', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.rawDataTmp.delete')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.rawDataTmp.delete', @amlActionCategoryId, N'aml.rawDataTmp.delete', N'{}')
END

IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'customer.organization.graphFetch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'customer.organization.graphFetch', @amlActionCategoryId, N'customer.organization.graphFetch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setupListFileSize')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setupListFileSize', @amlActionCategoryId, N'aml.setupListFileSize', N'{}')
END

IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.api.customerPreRegistrationCheck')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.api.customerPreRegistrationCheck', @amlActionCategoryId, N'aml.api.customerPreRegistrationCheck', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoringSearchPreRegistration')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoringSearchPreRegistration', @amlActionCategoryId, N'aml.monitoringSearchPreRegistration', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.api.customerPostRegistrationCheck')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.api.customerPostRegistrationCheck', @amlActionCategoryId, N'aml.api.customerPostRegistrationCheck', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoringSearchPostRegistration')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoringSearchPostRegistration', @amlActionCategoryId, N'aml.monitoringSearchPostRegistration', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.standartSearch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.standartSearch', @amlActionCategoryId, N'aml.standartSearch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.monitoringSearch')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.monitoringSearch', @amlActionCategoryId, N'aml.monitoringSearch', N'{}')
END
IF NOT EXISTS(SELECT 1 FROM [user].action WHERE actionId=N'aml.setupList.changeStatus')
BEGIN
	INSERT [user].[action]([actionId],[actionCategoryId],[description],[valueMap]) VALUES (N'aml.setupList.changeStatus', @amlActionCategoryId, N'aml.setupList.changeStatus', N'{}')
END


/****************** Rules ****************************/
DECLARE @ruleActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='rule')
IF @ruleActionCategoryId IS NULL
BEGIN
    INSERT INTO [user].[actionCategory] ([name], [table], [keyColumn], [displayColumn], [filter])
    VALUES (N'rule', NULL, NULL, NULL, NULL)
    SET @ruleActionCategoryId = SCOPE_IDENTITY()
END

MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('rule.rule.add', @ruleActionCategoryId, 'Add Rule', '{}'),
        ('rule.rule.edit', @ruleActionCategoryId, 'Edit Rule', '{}'),
        ('rule.rule.remove', @ruleActionCategoryId, 'Remove Rule', '{}'),
        ('rule.rule.fetch', @ruleActionCategoryId, 'Fetch Rule', '{}'),
        ('rule.item.fetch', @ruleActionCategoryId, 'Fetch Items', '{}')
    ) AS source (actionId, actionCategoryId, [description], valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId, actionCategoryId, [description], valueMap)
VALUES (actionId, actionCategoryId, [description], valueMap);

/****************** Transfer ****************************/
DECLARE @transferActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='transfer')
IF @transferActionCategoryId IS NULL
BEGIN
    INSERT INTO [user].[actionCategory] ([name], [table], [keyColumn], [displayColumn], [filter])
    VALUES (N'transfer', NULL, NULL, NULL, NULL)
    SET @transferActionCategoryId = SCOPE_IDENTITY()
END

MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('transfer.commissionSplitNonAuthorized.fetch', @transferActionCategoryId, 'Fetch Non-Authorized Commission Splits', '{}'),
        ('transfer.commissionSplitAuthorized.fetch', @transferActionCategoryId, 'Fetch Authorized Commission Splits', '{}'),
        ('transfer.commissionSplitPosted.fetch', @transferActionCategoryId, 'Fetch Posted Commission Splits', '{}'),
        ('transfer.commissionSplitRejected.fetch', @transferActionCategoryId, 'Fetch Rejected Commission Splits', '{}'),
        ('transfer.commissionSplit.edit', @transferActionCategoryId, 'Edit Commission Split', '{}'),
        ('transfer.commissionSplit.authorize', @transferActionCategoryId, 'Authorized Commission Split', '{}'),
        ('transfer.commissionSplit.reject', @transferActionCategoryId, 'Reject Commission Split', '{}'),
        ('transfer.commissionSplit.post', @transferActionCategoryId, 'Post Commission Split', '{}'),
        ('transfer.splitAudit.fetch', @transferActionCategoryId, 'Fetch Audited Commission Splits', '{}')
    ) AS source (actionId, actionCategoryId, [description], valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId, actionCategoryId, [description], valueMap)
VALUES (actionId, actionCategoryId, [description], valueMap);
