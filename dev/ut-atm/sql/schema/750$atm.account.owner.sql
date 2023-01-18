CREATE PROCEDURE [atm].[account.owner]
    @accountNumber varchar(50)
AS
SELECT TOP 1
    ownerId
FROM
    [integration].[vAccount]
WHERE
    accountNumber = @accountNumber
