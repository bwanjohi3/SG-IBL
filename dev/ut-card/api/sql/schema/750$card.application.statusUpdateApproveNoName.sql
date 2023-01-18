alter procedure [card].[application.statusUpdateApproveNoName] -- executed when No Name card is approved - updates the card status to Active and removes reason Id and comment from application
    @application [card].applicationTT READONLY,-- the list with the applications
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    DECLARE @statusId INT = (SELECT statusId from card.status  where statusName='Active')

    -- update card status to Active
    update c
    set previousStatusId = c.statusId,
        statusId = @statusId,
        updatedBy = @userId,
       updatedOn = GETDATE(),
       activatedBy = @userId,
       activationDate = getdate(),
       expirationDate = dateadd (month, t.termMonth, getdate())
    from @application a
    join card.card c on c.applicationId = a.applicationId
    join [card].[type] t on t.typeId = c.typeId

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
 