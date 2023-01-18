CREATE PROCEDURE [atm].[account.listNoBalance]
    @cardId bigint,
    @accountType varchar(20)
AS
SELECT
    accountName,
    accountNumber
FROM
    [integration].[vCardAccount]
WHERE
    cardId = @cardId AND
    (accountType = @accountType OR @accountType IS NULL)
ORDER BY
    accountOrder, accountNumber
