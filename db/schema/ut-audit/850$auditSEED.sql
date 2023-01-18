MERGE INTO [core].[configuration] AS target
USING  (VALUES
                ('auditEnabled','1','Flag to determine recording user events'),
                ('isEventStore','1','Flag to determine audit event record store'),
                ('alert.history', '0', 'Disable all alert history triggers'),
                ('atm.history', '1', 'Enable all atm history triggers'),
                ('agent.history', '1', 'Enable all agent history triggers'),
                ('bulk.history', '1', 'Enable all bulk history triggers'),
                ('card.history', '1', 'Enable all card history triggers'),
                ('core.history', '1', 'Enable all core history triggers'),
                ('core.errorLog.history', '0', 'Disable trigger for core.errorLog table'),
                ('core.callLog.history', '0', 'Disable trigger for core.callLog table'),
                ('customer.history', '1', 'Enable all customer history triggers'),
                ('customer.organizationHierarchyFlat.history', '0', 'Disable history for organizationHierarchyFlat'),
                ('document.history', '1', 'Enable all user history triggers'),
                ('ledger.history', '1', 'Enable all ledger history triggers'),
                ('policy.history', '1', 'Enable all policy history triggers'),
                ('rule.history', '1', 'Enable all rule history triggers'),
                ('transfer.history', '0', 'Enable all transfer history triggers'),
                ('user.history', '1', 'Enable all user history triggers'),
                ('user.session.history', '0', 'Disable history for sessions'),
                ('user.sessionHistory.history', '0', 'Disable history for sessions'),  
                ('toleranceTime', '5','Default time(minutes) interval to migrate data from cache table to permanent tables'),
                ('jobFrequency','5','frqeuncy(minutes) to run the SQLserver agent job to migrate cache table records to permanenet tables')
    ) AS source ([key], [value], [description])
ON target.[key] = source.[key]
WHEN MATCHED AND (target.[value] <> source.[value] OR target.[description] <> source.[description])
THEN UPDATE SET target.[value] = source.[value],target.[description] = source.[description]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([key], [value], [description])
VALUES ([key], [value], [description]);