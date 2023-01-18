ALTER VIEW [integration].vCustomer --view that shows information about all customers
AS

SELECT '1' as customerNumber, 'customer name 1' as customerName,
        '1' as customerTypeId, 'customer type 1' as customerType,
        '454655656' as telMobile,
        '1211' as personNumber, 'person Name 1' as personName, '5454545' as personTelMobile, 'same' as personType



UNION ALL

SELECT '2' as customerNumber, 'customer name 2' as customerName,
        '1' as customerTypeId, 'customer type 1' as customerType,
        '454655656' as telMobile,
        '1222' as personNumber, 'person Name 2' as personName, '545434545' as personTelMobile, 'same' as personType



UNION ALL

SELECT '3' as customerNumber, 'customer name 3' as customerName,
        '1' as customerTypeId, 'customer type 1' as customerType,
        '45465544656' as telMobile,
        '1233' as personNumber, 'person Name 3' as personName, '5454dd545' as personTelMobile, 'same' as personType



UNION ALL

SELECT '4' as customerNumber, 'customer name 4' as customerName,
         '2' as customerTypeId, 'customer type 2' as customerType,
        '454655656' as telMobile,
        '1244' as personNumber, 'person Name 4' as personName, '5454545' as personTelMobile, 'same' as personType


UNION ALL

SELECT '5' as customerNumber, 'customer name 5' as customerName,
        '2' as customerTypeId, 'customer type 2' as customerType,
        '454655656' as telMobile,
        '1255' as personNumber, 'person Name 5' as personName, '5454545' as personTelMobile, 'same' as personType



UNION ALL


SELECT '6' as customerNumber, 'customer name 6' as customerName,
        '2' as customerTypeId, 'customer type 2' as customerType,
        '454655656' as telMobile,
        '1266' as personNumber, 'person Name 6' as personName, '5454545' as personTelMobile, 'same' as personType



UNION ALL

SELECT '7' as customerNumber, 'customer name 7' as customerName,
        '3' as customerTypeId, 'customer type 3' as customerType,
        '454655656' as telMobile,
        '1277' as personNumber, 'person Name 7' as personName, '5454545' as personTelMobile, 'same' as personType



UNION ALL

SELECT '8' as customerNumber, 'customer name 8' as customerName,
        '3' as customerTypeId, 'customer type 3' as customerType,
        '454655656' as telMobile,
        '1288' as personNumber, 'person Name 8' as personName, '5454545' as personTelMobile, 'same' as personType



UNION ALL

SELECT customerNumber, c.customerNumber as customerName, customerTypeNumber as customerTypeId, ct.customerType as customerType, min(ph.phoneNumber) as telMobile,
    convert(varchar(20), p.actorId) as personNumber, p.firstName + ' ' + p.lastName as personName,  min(phPerson.phoneNumber) as personTelMobile, '' as personType
FROM customer.customer c
join integration.vCustomerType ct on ct.customertypeId = c.customerTypeId
join customer.person p on c.actorId = p.actorId
left join customer.phone ph on ph.actorId = c.actorId and ph.statusId = 'approved'
left join customer.phone phPerson on phPerson.actorId = p.actorId and phPerson.statusId = 'approved'
group by customerNumber, convert(varchar(20), p.actorId), p.firstName + ' ' + p.lastName, customerType, customerTypeNumber, ct.customerTypeId