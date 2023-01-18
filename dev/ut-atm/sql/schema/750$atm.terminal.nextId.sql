ALTER PROCEDURE [atm].[terminal.nextId]
    @channelId bigint
AS

DECLARE @tsn int

UPDATE
    atm.terminal
SET
    @tsn = tsn = ISNULL(tsn, 0) + 1
WHERE
    actorId = @channelId

IF @@ROWCOUNT <> 1 RAISERROR('atm.nextId', 16, 1);

SELECT @tsn as tsn
