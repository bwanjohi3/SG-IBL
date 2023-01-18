/*DECLARE @sa BIGINT = (SELECT actorId FROM [user].[hash] WHERE identifier = 'sa' AND [type] = 'password')
DECLARE @bulkDebit BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productType' AND itemName = 'Bulk Debit')
DECLARE @bulkCredit BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productType' AND itemName = 'Bulk Credit')
DECLARE @periodicFee BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productPeriodicFee' AND itemName = 'Annual')

DECLARE @sg BIGINT = (SELECT actorId FROM [customer].[organization] WHERE [organizationName] = 'IBL')
DECLARE @usd BIGINT = (SELECT currencyId FROM [core].[currency] cc JOIN [core].[itemName] cin ON cc.itemNameId = cin.itemNameId JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'currency' AND itemName = 'USD')  
DECLARE @state BIGINT = (SELECT s.stateId FROM ledger.state AS s JOIN core.itemName AS i ON s.itemNameId = i.itemNameId WHERE itemCode = 'active')


DECLARE @product [ledger].[productTT], @productId SMALLINT, @meta [core].[metaDataTT], @currentVersion BIGINT
INSERT INTO @meta([auth.actorId], method) VALUES(@sa,'')

IF NOT EXISTS(SELECT name FROM [ledger].[product] WHERE [name] = 'Bulk Credit Transaction' AND businessUnitId = @sg)
BEGIN
    INSERT INTO @product([name], businessUnitId, currencyId, productTypeId, startDate, periodicFeeId)     
    VALUES ('Bulk Credit Transaction', @sg, @usd, @bulkCredit, GETDATE(), @periodicFee)

    EXEC [ledger].[product.add] @product = @product, @noResultSet = 1, @meta = @meta
    SET @productId = (SELECT productId FROM [ledger].[product] WHERE [name] = 'Bulk Credit Transaction' AND businessUnitId = @sg)
    EXEC [ledger].[product.approve] @productId = @productId, @currentVersion = @currentVersion, @meta = @meta        
END
IF NOT EXISTS(SELECT name FROM [ledger].[product] WHERE [name] = 'Bulk Debit Transaction' AND businessUnitId = @sg)
BEGIN
    DELETE FROM @product
    INSERT INTO @product([name], businessUnitId, currencyId, productTypeId, startDate, periodicFeeId)     
    VALUES ('Bulk Debit Transaction', @sg, @usd, @bulkDebit, GETDATE(), @periodicFee)

    EXEC [ledger].[product.add] @product = @product, @noResultSet = 1, @meta = @meta
    SET @productId = (SELECT productId FROM [ledger].[product] WHERE [name] = 'Bulk Debit Transaction' AND businessUnitId = @sg)
    EXEC [ledger].[product.approve] @productId = @productId, @currentVersion = @currentVersion, @meta = @meta
END

----------------------------------------INTERNAL ACCOUNTS
 IF NOT EXISTS(SELECT accountNumber FROM [ledger].[account] WHERE accountNumber IN ('bulkCredit123','bulkDebit123'))
 BEGIN
    DECLARE @resultAccountIds core.arrayNumberList

    DECLARE @bulkCreditId SMALLINT = (SELECT productId FROM [ledger].[product] WHERE [name] = 'Bulk Credit Transaction' AND businessUnitId = @sg)
    DECLARE @bulkDebitId SMALLINT = (SELECT productId FROM [ledger].[product] WHERE [name] = 'Bulk Debit Transaction' AND businessUnitId = @sg)

    INSERT INTO ledger.account (ownerId, productId, businessUnitId, accountNumber, accountName, linkedAccount, statusId, stateId, isDeleted, createdBy, createdOn)
    OUTPUT INSERTED.accountId INTO @resultAccountIds ([value])
    VALUES(@sa, @bulkCreditId, @sg, 'bulkCredit123', 'Bulk credit -  Expense WC01 (expense)', 'WC01', 'approved', @state, 0, @sa, GETDATE()),
        (@sa, @bulkDebitId, @sg, 'bulkDebit123', 'Bulk debit - Suspense WB01 (liability)', 'WB01', 'approved', @state, 0, @sa, GETDATE())

END

INSERT INTO ledger.balance (accountId, credit, createdBy, createdOn)
SELECT [value], 100000, @sa, GETDATE()
FROM @resultAccountIds*/