CREATE PROCEDURE [card].[generated.add] --inserts new generated card numbers
    @pans [card].numberTT READONLY, -- the list with the card numbers
    @binId int, -- for which bin are these cards
    @cardNumberConstructionId int, -- for which card Number Construction
    @branchId bigint, -- for which branch are these cards
    @next int, --last generated number (encrypted)
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    begin transaction

        insert into [card].number(last4Digits, pan, cardNumberConstructionId, binId, branchId, isUsed)
        select nt.last4Digits, nt.pan, @cardNumberConstructionId, @binId, @branchId, 0
        from @pans nt

        IF EXISTS(SELECT * FROM [card].lastGeneratedNumber WHERE binId = @binId AND cardNumberConstructionId = @cardNumberConstructionId AND branchId = @branchId) BEGIN
            UPDATE [card].lastGeneratedNumber SET [next] = @next WHERE binId = @binId AND cardNumberConstructionId = @cardNumberConstructionId AND branchId = @branchId
        END ELSE BEGIN
            insert into [card].lastGeneratedNumber(binId, cardNumberConstructionId, branchId, [next])
            values (@binId, @cardNumberConstructionId, @branchId, @next)
        END

    commit transaction

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
