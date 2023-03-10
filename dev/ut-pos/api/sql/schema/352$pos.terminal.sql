CREATE TABLE [pos].[terminal](
    actorId BIGINT NOT NULL,
    terminalNumber VARCHAR(8) NOT NULL,
    terminalSerial VARCHAR(50),
    [name] VARCHAR(255),
    tsn BIGINT,
    merchantName VARCHAR(50),
    terminalBrandModelId BIGINT,
    [location] VARCHAR(50),
    [description] VARCHAR(250),
    currVersion VARCHAR (8),
    newVersionId BIGINT,
    keyChainId INT,    
    tmk VARCHAR(33),
    tmkkvv VARCHAR(6),
    dek VARCHAR(33),
    dekkvv VARCHAR(6),    
    fTmk VARCHAR(33),
    fTmkKvv VARCHAR(6), 
    kekDukpt VARCHAR(33),
    kekDukptKvv VARCHAR(6),    
    tillAccount VARCHAR(50),
    feeAccount VARCHAR(50),
    commissionAccount VARCHAR(50),
    [active] BIT,    
    adminPassword VARCHAR(50),
    merchantPassword VARCHAR(50),
    testPosData VARCHAR(50),
    businessUnitId INT,
    header1 VARCHAR(50),
    header2 VARCHAR(50),
    header3 VARCHAR(50),
    header4 VARCHAR(50),
    footer1 VARCHAR(50),
    footer2 VARCHAR(50),
    footer3 VARCHAR(50),
    CONSTRAINT [pkPosTerminal] PRIMARY KEY CLUSTERED (actorId ASC),
    CONSTRAINT fkPosTerminal_ActorId FOREIGN KEY(actorId) REFERENCES [core].[actor] (actorId),
    CONSTRAINT fkPosTerminal_newVersionId FOREIGN KEY(newVersionId) REFERENCES [pos].[application] (appId),
    CONSTRAINT fkPosTerminal_keyChainId FOREIGN KEY(keyChainId) REFERENCES [pos].[keyChain] (keyChainId)
)
