ALTER PROCEDURE [card].[application.get] -- this SP gets the information about application
    @applicationId INT, ---the unique reference of applicationin UTcard
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

SELECT 'application' AS resultSetName

SELECT  a.applicationId, a.customerId, a.customerNumber, vCust.customerType,
            a.customerName, a.personName, a.targetBranchId, o.organizationName AS targetBranchName,
            a.issuingBranchId, org.organizationName as issuingBranchName, cb.organizationName AS creationBranchName,
            a.reasonId, a.comments, ISNULL(trReason.itemNameTranslation, r.name) as reasonText,
            a.statusId, s.statusName as statusLabel, ISNULL(it.itemNameTranslation, s.statusName) AS statusName, ISNULL(pt.itemNameTranslation, p.name) AS productName,
            a.embossedTypeId, ISNULL(ett.itemNameTranslation, ein.itemName) AS embossedTypeName, ein.itemCode as nameType,
            a.createdOn, a.updatedOn, a.holderName, a.productId, p.accountLinkLimit, isnull (cbb.batchName,'') AS batchName, cbb.batchId,
            case when bs.statusName = 'Rejected' or bs.statusName = 'New' then 1 else 0 end as canBeRemovedFromBatch, a.personNumber
            , bi.startBin + '******' + c.cardNumber AS cardnumber, a.makerComments,
            case when exists (select * from [card].statusAction sa
                                join [card].action act on act.actionId = sa.actionId and act.actionName = 'Update'
                            where sa.module = 'application' and sa.fromStatusId = a.statusId ) then 1
                else 0 end as canBeEdited,
            a.typeId, ISNULL(ttr.itemNameTranslation, t.[name]) as typeName
FROM [card].[application] a
JOIN [card].[status] s ON a.statusId = s.statusId
LEFT JOIN [core].itemTranslation it on it.itemNameId = s.itemNameId and it.languageId = @languageid
JOIN [card].[type] t on a.typeId = t.typeId
LEFT JOIN core.itemTranslation ttr ON ttr.itemNameId = t.itemNameId and ttr.languageId = @languageid
JOIN [card].[product] p ON a.productId = p.productId
JOIN [card].[bin] bi ON bi.typeId = t.typeId
LEFT JOIN [core].itemTranslation pt on pt.itemNameId = p.itemNameId and pt.languageId = @languageid
JOIN [card].[embossedType] et ON a.embossedTypeId = et.embossedTypeId
join core.itemName ein on ein.itemNameId = et.itemNameId
LEFT JOIN core.itemTranslation ett on ett.itemNameId = et.itemNameId and ett.languageId = @languageId
JOIN customer.organization cb ON cb.actorId = a.BranchId
LEFT JOIN [card].batch cbb on cbb.batchId = a.batchId
LEFT JOIN [card].[status] bs on bs.statusId = cbb.statusId
LEFT JOIN customer.organization o ON o.actorId = a.targetBranchId
LEFT JOIN customer.organization org ON org.actorId = a.issuingBranchId
LEFT JOIN [card].[card] c ON c.applicationId = a.applicationId
left join [card].reason r on r.reasonId = a.reasonId
LEFT JOIN [core].itemTranslation trReason on trReason.itemNameId = r.itemNameId and trReason.languageId = @languageId
left join [integration].[vCustomer] vCust on vCust.customerNumber = a.customerNumber
WHERE a.applicationId = @applicationId

SELECT 'accounts' AS resultSetName

SELECT applicationAccountId, aa.accountId, isPrimary, aa.accountNumber, aa.accountTypeName, aa.currency,
        1  as isLinked, aa.accountOrder as accountOrder, aa.accountLinkId, itn.itemName as accountLinkText, methodOfOperationId
FROM [card].[application] ap
join [card].[applicationAccount] aa on aa.applicationId = ap.applicationId
left join [card].[accountLink] al on al.accountLinkId = aa.accountLinkId
left join [core].itemName itn on al.itemNameId = itn.itemNameId
left join [integration].[vAccount] va on va.accountNumber = aa.accountNumber
WHERE ap.applicationId = @applicationId
order by accountOrder

SELECT 'documents' AS resultSetName

select d.documentId, d.documentTypeId, da.attachmentId, da.contentType, da.extension, da.filename, da.hash
from document.document d
join document.attachment da on d.documentId = da.documentId
join [card].[documentApplication] aa on aa.documentId = d.documentId
where aa.applicationId = @applicationId

SELECT 'accountLink' AS resultSetName

SELECT accountLinkId, itn.itemName as [name], itn.itemCode as code
FROM [card].accountLink al
JOIN core.itemName itn on itn.itemNameId = al.itemNameId