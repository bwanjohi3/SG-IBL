IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'businessUnitId' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  ALTER TABLE [pos].terminal ADD [businessUnitId] INT NOT NULL DEFAULT(1002)
END 

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'header1' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  ALTER TABLE [pos].terminal ADD [header1] VARCHAR(50) NULL
END 

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'header2' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  ALTER TABLE [pos].terminal ADD [header2] VARCHAR(50) NULL
END 

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'header3' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  ALTER TABLE [pos].terminal ADD [header3] VARCHAR(50) NULL
END 

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'header4' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  ALTER TABLE [pos].terminal ADD [header4] VARCHAR(50) NULL
END 

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'footer1' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  ALTER TABLE [pos].terminal ADD [footer1] VARCHAR(50) NULL
END 

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'footer2' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  ALTER TABLE [pos].terminal ADD [footer2] VARCHAR(50) NULL
END 

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'footer3' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  ALTER TABLE [pos].terminal ADD [footer3] VARCHAR(50) NULL
END 


IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = 'merchantId' and Object_ID = Object_ID(N'pos.terminal'))
BEGIN
  EXEC sp_rename 'pos.terminal.merchantId', 'merchantName', 'COLUMN';
END 



