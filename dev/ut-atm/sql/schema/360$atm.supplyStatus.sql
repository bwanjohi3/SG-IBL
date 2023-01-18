CREATE TABLE [atm].[supplyStatus](
    atmId bigint NOT NULL,
	cardReader varchar(16) NOT NULL,
	depository varchar(16) NOT NULL,
	receiptPrinter varchar(16) NOT NULL,
	journalPrinter varchar(16) NOT NULL,
	rejectBin varchar(16) NOT NULL,
	cassette1 varchar(16) NOT NULL,
	cassette2 varchar(16) NOT NULL,
	cassette3 varchar(16) NOT NULL,
	cassette4 varchar(16) NOT NULL,
    CONSTRAINT pkAtmSupplyStatus PRIMARY KEY CLUSTERED (atmId ASC),
    CONSTRAINT fkAtmSupplyStatus_Terminal FOREIGN KEY(atmId) REFERENCES [atm].[terminal] (actorId)
)