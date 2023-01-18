ALTER PROCEDURE [pos].[terminal.get]
    @terminalId INT,   
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
     
AS
SET NOCOUNT ON;

DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

SELECT 'terminal' AS resultSetName

SELECT t.actorId AS terminalId, t.[name], t.terminalNumber, t.terminalSerial, t.merchantName, t.terminalBrandModelId, t.[location], t.[adminPassword],t.[description], t.tmk, t.tmkkvv, t.active,
    t.[currVersion], t.tillAccount , t.feeAccount, t.commissionAccount, t.[newVersionId], t.[keyChainId], t.businessUnitId,
    t.header1, t.header2, t.header3, t.header4, t.footer1, t.footer2, t.footer3  
FROM pos.terminal t    
WHERE t.actorId = @terminalId

