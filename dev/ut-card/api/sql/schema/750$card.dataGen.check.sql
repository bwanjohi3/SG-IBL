ALTER procedure [card].[dataGen.check] -- executed to search cards for which data (cvv1, cvv2 and etc.) is not generated
    @limit int, -- how many cards to be returned
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

as
DECLARE @callParams XML = ( SELECT @limit [limit], (SELECT * from @meta rows FOR XML AUTO, TYPE) [meta] FOR XML RAW('params'),TYPE)
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

-- no permission check since we are calling this procedure in background
-- exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
-- if @return != 0
--    return 55555

SELECT 'pans' AS resultSetName
select top (@limit)
    c.cardId,
    n.pan,
    isnull(c.cvk, t.cvk) as cvk,
    isnull(c.cipher, t.cipher) as cipher,
    t.cvv1,
    t.cvv2,
    t.icvv,
    100*t.[serviceCode1] + 10*t.[serviceCode2] + t.[serviceCode3] as serviceCode,
    c.expirationDate,
	isnull(c.pvk, t.pvk) as pvk,
	isnull(c.decimalisation, t.decimalisation) as decimalisation
from [card].[card] c
join [card].number n on c.cardId = n.numberId
join [card].[type] t on t.typeId = c.typeId
where
    data is null
    and (t.cvv1 | t.cvv2 | t.icvv) = 1
    -- hex encrypted card number length
    and len(n.pan) = 32
order by cardId
