ALTER PROCEDURE [card].[batch.checkDownload]
	@batchId int,
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
BEGIN
	SELECT 'batchCheckDownload' as resultSetName
	SELECT
		cb.batchId
		,count(cc.cardId) as generatedCards
		,max([numberOfCards]) as totalCards
	FROM [card].[batch] cb
	LEFT JOIN [card].[card] cc on cc.batchId = cb.batchId and cc.data is not null
	WHERE cb.batchId = @batchId
	GROUP BY cb.batchId
END
