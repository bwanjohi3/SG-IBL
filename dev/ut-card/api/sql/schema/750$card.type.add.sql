ALTER PROCEDURE [card].[type.add] -- the SP add new card type in DB
    @type [card].typeTT READONLY,-- in this parameter the stored procedure receives all fields of card Type
    @binId [core].[arrayNumberList] READONLY, -- the bin ids that will be assigned to card type   
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @noResultSet bit = 0 -- this is the flag about the waited result
AS
SET NOCOUNT ON
DECLARE @callParams XML = ( SELECT (SELECT * from @type rows FOR XML AUTO, TYPE) [type], (SELECT * from @binId rows FOR XML AUTO, TYPE) [binId], (SELECT * from @meta rows FOR XML AUTO, TYPE) [meta], @noResultSet [noResultSet] FOR XML RAW('params'),TYPE)
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @resultType [card].typeTT
SET @noResultSet = ISNULL(@noResultSet, 0)
BEGIN TRY
    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    IF @return != 0
        BEGIN
            RETURN 55555
        END

    DECLARE @ownershipTypeIdOwn bigint = (SELECT TOP 1 [ownershipTypeId]
                                FROM [card].[ownershipType] cot
                                LEFT JOIN [core].[itemName] cin on cin.itemNameId = cot.ownershipTypeId
                                WHERE cin.itemCode = 'own')

    IF NOT EXISTS (SELECT 1 FROM @binId)
        RAISERROR ('card.typeBinNotProvided', 16,1);

    IF EXISTS (SELECT 1 FROM @binId b
               LEFT JOIN [card].bin cb ON b.[value] = cb.binId
               WHERE cb.binId IS NULL)
        RAISERROR ('card.binDoesNotExist', 16,1);
    
    IF EXISTS (SELECT 1 FROM @binId b
               JOIN [card].bin cb ON b.[value] = cb.binId
               WHERE cb.typeId IS NOT NULL)
                 --AND cb.ownershipTypeId <> @ownershipTypeIdOwn)
        RAISERROR ('card.binAlreadyAssigned', 16,1);
    
    IF (SELECT COUNT (DISTINCT ownershipTypeId)
        FROM [card].bin cb
        JOIN @binId b ON b.value = cb.binId) > 1
        RAISERROR ('card.differentBinOwnerships', 16,1);
    
    IF (SELECT TOP 1 cb.ownershipTypeId
        FROM @binId b
        LEFT JOIN [card].bin cb on b.value = cb.binid) = @ownershipTypeIdOwn
        BEGIN
            DECLARE @cvk varchar(64) = (SELECT t.cvk from @type t)
            DECLARE @pvk varchar(64) = (SELECT t.pvk from @type t)
            DECLARE @mkac varchar(64) = (SELECT t.mkac from @type t)

            IF (@cvk IS NULL OR @pvk IS NULL OR @mkac IS NULL)
                RAISERROR ('card.differentBinTypeOwnership', 16,1);
        END
    ELSE
        BEGIN
            DECLARE @emvRequestTags varchar(1000) = (SELECT t.emvRequestTags from @type t)
            DECLARE @emvResponseTags varchar(1000) = (SELECT t.emvResponseTags from @type t)

            IF (@emvRequestTags IS NULL OR @emvResponseTags IS NULL)
                RAISERROR ('card.differentBinTypeOwnership', 16,1);
        END

    IF ((SELECT TOP 1 ownershipTypeId
        FROM [card].bin cb
        JOIN @binId b ON b.value = cb.binId) = @ownershipTypeIdOwn
        AND
        (SELECT COUNT(*) FROM @binId) > 1
    )
        RAISERROR ('card.tooManyBinsSelected', 16,1);

    IF EXISTS (SELECT 1
        FROM @type t
        INNER JOIN [card].type ct on t.name = ct.name)
        BEGIN
            RAISERROR ('card.typeNameAlreadyExists', 16,1);
        END

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    IF @languageId is null
        SET @languageId = (SELECT [languageId] FROM [core].[language] WHERE [name] = 'English')

    DECLARE @flow varchar(64);
    DECLARE @itemNameId BIGINT
    --
    BEGIN TRANSACTION
        INSERT INTO core.itemName(itemTypeId, itemName, organizationId, isEnabled)
        SELECT itemTypeId, t.name,null, 1
        FROM core.itemType
        CROSS APPLY @type t
        WHERE alias = 'cardType'

        SET @itemNameId = SCOPE_IDENTITY()

        INSERT INTO core.itemTranslation (languageId, itemNameId, itemNameTranslation)
        SELECT @languageId, @itemNameId, name
        FROM  @type     

        INSERT INTO [card].type
            (name,
            description,
            cardNumberConstructionId,
            cvk,
            pvk,
            cryptogramMethodIndex,
            cryptogramMethodName,
            schemeId,
            mkac,
            ivac,
            cdol1ProfileId,
            applicationInterchangeProfile,
            decimalisation,
            cipher,
            cvv1,
            cvv2,
            icvv,
            serviceCode1,
            serviceCode2,
            serviceCode3,
            emvRequestTags,
            emvResponseTags,
            termMonth,
            isActive,
            itemNameId,
            generateControlDigit,
            createdBy,
            createdOn,
            updatedBy,
            updatedOn,
            flow,
            issuerId,
            cardBrandId)
        OUTPUT
            INSERTED.typeId,
            INSERTED.name,
            INSERTED.description,
            INSERTED.cardNumberConstructionId,
            INSERTED.cryptogramMethodIndex,
            INSERTED.cdol1ProfileId,
            INSERTED.cvv1,
            INSERTED.cvv2,
            INSERTED.icvv,
            INSERTED.serviceCode1,
            INSERTED.serviceCode2,
            INSERTED.serviceCode3,
            INSERTED.termMonth,
            INSERTED.generateControlDigit,
            INSERTED.createdBy,
            INSERTED.createdOn,
            INSERTED.updatedBy,
            INSERTED.updatedOn,
            INSERTED.flow,
            INSERTED.issuerId,
            INSERTED.cardBrandId
        INTO @resultType
            (typeId,
            name,
            description,
            cardNumberConstructionId,
            cryptogramMethodIndex,
            cdol1ProfileId,
            cvv1,
            cvv2,
            icvv,
            serviceCode1,
            serviceCode2,
            serviceCode3,
            termMonth,
            generateControlDigit,
            createdBy,
            createdOn,
            updatedBy,
            updatedOn,
            flow,
            issuerId,
            cardBrandId)
        SELECT
            name,
            description,
            cardNumberConstructionId,
            cvk,
            pvk,
            cryptogramMethodIndex,
            cryptogramMethodName,
            schemeId,
            mkac,
            ivac,
            cdol1ProfileId,
            applicationInterchangeProfile,
            decimalisation,
            cipher,
            cvv1,
            cvv2,
            icvv,
            serviceCode1,
            serviceCode2,
            serviceCode3,
            emvRequestTags,
            emvResponseTags,
            termMonth,
            isnull(isActive,1),
            @itemNameId,
            generateControlDigit,
            @userId,
            getdate(),
            @userId,
            getdate(),
            flow,
            issuerId,
            cardBrandId
        FROM @type
      
        --assign bin(s) to card type
        UPDATE cb
        SET cb.typeId = r.typeId
        FROM [card].bin cb
        JOIN @binId b ON b.value = cb.binId
        JOIN @resultType r on 1 = 1

        --update type flow TO BE REVISED if needed
        UPDATE ct
        SET ct.flow = cin.itemCode
        FROM [card].[type] ct
        JOIN @resultType r ON r.typeId = ct.typeId
        JOIN [card].bin cb ON cb.typeId = r.typeId
        JOIN core.itemName cin ON cin.itemNameId = cb.ownershipTypeId

        SET @flow = (SELECT ct.flow FROM [card].[type] ct
            JOIN @resultType r ON r.typeId = ct.typeId)
        IF (@flow LIKE 'external%')
        BEGIN
            INSERT INTO [card].[card]
                ([cardId]
                , [statusId]
                , [typeId]
                , [createdBy]
                , [createdOn]
                , [updatedBy]
                , [pvk]
                , [pinOffset]
            )
            SELECT cn.numberId, 21, r.typeId, @userId, GETDATE(), @userId, 'skip', 'skip'
            FROM @resultType r
            JOIN [card].number cn ON cn.binId IN (SELECT [value] FROM @binId)
        END

    COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'cardType' AS resultSetName
        SELECT
            typeId,
            name,
            description,
            cardNumberConstructionId,
            cryptogramMethodIndex,
            cdol1ProfileId,
            cvv1,
            cvv2,
            icvv,
            serviceCode1,
            serviceCode2,
            serviceCode3,
            termMonth,
            generateControlDigit,
            createdBy,
            createdOn,
            updatedBy,
            updatedOn,
            flow,
            issuerId,
            cardBrandId
        FROM @resultType

        SELECT 'cardBin' as resultSetName
        SELECT
            b.[binId],
            b.[typeId]
        FROM [card].bin b
        JOIN @resultType r on r.typeId = b.typeId
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
       RAISERROR('card.typeNameAlreadyExists', 16, 1);
    END TRY
    BEGIN CATCH
          EXEC [core].[error]
    END CATCH
END CATCH