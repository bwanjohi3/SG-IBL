/*DECLARE
@condition [rule].conditionTT,
@conditionActor [rule].conditionActorTT,
@conditionItem [rule].conditionItemTT,
@conditionProperty [rule].conditionPropertyTT,
@limit [rule].limitTT,
@split XML,
@itemNameId BIGINT

DECLARE @actorIdTeller BIGINT = (SELECT actorId FROM [user].[role] WHERE name = 'Teller')
DECLARE @productId BIGINT = (SELECT itemNameId
                              FROM core.itemName cin
                              JOIN core.itemType cit ON cit.itemTypeId = cin.itemTypeId
                              WHERE [name] = 'accountProduct' AND itemName = 'selfRegistration')
--bulk debit
SET @itemNameId = (SELECT itemNameId
                              FROM core.itemName cin
                              JOIN core.itemType cit ON cit.itemTypeId = cin.itemTypeId
                              WHERE cit.alias = 'operation' AND itemCode = 'bulkDebit')


IF NOT EXISTS (SELECT * FROM [rule].condition WHERE[priority] = 18)
BEGIN
    INSERT INTO @condition ([priority], operationStartDate, operationEndDate, sourceAccountId, destinationAccountId)
                VALUES (18, NULL, NULL, NULL, NULL)

    INSERT INTO @conditionItem (factor, itemNameId)
                VALUES ('oc', @itemNameId),
                        ('sc', @productId)


    INSERT INTO @conditionActor(factor, actorId)
                VALUES ('co', @actorIdTeller)

    SET @split = N'<data>
                   <rows>
                    <splitName>
                        <name>Bulk debit</name>
                    </splitName>
                    <splitRange>
                        <startAmount>0</startAmount>
                        <startAmountCurrency>USD</startAmountCurrency>
                        <percent>100</percent>
                        <isSourceAmount>0</isSourceAmount>
                    </splitRange>
                    <splitAssignment>
                        <debit>${source.account.number}</debit>
                        <credit>bulkDebit123</credit>
                        <percent>100</percent>
                        <description>Bulk debit</description>
                        </splitAssignment>
                     </rows>
                </data>'

    EXEC [rule].[rule.add]
        @condition,
        @conditionActor,
        @conditionItem,
        @conditionProperty,
        @limit,
        @split

END
---------------

--bulk credit
SET @itemNameId = (SELECT itemNameId
                              FROM core.itemName cin
                              JOIN core.itemType cit ON cit.itemTypeId = cin.itemTypeId
                              WHERE cit.alias = 'operation' AND itemCode = 'bulkCredit')

DELETE FROM @condition
DELETE FROM @conditionActor
DELETE FROM @conditionItem
DELETE FROM @conditionProperty
DELETE FROM @limit

IF NOT EXISTS (SELECT * FROM [rule].condition WHERE[priority] = 19)
BEGIN
    INSERT INTO @condition ([priority], operationStartDate, operationEndDate, sourceAccountId, destinationAccountId)
                VALUES (19, NULL, NULL, NULL, NULL)

    INSERT INTO @conditionItem (factor, itemNameId)
                VALUES ('oc', @itemNameId),
                        ('dc', @productId)

    INSERT INTO @conditionActor(factor, actorId)
                VALUES ('co', @actorIdTeller)

    SET @split = N'<data>
                   <rows>
                    <splitName>
                        <name>Bulk credit</name>
                    </splitName>
                    <splitRange>
                        <startAmount>0</startAmount>
                        <startAmountCurrency>USD</startAmountCurrency>
                        <percent>100</percent>
                        <isSourceAmount>0</isSourceAmount>
                    </splitRange>
                    <splitAssignment>
                        <debit>bulkCredit123</debit>
                        <credit>${destination.account.number}</credit>
                        <percent>100</percent>
                        <description>Credit Amount</description>
                    </splitAssignment>
                    </rows>
                    <rows>
                    <splitName>
                        <name>Bulk credit WTH tax</name>
                        <tag>|acquirer|fee|</tag>
                    </splitName>
                    <splitRange>
                        <startAmount>0</startAmount>
                        <startAmountCurrency>USD</startAmountCurrency>
                        <percent>100</percent>
                        <isSourceAmount>0</isSourceAmount>
                    </splitRange>
                    <splitAssignment>
                        <debit>${destination.account.number}</debit>
                        <credit>454WTHWC01</credit>
                        <percent>20</percent>
                        <description>WTH tax</description>
                    </splitAssignment>
                    </rows>
                </data>'

    EXEC [rule].[rule.add]
        @condition,
        @conditionActor,
        @conditionItem,
        @conditionProperty,
        @limit,
        @split

END
---------------*/
