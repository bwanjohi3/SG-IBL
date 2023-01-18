IF EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'terminalName' AND OBJECT_ID = OBJECT_ID ('atm.terminal'))
    AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'address' AND OBJECT_ID = OBJECT_ID ('atm.terminal'))
    BEGIN
         exec sp_rename 'atm.terminal.terminalName', 'address', 'COLUMN'
    END
ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE [name] = 'terminalName' AND OBJECT_ID = OBJECT_ID ('atm.terminal'))
    BEGIN
         ALTER TABLE atm.terminal DROP COLUMN terminalName
    END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'city' and Object_ID = Object_ID(N'atm.terminal'))
BEGIN
  ALTER TABLE atm.terminal ADD city VARCHAR (13)
END 

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'state' and Object_ID = Object_ID(N'atm.terminal'))
BEGIN
  ALTER TABLE atm.terminal ADD [state] VARCHAR (2)
END 

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'country' and Object_ID = Object_ID(N'atm.terminal'))
BEGIN
  ALTER TABLE atm.terminal ADD country VARCHAR (2)
END 

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'branchId' and Object_ID = Object_ID(N'atm.terminal'))
BEGIN
  ALTER TABLE atm.terminal ADD branchId BIGINT
END 

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkAtmTerminal_Branch')
BEGIN 
    ALTER TABLE atm.terminal ADD CONSTRAINT fkAtmTerminal_Branch FOREIGN KEY(branchId) REFERENCES [customer].[organization] (actorId)
END   