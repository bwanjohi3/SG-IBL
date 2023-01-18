create procedure [card].[application.statusUpdateApproveName] -- executed when a named application is approved - sets the reason Id and the comments to NULL
    @application [card].applicationTT READONLY, -- the list with the applications
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update ap
    set ap.reasonId = a.reasonId,
        ap.comments = a.comments
    from @application a
    join [card].[application] ap on a.applicationId = ap.applicationId

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
 