CREATE PROCEDURE [card].[documentType.list] -- this SP returns all document types
@meta core.metaDataTT READONLY -- information for the user that makes the operation
as

   DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)


    select dt.documentTypeId as "key", ISNULL(it.itemNameTranslation, itn.itemName) as name
    from document.documentType dt
    JOIN core.itemName itn on dt.itemNameId = itn.itemNameId
    LEFT JOIN core.itemTranslation it on dt.itemNameId = it.itemNameId and it.languageId = @languageId


