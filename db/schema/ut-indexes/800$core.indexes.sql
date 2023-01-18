if not exists(select * from sys.indexes where name = 'IX_actorHierarchy_predicate_object')
    CREATE NONCLUSTERED INDEX [IX_actorHierarchy_predicate_object] ON [core].[actorHierarchy] ([predicate], [object]) INCLUDE ([subject])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_actorHierarchy_predicate_object' and ic.index_column_id = 1) != 'predicate'
   OR 
    (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_actorHierarchy_predicate_object' and ic.index_column_id = 2) != 'object'   
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_actorHierarchy_predicate_object' and  c.name = 'subject')     
    begin
        DROP INDEX [IX_actorHierarchy_predicate_object] ON [core].[actorHierarchy]

        CREATE NONCLUSTERED INDEX [IX_actorHierarchy_predicate_object] ON [core].[actorHierarchy] ([predicate], [object]) INCLUDE ([subject])
    end
end   

if not exists(select * from sys.indexes where name = 'IX_itemName_itemTypeId_itemSyncId')
    CREATE NONCLUSTERED INDEX [IX_itemName_itemTypeId_itemSyncId] ON [core].[itemName] (itemTypeId ASC, itemSyncId ASC) INCLUDE (itemName, itemCode, countryId, organizationId, isEnabled)
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_itemName_itemTypeId_itemSyncId' and ic.index_column_id = 1) != 'itemTypeId'
   OR 
    (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_itemName_itemTypeId_itemSyncId' and ic.index_column_id = 2) != 'itemSyncId'         
    
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_itemName_itemTypeId_itemSyncId' and  c.name = 'itemName')     
    
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_itemName_itemTypeId_itemSyncId' and  c.name = 'itemCode')     
    
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_itemName_itemTypeId_itemSyncId' and  c.name = 'countryId')
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_itemName_itemTypeId_itemSyncId' and  c.name = 'organizationId')     
    
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_itemName_itemTypeId_itemSyncId' and  c.name = 'isEnabled')     

    begin
        DROP INDEX [IX_itemName_itemTypeId_itemSyncId] ON [core].[itemName] 

        CREATE NONCLUSTERED INDEX [IX_itemName_itemTypeId_itemSyncId] ON [core].[itemName] (itemTypeId ASC, itemSyncId ASC) INCLUDE (itemName, itemCode, countryId, organizationId, isEnabled)
    end
end   

if not exists(select * from sys.indexes where name = 'IX_itemTranslation_itemNameId_languageId')
    CREATE NONCLUSTERED INDEX [IX_itemTranslation_itemNameId_languageId] ON [core].[itemTranslation] ([itemNameId] ASC, [languageId] ASC) INCLUDE ([itemNameTranslation])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_itemTranslation_itemNameId_languageId' and ic.index_column_id = 1) != 'itemNameId' 
    OR 
     (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_itemTranslation_itemNameId_languageId' and ic.index_column_id = 2) != 'languageId'  
    OR
    
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_itemTranslation_itemNameId_languageId' and  c.name = 'itemNameTranslation')
    begin
        DROP INDEX [IX_itemTranslation_itemNameId_languageId] ON [core].[itemTranslation]

        CREATE NONCLUSTERED INDEX [IX_itemTranslation_itemNameId_languageId] ON [core].[itemTranslation] ([itemNameId] ASC, [languageId] ASC) INCLUDE ([itemNameTranslation])
    end
end

if not exists(select * from sys.indexes where name = 'IX_actorHierarchyUnapproved_subject_predicate')
    CREATE NONCLUSTERED INDEX [IX_actorHierarchyUnapproved_subject_predicate] ON [core].[actorHierarchyUnapproved] ([subject], [predicate]) INCLUDE ([object], [isDeleted])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_actorHierarchyUnapproved_subject_predicate' and ic.index_column_id = 1) != 'subject' 
    OR
    (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_organizationHierarchyFlat_object' and ic.index_column_id = 2) != 'predicate' 
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_actorHierarchyUnapproved_subject_predicate' and c.name = 'object')
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_actorHierarchyUnapproved_subject_predicate' and c.name = 'isDeleted')
    begin
        DROP INDEX [IX_actorHierarchyUnapproved_subject_predicate] ON [core].[actorHierarchyUnapproved] 

        CREATE NONCLUSTERED INDEX [IX_actorHierarchyUnapproved_subject_predicate] ON [core].[actorHierarchyUnapproved] ([subject], [predicate]) INCLUDE ([object], [isDeleted])
    end
end




