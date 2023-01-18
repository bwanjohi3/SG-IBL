if not exists(select * from sys.indexes where name = 'IX_customer_customerNumber_organizationId')
    CREATE NONCLUSTERED INDEX [IX_customer_customerNumber_organizationId] ON [customer].[customer]  ([customerNumber], organizationId) 
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_customer_customerNumber_organizationId' and ic.index_column_id = 1) != 'customerNumber'   
    OR 
    (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_customer_customerNumber_organizationId' and ic.index_column_id = 2) != 'organizationId'   
    
    begin
        DROP INDEX [IX_customer_customerNumber_organizationId] ON [customer].[customer]

        CREATE NONCLUSTERED INDEX [IX_customer_customerNumber_organizationId] ON [customer].[customer] ([customerNumber], organizationId) 
    end
end


if not exists(select * from sys.indexes where name = 'IX_customer_organizationId')
    CREATE NONCLUSTERED INDEX [IX_customer_organizationId] ON [customer].[customer] ([organizationId]) INCLUDE ([countryId], [customerNumber], [stateId], [industryId], [sectorId])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_customer_organizationId' and ic.index_column_id = 1) != 'organizationId'    
        OR
        not exists (select c.name from sys.indexes i
                        join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                        join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                        where i.name = 'IX_customer_organizationId' and  c.name = 'countryId')
        OR
        not exists (select c.name from sys.indexes i
                        join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                        join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                        where i.name = 'IX_customer_organizationId' and  c.name = 'customerNumber')
        OR
        not exists (select c.name from sys.indexes i
                        join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                        join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                        where i.name = 'IX_customer_organizationId' and  c.name = 'stateId')
        OR 
        not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_organizationId' and  c.name = 'industryId')
        OR 
        not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_organizationId' and  c.name = 'sectorId')
    begin
        DROP INDEX [IX_customer_organizationId] ON [customer].[customer]

        CREATE NONCLUSTERED INDEX [IX_customer_organizationId] ON [customer].[customer] ([organizationId]) INCLUDE ([countryId], [customerNumber], [stateId], [industryId], [sectorId])
    end
end

-- [customer].[address]
if not exists(select * from sys.indexes where name = 'IX_address_actorId_statusId_addressTypeId')
    CREATE NONCLUSTERED INDEX [IX_address_actorId_statusId_addressTypeId] ON [customer].[address] (actorId, statusId, addressTypeId) INCLUDE ([value], city, lat, lng)
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and ic.index_column_id = 1) != 'actorId'    
        OR
        (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and ic.index_column_id = 2) != 'statusId'    
        OR
        (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and ic.index_column_id = 3) != 'addressTypeId'    
        OR
        not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and  c.name = 'value')
        OR 
        not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and  c.name = 'city')
        OR 
        not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and  c.name = 'lat')
        OR 
        not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and  c.name = 'lng')
    begin
        DROP INDEX [IX_address_actorId_statusId_addressTypeId] ON [customer].[address]
        CREATE NONCLUSTERED INDEX [IX_address_actorId_statusId_addressTypeId] ON [customer].[address] (actorId, statusId, addressTypeId) INCLUDE ([value], city, lat, lng)
    end
end 

if not exists(select * from sys.indexes where name = 'IX_address_statusId_addressTypeId')
    CREATE NONCLUSTERED INDEX [IX_address_statusId_addressTypeId] ON [customer].[address]([statusId] ASC, [addressTypeId] ASC) INCLUDE ( [actorId], [value]) 
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_address_statusId_addressTypeId' and ic.index_column_id = 1) != 'statusId'
   OR 
     (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_address_statusId_addressTypeId' and ic.index_column_id = 2) != 'addressTypeId'
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_statusId_addressTypeId' and  c.name = 'actorId')
     OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_statusId_addressTypeId' and  c.name = 'value')
    begin
        DROP INDEX [IX_address_statusId_addressTypeId] ON [customer].[address]

        CREATE NONCLUSTERED INDEX [IX_address_statusId_addressTypeId] ON [customer].[address]([statusId] ASC,[addressTypeId] ASC) INCLUDE ( [actorId],[value]) 
    end
end   

      
--index for the flat hiearchy
if not exists(select * from sys.indexes where name = 'IX_organizationHierarchyFlat_object')
    CREATE NONCLUSTERED INDEX [IX_organizationHierarchyFlat_object] ON [customer].[organizationHierarchyFlat] ([object]) INCLUDE ([subject])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_organizationHierarchyFlat_object' and ic.index_column_id = 1) != 'object' 
    OR
    
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_organizationHierarchyFlat_object' and  c.name = 'subject')
    begin
        DROP INDEX [IX_organizationHierarchyFlat_object] ON [customer].[organizationHierarchyFlat]

        CREATE NONCLUSTERED INDEX [IX_organizationHierarchyFlat_object] ON [customer].[organizationHierarchyFlat] ([object]) INCLUDE ([subject])
    end
end


-- [customer].[email]
if not exists(select * from sys.indexes where name = 'IX_email_actorId')
    CREATE NONCLUSTERED INDEX [IX_email_actorId] ON [customer].[email]  ([actorId])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_email_actorId' and ic.index_column_id = 1) != 'actorId'   
    begin
        DROP INDEX [IX_email_actorId] ON [customer].[email] 

        CREATE NONCLUSTERED INDEX [IX_email_actorId] ON [customer].[email] ([actorId])
    end
end    

-- [customer].[phone]
if not exists(select * from sys.indexes where name = 'IX_phone_phoneNumber')
    CREATE NONCLUSTERED INDEX [IX_phone_phoneNumber] ON [customer].[phone]([phoneNumber])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id = ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_phone_phoneNumber' and ic.index_column_id = 1) != 'phoneNumber'   
    begin
        DROP INDEX [IX_phone_phoneNumber] ON [customer].[phone] 

        CREATE NONCLUSTERED INDEX [IX_phone_phoneNumber] ON [customer].[phone]([phoneNumber])
    end
end    

if not exists(select * from sys.indexes where name = 'IX_phone_statusId_phonetTypeId')
    CREATE NONCLUSTERED INDEX [IX_phone_statusId_phonetTypeId] ON [customer].[phone]([statusId] ASC, [phoneTypeId] ASC) INCLUDE ([actorId], [phoneNumber]) 
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_phone_statusId_phonetTypeId' and ic.index_column_id = 1) != 'statusId'
   OR 
     (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_phone_statusId_phonetTypeId' and ic.index_column_id = 2) != 'phoneTypeId'
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_phone_statusId_phonetTypeId' and  c.name = 'actorId')
     OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_phone_statusId_phonetTypeId' and  c.name = 'phoneNumber')
    begin
        DROP INDEX [IX_phone_statusId_phonetTypeId] ON [customer].[phone]

        CREATE NONCLUSTERED INDEX [IX_phone_statusId_phonetTypeId] ON [customer].[phone]([statusId] ASC, [phoneTypeId] ASC) INCLUDE ([actorId], [phoneNumber]) 
    end
end   

if not exists(select * from sys.indexes where name = 'IX_phone_actorId')
    CREATE NONCLUSTERED INDEX [IX_phone_actorId] ON [customer].[phone]([actorId] ASC) INCLUDE ([phoneNumber], [phoneTypeId], [statusId]) 
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_phone_actorId' and ic.index_column_id = 1) != 'actorId'
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_phone_actorId' and  c.name = 'phoneNumber')
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_phone_actorId' and  c.name = 'phoneTypeId')
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_phone_actorId' and  c.name = 'statusId')
    begin
        DROP INDEX [IX_phone_actorId] ON [customer].[phone]

        CREATE NONCLUSTERED INDEX [IX_phone_actorId] ON [customer].[phone]([actorId] ASC) INCLUDE ([phoneNumber], [phoneTypeId], [statusId]) 
    end
end

-- [customer].[person]
if not exists(select * from sys.indexes where name = 'IX_person_firstName_lastName_dateOfBirth')
    CREATE NONCLUSTERED INDEX [IX_person_firstName_lastName_dateOfBirth] ON [customer].[person] ([firstName], [lastName], [dateOfBirth])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_person_firstName_lastName_dateOfBirth' and ic.index_column_id = 1) != 'firstName'
    OR 
        (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_person_firstName_lastName_dateOfBirth' and ic.index_column_id = 2) != 'lastName'
    OR 
        (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_person_firstName_lastName_dateOfBirth' and ic.index_column_id = 3) != 'dateOfBirth'                    
    begin
        DROP INDEX [IX_person_firstName_lastName_dateOfBirth] ON [customer].[person] 

        CREATE NONCLUSTERED INDEX [IX_person_firstName_lastName_dateOfBirth] ON [customer].[person] ([firstName], [lastName], [dateOfBirth])
    end
end    

