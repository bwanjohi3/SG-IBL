ALTER PROCEDURE [card].[reason.add] -- add new card reason in DB
    @reason [card].reasonTT READONLY,-- -- in this parameter the stored procedure receives all fields of card Reason
    @action core.arrayNumberList READONLY, --the action ids for which this reason is valid
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @noResultSet bit = 0 -- this is the flag about the waited result
AS
    DECLARE @callParams XML
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    DECLARE @result [card].reasonTT
    SET @noResultSet = ISNULL(@noResultSet, 0)
BEGIN TRY
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @languageId BIGINT = isnull((SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId), (select [languageId] from [core].[language] where [name] = 'English'))

    if @languageId is null
        set @languageId = (select [languageId] from [core].[language] where [name] = 'English')

    declare @itemNameId bigint, @module varchar(20)

     set @module = (SELECT module FROM @reason)

    if exists (select * from @action a
                 left join [card].statusAction sa  on sa.module = @module and sa.actionId = value
                where sa.module is null)
        RAISERROR('card.reason.add.actionforWrongModule', 16, 1);

    --
    BEGIN TRANSACTION

        insert into core.itemName(itemTypeId, itemName, organizationId, isEnabled)
        select itemTypeId, p.name, null, 1
        from core.itemType
        cross apply @reason p
        where alias = 'cardReason' + module

        set @itemNameId = SCOPE_IDENTITY()

        insert into core.itemTranslation (languageId, itemNameId, itemNameTranslation)
        select @languageId, @itemNameId, name
        from  @reason

        INSERT INTO [card].reason (code, name, itemNameId, isActive, createdBy, createdOn, updatedBy, updatedOn, module)
        OUTPUT INSERTED.* INTO @result
        SELECT code, name, @itemNameId, isnull(isActive,1), @userId, getdate(), @userId, getdate(), module
        FROM @reason

        insert into [card].reasonAction([reasonId], [actionId], [createdBy], createdOn, updatedBy, updatedOn)
        select reasonId, value, @userId, getDate(), @userId, getdate()
        from @result
        cross join @action


    COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'cardReason' AS resultSetName
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
       RAISERROR('Reason name already exists', 16, 1);
    END TRY
    BEGIN CATCH
       EXEC [core].[error]
    END CATCH
END CATCH
