alter procedure [card].[batch.statusUpdateSendToProduction] -- executed when a batch is sent to production - inserts new cards, updates send on date of the batch
    @batch [card].batchTT READONLY, -- the list with the batches
    @areAllCardsGenerated BIT OUT, -- result whether all cards in batch are generated - will need to have filled the service codes (stored encrypted in data column)	 
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @generatedId tinyint = (select statusId from card.status where statusName = 'Generated')
DECLARE @statusId    tinyint = (select statusId from card.status where statusName = 'Completed')
DECLARE @batchId int = (select batchid from @batch)

DECLARE @insertedCards [card].cardTT

BEGIN TRY
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    DECLARE @tranCount int = @@TRANCOUNT
    declare @countOfCards int = (select count(*) from [card].application where batchId = @batchId)
    -- insert new cards in card.card table in status Generated
    if @countOfCards > 0 --named batch
    begin
        IF @tranCount = 0 
            begin transaction
    -- for named batches
	       insert into [card].[card] (cardid, [cardNumber], [creationDate], [statusId], [applicationId], [createdBy], [createdOn], [batchId], [productId], [targetBranchId], [currentBranchId],
							     customerName, personName, customerNumber, embossedTypeId, personNumber, cardHolderName, pinRetriesLimit, pinRetriesDailyLimit, issuingBranchId,
							     expirationDate, updatedBy, updatedOn, typeId)
		      output inserted.cardid, inserted.[cardNumber], inserted.[creationDate], inserted.[statusId], inserted.[applicationId], inserted.[createdBy], inserted.[createdOn], inserted.[batchId], inserted.[productId], inserted.[targetBranchId], inserted.[currentBranchId],
								    inserted.customerName, inserted.personName, inserted.customerNumber, inserted.embossedTypeId, inserted.personNumber, inserted.cardHolderName, inserted.pinRetriesLimit, inserted.pinRetriesDailyLimit, inserted.issuingBranchId,
								    inserted.expirationDate, inserted.updatedBy, inserted.updatedOn, inserted.typeId
		      into @insertedCards(cardid, [cardNumber], [creationDate], [statusId], [applicationId], [createdBy], [createdOn], [batchId], [productId], [targetBranchId], [currentBranchId],
							     customerName, personName, customerNumber, embossedTypeId, personNumber, cardHolderName, pinRetriesLimit, pinRetriesDailyLimit, issuingBranchId,
							     expirationDate, updatedBy, updatedOn, typeId)
	       select n.numberId, n.last4Digits, getdate(), @generatedId, [applicationId], @userId, getdate(), [batchId], a.[productId], [targetBranchId], a.[branchId],
		      customerName, personName, customerNumber, a.embossedTypeId, personNumber, a.holderName, a.pinRetriesLimit, a.pinRetriesDailyLimit, issuingBranchId,
		      DATEADD(d,-1,DATEADD(mm, DATEDIFF(m,0,DATEADD (mm, a.termMonth, getdate()))+1,0)), @userId, getdate(), typeId
	       from
	       (
		      select a.applicationId, a.batchId, a.productId, a.targetBranchId, a.branchId, a.customerName, a.personName, a.customerNumber,
				        a.embossedTypeId, a.personNumber, a.holderName, a.issuingBranchId, a.typeId,
				        t.termMonth, t.cardNumberConstructionId, b.binId, p.pinRetriesLimit, p.pinRetriesDailyLimit,
                            row_number() over (partition by t.cardNumberConstructionId, b.binid, a.issuingBranchId order by a.applicationid) as rn1
		      from [card].application a
		      join [card].product p on p.productId = a.productId
              join [card].[type] t on t.typeId = a.typeId
              join [card].[bin] b on b.typeId = t.typeId
		      where batchId = @batchId
	       ) as a
	       outer apply
	       (
            select n.last4Digits, n.numberId, rn2
            from 
            (
			     select top (rn1) n.last4Digits, n.numberId, row_number() over (partition by cardNumberConstructionId, binId, branchId order by numberId) as rn2
			     from  [card].number n
			     where  isUsed = 0 and  n.cardNumberConstructionId = a.cardNumberConstructionId and n.binid = a.binId and issuingBranchId = n.branchId
            ) n
            where  rn1 = rn2                 
	       ) n 	

	       insert into [card].[cardAccount](cardId, accountId, accountNumber, accountTypeName, currency, isPrimary, createdBy, createdOn, accountOrder, accountLinkId)
	       select ic.cardId, aa.accountId, aa.accountNumber, aa.accountTypeName, aa.currency, aa.isPrimary, @userId, getdate(), aa.accountOrder, aa.accountLinkId
	       from @insertedCards ic
	       join [card].applicationAccount aa on aa.applicationId = ic.applicationId

	       insert into [card].[documentCard] ([cardId], [documentId])
	       select i.cardId, da.documentId
	       from [card].[documentApplication] da
	       join @insertedCards i on i.applicationId = da.applicationId

	       --set whether the cards in this batch will need to have filled the service codes (stored encrypted in data column)	       
	       set  @areAllCardsGenerated = 1 - (select max(Convert(tinyint, cvv1 | cvv2 | icvv))
                                                from [card].type t 
                                                join [card].[card] c on c.typeId = t.typeId
                                                where c.batchId = @batchId )

	       update n
	       set n.isUsed = 1
	       from @insertedCards ic
	       join [card].number n on n.numberId = ic.cardId

        IF @tranCount = 0 
            commit transaction
    end
    else -- no name batch
    begin
        set @countOfCards = (select numberOfCards  from [card].batch where batchId = @batchId)
        IF @tranCount = 0 
	       begin transaction

            insert into [card].[card] (cardid, [cardNumber], [creationDate], [statusId], [createdBy], [createdOn], [batchId], [typeId], [targetBranchId], [currentBranchId],
					               /*embossedTypeId, pinRetriesLimit, pinRetriesDailyLimit,*/ issuingBranchId,
					               expirationDate, updatedBy, updatedOn)
                output inserted.cardid, inserted.[cardNumber], inserted.[creationDate], inserted.[statusId], inserted.[createdBy], inserted.[createdOn], inserted.[batchId], inserted.[typeId], inserted.[targetBranchId], inserted.[currentBranchId],
						                  /*inserted.embossedTypeId, inserted.pinRetriesLimit, inserted.pinRetriesDailyLimit,*/ inserted.issuingBranchId,
						                  inserted.expirationDate, inserted.updatedBy, inserted.updatedOn
                into @insertedCards(cardid, [cardNumber], [creationDate], [statusId], [createdBy], [createdOn], [batchId], [typeId], [targetBranchId], [currentBranchId],
					               /*embossedTypeId, pinRetriesLimit, pinRetriesDailyLimit,*/ issuingBranchId,
					               expirationDate, updatedBy, updatedOn)
		  select top(@countOfCards) n.numberId, n.last4Digits, getdate(), @generatedId, @userId, getdate(), [batchId], b.[typeId], [targetBranchId], b.[branchId],
			 /*b.embossedTypeId, t.pinRetriesLimit, t.pinRetriesDailyLimit,*/ issuingBranchId,
			 DATEADD(d,-1,DATEADD(mm, DATEDIFF(m,0,DATEADD (mm, t.termMonth, getdate()))+1,0)), @userId, getdate()
		  from [card].batch b
		  join [card].type t on t.typeId = b.typeId
          join [card].bin bin on bin.typeId = t.typeId
		  join [card].number n on n.cardNumberConstructionId = t.cardNumberConstructionId and bin.binId = n.binId and b.issuingBranchId = n.branchId and isUsed = 0
		  where batchId = @batchId

		  set @areAllCardsGenerated = 1 - (select cvv1 | cvv2 | icvv
                                            from [card].type t
                                            join card.batch b on t.typeId = b.typeId 
                                            where b.batchid = @batchId)

		  update n
		  set n.isUsed = 1
		  from @insertedCards ic
		  join [card].number n on n.numberId = ic.cardId

	   IF @tranCount = 0 
            commit transaction
    end

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
