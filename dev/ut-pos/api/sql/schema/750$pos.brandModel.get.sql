ALTER PROCEDURE [pos].[brandModel.get]
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @brandModelId int
AS
SET NOCOUNT ON;

DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

IF @brandModelId IS NOT NULL
BEGIN
    SELECT 'brandModel' AS resultSetName
    SELECT t.brandModelId, t.brand, t.model, t.[description]
    FROM pos.brandModel t
    WHERE t.brandModelId = @brandModelId
END
