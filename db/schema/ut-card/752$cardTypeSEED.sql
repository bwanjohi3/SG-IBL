declare @type [card].typeTT, @binId [core].[arrayNumberList], @meta core.metaDataTT

declare @sa bigint = (select actorId from [user].[hash] where identifier = 'sa' and type = 'password')
insert into @meta ([auth.actorId], method, languageId) values (@sa, '', 1)

declare @typeName nvarchar(100)
declare @brandId bigint = (select cardBrandId from card.cardBrand where name = 'Master Card')
DECLARE @itemNameID BIGINT
DECLARE @issuerId nvarchar(20) = 'cbs'
DECLARE @bin bigint
DECLARE @cdol1ProfileId int
DECLARE @ownershipTypeId BIGINT = (SELECT TOP 1 [ownershipTypeId] FROM [card].[ownershipType] ot
                                    LEFT JOIN [core].[itemName] cin ON ot.ownershipTypeId = cin.itemNameId
                                    WHERE cin.itemCode = 'own')
SELECT @cdol1ProfileId=cdol1ProfileId FROM [card].[cdol1Profile] WHERE cdol1ProfileName = 'accu default'
BEGIN
    -- own
    set @typeName= 'Card Type Own Simulator'
    insert into @type (name, description, cardBrandId, cardNumberConstructionId, termMonth, createdBy, createdOn, updatedBy, updatedOn, isActive,
                cipher, pvk, cvk, cryptogramMethodIndex, cryptogramMethodName, schemeId,
                mkac, ivac, decimalisation, flow,
                issuerId, cvv1, cvv2, icvv, serviceCode1, serviceCode2, serviceCode3, generateControlDigit, applicationInterchangeProfile, cdol1ProfileId)
    select  @typeName, 'description own', @brandId, 2, 24, @sa, getdate(), @sa, getdate(), 1,
            'aes256', N'4cf3d0c9333edd677d9a7874e33d032848d64f14c05c209725678d3dce1bad2b', N'e78008932221bc6179019c544b82b387ce6b09f8ec2a525015a7f7467c516796', 1, 'KQ', 1,
            N'c7db033482c4cd0c75df0b4f924d64be7a1b1b126ed44a4d4decc1bea685f1de', N'9f312b7e80df49dcdebb06e5f8d379136eecbdcfb38de7265dcb9a54245beed8', N'b44d5f36006a1aec1d562cd6b07fd39e', N'own',
            @issuerId, 1, 0, 0, 5, 0, 3, 0, 1800, @cdol1ProfileId

    insert into @binId
    select top 1 binId from [card].bin WHERE ownershipTypeId = @ownershipTypeId order by binId

    if not exists (select * from [card].[type] where name = @typeName)
        exec [card].[type.add] @type = @type, @binId = @binId, @meta = @meta

    -- own hsm keys
    DELETE @type
    DELETE @binId
    set @typeName= 'Card Type Own HSM'
    insert into @type (name, description, cardBrandId, cardNumberConstructionId, termMonth, createdBy, createdOn, updatedBy, updatedOn, isActive,
                cipher, pvk, cvk, cryptogramMethodIndex, cryptogramMethodName, schemeId,
                mkac, ivac, decimalisation, flow,
                issuerId, cvv1, cvv2, icvv, serviceCode1, serviceCode2, serviceCode3, generateControlDigit, applicationInterchangeProfile, cdol1ProfileId)
    select  @typeName, 'description own hsm', @brandId, 2, 36, @sa, getdate(), @sa, getdate(), 1,
            'aes256', N'4a9084c2de7bcde91acb0a77e6a0136bedec8c5560a9dd3cc8055bf07f2f85a0', N'75d3b8a330126a3b58755bea20ce881589a50cda10a0326248c6b9dc9aed2d8f', 1, 'KQ', 1,
            N'd96d260dd71ec24440c9cc4eff344adb19b1a89189c10f6b57d175a1d53f83a2', N'9f312b7e80df49dcdebb06e5f8d379136eecbdcfb38de7265dcb9a54245beed8', N'ada4bace046cfd308b4f675b74e5a384', N'own',
            @issuerId, 1, 1, 1, 5, 0, 3, 1, 1800, @cdol1ProfileId

    insert into @binId
    select top 1 binId from [card].bin WHERE ownershipTypeId = @ownershipTypeId order by binId desc

    if not exists (select * from [card].[type] where name = @typeName)
        exec [card].[type.add] @type = @type, @binId = @binId, @meta = @meta

    -- external
    DELETE @type
    DELETE @binId
    set @typeName= 'Card Type External'
    SET @issuerId = 'notus'
    SET @ownershipTypeId = (SELECT TOP 1 [ownershipTypeId] FROM [card].[ownershipType] ot
                                        LEFT JOIN [core].[itemName] cin ON ot.ownershipTypeId = cin.itemNameId
                                        WHERE cin.itemCode = 'external')

    insert into @type (name, description, createdBy, createdOn, updatedBy, updatedOn, isActive,
                flow, issuerId, emvRequestTags, emvResponseTags)
    select  @typeName, 'description external', @sa, getdate(), @sa, getdate(), 1,
            N'notus', @issuerId, '97,9F02,70,92,9F37,9C', '9F32,8D,5A,9F35,9F09'

    insert into @binId
    select top 1 binId from [card].bin WHERE ownershipTypeId = @ownershipTypeId order by binId DESC

    if not exists (select * from [card].[type] where name = @typeName)
        exec [card].[type.add] @type = @type, @binId = @binId, @meta = @meta

END
