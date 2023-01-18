CREATE TYPE [card].[orderByTT] AS TABLE( --table type variable used for data sorting in stored procedures
    [column] varchar(128), --name of the column that will be sorted
    [direction] varchar(4) --sorting direction Ascending/Descending
)