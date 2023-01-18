ALTER PROCEDURE [pos].[parameter.list] -- lists all organizations
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

SELECT 'parameters' AS resultSetName

SELECT
    parameterId,
    [version],
    [name],
    menuId INT,
    receiptHeader1,
    receiptHeader2,
    receiptHeader3,
    receiptHeader4,
    receiptHeader5,
    receiptFooter1,
    receiptFooter2,
    receiptFooter3,
    receiptFooter4,
    [description]
FROM pos.parameter
