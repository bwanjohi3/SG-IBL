---Unlocking user needs approval
MERGE INTO [core].[configuration] AS target
USING
     (   VALUES ('UnlockNeedsApproval', '1', 'Unlocking user needs approval')
    ) AS source ([key], [value], [description])
ON target.[key] = source.[key]
WHEN MATCHED THEN UPDATE SET target.[value] = source.[value]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([key], [value], [description])
VALUES ([key], [value], [description]);

-- currency
DECLARE @itemTypeId BIGINT = (SELECT itemTypeId FROM [core].itemType WHERE name='currency')
IF @itemTypeId IS NULL
BEGIN
    INSERT INTO [core].itemType([alias], [name], [description], [table], [keyColumn], [nameColumn])
    VALUES ('currency', 'currency', 'currency', 'currency', 'currencyId', 'currencyId')
    SET @itemTypeId = SCOPE_IDENTITY()
END
declare @itemNameId bigint

IF NOT EXISTS (SELECT 1 FROM [core].itemName WHERE itemName = 'USD' AND itemTypeId = @itemTypeId)
BEGIN
    INSERT INTO [core].itemName([itemTypeId], [itemName], [itemCode], [itemSyncId], [organizationId], [isEnabled], [itemOrder])
    VALUES (@itemTypeId, 'USD', 'USD', null, null, 1, null)

    set @itemNameId = SCOPE_IDENTITY()
    insert into core.currency(itemNameId) values (@itemNameId)
END

---CustomerSelfRegistration
-- for default @branchId the business unit chosen should be at the correct depth level as selected below in
DECLARE @branchId nvarchar (200) = ( SELECT actorId FROM customer.organization WHERE organizationName = 'IBL')
DECLARE @accountTypeId nvarchar (200) = ( SELECT [accountTypeId] FROM [customer].[accountType] WHERE accountTypeCode = 'mwallet')
DECLARE @languageId nvarchar (200) = ( SELECT languageId FROM core.language WHERE iso2Code = 'en')
DECLARE @kycId nvarchar (200) = ( SELECT kycId FROM customer.kyc WHERE display = 'Level 0' and organizationId = @branchId and isDeleted = 0)
DECLARE @currencyId nvarchar (200) = ( SELECT a.currencyId from core.currency a join core.itemname b on b.itemnameid=a.itemnameid where b.itemname = 'USD')
DECLARE @customerType nvarchar (200) = ( SELECT customerTypeId FROM customer.customerType WHERE customerTypeId = 'individual')
DECLARE @customerStatusId nvarchar (200) = ( SELECT statusId FROM core.status WHERE statusId = 'inactive')
DECLARE @customerStateId nvarchar (200) = ( SELECT stateId FROM customer.state WHERE stateId = 'pending')
DECLARE @policyId nvarchar (200) = ( SELECT policyId FROM policy.policy WHERE name = 'STD')
DECLARE @mnoId nvarchar (200) = ( SELECT mnoId FROM customer.mno WHERE name = 'Lonestart - MTN' )
DECLARE @phoneTypeId nvarchar (200) = ( SELECT phoneTypeId FROM customer.phonetype WHERE phoneTypeId = 'personal' )
DECLARE @phoneStatusId nvarchar (200) = ( SELECT statusId FROM core.status WHERE statusId = 'approved' )
DECLARE @attachmentSizeId nvarchar (200) = ( SELECT attachmentSizeId FROM document.attachmentSize WHERE attachmentSizeId = 'original' )
DECLARE @roleID nvarchar (200) = ( SELECT 'MobileClient' )

MERGE INTO [core].[configuration] AS target
USING
     (   VALUES ('policyIdSelfAdd', @policyId, 'Default policy user for self registration'),
                ('accountTypeIdSelfAdd', @accountTypeId, 'Default account type user for self registration'),
                ('languageIdSelfAdd', @languageId, 'Default lenguage user for self registration'),
                ('currencyIdSelfAdd', @currencyId, 'Default currency for self registration'),
                ('customerStateIdSelfAdd', @customerStateId, 'Default customer state for self registration'),
                ('customerStatusIdSelfAdd', @customerStatusId, 'Default customer status for self registration'),
                ('customerKycIdSelfAdd', @kycId, 'Default Kyc user for self registration'),
                ('customerTypeSelfAdd', @customerType, 'Default customer type for self registration'),
                ('customerbranchSelfAdd', @branchId, 'Default customer branch (HO) for self registration'),
                ('mnoSelfAdd', @mnoId, 'Default mno for self registration'),
                ('phoneTypeIdSelfAdd', @phoneTypeId, 'Default phone type for self registration'),
                ('phoneStatusIdSelfAdd', @phoneStatusId, 'Default phone status for self registration'),
                ('openReferralLimitation', '10',  'Referrals limitation to an individual customer'),
                ('referralPeriodExpiration', '10', 'Referrals period limitation to open an account and the minimum deposit'),
                ('KYCLevelForBranchesDepth', '2', 'On which depth in hierarchy of the branches are defined the KYC levels'),
                ('CBSforBranchesDepth', '2', 'On which depth in hierarchy of the branches are defined the CBS sytems'),
                ('attachmentSizeSelfAdd', @attachmentSizeId, 'Default attachment size used for self registration'),
			 ('roleIdForSelfAdd', @roleID, 'Default role for customer registered under self registration'),
             ('card.application.disableIntegrationChecks', '1', 'Disable integration checks')
    ) AS source ([key], [value], [description])
ON target.[key] = source.[key]
WHEN MATCHED THEN UPDATE SET target.[value] = source.[value]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([key], [value], [description])
VALUES ([key], [value], [description]);


--Maker Checker
 MERGE INTO [core].[configuration] AS target
 USING
      (   VALUES ('DisableCustomerM/C', 0, 'Option to ban (Maker - Checker) functionalities for cusmtomer'),
 			 ('DisableAccountM/C', 0, 'Option to ban (Maker - Checker) functionalities for account')
                
     ) AS source ([key], [value], [description])
 ON target.[key] = source.[key]
 WHEN MATCHED THEN UPDATE SET target.[value] = source.[value]
 WHEN NOT MATCHED BY TARGET THEN
 INSERT ([key], [value], [description])
 VALUES ([key], [value], [description]);
