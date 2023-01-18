alter procedure [card].[application.statusUpdateDecline] -- executed when application is declined - detaches the card from the application and sets it to accepted status
    @application [card].applicationTT READONLY,-- the list with the applications
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta


   DELETE ca
   FROM [card].[cardAccount] ca
   join [card].[card] c on ca.cardId = c.cardid
   join @application a on a.applicationId = c.applicationId


    update c
    set [customerNumber] = NULL,
       [customerName] = NULL,
       [personName] = NULL,
       [statusId] = (select statusid from [card].[status] where statusname = 'Declined'),
       [applicationId] = NULL,
       [updatedOn] = getdate(),
       [updatedBy] = @userId,
       [personNumber] = NULL,
       [previousStatusId] = c.[statusId],
       [reasonId] = a.reasonId,
       [comments] = a.comments
    from @application a
    join [card].[card] c on a.applicationId = c.applicationId


     EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
