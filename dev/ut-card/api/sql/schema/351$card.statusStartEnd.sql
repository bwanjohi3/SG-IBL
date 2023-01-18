CREATE TABLE [card].statusStartEnd( --table that shows start and end status of each card module
    id int IDENTITY(1, 1), -- the id of the status start/end flag
    statusId tinyint NOT NULL, --the status defined for start or end
    module varchar(50) NOT NULL,  -- for which module this configuration is valid - application, batch, card or distributed card
    startendFlag bit NOT NULL, -- 0 -> start status; 1-> end status
 CONSTRAINT pkCardStatusStartEnd PRIMARY KEY CLUSTERED  (id),
 CONSTRAINT fkstatusStartEnd_statusId FOREIGN KEY(statusId) REFERENCES [card].[status] (statusId)
 )