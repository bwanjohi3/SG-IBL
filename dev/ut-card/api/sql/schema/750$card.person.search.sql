ALTER PROCEDURE [card].[person.search] -- fetch all persons by customer number as the passed
    @customerNumber nvarchar(10), --customer number for which to search
    @personName nvarchar(100), --person name
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

SET NOCOUNT ON
--checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

SELECT 'person' AS resultSetName

SELECT c.personName, personNumber, personTelMobile
FROM [integration].[vCustomer] c
where customerNumber = @customerNumber
    and (@personName is null or personName like @personName + '%' )