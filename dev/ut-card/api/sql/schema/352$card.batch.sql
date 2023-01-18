CREATE TABLE [card].batch(--table that stores information about all card batches
       batchId int IDENTITY, -- id of batch
       batchName nvarchar(100) NOT NULL, -- batch name
       sentOn datetime2(7) NULL, -- date when the batch was sent for production
       statusId tinyint NOT NULL, -- status of batch
       generatedPinMails int NULL, -- number of generated pin mails
       downloads int NULL, -- number of downloads
       embossedTypeId tinyint NULL, -- type of batch for generation of noName/Name cards
       numberOfCards int NULL, -- number of Cards in batch
       typeId [int] NULL, -- card type id
       targetBranchId bigint NULL, -- target branch
       branchId bigint NULL,-- this should be the branch of the user (teller) that created the application, what to do if more than 1?
       createdBy bigint NOT NULL, --the id of the user, that created the batch
       createdOn datetime2(7) NOT NULL,-- the exact time the batch was created
       updatedBy bigint NULL, --the id of the user, that updated the batch
       updatedOn datetime2(7) NULL, -- the exact time the user was updated
       reasonId tinyint NULL, -- id of the reject/decline reason
       comments nvarchar(1000) NULL, -- reject/decline user comments
       previousStatusId tinyint, -- previous state status  
       issuingBranchId bigint NULL, -- id of the branch that issued the batch
       areAllCardsGenerated Bit NOT NULL default(1), -- flag that is set to 1 when all cards in the batch are with generated cvv
 CONSTRAINT PK_batch_1 PRIMARY KEY CLUSTERED (batchId),
 CONSTRAINT uc_batchName UNIQUE (batchName),
 CONSTRAINT fkbatch_statusId FOREIGN KEY(statusId) REFERENCES [card].[Status] (statusId),
 CONSTRAINT fkbatch_embossedTypeId  FOREIGN KEY(embossedTypeId) REFERENCES [card].embossedType (embossedTypeId),
 CONSTRAINT fkbatch_typeId FOREIGN KEY(typeId) REFERENCES [card].type (typeId),
 CONSTRAINT fkbatch_reasonId FOREIGN KEY(reasonId) REFERENCES [card].reason (reasonId),
 CONSTRAINT fkbatch_StatusPreviousId FOREIGN KEY (previousStatusId) REFERENCES [card].[status] (statusId),
 CONSTRAINT fkbatch_targetBranchId FOREIGN KEY(targetBranchId) REFERENCES [customer].[organization] (actorId),
 CONSTRAINT fkbatch_branchId FOREIGN KEY(branchId) REFERENCES [customer].[organization] (actorId),
 CONSTRAINT fkbatch_issuingBranchId FOREIGN KEY(issuingBranchId) REFERENCES [customer].[organization] (actorId)
)