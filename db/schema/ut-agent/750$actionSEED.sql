MERGE INTO [user].[actionCategory] AS target
USING   
    (VALUES        
        ('agent')
    ) AS source (name)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name)
VALUES (name);

DECLARE @agentActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='agent')

--webui and tabs access
MERGE INTO [user].[action] AS target
USING
    (VALUES        
        ('agent.network.nav', @agentActionCategoryId, 'Access networks submenu', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);
    
-- network
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('agent.network.add', @agentActionCategoryId, 'Add network', '{}'),
        ('agent.network.addApproved', @agentActionCategoryId, 'Add approved data for new network', '{}'),
        ('agent.network.edit', @agentActionCategoryId, 'Edit network', '{}'),
        ('agent.network.editApproved', @agentActionCategoryId, 'Edit approved data for network', '{}'),
        ('agent.network.approve', @agentActionCategoryId, 'Approve changes for network', '{}'),
        ('agent.network.discard', @agentActionCategoryId, 'Discard changes for network', '{}'),
        ('agent.network.reject', @agentActionCategoryId, 'Reject changes for network', '{}'),
        ('agent.network.fetch', @agentActionCategoryId, 'Fetch networks', '{}'),
        ('agent.network.get', @agentActionCategoryId, 'Get a network', '{}'),
        ('agent.networkType.fetch', @agentActionCategoryId, 'Fetch network types', '{}'),
        ('customer.organization.getBUsParents', @agentActionCategoryId, 'Get BU parents', '{}')
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);
