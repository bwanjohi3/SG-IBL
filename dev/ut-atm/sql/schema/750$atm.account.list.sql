CREATE PROCEDURE [atm].[account.list]
    @cardId bigint,
    @accountType varchar(20)
AS
SELECT
    accountName,
    availableBalance,
    ledgerBalance,
    accountNumber,
    accountAlias
FROM
    [integration].[vCardAccountBalance]
WHERE
    cardId = @cardId AND
    (accountType = @accountType OR @accountType IS NULL)
ORDER BY
    accountOrder, accountNumber
