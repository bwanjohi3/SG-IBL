CREATE TABLE [pos].[brandModel](
    brandModelId BIGINT IDENTITY(1, 1) NOT NULL ,
    brand VARCHAR(50),
    model VARCHAR(50),
    [description] VARCHAR(250),

    CONSTRAINT pkPosBrandModel PRIMARY KEY CLUSTERED (brandModelId ASC)
)

-- UNIQUE CHECK ?
