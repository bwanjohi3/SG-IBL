ALTER PROCEDURE [atm].[terminal.info]
    @tmkkvv varchar(6),
    @terminalId varchar(8)
AS
SELECT
    actorId atmId,
    tmk,
    terminalId,
    customization,
    [address] + ISNULL([city], '') + ISNULL([state], '') + ISNULL([country], '') as terminalName,
    merchantId,
    merchantType,
    institutionCode,
    identificationCode,
    luno,
    cassette1Currency,
    cassette1Denomination,
    cassette2Currency,
    cassette2Denomination,
    cassette3Currency,
    cassette3Denomination,
    cassette4Currency,
    cassette4Denomination,
    [offline],
    [address],
    [city],
    [state],
    [country]
FROM
    atm.terminal
WHERE
    tmkkvv = @tmkkvv OR terminalId = @terminalId