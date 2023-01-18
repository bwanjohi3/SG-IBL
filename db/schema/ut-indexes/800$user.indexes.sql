-- [user].[hash]
if not exists(select * from sys.indexes where name = 'IX_hash_identifier')
    CREATE NONCLUSTERED INDEX [IX_hash_identifier] ON [user].[hash] ([identifier])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_hash_identifier' and ic.index_column_id = 1) != 'identifier'   
    begin
        DROP INDEX [IX_hash_identifier] ON [user].[hash] 

        CREATE NONCLUSTERED INDEX [IX_hash_identifier] ON [user].[hash] ([identifier])
    end
end   

if not exists(select * from sys.indexes where name = 'IX_hash_actorId_isEnabled')
    CREATE NONCLUSTERED INDEX [IX_hash_actorId_isEnabled] ON [user].[hash] ([actorId], [isEnabled]) INCLUDE ([identifier])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_hash_actorId_isEnabled' and ic.index_column_id = 1) != 'actorId'
    OR
     (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_hash_actorId_isEnabled' and ic.index_column_id = 2) != 'isEnabled'
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_hash_actorId_isEnabled' and  c.name = 'identifier')    
    begin
        DROP INDEX [IX_hash_actorId_isEnabled] ON [user].[hash]

        CREATE NONCLUSTERED INDEX [IX_hash_actorId_isEnabled] ON [user].[hash] ([actorId], [isEnabled]) INCLUDE ([identifier])
    end
end

-- [user].[actorDevice]
if not exists(select * from sys.indexes where name = 'IX_actorDevice_actorId')
    CREATE NONCLUSTERED INDEX [IX_actorDevice_actorId] ON [user].[actorDevice] ([actorId]) INCLUDE ([installationId], [imei]) 
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_actorDevice_actorId' and ic.index_column_id = 1) != 'actorId'   
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_actorDevice_actorId' and  c.name = 'installationId')    

    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_actorDevice_actorId' and  c.name = 'imei')    
    begin
        DROP INDEX [IX_actorDevice_actorId] ON [user].[actorDevice] 

        CREATE NONCLUSTERED INDEX [IX_actorDevice_actorId] ON [user].[actorDevice] ([actorId]) INCLUDE ([installationId], [imei]) 
    end
end 

if not exists(select * from sys.indexes where name = 'IX_actorDevice_imei')
    CREATE NONCLUSTERED INDEX [IX_actorDevice_imei] ON [user].[actorDevice] ([imei]) 
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_actorDevice_imei' and ic.index_column_id = 1) != 'imei'   
    begin
        DROP INDEX [IX_actorDevice_imei] ON [user].[actorDevice] 

        CREATE NONCLUSTERED INDEX [IX_actorDevice_imei] ON [user].[actorDevice] ([imei])
    end
end    
