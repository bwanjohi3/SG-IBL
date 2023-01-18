ALTER PROCEDURE [card].[product.edit] -- edits card Product information
    @product [card].productTT READONLY, -- the edited product information
    @noResultSet bit = 0, -- a flag to show if result is expected
    @productAccountType [card].productAccountTypeTT READONLY, -- details about the account type
    @productCustomerType [card].productCustomerTypeTT READONLY, -- details about the customer type
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @callParams XML
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta) -- the id of the user that makes the operation
    DECLARE @result [card].productTT

BEGIN TRY
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    if exists (SELECT 1 from @product where startDate > endDate)
        RAISERROR('card.product.add.startDateBiggerThanEndDate', 16, 1);

    if not exists(select * from  @product p
                            join [card].product pr on pr.productId = p.productId
                            join [customer].organizationsVisibleFor(@userId) on isnull(p.branchId, pr.branchId) = actorId)
        RAISERROR('card.cantAddInThisBranch', 16, 1)

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    BEGIN TRANSACTION
        UPDATE t
        SET t.startDate = s.startDate,
            t.endDate = s.endDate,
            t.updatedBy = @userId,
            t.updatedOn = getdate(),
            t.isActive = s.isActive
        OUTPUT INSERTED.productId, INSERTED.name, INSERTED.description, INSERTED.startDate, INSERTED.endDate, INSERTED.embossedTypeId, INSERTED.createdBy, 
               INSERTED.createdOn, INSERTED.updatedBy, INSERTED.updatedOn, INSERTED.isActive, INSERTED.periodicCardFeeId, INSERTED.itemNameId, INSERTED.branchId, 
               INSERTED.accountLinkLimit, INSERTED.pinRetriesLimit, INSERTED.pinRetriesDailyLimit
        INTO @result (productId, name, description, startDate, endDate, embossedTypeId, createdBy, createdOn, updatedBy, updatedOn, isActive, periodicCardFeeId, 
                      itemNameId, branchId, accountLinkLimit, pinRetriesLimit, pinRetriesDailyLimit)
        FROM [card].product t
        INNER JOIN @product s ON t.productId = s.productId

        declare @productId int
        set @productId =(select top 1 productId from @product )

        ;MERGE into [card].[productAccountType] as pa
        using @productAccountType p
             on pa.productId = p.productId and pa.accountTypeId = p.accountTypeId
        WHEN NOT MATCHED BY TARGET THEN
            insert (productId, accountTypeId)
            values(productId, accountTypeId )
        when not matched by source and pa.productId = @productId   then
            delete;

    COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'cardProduct' AS resultSetName
        SELECT * FROM @result
    END

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION

    EXEC core.error
    RETURN 55555
END CATCH