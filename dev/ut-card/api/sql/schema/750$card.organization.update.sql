alter procedure [card].[organization.update]
 @branches [card].[branchesTT]  READONLY
 AS
 BEGIN
				DECLARE @code as nvarchar (300)
				DECLARE @name as nvarchar (300)
				DECLARE @sg as bigint
				DECLARE @mustUpdate bit =0
				DECLARE @insertid bigint
				DECLARE @countryId bigint
				DECLARE Branches_Cursor CURSOR FOR
				SELECT  * FROM @branches
				OPEN Branches_Cursor
				FETCH NEXT FROM Branches_Cursor INTO @code,@name
				WHILE @@FETCH_STATUS = 0
				BEGIN
					IF NOT EXISTS(SELECT * FROM [customer].[organization] where code=@code and organizationName=@name)
					BEGIN
							SET @mustUpdate = 1;
							SET @sg = (select actorid from customer.organization where organizationName = 'IBL')
							INSERT INTO core.actor(actorType, isEnabled) Values('organization', 1)
							set @insertid = SCOPE_IDENTITY()

							set @countryId = (select countryId from customer.country where name = 'Ghana')

							INSERT INTO [customer].[organization] ([actorId],code, [organizationName], isEnabled, isDeleted, countryId)
							VALUES (@insertid, @code,@name, 1, 0, @countryId)

							insert into core.actorHierarchy(subject, predicate, object) values(@insertid, 'memberOf', @sg)
					END
				FETCH NEXT FROM Branches_Cursor
				INTO @code,@name
				END
				CLOSE Branches_Cursor
				DEALLOCATE Branches_Cursor

				IF @mustUpdate=1
				MERGE INTO [customer].[organizationHierarchyFlat] AS target
				USING(
				   SELECT a.actorId AS [subject], h.parentActorId, h.actorId AS [object], h.depth AS [relationDepth]
				   FROM customer.organization a
				   CROSS APPLY [customer].[organizationsVisibleForFlat](a.actorId) h

				   ) AS SOURCE ([subject], [parentActorId], [object], [relationDepth])
				ON  target.[subject] = source.[subject]
				AND target.[parentActorId] = source.[parentActorId]
				AND target.[object] = source.[object]
				WHEN MATCHED AND (   target.[relationDepth] <> SOURCE.[relationDepth] )
				   THEN
						UPDATE SET  target.[relationDepth] = SOURCE.[relationDepth]
				WHEN NOT MATCHED BY SOURCE THEN
				   DELETE
				WHEN NOT MATCHED BY TARGET THEN
				INSERT ([subject], [parentActorId], [object], [relationDepth])
				VALUES (SOURCE.[subject], SOURCE.[parentActorId], SOURCE.[object], SOURCE.[relationDepth]);
	
 END
