ALTER PROCEDURE [atm].[terminal.edit]         -- for update of atm
    @terminal   [atm].terminalTT READONLY,       -- table with updated terminal information
    @meta     core.metaDataTT READONLY       -- information for the user that makes the operation
AS
BEGIN TRY
    /*  permission.check will be added later when user modul is added into project */
--  declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
--  exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    /*  permission.check will be added later when user modul is added into project */

    IF EXISTS (SELECT 1 FROM atm.terminal WHERE tmkkvv IN (SELECT tmkkvv FROM  @terminal) AND actorId NOT IN (SELECT actorId FROM  @terminal))
        RAISERROR('atm.duplicateTmkkvv', 16, 1);

    IF EXISTS (SELECT 1 FROM atm.terminal WHERE terminalId IN (SELECT terminalId FROM  @terminal) AND actorId NOT IN (SELECT actorId FROM  @terminal))
        RAISERROR('atm.duplicateTerminalId', 16, 1);

    IF EXISTS (SELECT 1 FROM @terminal t
               JOIN atm.terminal atm ON atm.actorId = t.actorId
               WHERE len (  COALESCE (t.[address], atm.[address], '') 
                          + COALESCE (t.[city], atm.city, '') 
                          + COALESCE (t.[state], atm.[state], '')
                          + COALESCE (t.[country], atm.[country], ''))
                          > 40
                         )    
        RAISERROR('atm.terminalAddressLimitExceeded', 16, 1);  

    UPDATE t 
    SET t.[luno]                    = ISNULL(s.[luno], t.[luno])
       ,t.[tmk]                     = ISNULL(s.[tmk], t.[tmk])
       ,t.[tmkkvv]                  = ISNULL(s.[tmkkvv], t.[tmkkvv])
       ,t.[name]                    = ISNULL(s.[name], t.[name])
       ,t.[customization]           = ISNULL(s.[customization], t.[customization])
       ,t.[terminalId]              = ISNULL(s.[terminalId], t.[terminalId])
       ,t.[address]                 = ISNULL(s.[address], t.[address])
       ,t.[city]                    = ISNULL(s.[city], t.[city])
       ,t.[state]                   = ISNULL(s.[state], t.[state])
       ,t.[country]                 = ISNULL(s.[country], t.[country])
       ,t.[identificationCode]      = ISNULL(s.[identificationCode], t.[identificationCode])
       ,t.[merchantType]            = ISNULL(s.[merchantType], t.[merchantType])
       ,t.[cassette1Currency]       = ISNULL(s.[cassette1Currency], t.[cassette1Currency])
       ,t.[cassette1Denomination]   = ISNULL(s.[cassette1Denomination], t.[cassette1Denomination])
       ,t.[cassette2Currency]       = ISNULL(s.[cassette2Currency], t.[cassette2Currency])
       ,t.[cassette2Denomination]   = ISNULL(s.[cassette2Denomination], t.[cassette2Denomination])
       ,t.[cassette3Currency]       = ISNULL(s.[cassette3Currency], t.[cassette3Currency])
       ,t.[cassette3Denomination]   = ISNULL(s.[cassette3Denomination], t.[cassette3Denomination])
       ,t.[cassette4Currency]       = ISNULL(s.[cassette4Currency], t.[cassette4Currency])
       ,t.[cassette4Denomination]   = ISNULL(s.[cassette4Denomination], t.[cassette4Denomination])
       ,t.[tillAccount]             = ISNULL(s.[tillAccount], t.[tillAccount])
       ,t.[feeAccount]              = ISNULL(s.[feeAccount], t.[feeAccount])
       ,t.[commissionAccount]       = ISNULL(s.[commissionAccount], t.[commissionAccount])
       ,t.[branchId]                = ISNULL(s.[branchId], t.[branchId])
       --,t.[institutionCode]         = ISNULL(s.[institutionCode], t.[institutionCode])
       --,t.[merchantId]              = ISNULL(s.[merchantId], t.[merchantId])
       --,t.[tsn]                     = ISNULL(s.[tsn], t.[tsn])
    FROM [atm].[terminal] t
    JOIN @terminal s ON t.actorId   = s.actorId
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH