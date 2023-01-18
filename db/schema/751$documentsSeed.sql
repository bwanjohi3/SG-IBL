DECLARE @documentType document.documentTypeTT

insert into @documentType (documentTypeId, [description], statusId)
VALUES ('account_closure', 'Copy of Account closure request', 'active'),
        ('driving_license', 'Copy of driving license', 'active'),
        ('id_card', 'Copy of ID card', 'active'),
        ('other', 'Copy of other', 'active'),
        ('passport', 'Copy of passport', 'active'),
        ('power_of_attorney', 'Copy of Power of Attorney', 'active'),
        ('profile', 'profile picture', 'active'),
        ('proof_document', 'Copy of proof document', 'active'),
        ('proof_of_address', 'Copy of proof of address', 'active'),
        ('signature', 'Copy of signature', 'active'),
        ('vat_registration', 'Copy of VAT registration', 'active'),
        ('verification', 'Copy of Verification documents', 'active'),
        ('voucher', 'Copy of voucher', 'active'),
        ('terminate_agent', 'Copy of management approval and reasons for terminating the agent', 'active')


DECLARE @documentTypeId int = (select itemTypeId from  core.itemType where name = 'documentType')
DECLARE @language int = (select languageId from  [core].[language] where name = 'English')
DECLARE @resultitemName table  (itemNameId bigint ,languageId bigint ,itemNameTranslation varchar (max))

IF @documentTypeId IS NULL
BEGIN
    INSERT INTO core.itemType (alias, name, description, [table], keyColumn, nameColumn)
    SELECT 'documentType', 'documentType', 'documentType', 'document.documentType', 'documentTypeId', 'documentTypeId'

    SET @documentTypeId = SCOPE_IDENTITY()
END

MERGE INTO [core].[itemName]
USING (
	select @documentTypeId AS itemTypeId, dt.documentTypeId, 1 as isEnabled, dt.[description]
	from @documentType dt
    left join core.itemName i on (i.itemName = dt.documentTypeId OR i.itemCode = dt.documentTypeId) and i.itemTypeId = @documentTypeId
	where i.itemnameid is null
) d ON 1 = 0
WHEN NOT MATCHED THEN
    INSERT ([itemTypeId],[itemName],[isEnabled])
    VALUES (d.itemTypeId, d.documentTypeId, d.isEnabled)
OUTPUT INSERTED.itemNameId, @language, d.[description]
INTO @resultItemName (itemNameId, languageId, itemNameTranslation);



INSERT INTO [core].[itemTranslation]([itemNameId],[languageId],[itemNameTranslation])
select itemNameId, languageId, itemNameTranslation
from @resultItemName

;MERGE into document.documentType as dd
using
(
    select [documentTypeId], [description], [statusId], i.itemNameId
    from @documentType dt
    join core.itemName i on (i.itemName = dt.documentTypeId OR i.itemCode = dt.documentTypeId) and i.itemTypeId = @documentTypeId
) as d on dd.documentTypeId = d.documentTypeId
WHEN NOT MATCHED BY TARGET THEN
    INSERT ([documentTypeId], [description], [statusId], [itemNameId])
    VALUES ([documentTypeId], [description], [statusId], [itemNameId]);

-- document class
declare
@documentClass document.documentClassTT

insert into @documentClass (documentClassId, description, statusId)
VALUES ('open_account', 'Required when customer opens an account', 'active'),
    ('close_account', 'Required when account is closed', 'active'),
    ('open_customer', 'Required when new customer is open', 'active'),
    ('edit_customer', 'Required when customer is edited', 'active'),
    ('create_role', 'Required when new role is open', 'active'),
    ('edit_role', 'Required when role is edited', 'active'),
    ('delete_role', 'Required when role is deleted', 'active'),
    ('open_user', 'Required when new Internal user is open', 'active'),
    ('edit_user', 'Required when new Internal user is edited', 'active'),
    ('lock_user', 'Required when new Internal user is locked', 'active'),
    ('open_agent', 'Required when new Agent/Merchant is open', 'active'),
    ('edit_agent', 'Required when  Agent/Merchant is edited', 'active'),
    ('terminate_agent', 'Required when  Agent/Merchant is terminated', 'active')

;MERGE into document.documentClass as dd
    using @documentClass d on dd.documentClassId=d.documentClassId

WHEN NOT MATCHED BY TARGET THEN
    INSERT (documentClassId, [description], statusId)
    VALUES (documentClassId, [description], statusId);


-- document type class

DECLARE @documentTypeClass document.documentTypeClassTT

INSERT INTO  @documentTypeClass (documentClassId, documentTypeId) 
VALUES --open account
       ('open_account', 'id_card'), ('open_account', 'other'), ('open_account', 'passport'), ('open_account', 'profile'), ('open_account', 'proof_of_address'), ('open_account', 'signature'),
       ('open_account', 'power_of_Attorney'), ('open_account', 'vat_registration'), ('open_account', 'verification'), ('open_account', 'proof_document '), ('open_account', 'voucher'),
       --close account
       ('close_account', 'id_card'), ('close_account', 'account_closure'), ('close_account', 'voucher'), 
       --open customer
       ('open_customer', 'driving_license'), ('open_customer', 'id_card'), ('open_customer', 'other'), ('open_customer', 'passport'), ('open_customer', 'profile'), ('open_customer', 'proof_of_address'),
       ('open_customer', 'signature'), ('open_customer', 'power_of_Attorney'), ('open_customer', 'vat_registration'), ('open_customer', 'verification'), ('open_customer', 'proof_document '),
       --edit customer
       ('edit_customer', 'driving_license'), ('edit_customer', 'id_card'), ('edit_customer', 'other'), ('edit_customer', 'passport'), ('edit_customer', 'profile'), ('edit_customer', 'proof_of_address'),
       ('edit_customer', 'signature'), ('edit_customer', 'power_of_attorney'), ('edit_customer', 'vat_registration'), ('edit_customer', 'verification'), ('edit_customer', 'proof_document '),
       --roles
       ('create_role', 'proof_document '), ('edit_role', 'proof_document '), ('delete_role', 'proof_document '), 
       --users
       ('open_user', 'proof_document '), ('edit_user', 'proof_document '), ('lock_user', 'proof_document '), 
       --agents
       ('open_agent', 'proof_document '), ('edit_agent', 'proof_document '), ('terminate_agent', 'proof_document ')


;MERGE into document.documentTypeClass as dtc
    using @documentTypeClass d on dtc.documentClassId=d.documentClassId AND dtc.documentTypeId = d.documentTypeId

WHEN NOT MATCHED BY TARGET THEN
    INSERT (documentClassId, documentTypeId)
    VALUES (documentClassId, documentTypeId);

