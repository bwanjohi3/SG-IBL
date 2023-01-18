ALTER PROCEDURE [pos].[binList.fetch] -- lists all organizations
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS



SELECT 'binList' AS resultSetName

SELECT
    [binListId], [transaction], [pb].[binId], [pb].[productId], [startBin], [endBin], [cb].[description], cp.name AS productName
FROM pos.binList pb
LEFT JOIN card.bin cb ON [cb].[binId] = [pb].[binId]
LEFT JOIN card.product cp ON [cp].[itemNameId] = [pb].[productId]
