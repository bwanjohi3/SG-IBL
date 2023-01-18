ALTER procedure [card].[dataGen.put] -- executed to search cards for which data (cvv1, cvv2 and etc.) is not generated
    @panData [card].panDataTT READONLY, -- array with card ids and encrypted cvv
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

as
DECLARE @callParams XML = ( SELECT (SELECT * from @panData rows FOR XML AUTO, TYPE) [panData], (SELECT * from @meta rows FOR XML AUTO, TYPE) [meta] FOR XML RAW('params'),TYPE)

BEGIN TRY
    --DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    --DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

    --exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update c
    set data = cd.data,pvv=cd.pvv
    from [card].[card] c
    join @panData cd on c.cardId = cd.cardId

    ;with CTE as 
    (
        select c.batchId
        from @panData cd 
        join [card].[card] c on c.cardId = cd.cardId
        join [card].batch b on b.batchId = c.batchId and b.areAllCardsGenerated = 0
        group by c.batchId
    ),
    CTE2 as 
    (
        select ct.batchId, isnull(counterCards, 0) as counterCards
        from CTE ct
        outer apply
        (
            select count(c.cardID) as counterCards
            from [card].[card] c 
            join [card].[type] t on c.typeId = t.typeId and (cvv1 | cvv2 | icvv) = 1
            where c.batchId = ct.batchId and c.data is null            
        ) as cc
    )

    update b
    set b.areAllCardsGenerated  = 1
    from [card].batch b 
    join CTE2 ct on ct.batchId = b.batchId and counterCards = 0

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
DECLARE @CORE_ERROR_FILE_48 sysname='f:\JoboStuff\BayPort\AnotherClone\impl-standard\dev\ut-card\api\sql\schema/750$card.dataGen.put.sql' DECLARE @CORE_ERROR_LINE_48 int='49' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_48, @fileLine=@CORE_ERROR_LINE_48, @params = @callParams
END CATCH