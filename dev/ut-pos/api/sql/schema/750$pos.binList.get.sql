ALTER PROCEDURE [pos].[binList.get]
    @binListId INT = 0,
    @binId INT = 0,
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
SET NOCOUNT ON;

-- DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
-- EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
-- IF @return != 0
-- BEGIN
--    RETURN 55555
-- END

SELECT 'binList' AS resultSetName
SELECT [binListId], [transaction], [binId], [productId]
FROM pos.binList
WHERE binListId = @binListId OR binId = @binId
