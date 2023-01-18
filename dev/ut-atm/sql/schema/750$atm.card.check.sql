ALTER PROCEDURE [atm].[card.check]
    @cardId bigint,
    @pinOffset varchar(32),
    @pinOffsetNew varchar(32),
    @sourceAccountType varchar(50),
    @sourceAccount varchar(50),
    @destinationType varchar(50),
    @destinationTypeId varchar(50),
    @destinationAccount varchar(50),
    @destinationAccountType varchar(50),
    @mode varchar(50),
	@currency varchar(50)
AS
DECLARE @callParams XML = ( SELECT @cardId [cardId], @pinOffset [pinOffset], @pinOffsetNew [pinOffsetNew], @sourceAccountType [sourceAccountType], @sourceAccount [sourceAccount], @destinationType [destinationType], @destinationTypeId [destinationTypeId], @destinationAccount [destinationAccount], @destinationAccountType [destinationAccountType], @mode [mode], @currency [currency] FOR XML RAW('params'),TYPE)
SET @mode = ISNULL(@mode, '')
EXEC core.auditCall @procid = @@PROCID, @params = @callParams

DECLARE
    @cardStatus varchar(30),
    @cardActivation datetime,
    @cardExpiration datetime,
    @cardOffset varchar(32),
    @sourceAccountNumber varchar(30),
    @sourceAccountName varchar(100),
    @issuerId varchar(50),
    @cardProductName nvarchar(100),
	@cardHolderName nvarchar(100),
    @destinationAccountNumber varchar(30),
    @destinationAccountName varchar(100),
    @cardNumber varchar(30),
    @retryCount int,
    @retryLimit int,
    @retryCountDaily int,
    @retryLimitDaily int,
    @pinRetriesLastInvalid datetime2(0),
    @ordererId bigint,
    @isFound bit = 0

SELECT TOP 1
    @isFound = 1,
    @cardNumber = cardNumber,
    @cardStatus = ISNULL(statusName,'NULL'),
    @cardActivation = activationDate,
    @cardExpiration = expirationDate,
    @cardOffset = ISNULL(pinOffset,''),
    @issuerId = issuerId,
    @sourceAccountNumber = accountNumber,
    @sourceAccountName = accountName,
	@cardHolderName = holder,
    @retryCount = pinRetries,
    @cardProductName = cardProductName,
    @retryLimit = pinRetriesLimit,
    @retryCountDaily = ISNULL(pinRetriesDaily, 3),
    @retryLimitDaily = ISNULL(pinRetriesDailyLimit, 3),
    @pinRetriesLastInvalid = pinRetriesLastInvalid,
    @ordererId = personId
FROM
    (SELECT
        vc.cardNumber,
        vc.statusName,
        vc.activationDate,
        vc.expirationDate,
        vc.pinOffset,
        vc.issuerId,
        vc.accountNumber,
        vc.accountname,
		vc.holder,
        vc.cardProductName,
        vc.pinRetries,
        vc.pinRetriesLimit,
        vc.pinRetriesDaily,
        vc.pinRetriesDailyLimit,
        vc.pinRetriesLastInvalid,
        vc.personId,
        c.currency,
        ISNULL(vc.accountOrder, 99) accountOrder,
        RANK() OVER (ORDER BY ISNULL(vc.accountOrder, 99), vc.accountNumber) rnk
    FROM
        integration.vCardAccount vc JOIN [card].[cardAccount]  c on vc.cardId = c.cardId and c.accountNumber = vc.accountNumber
    WHERE
        vc.cardId = @cardId AND
        vc.accountNumber <> '' AND
		(c.currency = @currency OR @currency = '') AND 
        (accountType = @sourceAccountType OR @sourceAccountType IS NULL OR accountType IS NULL)
    ) x
WHERE
    'selected:' + CONVERT(varchar(10), x.rnk) = ISNULL(@sourceAccount, 'selected:1') OR
    x.accountNumber = @sourceAccount
ORDER BY
    accountOrder, accountNumber

IF ISNULL(@sourceAccount, '') <> '' AND @sourceAccount NOT LIKE 'selected:%'
BEGIN
    SET @sourceAccountNumber = @sourceAccount
END

IF @destinationType = 'cardId'
BEGIN
    SELECT TOP 1
        @destinationAccountNumber = accountNumber,
        @destinationAccountName = accountName
    FROM
        (SELECT
            accountNumber,
            accountName,
            ISNULL(accountOrder, 99) accountOrder,
            RANK() OVER (ORDER BY ISNULL(accountOrder, 99), accountNumber) rnk
        FROM
            integration.vCardAccount
        WHERE
            cardId = @destinationTypeId AND
            accountNumber <> '' AND
            (accountType = @destinationAccountType OR @destinationAccountType IS NULL OR accountType IS NULL)
        ) x
    WHERE
        CONVERT(varchar(10), x.rnk) = ISNULL(@destinationAccount, '1') OR
        x.accountNumber = @destinationAccount
    ORDER BY
        accountOrder, accountNumber
END ELSE
IF @destinationType = 'actorId'
BEGIN
    SELECT TOP 1
        @destinationAccountNumber = accountNumber,
        @destinationAccountName = accountName
    FROM
        (SELECT
            accountNumber,
            accountName,
            ISNULL(accountOrder, 99) accountOrder,
            RANK() OVER (ORDER BY ISNULL(accountOrder, 99), accountNumber) rnk
        FROM
            integration.vCardAccount
        WHERE
            customerId = @destinationTypeId AND
            accountNumber <> '' AND
            (accountType = @destinationAccountType OR @destinationAccountType IS NULL OR accountType IS NULL)
        ) x
    WHERE
        CONVERT(varchar(10), x.rnk) = ISNULL(@destinationAccount, '1') OR
        x.accountNumber = @destinationAccount
    ORDER BY
        accountOrder, accountNumber
END ELSE
IF @destinationType = 'partnerId'
BEGIN
    SELECT
		@isFound = 1,
		@cardStatus = 'active',
		@cardActivation = getdate(),
		@issuerId = partnerid,
        @destinationAccountNumber = settlementAccount,
        @destinationAccountName = [name]
    FROM
        [transfer].[partner]
    WHERE
        partnerId = @destinationTypeId
END ELSE
IF @destinationType = 'accountNumber'
BEGIN
   SET @destinationAccountNumber = @destinationAccount
END
--select @pinOffset = 'skip', //Uncomment to skip pin check
IF @isFound = 0
BEGIN
    RAISERROR('card.unknown', 16, 1)
END
ELSE IF @cardStatus IN ('hot')
BEGIN
    RAISERROR('card.hot', 16, 1)
END
ELSE IF @cardStatus IN ('new', 'pendingActivation') OR @cardActivation IS NULL OR @cardActivation > GETDATE()
BEGIN
    RAISERROR('card.notActivated', 16, 1)
END
ELSE IF @cardExpiration IS NOT NULL AND GETDATE() > @cardExpiration
BEGIN
    RAISERROR('card.expired', 16, 1)
END
ELSE IF @cardStatus IN ('inactive')
BEGIN
    RAISERROR('card.inactive', 16, 1)
END
ELSE IF @cardStatus = 'destructed'
BEGIN
    RAISERROR('card.forDestruction', 16, 1)
END -- uncomment below when pin is working okay
ELSE IF LEN(@cardOffset) <> 32 AND (LEN(@cardOffset) <> 0 OR @mode NOT IN ('POS changepin','PED changepin','ATM changepin'))
BEGIN
    RAISERROR('card.invalidPinData', 16, 1)
END
ELSE IF @cardStatus='active'
BEGIN
    IF (@pinOffset='skip')
    BEGIN
        SELECT
            @sourceAccountNumber sourceAccountNumber,
            @sourceAccountName sourceAccountName,
            @destinationAccountNumber destinationAccountNumber,
            @destinationAccountName destinationAccountName,
            @cardNumber cardNumber,
			@cardHolderName cardHolderName,
            @issuerId issuerId,
            @cardProductName cardProductName,
            'cbs' ledgerId,
            @ordererId ordererId
    END ELSE
    IF @retryCount >= @retryLimit
    BEGIN
        RAISERROR('card.retryLimitExceeded', 16, 1)
    END ELSE
    IF @retryCountDaily >= @retryLimitDaily AND @pinRetriesLastInvalid > (dateadd(day, -1, getdate()))
    BEGIN
        RAISERROR('card.retryDailyLimitExceeded', 16, 1)
    END ELSE
    IF @cardOffset = '' and @mode = 'ATM checkpin'
    BEGIN
        RAISERROR('card.pinNotSet', 16, 1)
    END ELSE
    IF (@pinOffset = 'invalid') OR (@pinOffsetNew = 'invalid')
    BEGIN
        RAISERROR('card.hsmError', 16, 1)
    END ELSE
    IF @cardOffset = @pinOffset OR (@cardOffset = '' AND @mode IN ('POS changepin','PED changepin','ATM changepin','ATM checkpin'))
    BEGIN
        IF @mode IN ('POS changepin','PED changepin','ATM changepin')
        BEGIN
            IF @pinOffsetNew IS NULL
            BEGIN
                RAISERROR('card.emptyPin', 16, 1)
                RETURN
            END

            UPDATE
                integration.vCard
            SET
                pinOffset = @pinOffsetNew,
                pinRetries = 0,
                pinRetriesDaily = 0,
                pinRetriesLastInvalid = NULL
            WHERE
                cardId = @cardId

            IF @@ROWCOUNT = 0
                RAISERROR('card.unknown', 16, 1)
            ELSE
                SELECT
                    @sourceAccountNumber sourceAccountNumber,
                    @sourceAccountName sourceAccountName,
                    @destinationAccountNumber destinationAccountNumber,
                    @destinationAccountName destinationAccountName,
                    @cardNumber cardNumber,
					@cardHolderName cardHolderName,
                    @issuerId issuerId,
                    @cardProductName cardProductName,
                    'cbs' ledgerId,
                    @ordererId ordererId
        END
        ELSE IF @cardOffset = '' AND @mode IN ('ATM checkpin')
        BEGIN
            SELECT 'pin not set' result
        END
        ELSE
        BEGIN
            UPDATE
                integration.vCard
            SET
                pinRetries = 0,
                pinRetriesDaily = 0,
                pinRetriesLastInvalid = NULL
            WHERE
                cardId = @cardId

            SELECT
                @sourceAccountNumber sourceAccountNumber,
                @sourceAccountName sourceAccountName,
                @destinationAccountNumber destinationAccountNumber,
                @destinationAccountName destinationAccountName,
                @cardNumber cardNumber,
				@cardHolderName cardHolderName,
                @issuerId issuerId,
                @cardProductName cardProductName,
                'cbs' ledgerId,
                @ordererId ordererId
        END
    END ELSE
    BEGIN
        UPDATE
            integration.vCard
        SET
            @retryCount = pinRetries = ISNULL(pinRetries, 0) + 1,
            @retryCountDaily = pinRetriesDaily = CASE WHEN (ISNULL(pinRetriesDaily, 0) + 1) = @retryLimitDaily THEN ISNULL(@retryCountDaily, 0) + 1
                                                      ELSE (ISNULL(pinRetriesDaily, 0) + 1) % @retryLimitDaily
                                                 END,
            pinRetriesLastInvalid = GetDate()
        WHERE
            cardId = @cardId

        IF @retryCount >= @retryLimit
        BEGIN   -- set cart status to permanent blocked
            UPDATE
                integration.vCard
            SET
                statusId = (SELECT statusId FROM [integration].[vCardStatus] WHERE statusName = N'PermanentBlocked')
            WHERE
                cardId = @cardId

            RAISERROR('card.retryLimitExceeded', 16, 1)
        END ELSE
        IF @retryCountDaily >= @retryLimitDaily
        BEGIN
            RAISERROR('card.retryDailyLimitExceeded', 16, 1)
        END ELSE
        BEGIN
            RAISERROR('card.incorrectPin', 16, 1)
        END
    END
END
ELSE
BEGIN
    RAISERROR('card.invalidStatus', 16, 1)
END