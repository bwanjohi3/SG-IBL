-- [ledger].[account]
if not exists(select * from sys.indexes where name = 'IX_account_ownerId')
    CREATE NONCLUSTERED INDEX [IX_account_ownerId] ON [ledger].[account]  ([ownerId])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_account_ownerId' and ic.index_column_id = 1) != 'ownerId'   
    begin
        DROP INDEX [IX_account_ownerId] ON [ledger].[account]

        CREATE NONCLUSTERED INDEX [IX_account_ownerId] ON [ledger].[account]  ([ownerId])
    end
end    

-- [ledger].[balance]
if not exists(select * from sys.indexes where name = 'IX_balance_accountId')
    CREATE NONCLUSTERED INDEX [IX_balance_accountId] ON [ledger].[balance]  ([accountId])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_balance_accountId' and ic.index_column_id = 1) != 'accountId'   
    begin
        DROP INDEX [IX_balance_accountId] ON [ledger].[balance]

        CREATE NONCLUSTERED INDEX [IX_balance_accountId] ON [ledger].[balance]  ([accountId])
    end
end    
