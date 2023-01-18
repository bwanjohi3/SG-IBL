CREATE procedure [card].[cardInUse.statusUpdateEdit] -- this procedure updates the accounts and documents for active cards
    @card [card].cardTT READONLY, -- the card which accounts are updated
    @account [card].cardAccountTT READONLY,--  all fields of accounts linked to the card
    @document document.documentTT READONLY, -- receive the entered fields for new document
    @attachment document.attachmentTT READONLY, -- receive the entered fields for all attachements for new document
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
as

DECLARE @callParams XML
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @cardId bigint

DECLARE @productId BIGINT = (SELECT productId FROM [card].[card] WHERE cardId IN (SELECT TOP 1 cardId from @card))
DECLARE @accountLinkLimit TINYINT = (SELECT ISNULL(accountLinkLimit, 0) FROM [card].[product] WHERE productId = @productId)
DECLARE @accountLinkCount INT = (SELECT COUNT(*) FROM @account)

if @accountLinkCount > @accountLinkLimit
    RAISERROR('cardInUse.statusUpdateEdit.accountLinkLimitExceed', 16, 1)

BEGIN TRY
    exec @return = [user].[permission.check] @actionId = @actionID, @objectId = null, @meta = @meta

if exists
           (select ac.customerNumber
           from @account a
           join [integration].[vAccount] ac on ac.accountNumber = a.accountNumber
           left join  @card  aa on aa.customerNumber = ac.customerNumber
           where aa.customerNumber is null)
    RAISERROR('card.cardInUse.statusUpdateEdit.submittedAccountsAreNotAtThatCustomer', 16, 1)

if exists (select accountNumber from @account group by accountNumber having count (*)>1   )
    RAISERROR('card.cardInUse.statusUpdateEdit.submittedAccountIsDuplicate', 16, 1)

if exists (select accountOrder from @account group by accountOrder having count (*)>1   )
    RAISERROR('card.cardInUse.statusUpdateEdit.submittedAccountOrderIsDuplicate', 16, 1)

if exists
        (select count (isPrimary)  from @account
        where isPrimary=1
        group by currency, isPrimary
        having count (isPrimary)<>1 )
    RAISERROR('card.cardInUse.statusUpdateEdit.thereShouldBeExactlyOnePrimaryAccount', 16, 1)

    ;MERGE into [card].[cardAccount] as t
    using
    (
        select cardAccountId, cardId, accountId, isPrimary, accountNumber, accountTypeName, currency, accountOrder, accountLinkId
        from @account
    ) s on s.cardAccountId = t.cardAccountId
    WHEN MATCHED THEN
        UPDATE
        set t.accountOrder = s.accountOrder,
            t.isPrimary = s.isPrimary,
            t.accountLinkId = s.accountLinkId,
            t.updatedBy = @userID,
            t.updatedOn = getDate()
    WHEN NOT MATCHED BY TARGET THEN
        insert (cardId, accountId, isPrimary, accountNumber, accountTypeName, currency, accountOrder, accountLinkId, createdBy, createdOn)
        values(s.cardId, s.accountId, isPrimary, accountNumber, accountTypeName, currency, accountOrder, accountLinkId, @userId, getDate())
    WHEN NOT MATCHED BY SOURCE and t.cardId in (select cardId from @card) THEN
        Delete;

--edit document
   set @cardId = (select  distinct cardId from @card )
   exec [card].[documentCard.edit]  @cardId = @cardId,
                                    @document = @document,
                                    @attachment = @attachment,
                                    @meta = @meta



     EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@trancount > 0 ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
