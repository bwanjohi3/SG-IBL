MERGE INTO [user].[actionCategory] AS target
USING   
    (VALUES        
        ('mobile')
    ) AS source (name)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name)
VALUES (name);

DECLARE @mobileActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name='mobile')

-- mobile permissions
MERGE INTO [user].[action] AS target
USING
    (VALUES
         ('module_transactions', @mobileActionCategoryId, 'Module Transactions Access', '{}'),
         ('module_customer_management', @mobileActionCategoryId, 'Module Customer Management Access', '{}'),
         ('fr_settings_grid', @mobileActionCategoryId, 'Screen Settings', '{}'),
         ('fr_dashboard_grid', @mobileActionCategoryId, 'Entering Screen Grid', '{}'),
         ('fr_change_password', @mobileActionCategoryId, 'Change password screen', '{}'),
         ('fr_login_up_btn_create_account', @mobileActionCategoryId, 'Button for account creation', '{}'),
         ('customer_module_fr_kyc_product_select', @mobileActionCategoryId, 'Customer Module KYC Product Select', '{}'),
         ('mwallet_balance_inquiry', @mobileActionCategoryId, 'MWallet Balance Inquiry', '{}'),
         ('mwallet_mini_statement', @mobileActionCategoryId, 'MWallet Mini Statement', '{}'),
         ('mwallet_wallet_to_wallet', @mobileActionCategoryId, 'MWallet Wallet To Wallet Transaction', '{}'),
         ('mwallet_cash_in', @mobileActionCategoryId, 'MWallet Cash In Transaction', '{}'),
         ('mwallet_cash_out', @mobileActionCategoryId, 'MWallet Cash Out Transaction', '{}'),
         ('mwallet_pull_from_linked_account', @mobileActionCategoryId, 'MWallet Pull From Linked Account Transaction', '{}'),
         ('mwallet_push_to_linked_account', @mobileActionCategoryId, 'MWallet Push To Linked Account Transaction', '{}')         
    ) AS source (actionId,actionCategoryId,[description],valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT (actionId,actionCategoryId,[description],valueMap)
VALUES (actionId,actionCategoryId,[description],valueMap);
