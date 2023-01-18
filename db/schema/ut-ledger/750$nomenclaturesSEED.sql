DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

MERGE INTO [core].[itemType] AS target
USING
    (VALUES
        ('productType', 'productType', 'productType'), --'ledger.productType', 'productTypeId'),
        ('productGroup', 'productGroup', 'productGroup'), --'ledger.productGroup', 'productGroupId'),
		('accountProduct', 'accountProduct', 'accountProduct'), --NULL, NULL),
		('productPeriodicFee', 'productPeriodicFee', 'productPeriodicFee')--, NULL, NULL)
    ) AS source (name, alias, [description])--, [table], keyColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, alias, [description])--, --[table], keyColumn)
VALUES (name, alias, [description]);--, --[table], keyColumn);

---------------------------------------- PRODUCT GROUPS
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('As', 'GL Asset', 'GL Asset')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Li', 'GL Liability', 'GL Liability')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Ex', 'GL Expense', 'GL Expense')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('In', 'GL Income', 'GL Income')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('CA', 'Customer accounts', 'Customer accounts')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('LO', 'Loans', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('INS', 'Insurance', 'Insurance')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'productGroup', @meta = @meta

INSERT INTO [ledger].[productGroup](productGroupId)
SELECT itemNameId
FROM [core].[itemName] cin
LEFT JOIN [ledger].[productGroup] pg ON pg.productGroupId = cin.itemNameId
JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId
WHERE it.[name] = 'productGroup' AND pg.productGroupId IS NULL

---------------------------------------- PRODUCT TYPES
DECLARE @loan BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productGroup' AND itemName = 'Loans')
DECLARE @insurance BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productGroup' AND itemName = 'Insurance')
DECLARE @asset BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productGroup' AND itemName = 'GL Asset')
DECLARE @liability BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productGroup' AND itemName = 'GL Liability')
DECLARE @income BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productGroup' AND itemName = 'GL Income')
DECLARE @expense BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productGroup' AND itemName = 'GL Expense')
DECLARE @customer BIGINT = (SELECT itemNameId FROM [core].[itemName] cin JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId WHERE it.[name] = 'productGroup' AND itemName = 'Customer accounts')

UPDATE t
SET isForCustomer = 0
FROM [ledger].[productGroup] t
WHERE productGroupId in (@asset, @liability, @income, @expense)

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('EM', 'Emergency', 'Emergency', 'productGroup', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('ML', 'Mortgage', 'Mortgage', 'productGroup', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('PL', 'Personal', 'Personal', 'productGroup', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('BL', 'Business', 'Business', 'productGroup', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('NL', 'Nano', 'Nano', 'productGroup', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('AL', 'Agro', 'Agro', 'productGroup', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('EL', 'Education', 'Education', 'productGroup', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('RL', 'Revolving', 'Revolving', 'productGroup', 'Loans')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('HEL', 'Home Equity', 'Home Equity', 'productGroup', 'Loans')

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('AI', 'Agricultural Insurance', 'Agricultural Insurance', 'productGroup', 'Insurance')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('HI', 'Health Insurance', 'Health Insurance', 'productGroup', 'Insurance')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('LI', 'Life Insurance', 'Life Insurance', 'productGroup', 'Insurance')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('MI', 'Mortgage Insurance', 'Mortgage Insurance', 'productGroup', 'Insurance')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('PI', 'Property Insurance', 'Property Insurance', 'productGroup', 'Insurance')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('SI', 'Self Insurance', 'Self Insurance', 'productGroup', 'Insurance')
------------------------------------------------------ASSETS
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('CH', 'Checks', 'Checks', 'productGroup', 'GL Asset')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('DP', 'Deposit Principal', 'Deposit Principal', 'productGroup', 'GL Asset')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('OD', 'Other Debtors', 'Other Debtors', 'productGroup', 'GL Asset')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('OF', 'Other Funds', 'Other Funds', 'productGroup', 'GL Asset')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('TFC', 'Till Foreign Currency', 'Till Foreign Currency', 'productGroup', 'GL Asset')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('TLC', 'Till Local Currency', 'Till Local Currency', 'productGroup', 'GL Asset')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('TAA', 'Transaction Amount', 'Transaction Amount', 'productGroup', 'GL Asset')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('VCH', 'Vouchers', 'Vouchers', 'productGroup', 'GL Asset')
------------------------------------------------------LIABILITIES
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('CMM', 'Commission', 'Commission', 'productGroup', 'GL Liability')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('LP', 'Loan Principal', 'Loan Principal', 'productGroup', 'GL Liability')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('OC', 'Other Creditors', 'Other Creditors', 'productGroup', 'GL Liability')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('OTAX', 'Other Tax ', 'Other Tax ', 'productGroup', 'GL Liability')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('TAL', 'Transaction Amount', 'Transaction Amount', 'productGroup', 'GL Liability')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('VAT', 'VAT', 'VAT', 'productGroup', 'GL Liability')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('WTHT', 'Withholding Tax', 'Withholding Tax', 'productGroup', 'GL Liability')
------------------------------------------------------EXPENSE
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('BCr', 'Bulk Credit', 'Bulk Credit', 'productGroup', 'GL Expense')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('SFEX', 'Suspense for Expenses', 'Suspense for Expenses', 'productGroup', 'GL Expense')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('FINEX', 'Financial Expenses', 'Financial Expenses', 'productGroup', 'GL Expense')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('IEX', 'Interest Expenses', 'Interest Expenses', 'productGroup', 'GL Expense')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('OEEX', 'Other Exceptional Expenses', 'Other Exceptional Expenses', 'productGroup', 'GL Expense')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('REFB', 'Referral Bonus', 'Referral Bonus', 'productGroup', 'GL Expense')
------------------------------------------------------INCOME
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('BDt', 'Bulk Debit', 'Bulk Debit', 'productGroup', 'GL Income')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('FEE', 'Fee', 'Fee', 'productGroup', 'GL Income')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('FININ', 'Financial Incomes', 'Financial Incomes', 'productGroup', 'GL Income')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('IIN', 'Interest Incomes', 'Interest Incomes', 'productGroup', 'GL Income')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('OEIN', 'Other Extraordinary Incomes', 'Other Extraordinary Incomes', 'productGroup', 'GL Income')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('SFIN', 'Suspense for Incomes', 'Suspense for Incomes', 'productGroup', 'GL Income')

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('FLOAT', 'Float', 'Float', 'productGroup', 'Customer accounts')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('CRR', 'Current', 'Current', 'productGroup', 'Customer accounts')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('SV', 'Saving', 'Saving', 'productGroup', 'Customer accounts')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('DEP', 'Deposit', 'Deposit', 'productGroup', 'Customer accounts')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('OVER', 'Overdraft', 'Overdraft', 'productGroup', 'Customer accounts')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('MW', 'Mwallet', 'Mwallet', 'productGroup', 'Customer accounts')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation, parentItemType, parentItemName) VALUES ('VIR', 'Virtual', 'Virtual', 'productGroup', 'Customer accounts')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'productType', @meta = @meta

INSERT INTO [ledger].[productType](productTypeId)
SELECT itemNameId
FROM [core].[itemName] cin
LEFT JOIN [ledger].[productType] pt ON pt.productTypeId = cin.itemNameId
JOIN [core].[itemType] it ON cin.itemTypeId = it.itemTypeId
WHERE it.[name] = 'productType' AND pt.productTypeId IS NULL

---------------------------------------- PRODUCT PERIODIC FEES
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Daily', 'Daily', 'Daily')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Weekly', 'Weekly', 'Weekly')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Monthly', 'Monthly', 'Monthly')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Annual', 'Annual', 'Annual')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'productPeriodicFee', @meta = @meta