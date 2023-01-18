ALTER PROCEDURE [card].[bin.edit]  -- edits card Bin information
    @bin [card].binTT READONLY, -- the edited Bin information
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @callParams XML
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta) -- the id of the user that makes the operation

BEGIN TRY

    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @startBin VARCHAR(8) = (SELECT startBin FROM @bin)
    DECLARE @endBin VARCHAR(8) = (SELECT endBin FROM @bin)
    DECLARE @binId BIGINT = (SELECT binId FROM @bin)
    IF EXISTS (SELECT 1 FROM [card].bin cb
               WHERE (@startBin BETWEEN startBin AND endBin
                   OR @endBin BETWEEN startBin AND endBin)
                   AND binId <> @binId)
        RAISERROR ('card.binRangeAlreadyInUse', 16,1)

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    BEGIN TRANSACTION
        UPDATE b
       SET b.startBin = s.startBin,
          b.endBin = s.endBin,
          b.updatedBy = @userId,
          b.updatedOn = getdate(),
          b.isActive  =  s.isActive,
          b.ownershipTypeId = s.ownershipTypeId
        FROM [card].bin b
        INNER JOIN @bin s ON b.binId = s.binId

       UPDATE i
       SET itemNameTranslation = r.[description]
       FROM [core].[itemTranslation] i
       join [card].bin cr on cr.itemNameId = i.itemNameId and i.languageId = @languageId
       join @bin r on r.binId = cr.binId

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
   IF @@trancount > 0 ROLLBACK TRANSACTION

   IF error_number() not in (2627)
       BEGIN
          EXEC [core].[error]
       END
    ELSE
    BEGIN TRY
       RAISERROR('Bin already exists', 16, 1);
    END TRY
    BEGIN CATCH
       EXEC [core].[error]
    END CATCH
END CATCH