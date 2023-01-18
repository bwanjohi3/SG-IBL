CREATE TYPE [card].[filterByTT] AS TABLE( --table type variable used for data filtering in stored procedures
    statusId tinyint,
    embossedTypeId tinyint,
    businessUnitId bigint,
    productId int,
    typeId int,
    -- custom search
    cardHolderName nvarchar(100),
    customerNumber nvarchar(10),
    customerName  nvarchar(100),
    personName  nvarchar(100),
    cardNumber varchar(100),
    -- custom search end
    applicationId bigint,
    batchName nvarchar(100),
    targetBranchId bigint,
    currentBranchId bigint,
    issuingBranchId bigint,
    --
    module varchar(50),
    productName  varchar(100),
    typeName  varchar(100),
    issuerId varchar(50),
    flow varchar(50),
    isActive bit,
    startBin VARCHAR(6),
    endBin VARCHAR(6),
    [description] NVARCHAR (100),
    -- reason
    reasonName nvarchar(255),
    actionId tinyint
)

