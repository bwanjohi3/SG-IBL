DECLARE @sg BIGINT
DECLARE @countryId INT
DECLARE @mustUpdate bit = 0

IF NOT EXISTS(select * from customer.organization where organizationName = 'IBL')
BEGIN
    SET @mustUpdate = 1
    INSERT INTO core.actor(actorType, isEnabled) Values('organization', 1)
    set @sg = SCOPE_IDENTITY()

    INSERT INTO [customer].[organization] ([actorId], [organizationName], isEnabled, isDeleted)
    VALUES (@sg, N'IBL', 1, 0)
end


