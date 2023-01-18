CREATE TABLE [card].[pinMailerFile](
    id tinyint IDENTITY(1, 1) NOT NULL,
    [name] VARCHAR(256),
    [pinMailerFile] VARCHAR(256),
    [pinLinkFile] VARCHAR(256),
    [batchId] INT NULL,
    [count] INT NULL,
    [createdOn] datetime2(0) NOT NULL,
    [status] INT,
    [udf] VARCHAR(1000)
)
