ALTER VIEW [integration].vBatchPansGet --view that shows information pin mailer custom print fields
AS

SELECT
	cardId as cardId,
	ISNULL([customerNumber], ' ') + ';' +
    ISNULL([customerName], ' ') + ';' +
    ISNULL([personName], ' ') + ';' +
    ISNULL([cardHolderName], ' ') as printFields
FROM [card].[card]
