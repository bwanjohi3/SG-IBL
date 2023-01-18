ALTER PROCEDURE [card].[cardInProduction.get] --this SP returns details for ready cards
    @cardId bigint, --the card id for which to return details
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
        RETURN 55555
END

exec [card].[card.get] @cardId = @cardId, @module = 'card',  @meta = @meta