CREATE TABLE [pos].[menuItem](
    menuItemId BIGINT IDENTITY(1, 1) NOT NULL,
    menuId BIGINT,
    [text] VARCHAR(50),
    parentId INT,
    [action] VARCHAR(10), -- transaction id hard coded in pos app code
    [priority] INT,
    protcected BIT,

    CONSTRAINT pkPosMenuItem PRIMARY KEY CLUSTERED (menuItemId ASC),
    CONSTRAINT fkPos_MeniItemMenu FOREIGN KEY(menuId) REFERENCES [pos].[menu] (menuId)
)
