DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DEclare @itemNameId bigint
declare @itemTypeConfirmation [tinyint] = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'actionConfirmation');
IF NOT EXISTS(SELECT * FROM [core].[itemType] WHERE name = 'actionConfirmation')
BEGIN
    INSERT INTO [core].[itemType] ([alias], [name], [description]) VALUES('actionConfirmation', 'actionConfirmation', 'Action Confirmation Dialog')
    set @itemTypeConfirmation = SCOPE_IDENTITY()
END

DELETE FROM @itemNameTranslationTT
--INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Your password must contain', 'Your password must contain', 'Your password must contain')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-ApproveNoNamed', 'Are you sure you want to approve the application?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-ApproveNamed', 'Are you sure you want to approve the application?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-CreateBatch', 'Are you sure you want to create a new batch?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-AddToBatch', 'Are you sure you want to add applications to the batch?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-RemoveFromBatch', 'Are you sure you want to remove the application from batch?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-Approve', 'Are you sure you want to approve the application?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-Reject', 'Are you sure you want to reject the application?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-Update', 'Are you sure you want to save changes?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Application-Decline', 'Are you sure you want to decline the application?')

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Batch-Complete', 'Are you sure you want to mark batch as completed?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Batch-Download', 'Are you sure you want to download production files for selected batches?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Batch-GeneratePIN', 'Are you sure you want to generate new PIN Mails?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Batch-Reject', 'Are you sure you want to reject batch?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Batch-SentToProduction', 'Are you sure you want to send selected applications from batch to production?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Batch-Update', 'Are you sure you want to save changes?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Batch-Decline', 'Are you sure you want to decline batch?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Batch-Approve', 'Are you sure you want to approve batch?')

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-Accept', 'Are you sure you want to accept cards in business unit?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-AcceptCards', 'Are you sure you want to accept cards in business unit?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-Allocate', 'Are you sure you want to allocate cards?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-ApproveCardAcceptance', 'Are you sure you want to approve card acceptance?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-ApproveDestruction', 'Are you sure you want to approve card destruction?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-Destruct', 'Are you sure you want to destruct cards?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-GeneratePIN', 'Are you sure you want to generate new PIN Mails?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-Reject', 'Are you sure you want to reject card acceptance?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-RejectCards', 'Are you sure you want to reject card acceptance?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-RejectDestruction', 'Are you sure you want to reject card destruction?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-ResetPINRetries', 'Are you sure you want to reset card pin retries?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-Send', 'Are you sure you want to approve card allocation?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-Card-Decline', 'Are you sure you want to decline cards?')

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-Update', 'Are you sure you want to save changes?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-Activate', 'Are you sure you want to activate cards?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-ApproveActivate', 'Are you sure you want to approve card activation?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-ApproveDestruction', 'Are you sure you want to approve card destruction?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-ApproveDeactivation', 'Are you sure you want to approve card deactivation?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-Deactivate', 'Are you sure you want to deactivate cards?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-Destruct', 'Are you sure you want to destruct cards?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-GeneratePIN', 'Are you sure you want to generate new PIN Mails?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-RejectActivation', 'Are you sure you want to reject card activation?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-ResetPINRetries', 'Are you sure you want to reset card pin retries?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-RejectDeactivation', 'Are you sure you want to reject deactivation?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-RejectDestruction', 'Are you sure you want to reject card destruction?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-Decline', 'Are you sure you want to decline card?')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES (null, 'ActionStatusConfirmationDialog-CardInUse-Hot', 'Are you sure you want to mark cards as HOT?')

declare @languageId int = (SELECT languageId FROM core.[language] WHERE iso2Code = 'en')
declare @meta core.metaDataTT

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @languageId, @organizationId = NULL, @itemType = 'actionConfirmation', @meta = @meta
