ALTER PROCEDURE [card].[batch.downloadCustom] -- executed when download button is clicked, it generates the file and increment the counter
   @batch [card].batchTT READONLY, -- in this parameter the stored procedure receives all fields of cards
   @meta core.metaDataTT READONLY -- information for the user that makes the operation
as
DECLARE @callParams XML = ( SELECT (SELECT * from @batch rows FOR XML AUTO, TYPE) [batch], (SELECT * from @meta rows FOR XML AUTO, TYPE) [meta] FOR XML RAW('params'),TYPE)
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    update b
    set downloads = isnull(b.downloads, 0) + 1
    from @batch bt
    join card.batch b on b.batchId = bt.batchId

    SELECT 'batchDownload' AS resultSetName

    --9132390100000121,101,1712,,TEST CARD 1,Mr,TEST,,CARD 1,04143,IBL Test Batch,,914,829,8753,8753,,B9132390100000121^MR. Test Card^211260118753914,9132390100000121=211260118753914,,184
    select
		'${' + n.[pan] + '}'
		+ ','
		+ left(cast(c.cardId as nvarchar),2)
		+ ','
		+ left(convert(varchar(8), c.creationDate, 12), 4)
		+''
		+ ','
		+''
		+ ','
		+CASE
				WHEN
				LEN(c.customerName) <= 26 THEN c.customerName
				WHEN
				LEN(LTRIM(RTRIM(SUBSTRING(c.customerName, 1, CHARINDEX(' ', c.customerName)))) + ' ' + LTRIM(RTRIM(LTRIM(REVERSE(LEFT(REVERSE(c.customerName),PATINDEX('% %',c.customerName)-1)))))) <= 26 THEN LTRIM(RTRIM(SUBSTRING(c.customerName, 1, CHARINDEX(' ', c.customerName)))) + ' ' + LTRIM(RTRIM(REVERSE(LEFT(REVERSE(c.customerName),PATINDEX('% %',c.customerName)-1))))
				ELSE coalesce(LTRIM(RTRIM(SUBSTRING(c.customerName, 1, CHARINDEX(' ', c.customerName)))),'ESTEEMED CUSTOMER')
			END
		+','
		+'Mr'
		+','
		+coalesce((substring(c.customerName,1,charindex(' ',c.customername))),'ESTEEMED')
		+','
		+','
		+coalesce((substring(c.customerName,charindex(' ',c.customername),len(c.customername))),'CUSTOMER')
		+','
		+ coalesce(c.customerNumber,'04143')
		+','
		+cb.batchName
		+ ','
		+','
		+ '${cvv1:'+c.data+'}'
		+ ','
		+ '${cvv2:'+c.data+'}'
		+ ','
		+ '${'+c.pvv+'}'
		+ ','
		+ '${'+c.pvv+'}'
		+ ','
		+''
		+ ','
		+ 'B'
		+'${' + n.[pan] + '}'
		+ '^'
		+coalesce(c.customerName,'LIVE/CARD')
		+ '^'
		+ left(convert(varchar(8), expirationdate, 12), 4)
		+ coalesce(cast(tb.servicecode1 as nvarchar),'6')
		+ coalesce(cast(tb.servicecode2 as nvarchar),'0')
		+ coalesce(cast(tb.servicecode3 as nvarchar),'1')
		+'1'
		+ '${'+c.pvv+'}'
		+ '${cvv1:'+c.data+'}'--This is the Generated CVV, we need to decrypt	
		+ ','
		+'${' + n.[pan] + '}'
		+ '='
		+ left(convert(varchar(8), expirationdate, 12), 4)
		+ coalesce(cast(tb.servicecode1 as nvarchar),'6')
		+ coalesce(cast(tb.servicecode2 as nvarchar),'0')
		+ coalesce(cast(tb.servicecode3 as nvarchar),'1')
		+'1'
		+ '${'+c.pvv+'}'
		+ '${cvv1:'+c.data+'}'--This is the Generated CVV, we need to decrypt	
		+ ','
		+''	
		+ ','
		+ '${icvv:'+c.data+'}'
		+';'
		+ coalesce(c.cipher, ta.cipher, tb.cipher)
    from @batch b
    join [card].[card] c on b.batchId = c.batchId
    join [card].number n on n.numberId = c.cardId
    join [card].[batch] cb on b.batchId = cb.batchId
    left join [card].[application] a on c.applicationId = a.applicationId
    left join [card].[type] tb on cb.typeId = tb.typeId -- batch type
    left join [card].[type] ta on ta.typeId = a.typeId -- application type

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
DECLARE @CORE_ERROR_FILE_37 sysname='C:\CFC Ghana\Bayport-ATMUpgrade\db\schema\ut-card/750$card.batch.downloadCustom.sql' DECLARE @CORE_ERROR_LINE_37 int='38' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_37, @fileLine=@CORE_ERROR_LINE_37, @params = @callParams
END CATCH

