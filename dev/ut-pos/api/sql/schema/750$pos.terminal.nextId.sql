ALTER PROCEDURE [pos].[terminal.nextId]
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @channelId BIGINT
AS

DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

DECLARE @tsn BIGINT

UPDATE
    pos.terminal
SET
    @tsn = tsn = ISNULL(tsn, 0) + 1
WHERE
    actorId = @channelId

IF @@ROWCOUNT <> 1 RAISERROR('pos.nextId', 16, 1);

SELECT @tsn AS tsn
