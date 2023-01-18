ALTER VIEW [integration].vCustomerType --view that shows information about all customers types
AS
SELECT customerTypeNumber, customerTypeId, ct.description as customerType, statusId
FROM customer.customerType ct
