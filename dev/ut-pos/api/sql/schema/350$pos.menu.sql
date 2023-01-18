CREATE TABLE [pos].[menu](
    menuId BIGINT IDENTITY(1, 1) NOT NULL,
    [version] VARCHAR(8),
    title VARCHAR(50),
    [description] VARCHAR(250),

    CONSTRAINT pkPosMenu PRIMARY KEY CLUSTERED (menuId ASC)
)
