ALTER PROCEDURE card.[batch.check] -- executed when a batch must be sent to production - checks the cards that will be needed
    @batchId INT, -- the list with the batches
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @callParams XML;
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID)+'.'+OBJECT_NAME(@@PROCID), @return INT = 0;

    BEGIN TRY
        EXEC @return = [user].[permission.check] @actionId = @actionID,
                                                 @objectId = NULL,
                                                 @meta = @meta;

        DECLARE @countOfCards INT =
        (
            SELECT COUNT(*)
            FROM card.application
            WHERE batchId = @batchId
        );

        IF @countOfCards > 0 --named batch -- bin-buCode-sequenceNumber
            SELECT a.cardNumberConstructionId, a.cardLength, replace(replace(replace(a.pattern, 'bin-', startBin), 'buCode-', bu), 'sequenceNumber', '') AS prefix,
                a.generateControlDigit, a.binId, a.branchId, needed, available, isnull(ln.next, 0) AS [next], a.cipher
            FROM
            (
                SELECT t.cardNumberConstructionId, cnc.cardLength, cnc.pattern, t.generateControlDigit, bb.binId, bb.startBin, a.issuingBranchId AS branchId,
                    isnull(o.code, '') AS bu, COUNT(a.applicationid) AS needed, t.cipher
                FROM card.application AS a
                JOIN card.[type] AS t ON t.typeId = a.typeId
                JOIN card.bin AS bb ON bb.typeId = t.typeId
                JOIN customer.organization AS o ON o.actorId = issuingBranchId
                JOIN card.cardNumberConstruction AS cnc ON cnc.cardNumberConstructionId = t.cardNumberConstructionId
                WHERE batchId = @batchId
                GROUP BY t.cardNumberConstructionId, cnc.cardLength, cnc.pattern, t.generateControlDigit, bb.binId, bb.startBin, a.issuingBranchId, isnull(o.code, ''), t.cipher
            ) AS a
            OUTER APPLY
            (
                SELECT n.cardNumberConstructionId, n.binId, branchId, COUNT(numberId) AS available
                FROM card.number AS n
                WHERE isUsed = 0
                      AND n.cardNumberConstructionId = a.cardNumberConstructionId
                      AND n.binId = a.binId
                      AND n.branchId = a.branchId
                GROUP BY n.cardNumberConstructionId, n.binId, isUsed, branchId
            ) AS n
            LEFT JOIN card.lastGeneratedNumber AS ln ON ln.cardNumberConstructionId = a.cardNumberConstructionId
                                                        AND ln.binId = a.binId
                                                        AND ln.branchId = a.branchId;
        ELSE -- no name batch
            SELECT t.cardNumberConstructionId, cnc.cardLength, replace(replace(replace(cnc.pattern, 'bin-', startBin), 'buCode-', isnull(o.code, '')), 'sequenceNumber', '') AS prefix,
                    t.generateControlDigit, bin.binId, b.issuingBranchId AS branchId, numberOfCards AS needed, isnull(have, 0) AS available, isnull(ln.next, 0) AS [next], t.cipher
            FROM card.batch AS b
            JOIN customer.organization AS o ON o.actorId = b.issuingBranchId
            JOIN card.[type] AS t ON t.typeId = b.typeId
            join [card].bin bin on bin.typeId = t.typeId
            JOIN card.cardNumberConstruction AS cnc ON cnc.cardNumberConstructionId = t.cardNumberConstructionId
            OUTER APPLY
            (
                SELECT n.cardNumberConstructionId, n.binId, COUNT(numberId) AS have
                FROM card.number AS n
                WHERE isUsed = 0
                      AND n.cardNumberConstructionId = t.cardNumberConstructionId
                      AND n.binId = bin.binId
                      AND b.issuingBranchId = n.branchId
                GROUP BY n.cardNumberConstructionId, n.binId, n.branchId, isUsed
            ) AS n
            LEFT JOIN card.lastGeneratedNumber AS ln ON ln.cardNumberConstructionId = t.cardNumberConstructionId
                                                    AND ln.binId = bin.binId
                                                    AND ln.branchId = b.issuingBranchId
        WHERE batchId = @batchId;
    END TRY
    BEGIN CATCH
        IF @@trancount > 0
            ROLLBACK TRANSACTION;
        EXEC core.error;
    END CATCH;