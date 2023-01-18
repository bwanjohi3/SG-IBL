DECLARE @atmAtmsim BIGINT = (SELECT MIN(actorId) FROM [atm].[terminal] WHERE tmkkvv = N'atmsim' )
DECLARE @atmA57622 BIGINT = (SELECT MIN(actorId) FROM [atm].[terminal] WHERE tmkkvv = N'4D65C8' )
DECLARE @isoH2H BIGINT = (SELECT MIN(actorId) FROM [core].[actor] WHERE actorType = N'H2H')
DECLARE @isoDHI BIGINT = (SELECT MIN(actorId) FROM [core].[actor] WHERE actorType = N'DHI')
DECLARE @pedD3E275 BIGINT = (SELECT MIN(actorId) FROM [ped].[terminal] WHERE terminalId = N'SN110019')      -- tmkkvv = N'D3E275'
DECLARE @systemCbs BIGINT = (SELECT MIN(actorId) FROM [transfer].[partner] WHERE partnerId = N'cbs')

DECLARE @systemcbl BIGINT = (SELECT MIN(actorId) FROM [transfer].[partner] WHERE partnerId = N'cbl')
DECLARE @systemH2H BIGINT = (SELECT MIN(actorId) FROM [transfer].[partner] WHERE partnerId = N'h2h')

DECLARE @createTransfer BIGINT
DECLARE @dhiTransfer BIGINT

IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Create transfers')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @createTransfer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@createTransfer, 'Create transfers', 'Create transfers', 1, 0, null, 1)
END
ELSE
    SET @createTransfer = (SELECT actorId FROM [user].[role] WHERE name = 'Create transfers')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@createTransfer, 'transfer.push.create', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);


IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'DHI manage transfers')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @dhiTransfer = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@dhiTransfer, 'DHI manage transfers', 'DHI manage transfers', 1, 0, null, 1)
END
ELSE
    SET @dhiTransfer = (SELECT actorId FROM [user].[role] WHERE name = 'DHI manage transfers')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@dhiTransfer, 'transfer.push.create', '%', 1),
        (@dhiTransfer, 'transfer.push.reverse', '%', 1),
        (@dhiTransfer, 'transfer.transfer.get', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

IF @atmAtmsim IS NULL
BEGIN
    INSERT
        [core].[actor](actorType, isEnabled)
    VALUES
        (N'atm', 1)

    SET @atmAtmsim = SCOPE_IDENTITY()

    IF NOT EXISTS (SELECT actorId FROM [atm].[terminal] WHERE terminalId='12345678')
    BEGIN
    INSERT
        [atm].[terminal] (actorId, luno, tmk, tmkkvv, [name], customization, institutionCode, terminalId, identificationCode, merchantId, merchantType, tsn, address,
        cassette1Currency, cassette1Denomination, cassette2Currency, cassette2Denomination, cassette3Currency, cassette3Denomination, cassette4Currency, cassette4Denomination)
    VALUES
        (@atmAtmsim, N'001', 'UF61471FD9BCEA1D5FE44AAB1C739789C', N'atmsim', N'Test automation', N'std', NULL, N'12345678', NULL, NULL, NULL, 0, 'SG SF',
        'USD', 100, 'USD', 50, 'USD', 20, 'USD', 10)

    INSERT INTO [core].[actorHierarchy] (subject, predicate, object, isDefault) VALUES (@atmAtmsim, 'role', @createTransfer, 1)
    END
END

IF @atmA57622 IS NULL
BEGIN
    INSERT
        [core].[actor](actorType, isEnabled)
    VALUES
        (N'atm', 1)

    SET @atmA57622 = SCOPE_IDENTITY()

    IF NOT EXISTS (SELECT actorId FROM [atm].[terminal] WHERE terminalId='12345679')
    BEGIN
    INSERT
        [atm].[terminal] (actorId, luno, tmk, tmkkvv, [name], customization, institutionCode, terminalId, identificationCode, merchantId, merchantType, tsn, address,
        cassette1Currency, cassette1Denomination, cassette2Currency, cassette2Denomination, cassette3Currency, cassette3Denomination, cassette4Currency, cassette4Denomination)
    VALUES
        (@atmA57622, N'002', N'UAB09AFAEB2EF42EC0BA3668ADB54BDAD', N'4D65C8', N'ATMulator  plus', N'std', NULL, N'12345679', NULL, NULL, NULL, 0, 'SG SF',
        'USD', 100, 'USD', 50, 'USD', 20, 'USD', 10)

    INSERT INTO [core].[actorHierarchy] (subject, predicate, object, isDefault) VALUES (@atmA57622, 'role', @createTransfer, 1)
    END
END

IF @isoH2H IS NULL
BEGIN
    INSERT
        [core].[actor] (actorType, isEnabled)
    VALUES
        (N'H2H', 1)

    SET @isoH2H = SCOPE_IDENTITY()

    INSERT
        iso.terminal(actorId, zmk, zmkkvv, name, institutionCode)
    VALUES
        (@isoH2H, N'U602A83E33EE7267B427417A80506E82C', N'2D617C', N'NI', N'999991')

    INSERT INTO [core].[actorHierarchy] (subject, predicate, object, isDefault) VALUES (@isoH2H, 'role', @createTransfer, 1)
END

IF @isoDHI IS NULL
BEGIN
    INSERT
        [core].[actor] (actorType, isEnabled)
    VALUES
        (N'dhi', 1)

    SET @isoDHI = SCOPE_IDENTITY()

    INSERT
        iso.terminal(actorId, zmk, zmkkvv, name, institutionCode)
    VALUES
        (@isoDHI, N'U773F7C1902633996DCCBE4EC5F2986AD', N'F3BF48', N'DHI', N'012345')

    INSERT INTO [core].[actorHierarchy] (subject, predicate, object, isDefault) VALUES (@isoDHI, 'role', @dhiTransfer, 1)
END

IF @pedD3E275 IS NULL
BEGIN
    INSERT
        [core].[actor] (actorType, isEnabled)
    VALUES
        (N'ped', 1)

    SET @pedD3E275 = SCOPE_IDENTITY()

    INSERT
        [ped].[terminal] (actorId, tmk, tmkkvv, [name], institutionCode, terminalId, terminalName, identificationCode, merchantId, merchantType, tsn)
    VALUES
        (@pedD3E275, N'UC618321CCB4266EF029EFAF84891F6C3', N'D3E275', N'utpinpad', N'', N'SN110019', N'PED Port Villa', N'1111111111', NULL, N'6011', 115)
END

IF @systemCbs IS NULL
BEGIN
    INSERT
        [core].[actor](actorType, isEnabled)
    VALUES
        (N'system', 1)

    SET @systemCbs = SCOPE_IDENTITY()

    INSERT
        [transfer].[partner] (actorId, partnerId, [name], port, mode, settlementDate, serialNumber, settings)
    VALUES
        (@systemCbs, N'cbs', N'tss', N'tss/transfer', N'online', N'2017-01-16 10:30:07.777', 3, NULL)
END
--dummy cbl entry. Correct it after getting accurate values
IF @systemcbl IS NULL
BEGIN
        INSERT
                [core].[actor](actorType, isEnabled)
            VALUES
                (N'system', 1)

            SET @systemcbl = SCOPE_IDENTITY()

            INSERT
                [transfer].[partner] (actorId, partnerId, [name], port, mode, settlementDate,settlementaccount,feeaccount,commissionaccount, serialNumber, settings)
            VALUES
                (@systemcbl, N'cbl', N'cbl', N'cbl/transfer', N'online', N'2017-01-16 10:30:07.777','484848484','383838383','83838383', 3, NULL)
END

IF @systemH2H IS NULL
BEGIN
    INSERT
        [core].[actor](actorType, isEnabled)
        VALUES
            (N'system', 1)

        SET @systemH2H = SCOPE_IDENTITY()

        INSERT
            [transfer].[partner] (actorId, partnerId, [name], port, mode, settlementDate,settlementaccount,feeaccount,commissionaccount, serialNumber, settings)
        VALUES
            (@systemH2H, N'h2h', N'h2h', N'h2h/transfer', N'online', N'2017-01-16 10:30:07.777', '123456789', '123456789', '123456789', 3, NULL)
END
