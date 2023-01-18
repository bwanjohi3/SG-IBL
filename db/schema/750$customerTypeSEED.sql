-- customer type
MERGE INTO customer.customerType AS target
USING
    (VALUES          
        ('corporate', 'Corporate', 'active'),
        ('individual', 'Individual', 'active')
        --,('client', 'client', 'active')
        --,('groups', 'Groups', 'active')
        --,('groups_of_groups', 'Groups of groups', 'active')
    ) AS source (customerTypeId, description, statusId)
ON target.customerTypeId = source.customerTypeId
WHEN NOT MATCHED BY TARGET THEN
INSERT (customerTypeId, description, statusId)
VALUES (customerTypeId, description, statusId);

-- customer category
MERGE INTO customer.customerCategory AS target
USING
    (VALUES          
        (1, 'Merchant', 'Merchant', 'active'),
        (2, 'Agent', 'Agent', 'active'),
        (3, 'Customer', 'Customer', 'active'),
		(4, 'Staff', 'Staff', 'active'),
		(5, 'VIP', 'VIP', 'active')
    ) AS source (customerCategoryId, name, description, statusId)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (customerCategoryId, name, description, statusId)
VALUES (customerCategoryId, name, description, statusId)
WHEN NOT MATCHED BY source THEN
DELETE;