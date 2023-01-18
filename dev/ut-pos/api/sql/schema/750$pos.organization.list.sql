CREATE PROCEDURE [pos].[organization.list] -- lists all organizations
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

EXEC [customer].[organization.list] @meta = @meta
