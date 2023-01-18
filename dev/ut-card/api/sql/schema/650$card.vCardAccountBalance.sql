ALTER VIEW [card].[vCardAccountBalance] --view that shows information about all customer accounts and cards information
AS
SELECT
    c.cardId,
    c.cardNumber,
    ca.accountNumber,
    itn.itemCode as accountType,
    ca.accountTypeName as accountName,
    c.cardHolderName as holder,
    s.statusName,
    c.activationDate,
    c.expirationDate,
    ca.accountOrder,
    ca.isPrimary,
    c.customerId,
    c.personId,
    c.pinRetries,
    c.pinRetriesLimit,
    c.pinRetriesDailyLimit,
    c.pinOffset,
    t.flow,
    t.issuerId,
    p.productId cardProductId,
    a.availableBalance,
    a.ledgerBalance,
    a.accountAlias,
    ca.currency
FROM
    [card].[card] c
LEFT JOIN
    [card].[cardAccount] ca ON c.cardId = ca.cardId
JOIN
    [card].status s ON s.statusId = c.statusId
JOIN
    [card].product p ON p.productId = c.productId
JOIN
    [card].[type] t ON t.typeId = c.typeId
LEFT JOIN
    [card].accountLink al on al.accountLinkId = ca.accountLinkId
LEFT JOIN
    core.itemName itn on itn.itemNameId = al.itemNameId
LEFT JOIN
    [integration].[vAccount] a ON a.accountNumber = ca.accountNumber
