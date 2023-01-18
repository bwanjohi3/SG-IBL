CREATE TABLE [pos].[binList](
    binListId BIGINT IDENTITY(1, 1) NOT NULL,
    [transaction] VARCHAR(1000),
    [binId] INT NOT NULL,
    [productId] INT NULL
)
