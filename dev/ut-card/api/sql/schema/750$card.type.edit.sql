ALTER PROCEDURE [card].[type.edit] -- the SP add new card type in DB
    @type [card].typeTT READONLY,-- in this parameter the stored procedure receives all fields of card Type    
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @noResultSet bit = 0 -- this is the flag about the waited result
AS
SET NOCOUNT ON
DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @result [card].typeTT
DECLARE @flow varchar(100)
SET @noResultSet = ISNULL(@noResultSet, 0)
BEGIN TRY
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

    if @languageId is null
        set @languageId = (select [languageId] from [core].[language] where [name] = 'English')

    declare @itemNameId bigint
    --
    BEGIN TRANSACTION       

        UPDATE ct 
        SET ct.isActive = t.isActive,
            ct.updatedBy = @userId, 
            ct.updatedON = GETDATE()
        OUTPUT INSERTED.typeId, INSERTED.name, INSERTED.cardNumberConstructionId, INSERTED.cvk, INSERTED.pvk, INSERTED.decimalisation, INSERTED.cipher, INSERTED.cvv1, INSERTED.cvv2, 
               INSERTED.icvv, INSERTED.serviceCode1, INSERTED.serviceCode2, INSERTED.serviceCode3, INSERTED.termMonth, INSERTED.isActive,  INSERTED.itemNameId, 
               INSERTED.createdBy, INSERTED.createdOn, INSERTED.updatedBy, INSERTED.updatedOn, INSERTED.flow, INSERTED.issuerId, INSERTED.cardBrandId
        INTO @result (typeId, name, cardNumberConstructionId, cvk, pvk, decimalisation, cipher, cvv1, cvv2, icvv,
                      serviceCode1, serviceCode2, serviceCode3, termMonth, isActive,  itemNameId, createdBy, createdOn, updatedBy, updatedOn, flow, issuerId, cardBrandId)
        FROM card.type ct
        JOIN @type t ON t.typeId = ct.typeId
      

    COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'cardType' AS resultSetName
        SELECT * FROM @result
    END

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH
