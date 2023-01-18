ALTER PROCEDURE [card].[product.add] -- the SP add new card product in DB
    @product [card].productTT READONLY,-- in this parameter the stored procedure receives all fields of card Product
    @productAccountType [card].productAccountTypeTT READONLY, -- details about the account type
    @productCustomerType [card].productCustomerTypeTT READONLY, -- details about the customer type
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @noResultSet bit = 0 -- this is the flag about the waited result
AS
SET NOCOUNT ON
DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @result [card].productTT
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

    if exists (SELECT 1 from @product where startDate > endDate)
        RAISERROR('card.product.add.startDateBiggerThanEndDate', 16, 1);

    Declare @branchId bigint = (select branchId from @product)

    if not exists(select * from [customer].organizationsVisibleFor(@userId) where actorId = @branchId)
        RAISERROR('card.cantAddInThisBranch', 16, 1)

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    if @languageId is null
        set @languageId = (select [languageId] from [core].[language] where [name] = 'English')


    declare @itemNameId bigint
    --
    BEGIN TRANSACTION
        insert into core.itemName(itemTypeId, itemName, itemDescription, organizationId, isEnabled)
        select itemTypeId, p.name, p.description, null, 1
        from core.itemType
        cross apply @product p
        where alias = 'cardProduct'

        set @itemNameId = SCOPE_IDENTITY()

        insert into core.itemTranslation (languageId, itemNameId, itemNameTranslation, itemDescriptionTranslation)
        select @languageId, @itemNameId, name, [description]
        from  @product

        --select @flow = cin.itemCode
        --FROM @product p
        --LEFT JOIN core.itemName cin on p.ownershipTypeId = cin.[itemNameId]

        INSERT INTO [card].product (name, [description], startDate, endDate, embossedTypeId, accountLinkLimit, isActive, periodicCardFeeId, itemNameId,
                                    branchId, createdBy, createdOn, updatedBy, updatedOn, pinRetriesLimit, pinRetriesDailyLimit)
        OUTPUT INSERTED.productId, INSERTED.name, INSERTED.[description], INSERTED.startDate, INSERTED.endDate, INSERTED.embossedTypeId, INSERTED.accountLinkLimit, INSERTED.isActive, 
               INSERTED.periodicCardFeeId, INSERTED.itemNameId, INSERTED.branchId, INSERTED.createdBy, INSERTED.createdOn, INSERTED.updatedBy, INSERTED.updatedOn, 
               INSERTED.pinRetriesLimit, INSERTED.pinRetriesDailyLimit       
        INTO @result (productId, name, [description], startDate, endDate, embossedTypeId, accountLinkLimit, isActive, periodicCardFeeId, itemNameId,
                      branchId, createdBy, createdOn, updatedBy, updatedOn, pinRetriesLimit, pinRetriesDailyLimit)
        SELECT name, [description], startDate, endDate, embossedTypeId, accountLinkLimit, isnull(isActive,1), periodicCardFeeId, @itemNameId, 
              branchId, @userId, getdate(), @userId, getdate(), pinRetriesLimit, pinRetriesDailyLimit
        FROM @product

        declare @productId int
        set @productId = (select top 1 productId from  @result)

        insert into [card].[productAccountType] (productId, accountTypeId)
        select @productId, pa.accountTypeId
        from @productAccountType pa

        insert into [card].[productCustomerType] (productId, customerTypeId)
        select @productId, pc.customerTypeId
        from @productCustomerType pc


    COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'cardProduct' AS resultSetName
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
       RAISERROR('Product name already exists', 16, 1);
    END TRY
    BEGIN CATCH
       EXEC [core].[error]
    END CATCH
END CATCH
