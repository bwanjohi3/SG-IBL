ALTER PROCEDURE [card].[statusAction.fetch] -- gets all statuses and actions based on user permissions
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @userId bigint = (select [auth.actorId] from @meta)
DECLARE @languageId BIGINT = isnull((SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId), isnull((select languageId from @meta), (select languageId from core.[language] where name = 'English')))

SELECT 'Application' AS resultSetName

select sa.fromStatusId, fromst.statusName as fromStatusLabel, ISNULL(ittFrom.itemNameTranslation, itnFrom.itemName) as fromStatusName,
    a.actionId, a.actionName as actionLabel, ISNULL(itt.itemNameTranslation, itn.itemName) as actionName, itt.itemDescriptionTranslation as actionDescription,
    sa.toStatusId, toSt.statusName as toStatusLabel, ISNULL(ittTo.itemNameTranslation, itnTo.itemName) as toStatusName,
    embossedTypeId, actionOrder, flagToConfirm,
    case when reasons.actionId is null then 0 else 1 end as hasReasons
from [card].statusAction sa
CROSS apply [user].allowedActions(@userId, SA.permission, null, NULL) uaa
join [card].[action] a on a.actionId = sa.actionId
JOIN core.itemName itn ON itn.itemNameId = a.itemNameId
LEFT JOIN core.itemTranslation itt on itt.itemNameId = a.itemNameId and itt.languageId = @languageId
join [card].[status] fromSt on fromSt.statusId = fromStatusId
JOIN core.itemName itnFrom ON itnFrom.itemNameId = fromSt.itemNameId
LEFT JOIN core.itemTranslation ittFrom on ittFrom.itemNameId = fromSt.itemNameId and ittFrom.languageId = @languageId
join [card].[status] toSt on toSt.statusId = toStatusId
JOIN core.itemName itnTo ON itnTo.itemNameId = toSt.itemNameId
LEFT JOIN core.itemTranslation ittTo on ittTo.itemNameId = toSt.itemNameId and ittTo.languageId = @languageId
outer apply
(
    select top 1 ra.actionId
    from [card].reasonAction ra
    join [card].reason r on r.reasonId = ra.reasonId
    where ra.actionId = sa.actionId and r.isActive = 1 and r.module = 'Application'
) as reasons
where module = 'Application'
order by actionOrder

SELECT 'Batch' AS resultSetName

select sa.fromStatusId, fromst.statusName as fromStatusLabel, ISNULL(ittFrom.itemNameTranslation, itnFrom.itemName) as fromStatusName,
    a.actionId, a.actionName as actionLabel, ISNULL(itt.itemNameTranslation, itn.itemName) as actionName, itt.itemDescriptionTranslation as actionDescription,
    sa.toStatusId, toSt.statusName as toStatusLabel, ISNULL(ittTo.itemNameTranslation, itnTo.itemName) as toStatusName,
    embossedTypeId, actionOrder, flagToConfirm,
    case when reasons.actionId is null then 0 else 1 end as hasReasons
from [card].statusAction sa
CROSS apply [user].allowedActions(@userId, SA.permission, null, NULL) uaa
join [card].[action] a on a.actionId = sa.actionId
JOIN core.itemName itn ON itn.itemNameId = a.itemNameId
LEFT JOIN core.itemTranslation itt on itt.itemNameId = a.itemNameId and itt.languageId = @languageId
join [card].[status] fromSt on fromSt.statusId = fromStatusId
JOIN core.itemName itnFrom ON itnFrom.itemNameId = fromSt.itemNameId
LEFT JOIN core.itemTranslation ittFrom on ittFrom.itemNameId = fromSt.itemNameId and ittFrom.languageId = @languageId
join [card].[status] toSt on toSt.statusId = toStatusId
JOIN core.itemName itnTo ON itnTo.itemNameId = toSt.itemNameId
LEFT JOIN core.itemTranslation ittTo on ittTo.itemNameId = toSt.itemNameId and ittTo.languageId = @languageId
outer apply
(
    select top 1 ra.actionId
    from [card].reasonAction ra
    join [card].reason r on r.reasonId = ra.reasonId
    where ra.actionId = sa.actionId and r.isActive = 1 and r.module = 'Batch'
) as reasons
where module = 'Batch'
order by actionOrder

SELECT 'Card' AS resultSetName

select sa.fromStatusId, fromst.statusName as fromStatusLabel, ISNULL(ittFrom.itemNameTranslation, itnFrom.itemName) as fromStatusName,
    a.actionId, a.actionName as actionLabel, ISNULL(itt.itemNameTranslation, itn.itemName) as actionName, itt.itemDescriptionTranslation as actionDescription,
    sa.toStatusId, toSt.statusName as toStatusLabel, ISNULL(ittTo.itemNameTranslation, itnTo.itemName) as toStatusName,
    embossedTypeId, actionOrder, flagToConfirm,
    case when reasons.actionId is null then 0 else 1 end as hasReasons
from [card].statusAction sa
CROSS apply [user].allowedActions(@userId, SA.permission, null, NULL) uaa
join [card].[action] a on a.actionId = sa.actionId
JOIN core.itemName itn ON itn.itemNameId = a.itemNameId
LEFT JOIN core.itemTranslation itt on itt.itemNameId = a.itemNameId and itt.languageId = @languageId
join [card].[status] fromSt on fromSt.statusId = fromStatusId
JOIN core.itemName itnFrom ON itnFrom.itemNameId = fromSt.itemNameId
LEFT JOIN core.itemTranslation ittFrom on ittFrom.itemNameId = fromSt.itemNameId and ittFrom.languageId = @languageId
join [card].[status] toSt on toSt.statusId = toStatusId
JOIN core.itemName itnTo ON itnTo.itemNameId = toSt.itemNameId
LEFT JOIN core.itemTranslation ittTo on ittTo.itemNameId = toSt.itemNameId and ittTo.languageId = @languageId
outer apply
(
    select top 1 ra.actionId
    from [card].reasonAction ra
    join [card].reason r on r.reasonId = ra.reasonId
    where ra.actionId = sa.actionId and r.isActive = 1  and r.module = 'Card'
) as reasons
where module = 'Card'
order by actionOrder


SELECT 'CardInUse' AS resultSetName

select sa.fromStatusId, fromst.statusName as fromStatusLabel, ISNULL(ittFrom.itemNameTranslation, itnFrom.itemName) as fromStatusName,
    a.actionId, a.actionName as actionLabel, ISNULL(itt.itemNameTranslation, itn.itemName) as actionName, itt.itemDescriptionTranslation as actionDescription,
    sa.toStatusId, toSt.statusName as toStatusLabel, ISNULL(ittTo.itemNameTranslation, itnTo.itemName) as toStatusName,
    embossedTypeId, actionOrder, flagToConfirm,
    case when reasons.actionId is null then 0 else 1 end as hasReasons
from [card].statusAction sa
CROSS apply [user].allowedActions(@userId, SA.permission, null, NULL) uaa
join [card].[action] a on a.actionId = sa.actionId
JOIN core.itemName itn ON itn.itemNameId = a.itemNameId
LEFT JOIN core.itemTranslation itt on itt.itemNameId = a.itemNameId and itt.languageId = @languageId
join [card].[status] fromSt on fromSt.statusId = fromStatusId
JOIN core.itemName itnFrom ON itnFrom.itemNameId = fromSt.itemNameId
LEFT JOIN core.itemTranslation ittFrom on ittFrom.itemNameId = fromSt.itemNameId and ittFrom.languageId = @languageId
join [card].[status] toSt on toSt.statusId = toStatusId
JOIN core.itemName itnTo ON itnTo.itemNameId = toSt.itemNameId
LEFT JOIN core.itemTranslation ittTo on ittTo.itemNameId = toSt.itemNameId and ittTo.languageId = @languageId
outer apply
(
    select top 1 ra.actionId
    from [card].reasonAction ra
    join [card].reason r on r.reasonId = ra.reasonId
    where ra.actionId = sa.actionId and r.isActive = 1 and r.module = 'CardInUse'
) as reasons
where module = 'CardInUse'
order by actionOrder