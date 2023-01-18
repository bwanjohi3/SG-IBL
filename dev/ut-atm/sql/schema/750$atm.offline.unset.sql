CREATE PROCEDURE [atm].[offline.unset]
    @atmId bigint
AS
UPDATE atm.terminal
SET [offline] = 0
WHERE actorId = @atmId
