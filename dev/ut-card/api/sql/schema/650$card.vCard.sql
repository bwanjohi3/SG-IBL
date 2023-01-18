ALTER VIEW [card].[vCard] AS

SELECT
    c.*, t.flow, t.issuerId, p.[name] cardProductName
FROM
    [card].[card] c
JOIN
    [card].[type] t on t.typeId = c.typeId
LEFT JOIN 
    [card].[product] p on p.productId = c.productId
