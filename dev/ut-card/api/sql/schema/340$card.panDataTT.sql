CREATE TYPE [card].[panDataTT] AS TABLE( --table type variable used for data filtering in stored procedures
    cardId bigint,
    data varchar(300),
    pvv varchar(300)
)