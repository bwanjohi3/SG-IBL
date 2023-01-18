ALTER PROCEDURE [card].[reason.edit]  -- edits card reason information
    @reason [card].reasonTT READONLY, -- the edited reason information
    @action core.arrayNumberList READONLY, --the action ids for which this reason is valid
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

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    declare @module varchar(20) = (SELECT module FROM @reason)

    if exists (select * from @action a
                 left join [card].statusAction sa  on sa.module = @module and sa.actionId = value
                where sa.module is null)
        RAISERROR('card.reason.edit.actionforWrongModule', 16, 1);

    BEGIN TRANSACTION
       UPDATE r
       SET r.[name] = s.[name],
              r.code = ISNULL (s.code, r.code),
              r.module = s.module,
              r.updatedBy = @userId,
              r.updatedOn = getdate(),
              r.isActive  =  s.isActive
        FROM [card].reason r
        INNER JOIN @reason s ON r.reasonId = s.reasonId

       UPDATE i
       SET itemName = r.[name]
       FROM [core].[itemName] i
       join [card].reason cr on cr.itemNameId = i.itemNameId
       join @reason r on r.reasonId = cr.reasonId

       UPDATE it
       SET itemNameTranslation = r.[name]
       FROM [core].[itemTranslation] it
       join [card].reason cr on cr.itemNameId = it.itemNameId
       join @reason r on r.reasonId = cr.reasonId
       where it.languageId = @languageId

       ;MERGE into [card].[reasonAction] as t
       USING
       (
         SELECT reasonId, [value]
          FROM @reason CROSS JOIN @action
       ) s ON s.reasonid = t.reasonId and s.[value] = t.actionid
       WHEN NOT MATCHED BY TARGET THEN
       INSERT (reasonId, actionId, createdBy, createdOn)
       VALUES (s.reasonId, [value], @userId, getDate())
       WHEN NOT MATCHED BY SOURCE AND t.reasonId in (select reasonId from @reason) THEN
       DELETE;

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
       RAISERROR('Reason name already exists', 16, 1);
    END TRY
    BEGIN CATCH
       EXEC [core].[error]
    END CATCH
END CATCH