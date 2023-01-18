ALTER PROCEDURE [card].[bin.add] -- add new card bin in DB
    @bin [card].binTT READONLY,-- -- in this parameter the stored procedure receives all fields of card Bin   
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @noResultSet bit = 0 -- this is the flag about the waited result
AS
    DECLARE @callParams XML
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    DECLARE @result [card].binTT
    SET @noResultSet = ISNULL(@noResultSet, 0)
BEGIN TRY
    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @startBin VARCHAR(8) = (SELECT startBin FROM @bin)
    DECLARE @endBin VARCHAR(8) = (SELECT endBin FROM @bin)
    DECLARE @binId int
    DECLARE @ownershipTypeId INT = (SELECT ownershipTypeId FROM @bin)
    DECLARE @ownershipTypeIdExternalCnt bigint = ISNULL((SELECT COUNT(*)
                                FROM [card].[ownershipType] cot
                                LEFT JOIN [core].[itemName] cin ON cin.itemNameId = cot.ownershipTypeId
                                WHERE cin.itemCode LIKE '%external%' AND cot.ownershipTypeId = @ownershipTypeId), 0)
    IF EXISTS (SELECT 1 FROM [card].bin cb
               WHERE @startBin BETWEEN startBin AND endBin
                   OR @endBin BETWEEN startBin AND endBin)
        RAISERROR ('card.binRangeAlreadyInUse', 16,1)

    IF @ownershipTypeIdExternalCnt = 0
        AND @startBin <> @endBin
        BEGIN
            RAISERROR ('card.ownBinRange', 16,1)
        END
    ELSE IF @ownershipTypeIdExternalCnt > 0
        AND @startBin = @endBin
        BEGIN
            RAISERROR ('card.externalSingleBin', 16,1)
        END

    DECLARE @languageId BIGINT = isnull((SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId), (SELECT [languageId] FROM [core].[language] WHERE [name] = 'English'))

    IF @languageId is null
        SET @languageId = (SELECT [languageId] FROM [core].[language] WHERE [name] = 'English')

    DECLARE @itemNameId BIGINT

    --
    BEGIN TRANSACTION

        INSERT INTO core.itemName(itemTypeId, itemName, organizationId, isEnabled)
        SELECT itemTypeId, b.[description], null, 1
        FROM core.itemType 
        CROSS APPLY @bin b
        WHERE alias = 'cardBin'

        SET @itemNameId = SCOPE_IDENTITY()

        INSERT INTO core.itemTranslation (languageId, itemNameId, itemNameTranslation)
        SELECT @languageId, @itemNameId, [description]
        FROM  @bin

        INSERT INTO [card].bin  (startBin, endBin, [description], [createdBy], [createdOn], [updatedBy], [updatedOn], [isActive], [itemNameId], [ownershipTypeId] )
        OUTPUT INSERTED.binId, INSERTED.startBin, INSERTED.endBin, INSERTED.[description], INSERTED.[createdBy], INSERTED.[createdOn], INSERTED.[updatedBy], INSERTED.[updatedOn], 
        INSERTED.[isActive], INSERTED.[itemNameId], INSERTED.[ownershipTypeId]
        INTO @result (binId, startBin, endBin, [description], [createdBy], [createdOn], [updatedBy], [updatedOn], [isActive], [itemNameId], [ownershipTypeId] )
        SELECT startBin, endBin,  [description],  @userId, getdate(), @userId, getdate(), isnull(isActive,1), @itemNameId, [ownershipTypeId]
        FROM @bin

        SET @binId = SCOPE_IDENTITY()

    IF @ownershipTypeIdExternalCnt > 0
    BEGIN
        DECLARE @branchId INT = (SELECT TOP 1 actorId FROM [customer].[organization])
        DECLARE @cardNumberConstructionId INT = (SELECT TOP 1 [cardNumberConstructionId] FROM [card].[cardNumberConstruction])
        INSERT INTO [card].number ([pan], [cardNumberConstructionId], [binId], [branchId], [isUsed])
        VALUES (@startBin, @cardNumberConstructionId, @binId, @branchId, 1)
    END

    COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'cardBin' AS resultSetName
        SELECT * FROM @result
    END

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
