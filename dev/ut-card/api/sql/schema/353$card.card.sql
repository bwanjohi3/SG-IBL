CREATE TABLE [card].[card]( -- table that stores all cards data
    cardId bigint NOT NULL, -- id of the card
    targetBranchId bigint, -- id of the branch where the card will be delivered
    currentBranchId bigint, -- id of the branch where the card is currently located
    cardNumber varchar(20) NULL, -- the number printed on the card
    creationDate date NULL, -- creation date of the card
    activationDate date NULL, -- date when the card has been activated
    expirationDate date NULL, -- date when the card expires
    customerId bigint NULL, -- id of the customer
    personId bigint NULL, -- id of the person who uses the card
    customerNumber nvarchar(10) NULL, -- customer number
    customerName nvarchar(100) NULL, -- name of the customer
    personName nvarchar(100), -- name of the person who uses the card
    cardHolderName nvarchar(100), -- the name printed on the card
    statusId tinyint NOT NULL, -- status of the card
    productId int NULL, -- card product
    typeId int NOT NULL, -- card type
    applicationId bigint, -- the application that issued card creation/activation
    activatedBy bigint NULL, -- user that activated the card
    verified bit NULL, -- is the card verified
    authorized bit NULL, -- is the card authorized
    isPinMailGenerated bit NULL, -- is a PIN generated for this card
    reasonId tinyint, -- decline/reject reason
    comments nvarchar(1000) NULL, -- decline/reject/user comments
    createdBy bigint NOT NULL, -- user that created the card
    createdOn datetime2(0) NOT NULL, -- date when the card has been created
    updatedOn datetime2(0) NULL, -- last updated date
    updatedBy bigint NULL, -- user who last modified card properties/status
    embossedTypeId tinyint, -- card type, i.e name/no name
    previousStatusId tinyint, -- previous state of the card
    batchId int, -- the batch that created the card
    personNumber nvarchar(10) NULL, -- number of the person who uses the card
    pinRetries int, -- incorrect PIN rertries
    pinRetriesLimit int NULL, -- how many incorrect PIN retries are allowed
    pinRetriesDaily int NULL, -- incorrect PIN retries per day
    pinRetriesDailyLimit int NULL, -- how many incorrect PIN retries will lock the card for a day
    pinRetriesLastInvalid datetime NULL, -- when the last wrong PIN attempt was done
    cipher varchar(50) NULL, -- cipher key
    pvk varchar(64) NULL, -- PIN verification key
    cvk varchar(64) NULL, -- card verification key
    mkac varchar(64) NULL, -- card ICC key
    ivac varchar(64) NULL, -- card ICC initial vector
    decimalisation varchar(32) NULL, -- decimalisation
    pinOffset varchar(32) NULL, -- PIN offset
    [statusCode] [varchar](50) NULL, -- code from ATM
    issuingBranchId bigint NULL, -- branch that issued the card
    generatedPinMails tinyint NOT NULL  DEFAULT(0), -- who many times PIN has been generated for the card
    [data] varchar(300) NULL, -- keep ccv or/and ccv2 plus some random string, all closed within json object like this crypt({ccv: '.....', ccv2: '....', rand: Math.random()})
    acceptanceDate date NULL, -- date when the card has been accepted
    CONSTRAINT pkCard PRIMARY KEY CLUSTERED (cardId),
    CONSTRAINT fkCard_CardNumber FOREIGN KEY (cardId) REFERENCES [card].number (numberId),
    CONSTRAINT fkCard_CardProduct FOREIGN KEY (productId) REFERENCES [card].product (productId),
    CONSTRAINT fkCard_Cardtype FOREIGN KEY (typeId) REFERENCES [card].type (typeId),
    CONSTRAINT fkCard_CardReason FOREIGN KEY (reasonId) REFERENCES [card].reason (reasonId),
    CONSTRAINT fkCard_CardStatus FOREIGN KEY (statusId) REFERENCES [card].[status] (statusId),
    CONSTRAINT fkCard_CardEmbossedType FOREIGN KEY (embossedTypeId) REFERENCES [card].[embossedType] (embossedTypeId),
    CONSTRAINT fkCard_CardStatusPrevious FOREIGN KEY (previousStatusId) REFERENCES [card].[status] (statusId),
    CONSTRAINT fkCard_CardBatchId FOREIGN KEY (batchId) REFERENCES [card].[batch] (batchId)
)