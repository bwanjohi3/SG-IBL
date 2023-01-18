-- [document].[document]
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

if not exists(select * from sys.indexes where name = 'IX_document_documentNumber_documentTypeId')
    CREATE NONCLUSTERED INDEX [IX_document_documentNumber_documentTypeId] ON [document].[document] ([documentNumber], [documentTypeId]) 
else 
begin
    if (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id = ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_document_documentNumber_documentTypeId' and ic.index_column_id = 1) != 'documentNumber'

        OR
        (select c.name from sys.indexes i
                    join sys.index_columns ic on i.object_id = ic.object_id  and i.index_id = ic.index_id
                    join sys.columns c  ON  C.object_id = I.object_id AND C.column_id = ic.column_id AND IC.is_included_column = 0
                    where i.name = 'IX_document_documentNumber_documentTypeId' and ic.index_column_id = 2) != 'documentTypeId'
    begin
        DROP INDEX [IX_document_documentNumber_documentTypeId] ON [document].[document] 

        CREATE NONCLUSTERED INDEX [IX_document_documentNumber_documentTypeId] ON [document].[document] ([documentNumber], [documentTypeId]) 
    end
end    

