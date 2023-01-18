-- KYC Types
MERGE INTO [core].[itemType] AS target
USING
    (VALUES        
        ('kycLevel', 'kycLevel', 'kycLevel', NULL, NULL, NULL),
        ('kycAttributesIndividual', 'kycAttributesIndividual', 'kycAttributesIndividual', NULL, NULL, NULL),
        ('kycAttributesCorporate', 'kycAttributesCorporate', 'kycAttributesCorporate', NULL, NULL, NULL)
    ) AS source (alias, name, [description], [table], keyColumn, nameColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (alias, name, [description], [table], keyColumn, nameColumn)
VALUES (alias, name, [description], [table], keyColumn, nameColumn);

DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

--Available KYC Levels
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemCode, itemOrder, itemNameTranslation) 
VALUES ('Level 0', 'level0', 0, 'Level 0'),
    ('Level 1', 'level1', 1, 'Level 1'),
    ('Level 2', 'level2', 2, 'Level 2'),
    ('Level 3', 'level3', 3, 'Level 3'),
    ('Level 4', 'level4', 4, 'Level 4'),
    ('Level 5', 'level5', 5, 'Level 5'),
    ('Level 6', 'level6', 6, 'Level 6'),
    ('Level 7', 'level7', 7, 'Level 7'),
    ('Level 8', 'level8', 8, 'Level 8'),
    ('Level 9', 'level9', 9, 'Level 9'),
    ('Level 10', 'level10', 10, 'Level 10')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = null, @itemType = 'kycLevel', @meta = @meta



--Attributes for Individual customers
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemCode, itemNameTranslation) 
VALUES
    ('Mobile Number', 'mobileNumber', 'Mobile Number'),
    ('First Name', 'firstName', 'First Name'),
    ('Middle Name', 'middleName', 'Middle Name'),
    ('Last Name', 'lastName', 'Last Name'),
    ('Gender', 'gender', 'Gender'),
    ('Date of Birth', 'dateOfBirth', 'Date of Birth'),
    ('ID Document Type', 'idDocumentType', 'ID Document Type'),
    ('ID Number', 'idNumber', 'ID Number'),
    ('ID Place of Issue', 'idPlaceOfIsssue', 'ID Place of Issue'),
    ('ID Date of Issue', 'idDateOfIssue', 'ID Date of Issue'),
    ('Number of Family Members', 'numberFamilyMembers', 'Number of Family Members'),
    ('Nationality', 'nationality', 'Nationality'),
    ('Marital Status', 'maritalStatus', 'Marital Status'),
    ('ID Document 2', 'idDocument2', 'ID Document 2'),
    ('ID Number 2', 'idNumber2', 'ID Number 2'),
    ('Income Range', 'incomeRange', 'Income Range'),
    ('Business sector', 'businessSector', 'Business sector'),
    ('Education', 'education', 'Education'),
    ('Employment', 'employment', 'Employment'),
    ('Employer Name', 'employerName', 'Employer Name'),
    ('Employer Category', 'employerCategory', 'Employer Category'),
    ('Date of Employment', 'employmentDate', 'Date of Employment'),
    ('Country - Zone 1', 'countryZone1', 'Country - Zone 1'),
    ('Address - Zone 2', 'addressZone2', 'Address - Zone 2'),
    ('Address - Zone 3', 'addressZone3', 'Address - Zone 3'),
    ('Address - Zone 4', 'addressZone4', 'Address - Zone 4'),
    ('Address street', 'addressStreet', 'Address street'),
    ('ID Photo', 'idPhoto', 'ID Photo'),
    ('Customer Photo', 'customerPhoto', 'Customer Photo'),
    ('Customer Signature', 'signature', 'Customer Signature'),
    ('GPS coordinates', 'gpsCoordinates', 'GPS coordinates')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
@languageId = @enLanguageId, @organizationId = null, @itemType = 'kycAttributesIndividual', @meta = @meta

 --Attributes for Corporate customers
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemCode, itemNameTranslation) 
VALUES
    ('Mobile Number', 'mobileNumberCorp', 'Mobile Number'),
    ('Company name', 'companyName', 'Company name'),
    ('Business license number', 'license', 'Business license number'),
    ('Tax identification number', 'tin', 'Tax identification number'),
    ('VAT registration number', 'vat', 'VAT registration number'),
    ('Organization Type', 'organizationType', 'Organization Type'),
    ('Number Of Owners', 'numberOwners', 'Number Of Owners'),
    ('Date Of Foundation', 'dateFoundation', 'Date Of Foundation'),
    ('Business sector', 'businessSectorCorp', 'Business sector')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = null, @itemType = 'kycAttributesCorporate', @meta = @meta

--Create default KYC Levels
DECLARE @customerKyc [customer].[kycTT]
DECLARE @customerTypeIndividualId int = (SELECT [customerTypeNumber] FROM customer.customerType WHERE [description] = 'individual')
DECLARE @customerTypeCorporatelId int = (SELECT [customerTypeNumber] FROM customer.customerType WHERE [description] = 'corporate')
DECLARE @level0 INT = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'level0')
DECLARE @level1 INT = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'level1')
DECLARE @level2 INT = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'level2')
DECLARE @level3 INT = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'level3')
DECLARE @organizationId bigint = (SELECT actorID FROM customer.organization WHERE organizationName = 'IBL')

INSERT INTO @customerKyc (display, [description], statusId, customerTypeId, organizationId, itemNameId)
VALUES ('Level 0', '', 'active', @customerTypeIndividualId, @organizationId, @level0),
       ('Level 1', 'no picture, no bio => client must be enrolled', 'active', @customerTypeIndividualId, @organizationId, @level1),
       ('Level 2', 'ID, Bio, picture are captured', 'active', @customerTypeIndividualId, @organizationId, @level2),
       ('Level 3', 'Status pulse + documents provided', 'active', @customerTypeCorporatelId, @organizationId, @level3)

;MERGE INTO [customer].[kyc] as t
    USING
    (
        SELECT display, [description], statusId, customerTypeId, organizationId,itemNameId
        FROM @customerKyc
    ) s ON s.itemNameId = t.itemNameId AND s.organizationId = t.organizationId
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (display, [description], statusId, customerTypeId, organizationId, itemNameId)
        VALUES(s.display, s.[description], s.statusId, s.customerTypeId, s.organizationId, itemNameId);
   

--Create conditions for default KYC Level
DECLARE @kycConditionAttribute customer.kycConditionAttributeTT
DECLARE @kycAttributesIndividual BIGINT = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'kycAttributesIndividual')
DECLARE @kycAttributesCorporate BIGINT = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'kycAttributesCorporate')
DECLARE @cond1 int = 1, @cond2 int = 2, @cond3 int = 3
DECLARE @attr1 int = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'mobileNumber' AND itemTypeId = @kycAttributesIndividual), 
        @attr2 int = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'firstName' AND itemTypeId = @kycAttributesIndividual),
        @attr3 int = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'lastName' AND itemTypeId = @kycAttributesIndividual), 
        @attr4 int = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'signature' AND itemTypeId = @kycAttributesIndividual), 
        @attr5 int = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'vat' AND itemTypeId = @kycAttributesCorporate),
        @attr6 int = (SELECT itemNameId FROM core.itemName WHERE itemCode = 'businessSectorCorp' AND itemTypeId = @kycAttributesCorporate)
DECLARE @kyc0 int = (SELECT kycId FROM customer.kyc WHERE display = 'Level 0' and organizationId = @organizationId and isDeleted = 0),
        @kyc1 int = (SELECT kycId FROM customer.kyc WHERE display = 'Level 1' and organizationId = @organizationId and isDeleted = 0),
        @kyc2 int = (SELECT kycId FROM customer.kyc WHERE display = 'Level 2' and organizationId = @organizationId and isDeleted = 0),
        @kyc3 int = (SELECT kycId FROM customer.kyc WHERE display = 'Level 3' and organizationId = @organizationId and isDeleted = 0)

INSERT INTO @kycConditionAttribute (kycId, conditionId, attributeId, conditionCheck)
VALUES (@kyc0, @cond1, @attr1, 'NOT NULL'),
    (@kyc0, @cond1, @attr2, 'NOT NULL'),
    (@kyc0, @cond2, @attr3, 'NOT NULL'),
    (@kyc1, @cond1, @attr1, 'NOT NULL'),
    (@kyc1, @cond2, @attr4, 'NOT NULL'),
    (@kyc2, @cond1, @attr2, 'NOT NULL'),
    (@kyc2, @cond1, @attr3, 'NOT NULL'),
    (@kyc2, @cond2, @attr1, 'NOT NULL'),
    (@kyc2, @cond3, @attr4, 'NOT NULL'),
    (@kyc3, @cond1, @attr5, 'NOT NULL'),
    (@kyc3, @cond1, @attr6, 'NOT NULL')

;MERGE INTO [customer].[kycConditionAttribute] as t
    USING
    (
        SELECT kycId, conditionId, attributeId, conditionCheck
        FROM @kycConditionAttribute
    ) s ON s.kycId = t.kycId AND s.conditionId = t.conditionId AND s.attributeId = t.attributeId
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (kycId, conditionId, attributeId, conditionCheck)
        VALUES(kycId, conditionId, attributeId, conditionCheck);