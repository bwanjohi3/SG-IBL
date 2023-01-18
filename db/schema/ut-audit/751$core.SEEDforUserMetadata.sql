
DECLARE @RC int
DECLARE @object [core].[objectTT]
DECLARE @variable  [core].[variableTT]
DECLARE @subObject [core].[subObjectTT]
DECLARE @component [core].[componentTT]
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
(VALUES  
    (N'user','businessObject','user','user')

) rl ([name],[type], mainTableSchema ,mainTableName)
LEFT JOIN [core].[object] al on al.[name] = rl.[name]


EXECUTE @RC = [core].[object.SEED]
   @object
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet

  

INSERT INTO @component (componentID, objectID, name)
SELECT c.componentID, o.objectid, rl.componentName
FROM
(VALUES  
    (N'user','get'),
    (N'user','fetch')
) rl (objectName,componentName)
JOIN [core].[object] o on o.[name] = rl.[objectName]
LEFT JOIN [core].[component] c on c.objectid = o.objectid AND c.name = rl.componentName


EXECUTE @RC = [core].[component.SEED]
   @component
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet



INSERT INTO @variable (variableId, componentID, name, isSPParam, definition)
SELECT v.variableId, c.componentID, rl.varName, rl.isSPParam, rl.definition
FROM
(VALUES  
    ('user','@objectId',1,'BIGINT','get'),
    ('user','@eventDate',1,'DATETIME2(3)','get'),
    ('user','@globalId',1,'UNIQUEIDENTIFIER','fetch'),
    ('user','@eventDate',1,'DATETIME2(3)','fetch'),
    ('user','@policyId',0,'BIGINT 
                    SET @policyId = (
                    SELECT TOP 1 policyId
                    FROM [history].policyactorPolicyHistory
                    WHERE auditStartDate <= @eventDate AND auditEndDate > @eventDate AND actorId = @objectId)','get'),
    ('user','@policyIdInherited',0,'BIGINT 
                    SET @policyIdInherited = (
                    SELECT TOP 1 policyId
                    FROM [history].policyactorPolicyHistory
                    WHERE auditStartDate <= @eventDate AND auditEndDate > @eventDate AND actorId = @objectId)
                    
                    IF (@policyIdInherited IS NULL)
		          SET @policyIdInherited = (SELECT TOP 1 pp.policyId
									FROM ( SELECT [subject], predicate, [object] 
                                                    FROM [history].coreactorHierarchyHistory
                                                    WHERE auditStartDate <= @eventDate AND auditEndDate > @eventDate
										 ) ah
									JOIN [history].policyactorPolicyHistory p ON ah.[object] = p.actorId AND p.auditStartDate <= @eventDate AND p.auditEndDate > @eventDate
									JOIN [history].policypolicyHistory pp ON p.policyId = pp.policyId AND pp.auditStartDate <= @eventDate AND pp.auditEndDate > @eventDate
                                             JOIN [history].userroleHistory r on r.actorId = p.actorId AND r.isDeleted = 0 AND r.auditStartDate <= @eventDate AND r.auditEndDate > @eventDate
									WHERE [subject] = @objectId AND predicate = ''role''
									ORDER BY pp.[priority])
                                             ','get')
) rl ([objectName],varName, isSPParam, definition, componentName)
JOIN [core].[object] o on o.name = rl.objectName
JOIN [core].[component] c on c.objectid = o.objectid AND c.name = rl.componentName
LEFT JOIN [core].[variable] v on v.name = rl.varName AND v.componentID = c.componentID


EXECUTE @RC = [core].[variable.SEED]
   @variable
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet





INSERT INTO @subObject (subObjectID, componentID, name, selectStatement, isSingle)
SELECT so.subObjectID, c.componentID, rl.subObjectName, rl.selectStatement, rl.isSingle
FROM
(VALUES  
    ('user','get','person','',1),
    ('user','get','phone','',0),
    ('user','get','address','',0),
    ('user','get','email','',0),
    ('user','get','memberOF','',0),
    ('user','get','user','',1),
    ('user','get','policy.basic','',0),
    ('user','get','policy.credentials','',0),
    ('user','get','user.hash','',0),
    ('user','get','externalSystemCredentials','',0),
    ('user','get','userActorDevice','',0),
    ('user','get','roles','',0),
    ('user','get','userClassification','',1),
    ('user','fetch','userFetch','',0)
) rl ([objectName],[componentName],[subObjectName],selectStatement, isSingle)
JOIN [core].[object] o on o.name = rl.objectName
JOIN [core].[component] c on c.objectid = o.objectid AND c.name = rl.componentName
LEFT JOIN [core].[subObject] so on so.[name] = rl.[subObjectName] AND so.componentID = c.componentID


EXECUTE @RC = [core].[subObject.SEED]
   @subObject
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet

  
INSERT INTO @relation (relationID, subObjectID, schemaName, tableName, tableAlias,columnName, joinType, joinOrder, additionalconditions)
SELECT r.relationID, al.subObjectID, rl.schemaName, rl.tableName, rl.tableAlias, rl.columnName, rl.joinType, rl.joinOrder,rl.additionalconditions
FROM
(VALUES  
    ('user','get','person','customer', 'person', 'p', null, 'FROM', 1,''),
    ('user','get','phone','customer', 'phone', 'ph', null, 'FROM', 1,''),
    ('user','get','phone','customer', 'mno', 'mno', 'mnoId', 'LEFT JOIN', 2,''),
    ('user','get','address','customer', 'address', 'a', null, 'FROM', 1,''),
    ('user','get','address','core', 'itemName', 'i1', 'itemNameId', 'LEFT JOIN', 2,''),
    ('user','get','address','core', 'itemName', 'i2', 'itemNameId', 'LEFT JOIN', 3,''),
    ('user','get','address','core', 'itemName', 'i3', 'itemNameId', 'LEFT JOIN', 4,''),
    ('user','get','address','core', 'itemName', 'i4', 'itemNameId', 'LEFT JOIN', 5,''),
    ('user','get','email','customer', 'email', 'e', null, 'FROM', 1,''),
    ('user','get','memberOF','core', 'actorHierarchy', 'ah', null, 'FROM', 1,''),
    ('user','get','memberOF','customer', 'organization', 'o', 'actorId', 'INNER JOIN', 2,''),
    ('user','get','user','user', 'user', 'u', null, 'FROM', 1,''),
    ('user','get','user','core', 'language', 'cl', 'languageId', 'LEFT JOIN', 2,''),
    ('user','get','policy.basic','policy', 'policy', 'pl', null, 'FROM', 1,''),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', null, 'FROM', 1,''),
    ('user','get','user.hash','user', 'hash', 'h', null, 'FROM', 1,''),
    ('user','get','externalSystemCredentials','user', 'userToExternalUser', 'ueu', null, 'FROM', 1,''),
    ('user','get','externalSystemCredentials','user', 'externalUser', 'eu', 'externalUserId', 'INNER JOIN', 2,''),
    ('user','get','externalSystemCredentials','core', 'externalSystem', 'es', 'externalSystemId', 'INNER JOIN', 3,''),
    ('user','get','externalSystemCredentials','customer', 'organization', 'o', 'actorId', 'INNER JOIN', 4,''),
    ('user','get','userActorDevice','user', 'actorDevice', 'ad', null, 'FROM', 1,''),
    ('user','get','roles','core', 'actorHierarchy', 'ah', null, 'FROM', 1,''),
    ('user','get','roles','user', 'user', 'u', 'actorId', 'INNER JOIN', 2,''),
    ('user','get','roles','user', 'role', 'r', 'actorId', 'INNER JOIN', 3,''),
    ('user','get','userClassification','core', 'actorProperty', 'c', null, 'FROM', 1,''),
    ('user','fetch','userFetch','user', 'user', 'u', null, 'FROM', 1,''),
    ('user','fetch','userFetch','user', 'hash', 'uh', 'actorId' , 'INNER JOIN', 2,'')
  
) rl (ObjectName,componentName,subObjectName,schemaName, tableName, tableAlias, columnName, joinType, joinOrder, additionalconditions)
JOIN [core].[object] o on o.name = rl.objectName
JOIN [core].[component] c on c.objectid = o.objectid AND c.name = rl.componentName
JOIN [core].[subObject] al on al.[name] = rl.[subObjectName] AND al.componentID = c.componentID
LEFT JOIN [core].[relation] r on rl.schemaName = r.schemaName and rl.tableName = r.tableName and r.tableAlias = rl.tableAlias and r.columnName = rl.columnName /*and r.relatedToTableID = rt.tableID and r.relatedToColumn = rl.relatedToColumn and r.relatedToTableAlias = rl.relatedToTableAlias*/ and r.joinType = rl.joinType and r.joinOrder = rl.joinOrder and r.subObjectID = al.subObjectID

EXECUTE @RC = [core].[relation.SEED]
   @relation
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet


-- update relationID
INSERT INTO @relationIDs (relationID, parentRelationID, parentColumn )
SELECT r.relationID, rr.relationID AS parentRelationID, rl.relatedToColumn as parentColumn
FROM
(VALUES  
    ('user','get','phone','customer', 'mno', 'mno', 'mnoId', 'customer', 'phone', 'ph', 'mnoId', 'LEFT JOIN', 2,''),
    ('user','get','address','core', 'itemName', 'i1', 'itemNameId', 'customer', 'address', 'a', 'addressZone1', 'LEFT JOIN', 2,''),
    ('user','get','address','core', 'itemName', 'i2', 'itemNameId', 'customer', 'address', 'a', 'addressZone2', 'LEFT JOIN', 3,''),
    ('user','get','address','core', 'itemName', 'i3', 'itemNameId', 'customer', 'address', 'a', 'addressZone3', 'LEFT JOIN', 4,''),
    ('user','get','address','core', 'itemName', 'i4', 'itemNameId', 'customer', 'address', 'a', 'addressZone4', 'LEFT JOIN', 5,''),
    ('user','get','memberOF','customer', 'organization', 'o', 'actorId', 'core', 'actorHierarchy', 'ah', '[object]', 'INNER JOIN', 2,''),
    ('user','get','externalSystemCredentials','user', 'externalUser', 'eu', 'externalUserId', 'user', 'userToExternalUser', 'ueu', 'externalUserId', 'INNER JOIN', 2,''),
    ('user','get','externalSystemCredentials','core', 'externalSystem', 'es', 'externalSystemId', 'user', 'externalUser', 'eu', 'externalSystemId', 'INNER JOIN', 3,''),
    ('user','get','externalSystemCredentials','customer', 'organization', 'o', 'actorId', 'core', 'externalSystem', 'es', 'organizationId', 'INNER JOIN', 4,''),
    ('user','get','roles','user', 'user', 'u', 'actorId', 'core', 'actorHierarchy', 'ah', 'subject', 'INNER JOIN', 2,''),
    ('user','get','roles','user', 'role', 'r', 'actorId', 'core', 'actorHierarchy', 'ah', 'object', 'INNER JOIN', 3,''),
    ('user','get','user','core', 'language', 'cl', 'languageId','user', 'user', 'u', 'primaryLanguageId', 'LEFT JOIN', 2,''),
    ('user','fetch','userFetch','user', 'hash', 'uh', 'actorId' , 'user', 'user', 'u', 'actorId', 'INNER JOIN', 2,'')
    
) rl (ObjectName,componentName,subObjectName,schemaName, tableName, tableAlias, columnName, relatedToTableSchema, relatedToTableName, relatedToTableAlias, relatedToColumn, joinType, joinOrder,additionalConditions)
JOIN [core].[object] o on o.name = rl.objectName
JOIN [core].[component] c on c.objectid = o.objectid AND c.name = rl.componentName
JOIN [core].[subObject] al on al.[name] = rl.[subObjectName] AND al.componentID = c.componentID
JOIN [core].[relation] r on rl.schemaName = r.schemaName and rl.tableName = r.tableName and rl.tableAlias = r.tableAlias and r.subObjectID = al.subObjectID
JOIN [core].[relation] rr on rl.relatedToTableSchema = rr.schemaName and rl.relatedToTableName = rr.tableName and rl.relatedToTableAlias = rr.tableAlias and rr.subObjectID = al.subObjectID
WHERE r.parentRelationID IS NULL OR r.relationID <> r.parentRelationID

update r
set r.parentRelationID = rr.parentRelationID,
    r.parentColumn = rr.parentColumn
from [core].[relation] r
join @relationIDs rr on rr.relationID = r.relationID


INSERT INTO @field (fieldID,  relationID, sourceColumn, definition, columnAlias)
SELECT f.fieldID, r.relationID, rl.columnName, rl.definition, rl.columnAlias
FROM
(VALUES  
-- person resultset
    ('user','get','person','customer', 'person', 'p', 'actorId',null,null),
    ('user','get','person','customer', 'person', 'p', 'frontEndRecordId',null,null),
    ('user','get','person','customer', 'person', 'p', 'firstName',null,null),
    ('user','get','person','customer', 'person', 'p', 'lastName',null,null),
    ('user','get','person','customer', 'person', 'p', 'nationalId',null,null),
    ('user','get','person','customer', 'person', 'p', 'dateOfBirth',null,null),
    ('user','get','person','customer', 'person', 'p', 'placeOfBirth',null,null),
    ('user','get','person','customer', 'person', 'p', 'nationality',null,null),
    ('user','get','person','customer', 'person', 'p', 'gender',null,null),
    ('user','get','person','customer', 'person', 'p', 'bioId',null,null),
    ('user','get','person','customer', 'person', 'p', 'oldValues',null,null),
    ('user','get','person','customer', 'person', 'p', 'udf',null,null),
    ('user','get','person','customer', 'person', 'p', 'phoneModel',null,null),
    ('user','get','person','customer', 'person', 'p', 'computerModel',null,null),
    ('user','get','person','customer', 'person', 'p', 'maritalStatusId',null,null),
    ('user','get','person','customer', 'person', 'p', 'age',null,null),

-- phone resultset
    ('user','get','phone','customer', 'phone', 'ph','phoneId',null,null),
    ('user','get','phone','customer', 'phone', 'ph','actorId',null,null),
    ('user','get','phone','customer', 'phone', 'ph','frontEndRecordId',null,null),
    ('user','get','phone','customer', 'phone', 'ph','phoneTypeId',null,null),
    ('user','get','phone','customer', 'phone', 'ph','phoneNumber',null,null),
    ('user','get','phone','customer', 'phone', 'ph','statusId',null,null),
    ('user','get','phone','customer', 'phone', 'ph','oldValues',null,null),
    ('user','get','phone','customer', 'phone', 'ph','udf',null,null),
    ('user','get','phone','customer', 'phone', 'ph','mnoId',null,null),
    ('user','get','phone','customer', 'phone', 'ph','isPrimary',null,null),
    ('user','get','phone','customer', 'mno', 'mno', 'ut5Key',null,'mnoKey'),

-- address resultset
    ('user','get','address','customer', 'address', 'a', 'addressId',null,null),
    ('user','get','address','customer', 'address', 'a', 'actorId',null,null),
    ('user','get','address','customer', 'address', 'a', 'value',null,null),
    ('user','get','address','customer', 'address', 'a', 'frontEndRecordId',null,null),
    ('user','get','address','customer', 'address', 'a', 'addressTypeId',null,null),
    ('user','get','address','customer', 'address', 'a', 'statusId',null,null),
    ('user','get','address','customer', 'address', 'a', 'oldValues',null,null),
    ('user','get','address','customer', 'address', 'a', 'city',null,null),
    ('user','get','address','customer', 'address', 'a', 'lat',null,null),
    ('user','get','address','customer', 'address', 'a', 'lng',null,null),
    ('user','get','address','core', 'itemName', 'i1', 'itemName',null,'addressZone1'),
    ('user','get','address','core', 'itemName', 'i2', 'itemName',null,'addressZone2'),
    ('user','get','address','core', 'itemName', 'i3', 'itemName',null,'addressZone3'),
    ('user','get','address','core', 'itemName', 'i4', 'itemName',null,'addressZone4'),
    ('user','get','address','customer', 'address', 'a', 'addressZone1',null,'addressZone1Id'),
    ('user','get','address','customer', 'address', 'a', 'addressZone2',null,'addressZone2Id'),
    ('user','get','address','customer', 'address', 'a', 'addressZone3',null,'addressZone3Id'),
    ('user','get','address','customer', 'address', 'a', 'addressZone4',null,'addressZone4Id'),

-- email resultset
    ('user','get','email','customer', 'email', 'e', 'emailId',null,null),
    ('user','get','email','customer', 'email', 'e', 'actorId',null,null),
    ('user','get','email','customer', 'email', 'e', '[value]',null,null),
    ('user','get','email','customer', 'email', 'e', 'frontEndRecordId',null,null),
    ('user','get','email','customer', 'email', 'e', 'emailTypeId',null,null),
    ('user','get','email','customer', 'email', 'e', 'statusId',null,null),
    ('user','get','email','customer', 'email', 'e', 'oldValues',null,null),
    ('user','get','email','customer', 'email', 'e', ' isPrimary',null,null),

-- memberOF resultset
    ('user','get','memberOF','core', 'actorHierarchy', 'ah', '[object]',null,null),
    ('user','get','memberOF','customer', 'organization', 'o', 'organizationName',null,null),
    ('user','get','memberOF','core', 'actorHierarchy', 'ah', 'isDefault',null,null),

-- user resultset
    ('user','get','user','user', 'user', 'u', 'actorId',null,null),
    ('user','get','user','user', 'user', 'u', 'primaryLanguageId',null,null),
    ('user','get','user','core', 'language', 'cl', 'name',null,'primaryLanguageName'),
    ('user','get','user','user', 'user', 'u', 'dateFormat',null,null),
    ('user','get','user','user', 'user', 'u', 'numberFormat',null,null),
    ('user','get','user','user', 'user', 'u', 'isEnabled',null,null),
    ('user','get','user','user', 'user', 'u', 'isDeleted',null,null),
    ('user','get','user','user', 'user', 'u', 'isApproved',null,null),
    ('user','get','user','user', 'user', 'u', null,' @policyId ','policyId'),

-- policy.basic resultset
    ('user','get','policy.basic','policy', 'policy', 'pl', 'policyId',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'name',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'priority',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'description',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'inactivityLockValue',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'inactivityLockKey',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'inactivityTimeoutValue',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'inactivityTimeoutKey',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'isEnabled',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'isDeleted',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'actionTimeframe',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'actionId',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'mobileRestriction',null,null),
    ('user','get','policy.basic','policy', 'policy', 'pl', 'isVisible',null,null),

-- policy.credentials resultset
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'credentialId',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'policyId',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'type',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'regex',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'charMin',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'charMax',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'sendMethod',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'resetMethod',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'notifyMethod',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'validityValue',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'validityKey',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'allowChange',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'allowReset',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'fingers',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'noReuseOfLast',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'regexInfo',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'generateMethod',null,null),
    ('user','get','policy.credentials','policy', 'credentials', 'cr', 'secretQuestionsOnReset',null,null),

-- user.hash resultset
    ('user','get','user.hash','user', 'hash', 'h', 'hashId',null,null),
    ('user','get','user.hash','user', 'hash', 'h', 'type',null,null),
    ('user','get','user.hash','user', 'hash', 'h', 'identifier',null,null),
    ('user','get','user.hash','user', 'hash', 'h', 'failedAttempts',null,null),
    ('user','get','user.hash','user', 'hash', 'h', 'lastAttempt',null,null),
    ('user','get','user.hash','user', 'hash', 'h', 'lastChange',null,null),
    ('user','get','user.hash','user', 'hash', 'h', 'expireDate',null,null),

-- externalSystemCredentials resultset
    ('user','get','externalSystemCredentials','user', 'userToExternalUser', 'ueu', 'userToExternalUserId',null,null),
    ('user','get','externalSystemCredentials','user', 'externalUser', 'eu', 'userName',null,null),
    ('user','get','externalSystemCredentials','user', 'externalUser', 'eu', 'userAlias',null,null),
    ('user','get','externalSystemCredentials','user', 'externalUser', 'eu', 'isGeneric',null,null),
    ('user','get','externalSystemCredentials','user', 'userToExternalUser', 'ueu', 'isActive',null,null),
    ('user','get','externalSystemCredentials','user', 'externalUser', 'eu', 'externalUserId',null,null),
    ('user','get','externalSystemCredentials','user', 'externalUser', 'eu', 'externalSystemId',null,null),
    ('user','get','externalSystemCredentials','user', 'externalUser', 'eu', 'udf',null,'nonGenericUdf'),
    ('user','get','externalSystemCredentials','core', 'externalSystem', 'es', 'name',null,'externalSystemName'),
    ('user','get','externalSystemCredentials','core', 'externalSystem', 'es', 'organizationId',null,null),
    ('user','get','externalSystemCredentials','customer', 'organization', 'o', 'organizationName',null,'organizationName'),
    ('user','get','externalSystemCredentials',null, null,null, null,'case when eu.password is not null and eu.password != '''' then 1 else 0 end','hasPassword'),
    ('user','get','externalSystemCredentials','user', 'userToExternalUser', 'ueu', 'udf',null,'genericUdf'),
       
-- userActorDevice resultset
    ('user','get','userActorDevice','user', 'actorDevice', 'ad', 'actorDeviceId', null, null),
    ('user','get','userActorDevice','user', 'actorDevice', 'ad', 'installationId', null, null),
    ('user','get','userActorDevice','user', 'actorDevice', 'ad', 'imei', null, null),

-- roles resultset
    ('user','get','roles','core', 'actorHierarchy', 'ah', 'object', null, null),
    ('user','get','roles','core', 'actorHierarchy', 'ah', 'isDefault', null, null),
    ('user','get','roles','user', 'role', 'r', 'name', null, null),
 
 -- roles resultset
    ('user','get','userClassification','core', 'actorProperty', 'c', null, 'case c.value when ''Staff'' then 1 else 0 end', 'classificationType'),
    ('user','get','userClassification','user', 'role', 'r', 'name', null, null),

-- userFetch resultset
    ('user','fetch','userFetch','user', 'user', 'u', 'actorId',null,'objectId'),
    ('user','fetch','userFetch','user', 'hash', 'uh', 'identifier',null, 'shortDesc')

) rl (objectName, componentName, subObjectName,schemaName, tableName, tableAlias, columnName, definition, columnAlias )
JOIN [core].[object] o on o.name = rl.objectName
JOIN [core].[component] c on c.objectid = o.objectid AND c.name = rl.componentName
JOIN [core].[subObject] al on al.[name] = rl.[subObjectName] and al.componentID = c.componentID
JOIN [core].[relation] r on r.subObjectID = al.subObjectID and r.schemaName = rl.schemaName and rl.tableName = r.tableName and r.tableAlias = rl.tableAlias
LEFT JOIN [core].[field] f on f.relationId = r.relationID and isnull(f.sourceColumn,f.definition) = isnull(rl.columnName,rl.definition) and isnull(f.columnAlias,'') = isnull(rl.columnAlias,'') 


EXECUTE @RC = [core].[field.SEED]
   @field
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet




INSERT INTO @condition (conditionID, relationID, columnName, definition)
SELECT c.conditionID, r.relationID, rl.columnName, rl.definition
FROM
(VALUES  
    ('user','get','phone','customer', 'phone', 'ph','statusId','IN (''active'', ''approved'')'),
    ('user','get','memberOF','customer', 'organization', 'o','isEnabled',' = 1'),
    ('user','get','person','customer', 'person', 'p','actorId',' = @objectId'),
    ('user','get','phone','customer', 'phone', 'ph','actorId',' = @objectId'),
    ('user','get','address','customer', 'address', 'a','actorId',' = @objectId'),
    ('user','get','email','customer', 'email', 'e','actorId',' = @objectId'),
    ('user','get','memberOF','core', 'actorHierarchy', 'ah','[subject]',' = @objectId'),
    ('user','get','user','user', 'user', 'u','actorId',' = @objectId'),
    ('user','get','policy.basic','policy', 'policy', 'pl','policyId',' = @policyIdInherited'),
    ('user','get','policy.credentials','policy', 'credentials', 'cr','policyId',' = @policyIdInherited'),
    ('user','get','user.hash','user', 'hash', 'h','actorId',' = @objectId'),
    ('user','get','user.hash','user', 'hash', 'h','isEnabled',' = 1'),
    ('user','get','externalSystemCredentials','user', 'userToExternalUser', 'ueu','userId',' = @objectId'),
    ('user','get','userActorDevice','user', 'actorDevice', 'ad','actorId',' = @objectId'),
    ('user','get','roles','core', 'actorHierarchy', 'ah', 'predicate', ' = ''role'''),
    ('user','get','roles','core', 'actorHierarchy', 'ah', 'subject', ' = @objectId'),
    ('user','get','roles','user', 'role', 'r','isEnabled', '= 1'),
    ('user','get','userClassification','core', 'actorProperty', 'c','actorId', ' = @objectId')

   ) rl (objectName, componentName, subObjectName,schemaName, tableName, tableAlias, columnName, definition )
JOIN [core].[object] o on o.name = rl.objectName
JOIN [core].[component] co on co.objectid = o.objectid AND co.name = rl.componentName
JOIN [core].[subObject] al on al.[name] = rl.[subObjectName] and al.componentID = co.componentID
JOIN [core].[relation] r on r.subObjectID = al.subObjectID and r.schemaName = rl.schemaName and r.tableName = rl.tableName and r.tableAlias = rl.tableAlias
LEFT JOIN [core].[condition] c on c.relationID = r.relationID and c.ColumnName = rl.columnName


EXECUTE @RC = [core].[condition.SEED]
   @condition
  ,@removeDataFlag
  ,@updateFlag
  ,@insertFlag
  ,@noResultSet
