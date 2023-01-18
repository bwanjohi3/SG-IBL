ALTER PROCEDURE [card].[cardInUse.resetPINRetries] -- the SP sets the incorrect PIN counter to 0
    @card [card].cardTT READONLY, -- card details
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @callParams XML = ( SELECT (SELECT * from @card rows FOR XML AUTO, TYPE) card, (SELECT * from @meta rows FOR XML AUTO, TYPE) meta FOR XML RAW('params'),TYPE)
BEGIN TRY
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    update cc set
        pinRetries = 0,
        pinRetriesDaily = 0,
        pinRetriesLastInvalid = NULL
    from @card c
    join card.card cc on cc.cardId = c.cardId

END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
