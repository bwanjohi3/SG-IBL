CREATE PROCEDURE [pos].[account.list]
    @cardId bigint,
    @accountType varchar(20),
    @currency varchar(50)
AS

SELECT 'accounts' AS resultSetName

SELECT
    accountName,
    availableBalance,
    ledgerBalance,
    accountNumber,
    accountAlias,
    currency
FROM
    [integration].[vCardAccountBalance]
WHERE
    cardId = @cardId AND
    (accountType = @accountType OR @accountType IS NULL) AND
    (currency = @currency OR @currency IS NULL)
ORDER BY
    accountOrder, accountNumber
