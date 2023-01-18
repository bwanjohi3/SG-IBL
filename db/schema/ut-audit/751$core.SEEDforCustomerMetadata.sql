DECLARE @xml xml
SET @xml = 
'<object name = "customer" type = "businessObject" mainTableSchema = "customer" mainTableName = "customer" >
 <component name = "get">
  <variables>
    <variable name = "@objectId" isSPParam = "1" definition = "BIGINT"/> 
    <variable name = "@eventDate" isSPParam = "1" definition = "DATETIME2(3)"/> 
    <variable name = "@languageId" isSPParam = "0" definition = "BIGINT 
                                                                 SET @languageId =  isnull((SELECT languageId
                                                                     FROM [core].[language] cl
                                                                     JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                                                                     WHERE us.[actorId] = @objectId), (select [languageId] from [core].[language] where [name] = ''English''))"/> 

  </variables>
  <subObjects>
    <subObject name = "customer" isSingle = "0">
      <relations>
		<relation schemaName = "customer" tableName = "customer" tableAlias = "c" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "actorId" />
			<field sourceColumn = "frontEndRecordId" />
			<field sourceColumn = "customerNumber" />
			<field sourceColumn = "customerTypeId" /> 
			<field sourceColumn = "kycId" />
			<field sourceColumn = "stateId" />
			<field sourceColumn = "statusId" />
			<field sourceColumn = "createdBy" />
			<field sourceColumn = "createdOn" />
			<field sourceColumn = "updatedBy" />
			<field sourceColumn = "updatedOn" />
			<field sourceColumn = "customerCategoryId" />
			<field sourceColumn = "dao" />
			<field sourceColumn = "description" />  
			<field sourceColumn = "cbsId" />  
			<field sourceColumn = "countryId" />  
			<field sourceColumn = "industryId" />  
			<field sourceColumn = "sectorId" />  
			<field sourceColumn = "loanCycle" /> 
			<field sourceColumn = "organizationId" />  
			<field sourceColumn = "prospectClient" />  
			<field sourceColumn = "adminFee" />  
		  </fields>
		  <conditions>
			<condition  columnName = "actorId" definition = " = @objectId" />
		  </conditions>
		</relation> 
		<relation schemaName = "customer" tableName = "state" tableAlias = "s" columnName = "stateId" parentRelationAlias = "c" parentColumn = "stateId" joinType = "JOIN" joinOrder = "2">
		  <fields>
			<field columnAlias = "stateValue" sourceColumn = "display" />
		  </fields>
		</relation> 
		<relation schemaName = "customer" tableName = "kyc" tableAlias = "k" columnName = "kycId" parentRelationAlias = "c" parentColumn = "kycId" joinType = "LEFT JOIN" joinOrder = "3" >
		  <fields>
			<field columnAlias = "kycValue" sourceColumn = "display" /> 
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "cbs" tableAlias = "cbs" columnName = "cbsId" parentRelationAlias = "c" parentColumn = "cbsId" joinType = "LEFT JOIN" joinOrder = "4" >
		  <fields>
			<field columnAlias = "cbsPort"  sourceColumn = "ut5Key" />
		  </fields>
		</relation> 
		<relation schemaName = "customer" tableName = "country" tableAlias = "country" columnName = "countryId" parentRelationAlias = "c" parentColumn = "countryId" joinType = "LEFT JOIN" joinOrder = "5">
		  <fields>
			<field columnAlias = "country"  sourceColumn = "name" /> 
			<field columnAlias = "departmentId" sourceColumn = "countryId" /> 
		  </fields>
		</relation> 
		<relation schemaName = "customer" tableName = "industry" tableAlias = "ci" columnName = "industryId" parentRelationAlias = "c" parentColumn = "industryId" joinType = "LEFT JOIN" joinOrder = "6">
		</relation>  		
		<relation schemaName = "core" tableName = "itemName" tableAlias = "i" columnName = "itemNameId" parentRelationAlias = "ci" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "7">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "industryName" />	
		  </fields>
		</relation>

          <relation schemaName = "customer" tableName = "organization" tableAlias = "o" columnName = "actorId" parentRelationAlias = "c" parentColumn = "organizationId" joinType = "LEFT JOIN" joinOrder = "8">
		  <fields>
			<field sourceColumn = "organizationName" />
		  </fields>
		</relation> 
      </relations>
    </subObject>
	<subObject name = "person" isSingle = "0" >
      <relations>
		<relation schemaName = "customer" tableName = "person" tableAlias = "p" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "actorId" />
			<field sourceColumn = "frontEndRecordId" />
			<field sourceColumn = "firstName" />
			<field sourceColumn = "lastName" /> 
			<field sourceColumn = "nationalId" />
			<field sourceColumn = "nationality" />
			<field sourceColumn = "dateOfBirth" />
			<field sourceColumn = "placeOfBirth" />
			<field sourceColumn = "gender" />
			<field sourceColumn = "bioId" />
			<field sourceColumn = "udf" />
			<field sourceColumn = "phoneModel" />
			<field sourceColumn = "computerModel" />
			<field sourceColumn = "isEnabled" />
			<field sourceColumn = "isDeleted" />
			<field sourceColumn = "maritalStatusId" />
			<field sourceColumn = "age" />
			<field sourceColumn = "middleName" />
			<field sourceColumn = "educationId" />
			<field sourceColumn = "employmentId" />
			<field sourceColumn = "employmentDate" />
			<field sourceColumn = "incomeRangeId" />
			<field sourceColumn = "employerName" />
			<field sourceColumn = "employerCategoryId" />
			<field sourceColumn = "familyMembers" />
		  </fields>
		  <conditions>
			<condition columnName = "actorId" definition = " = @objectId" />
		  </conditions>
		</relation> 
        <relation schemaName = "customer" tableName = "education" tableAlias = "e" columnName = "educationId" parentRelationAlias = "p" parentColumn = "educationId" joinType = "LEFT JOIN" joinOrder = "2">
		</relation> 
        <relation schemaName = "core" tableName = "itemName" tableAlias = "i" columnName = "itemNameId" parentRelationAlias = "e" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "3">
		  <fields>
			<field columnAlias = "educationName"   sourceColumn = "itemName" /> 
		  </fields>
		</relation> 
		<relation schemaName = "customer" tableName = "employerCategory" tableAlias = "ec" columnName = "employerCategoryId" parentRelationAlias = "p" parentColumn = "employerCategoryId" joinType = "LEFT JOIN" joinOrder = "4">
		</relation> 
        <relation schemaName = "core" tableName = "itemName" tableAlias = "i1" columnName = "itemNameId" parentRelationAlias = "ec" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "5">
		  <fields>
			<field columnAlias = "employerCategoryName"  sourceColumn = "itemName" /> 
		  </fields>
		</relation>  
		<relation schemaName = "customer" tableName = "employment" tableAlias = "ee" columnName = "employmentId" parentRelationAlias = "p" parentColumn = "employmentId" joinType = "LEFT JOIN" joinOrder = "6">
		</relation> 
        <relation schemaName = "core" tableName = "itemName" tableAlias = "i2" columnName = "itemNameId" parentRelationAlias = "ee" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "7">
		  <fields>
			<field columnAlias = "employmentName"  sourceColumn = "itemName" /> 
		  </fields>
		</relation> 
		<relation schemaName = "customer" tableName = "incomeRange" tableAlias = "ir" columnName = "incomeRangeId" parentRelationAlias = "p" parentColumn = "incomeRangeId" joinType = "LEFT JOIN" joinOrder = "8">
		</relation>  
		<relation schemaName = "core" tableName = "itemName" tableAlias = "i3" columnName = "itemNameId" parentRelationAlias = "ir" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "9">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "incomeRangeName" />	
		  </fields>
		</relation>
		<relation schemaName = "customer" tableName = "maritalStatus" tableAlias = "ms" columnName = "maritalStatusId" parentRelationAlias = "p" parentColumn = "maritalStatusId" joinType = "LEFT JOIN" joinOrder = "10">
		</relation>  
		<relation schemaName = "core" tableName = "itemName" tableAlias = "i4" columnName = "itemNameId" parentRelationAlias = "ms" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "11">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "maritalStatusName" />	
		  </fields>
		</relation>
	  </relations>
    </subObject>
	<subObject name = "account" isSingle = "0" >
      <relations>
		<relation schemaName = "ledger" tableName = "account" tableAlias = "a" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "accountId" />
			<field sourceColumn = "accountName" />
			<field sourceColumn = "accountNumber" />
			<field sourceColumn = "businessUnitId" />
			<field sourceColumn = "statusId" />
			<field sourceColumn = "stateId" />
			<field sourceColumn = "createdBy" />
			<field sourceColumn = "createdOn" />
			<field sourceColumn = "linkedAccount" />
			<field sourceColumn = "ownerId" />
			<field sourceColumn = "analytic1TypeId" />
			<field sourceColumn = "analytic2TypeId" />
			<field sourceColumn = "analytic3TypeId" />
			<field sourceColumn = "analytic4TypeId" />
			<field sourceColumn = "isDeleted" />
			<field sourceColumn = "checkAmount" />
			<field sourceColumn = "checkMask" />
			<field sourceColumn = "" definition = "CASE WHEN a.statusId = ''new'' THEN 1 ELSE 0 END" columnAlias = "isNew" />
		  </fields>
		  <conditions>
			<condition columnName = "ownerId" definition = " = @objectId" />
		  </conditions>
		</relation> 
		<relation schemaName = "ledger" tableName = "balance" tableAlias = "b" columnName = "accountId" parentRelationAlias = "a" parentColumn = "accountId" joinType = "LEFT JOIN" joinOrder = "2">
		  <fields>
			<field sourceColumn = "" definition = "isnull(b.credit - b.debit, 0)" columnAlias = "balance"/>
		  </fields>
		</relation> 	
		<relation schemaName = "ledger" tableName = "product" tableAlias = "pr" columnName = "productId" parentRelationAlias = "a" parentColumn = "productId" joinType = "JOIN" joinOrder = "3">
		  <fields>
			<field sourceColumn = "productCode" />
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "itemName" tableAlias = "npr" columnName = "itemNameId" parentRelationAlias = "pr" parentColumn = "itemNameId" joinType = "JOIN" joinOrder = "4">
		  <fields>
			<field sourceColumn = "itemNameId" columnAlias = "productNameId"/>
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "itemName" tableAlias = "npt" columnName = "itemNameId" parentRelationAlias = "pr" parentColumn = "productTypeId" joinType = "JOIN" joinOrder = "5">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "productTypeName"/>
		  </fields>
          </relation> 
		<relation schemaName = "core" tableName = "itemName" tableAlias = "ng" columnName = "itemNameId" parentRelationAlias = "npt" parentColumn = "parentItemNameId" joinType = "JOIN" joinOrder = "6">
		  <fields>
			<field sourceColumn = "itemNameId" columnAlias = "productGroupId"/>
		  </fields>		  
		</relation>
		<relation schemaName = "core" tableName = "currency" tableAlias = "c" columnName = "currencyId" parentRelationAlias = "pr" parentColumn = "currencyId" joinType = "JOIN" joinOrder = "7">
		</relation>  
		<relation schemaName = "core" tableName = "itemName" tableAlias = "n" columnName = "itemNameId" parentRelationAlias = "c" parentColumn = "itemNameId" joinType = "JOIN" joinOrder = "8">
		</relation> 
		<relation schemaName = "ledger" tableName = "state" tableAlias = "s" columnName = "stateId" parentRelationAlias = "a" parentColumn = "stateId" joinType = "JOIN" joinOrder = "9">
		</relation> 	
		<relation schemaName = "core" tableName = "itemName" tableAlias = "ss" columnName = "itemNameId" parentRelationAlias = "s" parentColumn = "itemNameId" joinType = "JOIN" joinOrder = "10">
		</relation> 
		<relation schemaName = "customer" tableName = "organization" tableAlias = "o" columnName = "actorId" parentRelationAlias = "a" parentColumn = "businessUnitId" joinType = "JOIN" joinOrder = "11">
		  <fields>
			<field sourceColumn = "organizationName" />
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "itemTranslation" tableAlias = "it" columnName = "itemNameId" parentRelationAlias = "n" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "12" additionalConditions = " AND it.languageId  = @languageId">
		  <fields>
			<field sourceColumn = "" definition = "isnull(it.itemNameTranslation, n.itemName)" columnAlias = "currencyName" />
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "itemTranslation" tableAlias = "ittn" columnName = "itemNameId" parentRelationAlias = "ng" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "13" additionalConditions = " AND ittn.languageId  = @languageId">
		  <fields>
			<field sourceColumn = "" definition = "isnull(ittn.itemNameTranslation, ng.itemName)" columnAlias = "productGroup" />
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "itemTranslation" tableAlias = "ittnt" columnName = "itemNameId" parentRelationAlias = "npt" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "14">
		</relation> 
		<relation schemaName = "core" tableName = "itemTranslation" tableAlias = "ittnn" columnName = "itemNameId" parentRelationAlias = "npr" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "15" additionalConditions = " AND ittn.languageId  = @languageId">
		  <fields>
			<field sourceColumn = "" definition = "isnull(ittnn.itemNameTranslation, npr.itemName)" columnAlias = "productName" />
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "itemTranslation" tableAlias = "itts" columnName = "itemNameId" parentRelationAlias = "ss" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "16">
		</relation> 
		<relation schemaName = "ledger" tableName = "state" tableAlias = "st" columnName = "stateId" parentRelationAlias = "a" parentColumn = "stateId" joinType = "JOIN" joinOrder = "17">
		</relation> 
		<relation schemaName = "core" tableName = "itemName" tableAlias = "inSt" columnName = "itemNameId" parentRelationAlias = "st" parentColumn = "itemNameId" joinType = "JOIN" joinOrder = "18">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "stateName"/>
			<field sourceColumn = "itemCode" columnAlias = "stateCode"/>			
		  </fields>

		</relation> 		
      </relations>
    </subObject>	
	<subObject name = "accountPerson" isSingle = "0" >
      <relations>
		<relation schemaName = "ledger" tableName = "account" tableAlias = "a" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "accountId" />
			<field sourceColumn = "accountName" />
			<field sourceColumn = "updatedBy" />
			<field sourceColumn = "businessUnitId" />
			<field sourceColumn = "productId" />
			<field sourceColumn = "ownerId" />			
		  </fields>
		  <conditions>
			<condition columnName = "ownerId" definition = " = @objectId" />
		  </conditions>
		</relation> 
		<relation schemaName = "ledger" tableName = "accountPerson" tableAlias = "ap" columnName = "accountId" parentRelationAlias = "a" parentColumn = "accountId" joinType = "JOIN" joinOrder = "2">
		  <fields>
			<field sourceColumn = "personId" />
		  </fields>
		</relation> 
		<relation schemaName = "customer" tableName = "person" tableAlias = "p" columnName = "actorId" parentRelationAlias = "ap" parentColumn = "personId" joinType = "LEFT JOIN" joinOrder = "3">
		</relation> 
		<relation schemaName = "ledger" tableName = "balance" tableAlias = "b" columnName = "accountId" parentRelationAlias = "a" parentColumn = "accountId" joinType = "LEFT JOIN" joinOrder = "4">
		  <fields>
			<field sourceColumn = "" definition = "isnull(b.credit - b.debit, 0)" columnAlias = "balance" />
		  </fields>
		</relation> 		
      </relations>
    </subObject>
	<subObject name = "address" isSingle = "0" >
      <relations>
		<relation schemaName = "customer" tableName = "address" tableAlias = "a" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "addressId" />
			<field sourceColumn = "actorId" />
			<field sourceColumn = "value" />
			<field sourceColumn = "frontEndRecordId" />
			<field sourceColumn = "addressTypeId" />
			<field sourceColumn = "statusId" />
			<field sourceColumn = "city" />
			<field sourceColumn = "lat" />
			<field sourceColumn = "lng" />
			<field sourceColumn = "addressZone1" columnAlias = "addressZone1Id" />
			<field sourceColumn = "addressZone2" columnAlias = "addressZone2Id" />
			<field sourceColumn = "addressZone3" columnAlias = "addressZone3Id" />
			<field sourceColumn = "addressZone4" columnAlias = "addressZone4Id" />		
		  </fields>
		  <conditions>
			<condition columnName = "actorId" definition = " = @objectId" />
		  </conditions>
		</relation> 
		<relation schemaName = "core" tableName = "itemName" tableAlias = "i1" columnName = "itemNameId" parentRelationAlias = "a" parentColumn = "addressZone1" joinType = "LEFT JOIN" joinOrder = "2">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "addressZone1" />	
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "itemName" tableAlias = "i2" columnName = "itemNameId" parentRelationAlias = "a" parentColumn = "addressZone2" joinType = "LEFT JOIN" joinOrder = "3">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "addressZone2" />	
		  </fields>
		</relation> 
		<relation schemaName = "core" tableName = "itemName" tableAlias = "i3" columnName = "itemNameId" parentRelationAlias = "a" parentColumn = "addressZone3" joinType = "LEFT JOIN" joinOrder = "4">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "addressZone3" />	
		  </fields>
		</relation> 	
		<relation schemaName = "core" tableName = "itemName" tableAlias = "i4" columnName = "itemNameId" parentRelationAlias = "a" parentColumn = "addressZone4" joinType = "LEFT JOIN" joinOrder = "5">
		  <fields>
			<field sourceColumn = "itemName" columnAlias = "addressZone4" />	
		  </fields>
		</relation> 		
      </relations>
    </subObject>		
	<subObject name = "email" isSingle = "0" >
      <relations>
		<relation schemaName = "customer" tableName = "email" tableAlias = "a" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "emailId" />
			<field sourceColumn = "actorId" />
			<field sourceColumn = "value" />
			<field sourceColumn = "frontEndRecordId" />
			<field sourceColumn = "emailTypeId" />
			<field sourceColumn = "statusId" />
			<field sourceColumn = "oldValues" />
			<field sourceColumn = "isPrimary" />	
		  </fields>
		  <conditions>
			<condition columnName = "actorId" definition = " = @objectId" />
		  </conditions>
		</relation> 
      </relations>
    </subObject>
	<subObject name = "phone" isSingle = "0" >
      <relations>
		<relation schemaName = "customer" tableName = "phone" tableAlias = "p" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "phoneId" />
			<field sourceColumn = "actorId" />
			<field sourceColumn = "frontEndRecordId" />
			<field sourceColumn = "phoneTypeId" />
			<field sourceColumn = "phoneNumber" />
			<field sourceColumn = "statusId" />
			<field sourceColumn = "oldValues" />
			<field sourceColumn = "udf" />
			<field sourceColumn = "mnoId" />
			<field sourceColumn = "isPrimary" />
		  </fields>
		  <conditions>
			<condition columnName = "actorId" definition = " = @objectId" />
		  </conditions>
		</relation>  
		<relation schemaName = "customer" tableName = "mno" tableAlias = "mno" columnName = "mnoId" parentRelationAlias = "p" parentColumn = "mnoId" joinType = "LEFT JOIN" joinOrder = "2">
		  <fields>
			<field sourceColumn = "ut5Key" columnAlias = "mnoKey" />	
			<field sourceColumn = "name" columnAlias = "mnoName" />	
		  </fields>
		</relation>   
      </relations>
    </subObject>
	<subObject name = "document" isSingle = "0" >
      <relations>
		<relation schemaName = "document" tableName = "document" tableAlias = "du" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "documentId" />
			<field sourceColumn = "documentTypeId" />
			<field sourceColumn = "statusId" />
			<field sourceColumn = "expirationDate" />
			<field sourceColumn = "oldValues" />
			<field sourceColumn = "documentNumber" />
			<field sourceColumn = "description" />
			<field sourceColumn = "createdDate" />
			<field sourceColumn = "countryId" />
		  </fields>
		</relation>  
		<relation schemaName = "document" tableName = "actorDocument" tableAlias = "adu" columnName = "documentId" parentRelationAlias = "du" parentColumn = "documentId" joinType = "JOIN" joinOrder = "2">
		  <fields>
			<field sourceColumn = "documentOrder" />
		  </fields>
		  <conditions>
			<condition columnName = "actorId" definition = " = @objectId" />
		  </conditions>
		</relation>   
		<relation schemaName = "document" tableName = "documentType" tableAlias = "dt" columnName = "documentTypeId" parentRelationAlias = "du" parentColumn = "documentTypeId" joinType = "LEFT JOIN" joinOrder = "3">
		</relation>  
		<relation schemaName = "core" tableName = "itemTranslation" tableAlias = "itt" columnName = "itemNameId" parentRelationAlias = "dt" parentColumn = "itemNameId" joinType = "LEFT JOIN" joinOrder = "4" additionalConditions = " AND itt.languageId  = @languageId">
		  <fields>
			<field sourceColumn = "itemNameTranslation" columnAlias = "documentTypeName" />	
		  </fields>
		</relation>
		<relation schemaName = "customer" tableName = "country" tableAlias = "cc" columnName = "countryid" parentRelationAlias = "du" parentColumn = "countryid" joinType = "LEFT JOIN" joinOrder = "5">
		  <fields>
			<field sourceColumn = "name" columnAlias = "countryName" />	
		  </fields>	
		</relation>  		
      </relations>
    </subObject>
	<subObject name = "attachment" isSingle = "0" >
      <relations>
		<relation schemaName = "document" tableName = "attachment" tableAlias = "au" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "attachmentId" />
			<field sourceColumn = "contentType" />
			<field sourceColumn = "extension" />
			<field sourceColumn = "filename" />
			<field sourceColumn = "documentId" />
			<field sourceColumn = "attachmentSizeId" />
			<field sourceColumn = "page" />
			<field sourceColumn = "oldValues" />
		  </fields>
		</relation>  
		<relation schemaName = "document" tableName = "actorDocument" tableAlias = "adu" columnName = "documentId" parentRelationAlias = "au" parentColumn = "documentId" joinType = "JOIN" joinOrder = "2">
		  <fields>
			<field sourceColumn = "documentOrder" />
		  </fields>
		  <conditions>
			<condition columnName = "actorId" definition = " = @objectId" />
		  </conditions>
		</relation>   
		<relation schemaName = "document" tableName = "document" tableAlias = "d" columnName = "documentId" parentRelationAlias = "au" parentColumn = "documentId" joinType = "JOIN" joinOrder = "3">
		</relation>  
      </relations>
    </subObject>
	</subObjects>
  </component>	
  <component name = "fetch">
  <variables>
    <variable name = "@globalId" isSPParam = "1" definition = "UNIQUEIDENTIFIER"/> 
    <variable name = "@eventDate" isSPParam = "1" definition = "DATETIME2(3)"/> 
  </variables>
  <subObjects> 
	<subObject name = "customerFetch" isSingle = "0" >
      <relations>
		<relation schemaName = "customer" tableName = "customer" tableAlias = "c" joinType = "FROM" joinOrder = "1">
		  <fields>
			<field sourceColumn = "actorId" columnAlias = "objectId" />
			<field sourceColumn = "customerNumber" columnAlias = "shortDesc" />
		  </fields>
		</relation>  
      </relations>
    </subObject>	
	</subObjects>
 </component>	
</object>'


DECLARE @RC int
DECLARE @object [core].[objectTT]
DECLARE @component [core].[componentTT]
DECLARE @variable  [core].[variableTT]
DECLARE @subObject [core].[subObjectTT]
DECLARE @relation [core].[relationTT]
DECLARE @relationIDs [core].[relationTT]
DECLARE @field [core].[fieldTT]
DECLARE @condition [core].[conditionTT]
DECLARE @removeDataFlag int = 0
DECLARE @updateFlag int = 1
DECLARE @insertFlag int = 1
DECLARE @noResultSet INT = 0



INSERT INTO @object (objectid, name, description ,[type], mainTableSchema ,mainTableName)
SELECT al.objectid, rl.name, null, rl.[type], rl.mainTableSchema ,rl.mainTableName
FROM
(SELECT 
    b.value('@name', 'nvarchar(50)') as name
  , b.value('@type', 'nvarchar(50)') as type
  , b.value('@description', 'nvarchar(50)') as description
  , b.value('@mainTableSchema', 'nvarchar(50)') as mainTableSchema
  , b.value('@mainTableName', 'nvarchar(50)') as mainTableName
  , b.value('@databaseName', 'nvarchar(50)') as databaseName
FROM @xml.nodes('/object') as a(b)) rl 
LEFT JOIN [core].[object] al on al.[name] = rl.[name]

EXECUTE @RC = [core].[object.SEED]
   @object
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet


UPDATE a
SET objectid = b.objectid
FROM @object a
JOIN core.object b ON a.name = b.name
WHERE a.objectid IS NULL
 

INSERT INTO @component (componentID, objectID, Name)
SELECT c.componentID, o.objectid, rl.componentName
FROM
(SELECT 
    b.value('../@name', 'nvarchar(50)') as objectName
  , b.value('@name', 'nvarchar(50)') as componentName
FROM @xml.nodes('/object/component') as a(b)) rl 
JOIN [core].[object] o on o.[name] = rl.[objectName]
LEFT JOIN [core].[component] c on c.objectid = o.objectid AND c.name = rl.componentName


EXECUTE @RC = [core].[component.SEED]
   @component
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet


UPDATE a
SET componentID = b.componentID
FROM @component a
JOIN core.component b ON a.name = b.name
                        AND a.objectID = b.objectID
WHERE a.componentID IS NULL  


INSERT INTO @variable (variableId, componentID, name, isSPParam, definition)
SELECT v.variableId, c.componentID, rl.varName, rl.isSPParam, rl.definition
FROM
(SELECT 
    b.value('../../../@name', 'nvarchar(50)') as objectName
  , b.value('../../@name', 'nvarchar(50)') as componentName
  , b.value('@name', 'nvarchar(50)') as varName
  , b.value('@isSPParam', 'int') as isSPParam
  , b.value('@definition', 'nvarchar(50)') as definition
FROM @xml.nodes('/object/component/variables/variable') as a(b)) rl 
JOIN @object o on o.name = rl.objectName
JOIN [core].[component] c on c.objectid = o.objectid AND c.name = rl.componentName
LEFT JOIN [core].[variable] v on v.name = rl.varName and v.componentID = c.componentID


EXECUTE @RC = [core].[variable.SEED]
   @variable
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet


UPDATE a
SET variableId = b.variableId
FROM @variable a
JOIN core.variable b ON a.name = b.name
                        AND a.componentID = b.componentID
WHERE a.variableId IS NULL  


INSERT INTO @subObject (subObjectID, componentID, name, selectStatement, isSingle)
SELECT so.subObjectID, c.componentID, rl.subObjectName, rl.selectStatement, rl.isSingle
FROM
(SELECT 
    b.value('../../../@name', 'nvarchar(50)') as objectName
  , b.value('../../@name', 'nvarchar(50)') as componentName
  , b.value('@name', 'nvarchar(50)') as subObjectName
  , b.value('@isSingle', 'int') as isSingle
  , b.value('@selectStatement', 'nvarchar(50)') as selectStatement
  , b.value('@sortOrder', 'int') as sortOrder
FROM @xml.nodes('/object/component/subObjects/subObject') as a(b)) rl 
JOIN @object o on o.name = rl.objectName
JOIN @component c on c.objectid = o.objectid AND c.name = rl.componentName
LEFT JOIN [core].[subObject] so on so.[name] = rl.[subObjectName] and c.componentID = so.componentID


EXECUTE @RC = [core].[subObject.SEED]
   @subObject
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet

UPDATE a
SET subObjectID = b.subObjectID
FROM @subObject a
JOIN [core].[subObject] b ON a.name = b.name
                        AND a.componentID = b.componentID
WHERE a.subObjectID IS NULL  
  

declare @newRelation table(objectName nvarchar(50),componentName nvarchar(50),subObjectName nvarchar(50),schemaName nvarchar(50),tableName nvarchar(50),tableAlias nvarchar(50), columnName nvarchar(50), joinType nvarchar(50), joinOrder nvarchar(50), additionalConditions nvarchar(50))
INSERT INTO @newRelation
SELECT 
    b.value('../../../../../@name', 'nvarchar(50)') as objectName
  , b.value('../../../../@name', 'nvarchar(50)') as componentName
  , b.value('../../@name', 'nvarchar(50)') as subObjectName
  , b.value('@schemaName', 'nvarchar(50)') as schemaName
  , b.value('@tableName', 'nvarchar(50)') as tableName
  , b.value('@tableAlias', 'nvarchar(50)') as tableAlias
  , b.value('@columnName', 'nvarchar(50)') as columnName
  , b.value('@joinType', 'nvarchar(50)') as joinType
  , b.value('@joinOrder', 'nvarchar(50)') as joinOrder
  , b.value('@additionalConditions', 'nvarchar(50)') as additionalConditions
FROM @xml.nodes('/object/component/subObjects/subObject/relations/relation') as a(b)


INSERT INTO @relation (relationID, subObjectID, schemaName, tableName, tableAlias,columnName, joinType, joinOrder, additionalconditions)
SELECT r.relationID, al.subObjectID, rl.schemaName, rl.tableName, rl.tableAlias, rl.columnName, rl.joinType, rl.joinOrder,rl.additionalconditions
FROM @newRelation rl
JOIN @object o on o.name = rl.objectName
JOIN @component c on c.objectid = o.objectid AND c.name = rl.componentName
JOIN @subObject al on al.[name] = rl.[subObjectName] and al.componentID = c.componentID
LEFT JOIN [core].[relation] r on r.subObjectID = al.subObjectID and r.tableAlias = rl.tableAlias


EXECUTE @RC = [core].[relation.SEED]
   @relation
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet

UPDATE a
SET relationID = b.relationID
FROM @relation a
JOIN [core].[relation] b ON a.tableAlias = b.tableAlias
                        AND a.subObjectID = b.subObjectID
WHERE a.relationID IS NULL  

DECLARE @newRelationIDs table(objectName nvarchar(50),componentName nvarchar(50),subObjectName nvarchar(50),tableAlias nvarchar(50),columnName nvarchar(50),relatedToTableAlias nvarchar(50), relatedToColumn nvarchar(50))
INSERT INTO @newRelationIDs
SELECT 
    b.value('../../../../../@name', 'nvarchar(50)') as objectName
  , b.value('../../../../@name', 'nvarchar(50)') as componentName
  , b.value('../../@name', 'nvarchar(50)') as subObjectName
  , b.value('@tableAlias', 'nvarchar(50)') as tableAlias
  , b.value('@columnName', 'nvarchar(50)') as columnName
  , b.value('@parentRelationAlias', 'nvarchar(50)') as relatedToTableAlias
  , b.value('@parentColumn', 'nvarchar(50)') as relatedToColumn
FROM @xml.nodes('/object/component/subObjects/subObject/relations/relation') as a(b)


-- update relationID
INSERT INTO @relationIDs (relationID, parentRelationID, parentColumn )
SELECT r.relationID, rr.relationID AS parentRelationID, rl.relatedToColumn as parentColumn
FROM @newRelationIDs rl
JOIN @object o on o.name = rl.objectName
JOIN @component c on c.objectid = o.objectid AND c.name = rl.componentName
JOIN @subObject al on al.[name] = rl.[subObjectName] and al.componentID = c.componentID
JOIN [core].[relation] r on rl.tableAlias = r.tableAlias and r.subObjectID = al.subObjectID
JOIN [core].[relation] rr on rl.relatedToTableAlias = rr.tableAlias and rr.subObjectID = al.subObjectID
WHERE r.parentRelationID IS NULL OR r.relationID <> r.parentRelationID

update r
set r.parentRelationID = rr.parentRelationID,
    r.parentColumn = rr.parentColumn
from [core].[relation] r
join @relationIDs rr on rr.relationID = r.relationID


DECLARE @newfield table(objectName nvarchar(50),componentName nvarchar(50),subObjectName nvarchar(50),tableAlias nvarchar(50),columnName nvarchar(50),definition nvarchar(50), columnAlias nvarchar(50))
INSERT INTO @newfield
SELECT 
    b.value('../../../../../../../@name', 'nvarchar(50)') as objectName
  , b.value('../../../../../../@name', 'nvarchar(50)') as componentName
  , b.value('../../../../@name', 'nvarchar(50)') as subObjectName
  , b.value('../../@tableAlias', 'nvarchar(50)') as tableAlias
  , b.value('@sourceColumn', 'nvarchar(50)') as columnName
  , b.value('@definition', 'nvarchar(50)') as definition
  , b.value('@columnAlias', 'nvarchar(50)') as columnAlias
FROM @xml.nodes('/object/component/subObjects/subObject/relations/relation/fields/field') as a(b)

INSERT INTO @field (fieldID,  relationID, sourceColumn, definition, columnAlias)
SELECT f.fieldID, r.relationID, rl.columnName, rl.definition, rl.columnAlias
FROM @newfield rl
JOIN @object o on o.name = rl.objectName
JOIN @component c on c.objectid = o.objectid AND c.name = rl.componentName
JOIN @subObject al on al.[name] = rl.[subObjectName] and al.componentID = c.componentID
JOIN @relation r on r.subObjectID = al.subObjectID and r.tableAlias = rl.tableAlias
LEFT JOIN [core].[field] f on f.relationId = r.relationID and f.sourceColumn = rl.columnName and isnull(f.columnAlias,'') = isnull(rl.columnAlias,'') 


EXECUTE @RC = [core].[field.SEED]
   @field
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet

UPDATE a
SET fieldID = b.fieldID
FROM @field a
JOIN [core].[field] b ON a.sourceColumn = b.sourceColumn
                        AND isnull(a.columnAlias,'') = isnull(b.columnAlias,'')
                        AND a.relationId  = b.relationId 
WHERE a.fieldID IS NULL  

DECLARE @newCondition table(objectName nvarchar(50),componentName nvarchar(50),subObjectName nvarchar(50),tableAlias nvarchar(50),columnName nvarchar(50),definition nvarchar(50))
INSERT INTO @newCondition
SELECT 
    b.value('../../../../../../../@name', 'nvarchar(50)') as objectName
  , b.value('../../../../../../@name', 'nvarchar(50)') as componentName
  , b.value('../../../../@name', 'nvarchar(50)') as subObjectName
  , b.value('../../@tableAlias', 'nvarchar(50)') as tableAlias
  , b.value('@columnName', 'nvarchar(50)') as columnName
  , b.value('@definition', 'nvarchar(50)') as definition
FROM @xml.nodes('/object/component/subObjects/subObject/relations/relation/conditions/condition') as a(b)

INSERT INTO @condition (conditionID, relationID, columnName, definition)
SELECT c.conditionID, r.relationID, rl.columnName, rl.definition
FROM @newCondition rl 
JOIN @object o on o.name = rl.objectName
JOIN @component co on co.objectid = o.objectid AND co.name = rl.componentName
JOIN @subObject al on al.[name] = rl.[subObjectName] and al.componentID = co.componentID
JOIN @relation r on r.subObjectID = al.subObjectID and r.tableAlias = rl.tableAlias
LEFT JOIN [core].[condition] c on c.relationID = r.relationID and c.columnName = rl.columnName


EXECUTE @RC = [core].[condition.SEED]
   @condition
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet

UPDATE a
SET conditionID = b.conditionID
FROM @condition a
JOIN [core].[condition] b ON a.columnName = b.columnName
                        AND a.relationId  = b.relationId 
WHERE a.conditionID IS NULL  


-- remove deleted records
DELETE c
FROM core.condition c
JOIN core.relation r ON c.relationID = r.relationID
JOIN core.subObject so ON r.subObjectID = so.subObjectID
JOIN core.component co ON so.componentID = co.componentID
JOIN @object o ON o.objectID = co.objectID
LEFT JOIN @condition nc ON nc.conditionID = c.conditionID
WHERE nc.conditionID IS NULL

DELETE f
FROM core.field f
JOIN core.relation r ON f.relationID = r.relationID
JOIN core.subObject so ON r.subObjectID = so.subObjectID
JOIN core.component co ON so.componentID = co.componentID
JOIN @object o ON o.objectID = co.objectID
LEFT JOIN @field nf ON nf.fieldID = f.fieldID
WHERE nf.fieldID IS NULL

DELETE r
FROM core.relation r 
JOIN core.subObject so ON r.subObjectID = so.subObjectID
JOIN core.component co ON so.componentID = co.componentID
JOIN @object o ON o.objectID = co.objectID
LEFT JOIN @relation nr ON nr.relationID = r.relationID
WHERE nr.relationID IS NULL

DELETE so
FROM core.subObject so 
JOIN core.component co ON so.componentID = co.componentID
JOIN @object o ON o.objectID = co.objectID
LEFT JOIN @subObject nso ON nso.subObjectID = so.subObjectID
WHERE nso.subObjectID IS NULL

DELETE co
FROM core.component co
JOIN @object o ON o.objectID = co.objectID
LEFT JOIN @component c ON c.componentID = co.componentID
WHERE c.componentID IS NULL