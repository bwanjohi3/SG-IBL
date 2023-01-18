DECLARE @policyIdList [core].[arrayNumberList]
DECLARE @meta [core].[metaDataTT]
DECLARE @sa BIGINT = (SELECT actorId FROM [user].[hash] WHERE identifier = 'sa' AND [type] = 'password')
INSERT INTO @meta([auth.actorId], [method]) values(@sa,'policy.policy.delete')

DECLARE @policyBaobabId INT = (SELECT policyId FROM [policy].[policy] WHERE name = 'Baobab AP')
DECLARE @policyBioStdId INT = (SELECT policyId FROM [policy].[policy] WHERE name = 'BIO -> if fail -> STD')

INSERT INTO @policyIdList VALUES(@policyBaobabId),(@policyBioStdId)
EXEC [policy].[policy.delete] @policyIdList = @policyIdList, @meta = @meta