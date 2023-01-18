ALTER PROCEDURE [card].[pin.get] -- SP that returns pin details for the card
    @pan varchar(32), --encrypted PAN
    @bin varchar(6) = NULL, -- card bin
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

SELECT 'pin' AS resultSetName, 1 single
SELECT
    c.cardId,
    ISNULL(c.cipher, t.cipher) cipher,
    ISNULL(c.pvk, t.pvk) pvk,
    ISNULL(c.decimalisation, t.decimalisation) decimalisation,
    c.pinOffset,
    @pan pan
FROM
    [card].[number] n
LEFT JOIN
    [card].[card] c on c.cardId = n.numberId
LEFT JOIN
    [card].[type] t on c.typeId = t.typeId
WHERE
    n.pan = @pan OR
    n.pan = @bin
