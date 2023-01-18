CREATE TABLE [pos].[parameter](
    parameterId BIGINT IDENTITY(1, 1) NOT NULL,
    [version] VARCHAR(8) NOT NULL,
    [name] VARCHAR(50),
    menuId INT,
    receiptHeader1 VARCHAR(50),
    receiptHeader2 VARCHAR(50),
    receiptHeader3 VARCHAR(50),
    receiptHeader4 VARCHAR(50),
    receiptHeader5 VARCHAR(50),
    receiptFooter1 VARCHAR(50),
    receiptFooter2 VARCHAR(50),
    receiptFooter3 VARCHAR(50),
    receiptFooter4 VARCHAR(50),
    [description] VARCHAR(250),

    CONSTRAINT pkPosParameter PRIMARY KEY CLUSTERED (parameterId ASC)
)
