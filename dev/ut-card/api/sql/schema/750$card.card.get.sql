ALTER PROCEDURE [card].[card.get] -- SP that returns details for the card and its accounts
    @cardId bigint, --the ID of the card
    @module varchar(50) = 'card', --whether to return for a card that is in the client (cardInUse) or for card that is still in the bank (card)
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

SET NOCOUNT ON
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

--checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

SELECT @module AS resultSetName, 1 as single

SELECT c.cardId, bi.startBin + '******' + c.cardnumber AS cardNumber, c.customerId, c.customerNumber, c.customerName, c.cardHolderName, c.personName, vCust.customerType,
        c.activationDate, c.expirationDate, c.reasonId, c.comments, ISNULL(trReason.itemNameTranslation, r.name) as reasonText,
            c.targetBranchId, o.organizationName AS targetBranchName, cb.organizationName AS creationBranchName,
          c.issuingBranchId, org.organizationName AS issuingBranchName,
            c.statusId, s.statusName as statusLabel, c.productId, p.accountLinkLimit, ISNULL(itt.itemNameTranslation, s.statusName) as statusName, ISNULL(trProduct.itemNameTranslation, p.name) AS productName,
            c.createdOn, c.updatedOn,c.personNumber, t.typeId, ISNULL(trType.itemNameTranslation, t.name) as typeName,
            b.batchId, b.batchName,
            case when exists (select * from [card].statusAction sa
                                join [card].action a on a.actionId = sa.actionId and a.actionName = 'Update'
                            where sa.module = @module and sa.fromStatusId = s.statusId ) then 1
                else 0 end as canBeEdited
FROM [card].[card] c
JOIN [card].[status] s ON c.statusId = s.statusId
LEFT JOIN [core].itemTranslation itt on itt.itemNameId = s.itemNameId and itt.languageId = @languageid
LEFT JOIN [card].[product] p ON c.productId = p.productId
JOIN [card].[type] t ON c.typeId = t.typeId
JOIN [card].[bin] bi ON bi.typeId=t.typeId
LEFT JOIN core.itemTranslation trProduct on trProduct.itemNameId = p.itemNameId and trProduct.languageId = @languageId
LEFT JOIN core.itemTranslation trType on trType.itemNameId = t.itemNameId and trType.languageId = @languageId
JOIN customer.organization cb ON cb.actorId = c.currentBranchId
JOIN customer.organization o ON o.actorId = c.targetBranchId
JOIN customer.organization org ON org.actorId = c.issuingBranchId
left join [card].batch b on b.batchId = c.batchId
left join [card].reason r on r.reasonId = c.reasonId
LEFT JOIN [core].itemTranslation trReason on trReason.itemNameId = r.itemNameId and trReason.languageId = @languageId
left join [integration].[vCustomer] vCust on vCust.customerNumber = c.customerNumber and c.personNumber   = vCust.personNumber
WHERE c.cardId = @cardId

SELECT 'accounts' AS resultSetName

SELECT cardAccountId, ca.cardId, ca.accountNumber, ca.isPrimary, ca.accountTypeName, ca.currency, 1 as isLinked, accountOrder,
    ca.accountLinkId, itn.[itemName] as accountLinkText, methodOfOperationId
FROM [card].[card] c
join [card].cardAccount ca on c.cardId = ca.cardId
left join [card].[accountLink] al on al.accountLinkId = ca.accountLinkId
left join [core].itemName itn on al.itemNameId = itn.itemNameId
left join [integration].[vAccount] va on va.accountNumber = ca.accountNumber
WHERE c.cardId = @cardId
order by accountOrder

SELECT 'documents' AS resultSetName

select d.documentId, d.documentTypeId, da.attachmentId, da.contentType, da.extension, da.filename, da.hash
from document.document d
join document.attachment da on d.documentId = da.documentId
join [card].[documentCard] aa on aa.documentId = d.documentId
where aa.cardId = @cardId

SELECT 'accountLink' AS resultSetName

SELECT accountLinkId, itn.itemName as [name], itn.itemCode as code
FROM [card].accountLink al
JOIN core.itemName itn on itn.itemNameId = al.itemNameId