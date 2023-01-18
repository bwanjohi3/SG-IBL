CREATE TABLE [pos].[application](
    appId BIGINT IDENTITY(1, 1) NOT NULL,
    [name] VARCHAR(50),
    [description] VARCHAR(250),    
    [version] VARCHAR(8) NOT NULL,
    [datePublished] DATETIME2 NOT NULL,
    isEnabled BIT NOT NULL DEFAULT(1),
    firmwarePath NVARCHAR (100),
    CONSTRAINT pkPosApplication PRIMARY KEY CLUSTERED (appId ASC)
)
