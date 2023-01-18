if not exists(select * from sys.indexes where name = 'IX_messageOut_statusId')
    CREATE INDEX [IX_messageOut_statusId] ON [alert].[messageOut] ([port], [statusId]) INCLUDE ([priority])
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_messageOut_statusId' and ic.index_column_id = 1) != 'port'
    OR
    (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_messageOut_statusId' and ic.index_column_id = 2) != 'statusId'
    OR
    not exists (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id= ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 1
                    where i.name = 'IX_messageOut_statusId' and  c.name = 'priority')                    
                    
    begin
        DROP INDEX [IX_messageOut_statusId] ON [alert].[messageOut]

        CREATE INDEX [IX_messageOut_statusId] ON [alert].[messageOut] ([port], [statusId]) INCLUDE ([priority])
    end
end   





