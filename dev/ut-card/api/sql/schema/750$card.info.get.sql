ALTER PROCEDURE [card].[info.get] -- SP that returns pin details for the card
    @pan varchar(32), --encrypted PAN
    @bin varchar(8) = NULL, -- card bin
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE
        @cardId BIGINT,
        @typeId INT,
        @cdol1ProfileId INT

    --if(@bin like '5%' OR @bin like '4%')
	--	set @bin = 44000000 
    DECLARE @startBin varchar(8) = (SELECT TOP 1 startBin FROM [card].[bin] WHERE startBin <= @bin AND endBin >= @bin)
    SELECT
        @cardId = n.numberId,
        @typeId = c.typeId
    FROM [card].[number] n
    LEFT JOIN [card].[card] c on c.cardId = n.numberId
    WHERE
        n.pan = @pan OR
        n.pan = @startBin
-----------------------------
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
        n.numberId = @cardId
---------------------------
    IF @typeId IS NOT NULL
    BEGIN
        SELECT 'type' AS resultSetName, 1 single
        SELECT
            issuerId,
            flow,
            cipher,
            mkac,
            ivac,
            emvRequestTags,
            emvResponseTags,
            cryptogramMethodName,
            schemeId,
            applicationInterchangeProfile,
            binId = (SELECT binId FROM [card].[bin] WHERE typeId = ct.typeId)
        FROM [card].[type] ct
        WHERE
            --isActive = 1 AND
            typeId = @typeId

        SELECT 'CDOL1' AS resultSetName
        SELECT
            [tag],
            [len]
        FROM [card].[type] ct
        LEFT JOIN [card].[cdol1ProfileData] cpd ON ct.cdol1ProfileId = cpd.cdol1ProfileId
        WHERE
            typeId = @typeId
        ORDER BY [order] ASC
    END
