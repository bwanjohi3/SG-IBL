CREATE PROCEDURE [atm].[card.params]
    @cardId bigint
AS
SELECT TOP 1
    flow,
    issuerId
FROM
    [integration].[vCard]
WHERE
    cardId = @cardId
