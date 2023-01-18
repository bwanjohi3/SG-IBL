CREATE PROCEDURE [atm].[offline.set]
    @atmId bigint
AS
UPDATE atm.terminal
SET [offline] = 1
WHERE actorId = @atmId
