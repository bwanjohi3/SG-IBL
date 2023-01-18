ALTER PROCEDURE [card].[product.list] -- this SP gets all existing card Product in DB
    @isActive bit = NULL, -- filter by isActive flag in card.product
    @isValid bit = NULL, -- filter product and by start and end date
    @embossedTypeId tinyint = NULL, -- what kind of cards to return - named or no named
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
    SET NOCOUNT ON

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

    declare @today date =getdate()

    SELECT 'product' AS resultSetName

    SELECT productId, accountLinkLimit, ISNULL(itt.itemNameTranslation, p.name) AS name
    FROM [card].product p
    LEFT JOIN [core].itemTranslation itt on itt.itemNameId = p.itemNameId and itt.languageId = @languageId
    JOIN [user].[parentOrganizationsForUser](@userId) po ON po.actorId = p.branchId
    WHERE ( @isActive IS NULL OR p.isActive = @isActive ) AND
            (@isValid IS NULL OR (@isValid = 1 AND p.isActive = 1 AND @today >= p.startDate AND (p.endDate IS NULL OR @today <= p.endDate)))
            AND (@embossedTypeId is null or p.embossedTypeId = @embossedTypeId)
            
