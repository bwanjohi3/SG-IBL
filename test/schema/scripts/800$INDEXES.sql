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
    CREATE NONCLUSTERED INDEX [IX_itemName_itemTypeId_itemSyncId] ON [core].[itemName] (itemTypeId ASC, itemSyncId ASC) INCLUDE (itemNameId, itemName, itemCode, countryId, organizationId, isEnabled)
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
                    where i.name = 'IX_itemName_itemTypeId_itemSyncId' and  c.name = 'itemNameId')     
    
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

        CREATE NONCLUSTERED INDEX [IX_itemName_itemTypeId_itemSyncId] ON [core].[itemName] (itemTypeId ASC, itemSyncId ASC) INCLUDE (itemNameId, itemName, itemCode, countryId, organizationId, isEnabled)
    end
end   


if not exists(select * from sys.indexes where name = 'IX_account_actorId')
    CREATE NONCLUSTERED INDEX [IX_account_actorId] ON [customer].[account] ([actorId]) INCLUDE ([accountTypeId],[balance],[accountNumber],
	                                                                                                            [accountName],
	                                                                                                            [statusId],
	                                                                                                            [currencyId],
	                                                                                                            [accountLastTrx],
	                                                                                                            [accountLastTrxOn],
	                                                                                                            [accountOpenedOn])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_account_actorId' and ic.index_column_id = 1) != 'actorId'
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_account_actorId' and  c.name = 'accountTypeId')
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_account_actorId' and  c.name = 'balance')    
    OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_account_actorId' and  c.name = 'accountNumber')
    OR not exists (select 1 from sys.indexes i
                join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                where i.name = 'IX_account_actorId' and  c.name = 'accountName')
    OR not exists (select 1 from sys.indexes i
                join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                where i.name = 'IX_account_actorId' and  c.name = 'statusId')
    OR not exists (select 1 from sys.indexes i
                join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                where i.name = 'IX_account_actorId' and  c.name = 'currencyId')
    OR not exists (select 1 from sys.indexes i
                join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                where i.name = 'IX_account_actorId' and  c.name = 'balance')
    OR not exists (select 1 from sys.indexes i
                join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                where i.name = 'IX_account_actorId' and  c.name = 'accountLastTrx')
    OR not exists (select 1 from sys.indexes i
                join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                where i.name = 'IX_account_actorId' and  c.name = 'accountLastTrxOn')
    OR not exists (select 1 from sys.indexes i
                join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_account_actorId' and  c.name = 'accountOpenedOn')
    BEGIN
        DROP INDEX [IX_account_actorId] ON [customer].[account] 

        CREATE NONCLUSTERED INDEX [IX_account_actorId] ON [customer].[account] ([actorId]) INCLUDE ([accountTypeId],[balance],[accountNumber],
	                                                                                                            [accountName],
	                                                                                                            [statusId],
	                                                                                                            [currencyId],
	                                                                                                            [accountLastTrx],
	                                                                                                            [accountLastTrxOn],
	                                                                                                            [accountOpenedOn])
    END
end



if not exists(select * from sys.indexes where name = 'IX_account_accountTypeId')
    CREATE NONCLUSTERED INDEX [IX_account_accountTypeId] ON [customer].[account] ([accountTypeId]) INCLUDE ([actorId],[balance])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_account_accountTypeId' and ic.index_column_id = 1) != 'accountTypeId'
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_account_accountTypeId' and  c.name = 'actorId')
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_account_accountTypeId' and  c.name = 'balance')    
    begin
        DROP INDEX [IX_account_accountTypeId] ON [customer].[account] 

        CREATE NONCLUSTERED INDEX [IX_account_accountTypeId] ON [customer].[account]  ([accountTypeId]) INCLUDE ([actorId],[balance])
    end
end



if not exists(select * from sys.indexes where name = 'IX_address_actorId')
    CREATE NONCLUSTERED INDEX [IX_address_actorId] ON [customer].[address] ([actorId])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_address_actorId' and ic.index_column_id = 1) != 'actorId'   
    begin
        DROP INDEX [IX_address_actorId] ON [customer].[address]

        CREATE NONCLUSTERED INDEX [IX_address_actorId] ON [customer].[address] ([actorId])
    end
end    

if not exists(select * from sys.indexes where name = 'IX_address_statusId_addressTypeId')
    CREATE NONCLUSTERED INDEX [IX_address_statusId_addressTypeId] ON [customer].[address]([statusId] ASC, [addressTypeId] ASC) INCLUDE ( [actorId],[value]) 
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


if not exists(select * from sys.indexes where name = 'IX_address_statusId_addressTypeId')
    CREATE NONCLUSTERED INDEX [IX_address_statusId_addressTypeId] ON [customer].[address]([statusId] ASC, [addressTypeId] ASC) INCLUDE ( [actorId],[value]) 
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

if not exists(select * from sys.indexes where name = 'IX_customer_customerNumber_organizationId')
    CREATE NONCLUSTERED INDEX [IX_customer_customerNumber_organizationId] ON [customer].[customer]  ([customerNumber], organizationId) INCLUDE (actorId)
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
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_customerNumber_organizationId' and  c.name = 'actorId')     
    begin
        DROP INDEX [IX_customer_customerNumber_organizationId] ON [customer].[customer]

        CREATE NONCLUSTERED INDEX [IX_customer_customerNumber_organizationId] ON [customer].[customer] ([customerNumber], organizationId) INCLUDE (actorId)
    end
end

if not exists(select * from sys.indexes where name = 'IX_customer_customerNumber_countryId')
BEGIN
   CREATE NONCLUSTERED INDEX [IX_customer_customerNumber_countryId] ON [customer].[customer] ([customerNumber], [countryId]) INCLUDE ([actorId])
END
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_customer_customerNumber_countryId' and ic.index_column_id = 1) != 'customerNumber'   
    OR 
    (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_customer_customerNumber_countryId' and ic.index_column_id = 2) != 'countryId'   
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_customerNumber_countryId' and  c.name = 'actorId')     
    begin
        DROP INDEX [IX_customer_customerNumber_countryId] ON [customer].[customer]
        CREATE NONCLUSTERED INDEX [IX_customer_customerNumber_countryId] ON [customer].[customer] ([customerNumber], [countryId]) INCLUDE ([actorId])
    end
end   


if not exists(select * from sys.indexes where name = 'IX_customer_organizationId')
    CREATE NONCLUSTERED INDEX [IX_customer_organizationId] ON [customer].[customer] ([organizationId]) INCLUDE ([actorId], [countryId], [customerNumber], [stateId], [prospectClient],
	                                                                                                                                [adminfee], [udf], [loanCycle], [industryId], [sectorId])
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
                    where i.name = 'IX_customer_organizationId' and  c.name = 'actorId')
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
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_organizationId' and  c.name = 'prospectClient')
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_organizationId' and  c.name = 'adminfee')
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_organizationId' and  c.name = 'udf')
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_organizationId' and  c.name = 'loanCycle')
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_organizationId' and  c.name = 'industryId')
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_customer_organizationId' and  c.name = 'sectorId')
    begin
        DROP INDEX [IX_customer_organizationId] ON [customer].[customer]

        CREATE NONCLUSTERED INDEX [IX_customer_organizationId] ON [customer].[customer] ([organizationId]) INCLUDE ([actorId], [countryId], [customerNumber], [stateId], [prospectClient],
	                                                                                                                                [adminfee], [udf], [loanCycle], [industryId], [sectorId])
    end
end

if not exists(select * from sys.indexes where name = 'IX_phone_statusId_phonetTypeId')
    CREATE NONCLUSTERED INDEX [IX_phone_statusId_phonetTypeId] ON [customer].[phone]([statusId] ASC,[phoneTypeId] ASC) INCLUDE ([actorId], [phoneNumber]) 
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

        CREATE NONCLUSTERED INDEX [IX_phone_statusId_phonetTypeId] ON [customer].[phone]([statusId] ASC,[phoneTypeId] ASC) INCLUDE ([actorId], [phoneNumber]) 
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

if not exists(select * from sys.indexes where name = 'IX_document_statusId_documentTypeId')
    CREATE NONCLUSTERED INDEX [IX_document_statusId_documentTypeId] ON [document].[document]([statusId] ASC, [documentTypeId] ASC) INCLUDE ([documentId], [documentNumber])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_document_statusId_documentTypeId' and ic.index_column_id = 1) != 'statusId'
   OR 
     (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_document_statusId_documentTypeId' and ic.index_column_id = 2) != 'documentTypeId'
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_document_statusId_documentTypeId' and  c.name = 'documentId')
     OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_document_statusId_documentTypeId' and  c.name = 'documentNumber')
    begin
        DROP INDEX [IX_document_statusId_documentTypeId] ON [document].[document]

        CREATE NONCLUSTERED INDEX [IX_document_statusId_documentTypeId] ON [document].[document]([statusId] ASC, [documentTypeId] ASC) INCLUDE ([documentId], [documentNumber])
    end
end

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
                    where i.name = 'IX_hash_actorId_isEnabled' and ic.index_column_id = 1) != 'isEnabled'
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
if not exists(select * from sys.indexes where name = 'IX_mno_countryId')
    CREATE NONCLUSTERED INDEX [IX_mno_countryId] ON [customer].[mno] (countryId) INCLUDE (ut5Key)
else 
begin
    if not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_mno_countryId' and  c.name = 'ut5Key')    
    begin
        DROP INDEX [IX_mno_countryId] ON [customer].[mno]
        CREATE NONCLUSTERED INDEX [IX_mno_countryId] ON [customer].[mno] (countryId) INCLUDE (ut5Key)
    end
end

if not exists(select * from sys.indexes where name = 'IX_address_actorId_statusId_addressTypeId')
    CREATE NONCLUSTERED INDEX [IX_address_actorId_statusId_addressTypeId] ON [customer].[address] (actorId, statusId, addressTypeId) INCLUDE (value, city, lat, lng)
else 
begin
    if not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and  c.name = 'value')
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and  c.name = 'city')
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and  c.name = 'lat')
        OR not exists (select 1 from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_address_actorId_statusId_addressTypeId' and  c.name = 'lng')
    begin
        DROP INDEX [IX_address_actorId_statusId_addressTypeId] ON [customer].[address]
        CREATE NONCLUSTERED INDEX [IX_address_actorId_statusId_addressTypeId] ON [customer].[address] (actorId, statusId, addressTypeId) INCLUDE (value, city, lat, lng)
    end
end 
	   
if not exists(select * from sys.indexes where name = 'IX_itemTranslation_itemNameId_languageId')
    CREATE NONCLUSTERED INDEX [IX_itemTranslation_itemNameId_languageId] ON [core].[itemTranslation] ([languageId] ASC, [itemNameId] ASC) INCLUDE ([itemNameTranslation])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_itemTranslation_itemNameId_languageId' and ic.index_column_id = 1) != 'languageId' 
    OR 
     (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_itemTranslation_itemNameId_languageId' and ic.index_column_id = 2) != 'itemNameId'  
    OR
    
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_itemTranslation_itemNameId_languageId' and  c.name = 'itemNameTranslation')
    begin
        DROP INDEX [IX_itemTranslation_itemNameId_languageId] ON [core].[itemTranslation]

        CREATE NONCLUSTERED INDEX [IX_itemTranslation_itemNameId_languageId] ON [core].[itemTranslation] ([languageId] ASC, [itemNameId] ASC) INCLUDE ([itemNameTranslation])
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
                    where i.name = 'IX_actorHierarchyUnapproved_subject_predicate' and c.name = 'subject')
    begin
        DROP INDEX [IX_actorHierarchyUnapproved_subject_predicate] ON [core].[actorHierarchyUnapproved] 

        CREATE NONCLUSTERED INDEX [IX_actorHierarchyUnapproved_subject_predicate] ON [core].[actorHierarchyUnapproved] ([subject], [predicate]) INCLUDE ([object], [isDeleted])
    end
end




