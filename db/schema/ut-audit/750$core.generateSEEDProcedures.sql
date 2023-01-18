DECLARE @tableArray TABLE (rowId INT IDENTITY(1,1),  tableSchema NVARCHAR(128), tableName NVARCHAR(128))
INSERT INTO @tableArray (tableSchema , tableName) 
VALUES 
    (N'core', N'object'),
    (N'core', N'variable'),
    (N'core', N'subObject'),
    (N'core', N'relation'),
    (N'core', N'field'),
    (N'core', N'condition'),
    (N'core', N'component')


DECLARE @SQL NVARCHAR(200) = 'exec [core].[generateSeedProcedures] @tableSchema, @tableName, 0'
DECLARE @tableSchema NVARCHAR(128), @tableName NVARCHAR(128)
DECLARE @numberRecords INT = (SELECT COUNT(*) FROM @tableArray)
DECLARE @rowCount INT = 1

WHILE @rowCount <= @numberRecords
BEGIN
    SELECT 
        @tableSchema = tableSchema, 
        @tableName = tableName
    FROM @tableArray
    WHERE rowId = @rowCount

    exec sp_executesql @SQL, 
         N'@tableSchema NVARCHAR(128), @tableName NVARCHAR(128)',
         @tableSchema,
         @tableName
    
    SET @rowCount = @rowCount + 1
END