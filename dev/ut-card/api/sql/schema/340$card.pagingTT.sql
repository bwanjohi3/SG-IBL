CREATE TYPE [card].[pagingTT] AS TABLE( --table type variable used for paging properties
    [pageNumber] int, -- page number of the returned data
    [pageSize] int -- page size in rows
)