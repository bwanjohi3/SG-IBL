DECLARE @value VARCHAR(10) = 'Staff'
DECLARE @staffUsers TABLE (value nvarchar(100))
INSERT INTO @staffUsers (value)
VALUES
    ('BackOffice'),
    ('BackOfficeSupervisor'),
    ('CardAdmin'),
    ('contentAdmin'),
    ('CustomerService'),
    ('CustomerServiceSupervisor'),
    ('sa'),
    ('userCheckerAdmin'),
    ('userMakerAdmin'),
    ('Viewer'),
    ('mobileAgent'),
    ('mobileClient'),
    ('tellerUser')
INSERT INTO  [core].[actorProperty]  (actorId, name, value)
SELECT uh.actorid, 'typeOfUser', @value
FROM  [user].[hash] uh
JOIN @staffUsers su ON uh.identifier = su.value
LEFT JOIN [core].[actorProperty] tgt on uh.actorId = tgt.actorId AND tgt.name = 'typeOfUser'
WHERE tgt.actorId IS NULL