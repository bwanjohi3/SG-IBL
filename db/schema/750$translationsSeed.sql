DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT

MERGE INTO [core].[itemType] AS target
USING
    (VALUES        
        ('language', 'language', 'language', 'language', 'languageId', 'name'),
        ('text', 'text', 'text', null, null, null)
    ) AS source (alias, name, [description], [table], keyColumn, nameColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (alias, name, [description], [table], keyColumn, nameColumn)
VALUES (alias, name, [description], [table], keyColumn, nameColumn);

DECLARE @itemTypeLanguage TINYINT = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'language');
DECLARE @itemTypeTextId INT = (SELECT itemTypeId FROM [core].[itemType] WHERE name = 'text');

IF NOT EXISTS(SELECT * FROM [core].[language] WHERE iso2Code = 'en')
BEGIN
	INSERT INTO [core].[language] ([languageId], [iso2Code], [name], [locale]) VALUES((SELECT COUNT(languageId)+1 FROM [core].[language]), 'en', 'English', 'en_GB')
END


DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

------ Insert languages ---------
MERGE INTO [core].[itemName] AS target
USING
    (VALUES        
        (@itemTypeLanguage, 'English', 'en', @enLanguageId)
    ) AS source (itemTypeId, itemName, itemCode, itemSyncId)
ON target.itemTypeId = source.itemTypeId AND target.itemName = source.itemName
WHEN NOT MATCHED BY TARGET THEN
INSERT (itemTypeId, itemName, itemCode, itemSyncId)
VALUES (itemTypeId, itemName, itemCode, itemSyncId);

declare @itemNameId BIGINT
set @itemNameId = (SELECT itemNameId FROM [core].[itemName] WHERE itemTypeId = @itemTypeLanguage and itemName = 'English')
IF NOT EXISTS(SELECT * FROM [core].[itemTranslation] WHERE languageId=@enLanguageId and itemNameId = @itemNameId)
BEGIN
	insert into [core].itemTranslation ([itemNameId], [languageId], [itemNameTranslation]) values (@itemNameId, @enLanguageId, 'English');
END

IF NOT EXISTS(SELECT * FROM [core].[itemName] WHERE itemTypeId=@itemTypeTextId and itemName = 'Customer')
BEGIN
	insert into [core].itemName ([itemTypeId], [itemName]) values (@itemTypeTextId, 'Customer');
END

-------- INSERT UI TEXTS ----------
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('Gender_M', 'M'),('Gender_F', 'F')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = @itemTypeTextId, @meta = @meta

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES('0', '0'), ('Access', 'Accès'), ('Add profile photo', 'Ajouter une photo de profil'), ('Address', 'Adresse'), ('Agency', 'Agence'), ('Agent', 'Agent'), ('Amount', 'Montant'), ('Application step', 'L''étape d''application'), ('Approve customer file', 'Valider fichier client'), ('Approved', 'Approuvé'), ('Assign', 'Assigner'), ('Assign to', 'Assigné à'), ('Back', 'Retour'), ('Biometric data has been registered successfully!', 'Les empreintes biométriques ont bien été enregistrées!'), ('Biometric fingerprints have been saved!', 'Les empreintes biométriques ont bien été enregistrées!'), ('Biometrie', 'Biométrie'), ('Block customer file', 'Bloquer fichier client'), ('Blocked', 'Bloqué'), ('Branch management', 'Gestion d''agence'), ('Cancel', 'Annuler'), ('Capture', 'Valider'), ('Cellphone number', 'Numéro mobile'), ('Change', 'Modifier'), ('Change password', 'Modifier mot de passe'), ('Choose role startup page.', 'Choisissez la page de départ du rôle.'), ('Choose Screen Header', 'Choisissez un écran d''en-tête'), ('Client', 'Client'), ('Client number', 'Numéro Client'), ('Client number, account, telephone', 'Numéro client, compte, téléphone'), ('Client service', 'Gestion de clientèle'), ('Close', 'Fermer'), ('Code sent via SMS to', 'Code envoyé via SMS à'), ('Committee', 'Comité'), ('comments', 'commentaires'), ('Conditionally approved', 'Approuvée sous conditions'), ('Confirm new password', 'Confirmer nouveau mot de passe'), ('Confirm your identity by placing your right index finger on the bio fingerprint reader.', 'Posez votre doigt sur le lecteur biométrique pour confirmer votre identité.'), ('Confirmation failed', 'Echec de confirmation'), ('Congratulations! It is successful', 'Modification effectuée'), ('Connect with bio', 'Connexion par biométrie'), ('Connect with password', 'Se connecter avec un mot de passe'), ('Connection with password', 'Connexion par mot de passe'), ('Creation Date', 'Date de création'), ('Credit Line', 'Ligne de Crédit'), ('Customer', 'Client'), ('Customer ?', 'Numéro client'), ('Customer Management', 'Gestion de clientèle'), ('Customer number', 'Numéro client'), (N'Customer №', 'Numéro client'), ('Customer number:', 'Numéro de client:'), ('Customer Number, Account, Phone', 'Numéro client, compte, téléphone'), ('Date created', 'Ouverture'), ('Date of birth', 'Date de naissance'), ('Default Screen', 'Écran par Défaut'), ('Description', 'Décrire'), ('Device not found', 'Appareil manquant'), ('Duration', 'Durée'), ('End', 'Fin'), ('Enregister', 'Enregister'), ('Enter password', 'Saisir mot de passe'), ('Enter the correct code', 'Entrez le bon code'), ('Enter the phone number to be validated', 'Entrez le numéro de téléphone à valider'), ('Enter the received code', 'Saisissez le code reçu'), ('Equipment', 'Matériel'), ('Error', 'Erreur'), ('Error N10234', 'Error N10234'), ('Evaluate', 'Évaluer'), ('Expiry date', 'Date d''expiration'), ('Fdiagne', 'Fdiagne'), ('Female', 'Femme'), ('Files To Validate', 'A valider'), ('Fingerprint scanner problem. Restart UTFingerprint windows service or unplug/plug the device.', 'Problème avec le lecteur biométrique. Veuillez redémarrer le service Windows UTFingerprint ou reconnecter le lecteur.'), ('Fingerprints', 'Empreintes'), ('Finish', 'Terminer'), ('First name', 'Prénom'), ('First names', 'Prénoms'), ('Firstname', 'Prénom'), ('found results for', 'résultats trouvés pour'), ('From computer', 'De l''ordinateur'), ('From webcam', 'De la webcam'), ('Gender_F', 'F'), ('Gender_M', 'H'), ('Go to home page', 'Retourner à la page d''accueil'), ('has been validated!', 'a été validé!'), ('Home Page', 'Accueil'), ('HTTP error', 'Erreur HTTP'), ('ID', 'Pièce d''identité'), ('ID number', 'Numéro d''identification nationale'), ('Identification', 'Identification'), ('Identify', 'M''identifier'), ('illegible', 'illisible'), ('is created for', 'est créée pour'), ('KYC', 'Niveau'), ('Language', 'Langue'), ('Last name', 'Nom'), ('Left Index', 'Index Gauche'), ('Left Little', 'Petit doigt Gauche'), ('Left Middle', 'Majeur Gauche'), ('Left Ring', 'Annulaire Gauche'), ('Left Thumb', 'Pouce Gauche'), ('Level', 'Niveau'), ('Level 1', 'Niveau 1'), ('Level 2', 'Niveau 2'), ('Level 3', 'Niveau 3'), ('Loan Process', 'Processus de demande'), ('Loan Purpose', 'Objet du Crédit'), ('Log out', 'Se déconnecter'), ('Login', 'Se connecter'), ('Login with password', 'Connexion par mot de passe'), ('Male', 'Homme'), ('missing', 'manquante'), ('Mobile computer', 'Ordinateur portable'), ('Mobile device', 'Téléphone portable'), ('Mobile number', 'Numéro mobile'), ('Mobile phone', 'Téléphone portable'), ('Mobile phone number', 'Numéro mobile'), ('Modified on', 'Modifié le'), ('Modify', 'Modifier'), ('Modify password', 'Modifier le mot de passe'), ('Name', 'Nom'), ('Nationality', 'Nationalité'), ('New Application', 'Nouvelle Demande'), ('New Loan Application', 'Nouvelle demande'), ('New password', 'Nouveau mot de passe'), ('Next', 'Suivant'), ('No files for validation', 'Aucun fichier à valider'), ('Not applicable', 'N''est pas applicable'), ('Not Available', 'Non disponible'), ('Not Enrolled', 'Non inscrit'), ('Old password', 'Ancien mot de passe'), ('Only numbers between 6 and 15 characters long', 'Uniquement des numéros entre 6 et 15 caractères'), ('Other reasons', 'Autres motifs'), ('Otp code sended by email', 'Code OTP envoyé par email'), ('OTP code sent via email', 'Code OTP envoyé par e-mail'), ('OTP code sent by email', 'Code OTP envoyé par email'), ('Parameters', 'Paramètres'), ('Password', 'Mot de passe'), ('Password is weak', 'Mot de passe faible'), ('Password updated', 'Modification effectuée'), ('Passwords do not match', 'Les mots de passe sont différents'), ('Pending', 'En attente'), ('Pending approval', 'En attente de validation'), ('Permission', 'Rôle et autorisations'), ('Personal number', 'Numéro personnel'), ('Personal phone number', 'Numéro personnel'), ('Phone number', 'Numéro mobile'), ('Picture', 'Photo portrait'), ('Piece de identity', 'Pièce d''identité'), ('Place of birth', 'Lieu de naissance'), ('placeholder', 'placeholder'), ('Please wait', 'Veuillez patienter'), ('Please wait...', 'Veuillez patienter…'), ('Portable computer', 'Ordinateur portable'), ('Portfolio management', 'Gestion de portefeuille'), ('Profile picture', 'Photo portrait'), ('Proof of residency', 'Justificatif de domicile'), ('Purpose', 'Objectif'), ('RECAPTURE', 'VALIDER'), ('Record 3 times the same left finger', 'Enregistrez 3 fois le même doigt gauche'), ('Record biometric fingerprints', 'Enregistrer empreintes biométriques'), ('Register', 'Enregister'), ('Reject', 'Rejeter'), ('Reject customer file', 'Rejeter fichier client'), ('Rejected', 'Rejeté'), ('Rejection Reason', 'Raison du rejet'), ('Required', 'Obligatoire'), ('RESET', 'RÉINITIALISER'), ('results found for', 'Résultats trouvés pour'), ('Retry', 'Réessayer'), ('Right Index', 'Index Droit'), ('Right Little', 'Petit doigt Droit'), ('Right Middle', 'Majeur Droit'), ('Right Ring', 'Annulaire Droit'), ('Right Thumb', 'Pouce Droit'), ('Role and permissions', 'Rôle et permissions'), ('Save', 'Enregistrer'), ('Save 3 times the same finger', 'Enregistrez 3 fois le même doigt'), ('Scan the client biometric fingerprint', 'Prenez les empruntes biométriques du client'), ('Search Results', 'Résultats de la recherche'), ('Select access policy', 'Sélectionnez une politique d''accès'), ('Select an option', 'Choisissez une option'), ('Select document to upload', 'Choisissez un document à importer'), ('Send code', 'Envoyer le code'), ('Settings', 'Paramètres'), ('Sex', 'Sexe'), ('Signature', 'Signature'), ('Sorry, the page you are trying to access does not exist.', 'La page que vous tentez d’accéder n''existe pas!'), ('Status', 'Statut dossier'), ('Submit without', 'Soumettre sans'), ('Successfully created', 'Créée avec succès'), ('to confirm the application', 'pour valider sa demande'), ('That''s an error.', 'Ceci est une erreur.'), ('The Access Policy Set defines the method of login, expirationdates, number of tries before locking user, etc.', 'La politique d''accès définit la méthode d''ouverture de session, les dates d''expiration, le nombre d''essais avant verrouillage de l''utilisateur, etc.'), ('The application', 'La demande'), ('The entered code does not validate phone number', 'Le code entré ne valide pas le numéro'), ('The mobile phone number', 'Le numéro de portable'), ('The new password cannot be the same as the old one', 'Le nouveau mot de passe doit être différent de l’ancien mot de passe'), ('The profile picture has been added', 'La photo de profil a été ajoutée'), ('The uploaded document has been saved successfully', 'L''importation de la pièce a été enregistrée'), ('This may be an outdated link.', 'Ceci peut être un lien périmé.'), ('Try again', 'Réessayer'), ('Up to date', 'Validé'), ('UPDATE STATUS', 'METTRE À JOUR'), ('Upload', 'Importer'), ('Upload document', 'Importer une pièce'), ('Upload in progress', 'Importation en cours'), ('Upload in progress...', 'Importation en cours...'), ('Upload successful', 'Importation réussie'), ('Use biometric login', 'Utiliser la connexion biométrique'), ('Use my password', 'Utiliser le mot de passe'), ('Username', 'Nom d’utilisateur'), ('Validate', 'Valider'), ('Validate mobile phone number', 'Valider le numéro mobile'), ('Work number', 'Numéro de travail'), ('Work phone number', 'Numéro de travail'), ('Wrong Password', 'Mot de passe incorrect'), ('Your account has been locked because of inactivity! Please contact the system administrator.', 'Votre profil utilisateur est verrouillé à cause de l''inactivité! Veuillez contacter votre administrateur réseau.'), ('Your account has been locked! Please contact the system administrator.', 'Votre profil utilisateur a été verrouillé! Veuillez contacter votre administrateur réseau.'), ('Your password has been changed', 'Votre mot de passe a bien été modifié.'), ('Your password has been updated successfully', 'Votre mot de passe a bien été modifié'), ('Your password has expired! Please contact the system administrator.', 'Votre mot de passe est expiré! Veuillez contacter votre administrateur réseau.'), ('Audit & headquarters', 'Audit & Siège social'), ('Baobab network', 'Réseau Baobab'), ('Compliance', 'Conformité'), ('An application has already been submitted', 'Une demande a déjà été envoyée'), ('Reject Reason', 'Raison du rejet'), ('Block Reason', 'Raison du blocage'),('Staff', 'Staff-fr'),('Non Staff', 'Non Staff-fr'),
-- to delete?
('Choisissez le type de document et cliquez sur uneoption d''importation', 'Choisissez le type de document et cliquez sur une option d''importation'), ('Choisissez une option d''ajout', 'Choisissez une option d''ajout'),('AJOUTER UNE PHOTO DE PROFIL', 'AJOUTER UNE PHOTO DE PROFIL'), ('IMPORTER UNE PIÈCE', 'IMPORTER UNE PIÈCE'),('autres motifs', 'Autres motifs')




---ADD PHONE, EMAIL, ADDRESS TYPE in itemtype
MERGE INTO [core].[itemType] AS target
USING
    (VALUES        
        ('phoneType', 'phoneType', 'phone', 'phoneTypeId', 'phoneTypeId'),
        ('emailType', 'emailType', 'email', 'emailTypeId', 'emailTypeId'),
        ('addressType', 'addressType', 'address', 'addressTypeId', 'addressTypeId'),
        ('accountType', 'accountType', 'account', 'accountTypeId', 'accountTypeId'),
        ('customerType', 'customerType', 'customer', 'customerTypeId', 'customerTypeId'),
        ('documentType', 'documentType', 'document', 'documentTypeId', 'documentTypeId')
    ) AS source (name, alias, [description], keyColumn, nameColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, alias, [description], keyColumn, nameColumn)
VALUES (name, alias, [description], keyColumn, nameColumn);

--add in item phone, email, address type and translations -----------------------------------------------------------------------------------------------------------------
--phone
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('phoneType', 'Type of phone'),('personal', 'personal'),('home', 'home'),('work', 'work')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'phoneType', @meta = @meta

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('phoneType', 'Type de téléphone'),('personal', 'personnel'),('home', 'domicile'),('work', 'travail')

-- email
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('emailType', 'Type of email'),('personal', 'personal'),('work', 'work')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'emailType', @meta = @meta

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('emailType', 'Type d''email'),('personal', 'personnel'),('work', 'travail')

--address
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('addressType', 'Type of address'),('home', 'home'),('work', 'work')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'addressType', @meta = @meta

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('addressType', 'Type d''adresse'),('home', 'domicile'),('work', 'travail')

--account
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('mwallet', 'mwallet'),('savings', 'savings')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'accountType', @meta = @meta


--customer
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('customerType', 'Customer Type'), ('client', 'client')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'customerType', @meta = @meta


--document
DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('driving_license', 'Driving license'),('id_card', 'ID card'),('passport', 'Passport'),('profile', 'Profile'),('proof_of_address', 'Proof of address'),('signature', 'Signature'),('other', 'Other')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'documentType', @meta = @meta



MERGE INTO [core].[itemType] AS target
USING
    (VALUES        
        ('cbs', 'cbs', 'cbs', 'cbs', 'cbsId', 'cbsId'),
        ('country', 'country', 'country', 'country', 'countryId', 'countryId')
    ) AS source (name, alias, [description], [table], keyColumn, nameColumn)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT (name, alias, [description], [table], keyColumn, nameColumn)
VALUES (name, alias, [description], [table], keyColumn, nameColumn);

DECLARE @itemTypeId INT
--translation cbs
IF NOT EXISTS ( SELECT * FROM [core].[itemName] WHERE itemName = 'cbs')
BEGIN
	SELECT @itemtypeid = itemtypeid from [core].[itemType] where name = 'cbs'
	INSERT INTO [core].[itemName]([itemTypeId], [itemName], [itemCode])  VALUES (@itemtypeid, 'cbs', 'cbs')
END

-- translation country
IF NOT EXISTS ( SELECT * FROM [core].[itemName] WHERE itemName = 'country')
BEGIN
	SELECT @itemtypeid = itemtypeid from [core].[itemType] where name = 'country'
	INSERT INTO [core].[itemName]([itemTypeId], [itemName], [itemCode])  VALUES (@itemtypeid, 'country', 'country')
END


IF NOT EXISTS ( SELECT * FROM [core].[itemType] WHERE name = 'rejectReason')
  INSERT INTO [core].[itemType]([name], [alias], [description], [table], [keyColumn], [nameColumn])  VALUES ('rejectReason', 'rejectReason', 'rejectReason', NULL, NULL, NULL)

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemCode, itemNameTranslation) VALUES 
('Generalization Failed on Finger:L1', 'Generalization Failed on Finger:L1', 'Generalization Failed on Left Thumb Finger'),
('Generalization Failed on Finger:L2', 'Generalization Failed on Finger:L2', 'Generalization Failed on Left Index Finger'),
('Generalization Failed on Finger:L3', 'Generalization Failed on Finger:L3', 'Generalization Failed on Left Middle Finger'),
('Generalization Failed on Finger:L4', 'Generalization Failed on Finger:L4', 'Generalization Failed on Left Ring Finger'),
('Generalization Failed on Finger:L5', 'Generalization Failed on Finger:L5', 'Generalization Failed on Left Little Finger'),
('Generalization Failed on Finger:R1', 'Generalization Failed on Finger:R1', 'Generalization Failed on Right Thumb Finger'),
('Generalization Failed on Finger:R2', 'Generalization Failed on Finger:R2', 'Generalization Failed on Right Index Finger'),
('Generalization Failed on Finger:R3', 'Generalization Failed on Finger:R3', 'Generalization Failed on Right Middle Finger'),
('Generalization Failed on Finger:R4', 'Generalization Failed on Finger:R4', 'Generalization Failed on Right Ring Finger'),
('Generalization Failed on Finger:R5', 'Generalization Failed on Finger:R5', 'Generalization Failed on Right Little Finger'),
('FPScanner.general.error', 'FPScanner.general.error', 'Fingerprint scanner problem. Restart UTFingerprint service or unplug/plug the device.')

exec core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'text', @meta = @meta


if not exists(select * from core.itemType where name = 'actionType')
    insert into core.itemType(name, alias, description)
    values ('actionType', 'actionType', 'actionType')

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemSyncId, itemName, itemNameTranslation) VALUES ('', 'customer.activity', 'Check Recent Activity')
INSERT INTO @itemNameTranslationTT(itemSyncId, itemName, itemNameTranslation) VALUES ('', 'identity.register', 'Activation')
INSERT INTO @itemNameTranslationTT(itemSyncId, itemName, itemNameTranslation) VALUES ('', 'customer.serviceCall', 'Call Customer Service')
INSERT INTO @itemNameTranslationTT(itemSyncId, itemName, itemNameTranslation) VALUES ('', 'identity.login', 'Login')
INSERT INTO @itemNameTranslationTT(itemSyncId, itemName, itemNameTranslation) VALUES ('', 'identity.forgottenPassword', 'Forgot Pass')
INSERT INTO @itemNameTranslationTT(itemSyncId, itemName, itemNameTranslation) VALUES ('', 'identity.passwordChange', 'Password Change')
INSERT INTO @itemNameTranslationTT(itemSyncId, itemName, itemNameTranslation) VALUES ('', 'customer.checkBalance', 'Check Balance')

exec core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = null, @itemType = 'actionType', @meta = @meta

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'screenHeader')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('screenHeader', 'screenHeader', 'screenHeader', null, 'itemCode', 'itemName')
END

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Audit & headquarters', 'Audit & headquarters', 'Audit & headquarters')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Compliance', 'Compliance', 'Compliance')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Branch management', 'Branch management', 'Branch management')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Portfolio management', 'Portfolio management', 'Portfolio management')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Client service', 'Client service', 'Client service')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = null, @itemType = 'screenHeader', @meta = @meta


IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'regexInfo')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('regexInfo', 'regexInfo', 'regexInfo', NULL, 'itemCode', 'itemName')
END

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('requireLowerCase', 'requireLowerCase', 'a lowercase letter')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('requireUpperCase', 'requireUpperCase', 'an uppercase letter')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('requireDigits', 'requireDigits', 'a digit')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('requireSpecialCharacters', 'requireSpecialCharacters', 'a special character (@, #, &, etc.)')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('allowSpace', 'allowSpace', 'a space')

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('Your password must be between', 'Your password must be between', 'Your password must be between')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('and', 'and', 'and')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('characters long', 'characters long', 'characters long')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('must contain', 'must contain', 'must contain')
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('should contain', 'should contain', 'should be comprised of the following types of characters')

EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'regexInfo', @meta = @meta

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'error')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('error', 'error', 'error', NULL, 'itemCode', 'itemName')
END

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('core', 'ut-core core error', 'ut-core core error'), ('core.throttle', 'ut-core rejected request due to receiving too many requests within a short period of time, please try again later', 'ut-core rejected request due to receiving too many requests within a short period of time, please try again later'), ('core.noItemTypeID', 'Item type with this @itemTypeId not found', 'Item type with this @itemTypeId not found'), ('core.noItemNameID', 'Item name with this @itemNameId not found', 'Item name with this @itemNameId not found'), ('core.noLanguageID', 'Language with this @languageId not found', 'Language with this @languageId not found'), ('core.itemNameIdRequired', '@itemNameId is required for edit', '@itemNameId is required for edit'), ('core.itemNameCannotBeEdited', 'itemName cannot be edited', 'itemName cannot be edited'), ('core.typeCannotBeEdited', 'itemType cannot be edited', 'itemType cannot be edited'),('customer', 'ut-customer customer error', 'ut-customer customer error'), ('customer.personNotSingle', 'Parameter @person missing or not an object', 'Parameter @person missing or not an object'), ('customer.actorIdRequired', 'Parameter @actorId is required', 'Parameter @actorId is required'), ('customer.nameRequired', 'First name and last name are required', 'First name and last name are required'), ('customer.disabledOrDeletedOrganization', 'Security violation. Parent organization is disabled or deleted', 'Security violation. Parent organization is disabled or deleted'), ('customer.organizationDataNotSingle', 'Parameter @organization missing or not an object', 'Parameter @organization missing or not an object'), ('customer.cannotLockHasOrganizations', 'Cannot lock organization. There are active organizations assigned to this organization', 'Cannot lock organization. There are active organizations assigned to this organization'), ('customer.cannotLockHasUsers', 'Cannot lock organization. There are active users assigned to this organization', 'Cannot lock organization. There are active users assigned to this organization'), ('customer.cannotLockHasRoles', 'Cannot lock organization. There are active roles visible for this organization', 'Cannot lock organization. There are active roles visible for this organization'), ('customer.cannotDeleteHasOrganizations', 'Cannot delete organization. There are active organizations assigned to this organization', 'Cannot delete organization. There are active organizations assigned to this organization'), ('customer.cannotDeleteHasUsers', 'Cannot delete organization. There are active users assigned to this organization', 'Cannot delete organization. There are active users assigned to this organization'), ('customer.cannotDeleteHasRoles', 'Cannot delete organization. There are active roles visible for this organization', 'Cannot delete organization. There are active roles visible for this organization'), ('customer.jointDataNotSingle', 'Parameter @joint missing or not an object', 'Parameter @joint missing or not an object'), ('customer.customerDataNotSingle', 'Parameter @customer missing or not an object', 'Parameter @customer missing or not an object'), ('customer.personJointOrganizationDataRequired', 'Invalid data. At least one of the parameters @personData, @jointData, @organizationData is required', 'Invalid data. At least one of the parameters @personData, @jointData, @organizationData is required'), ('customer.missingCountry', 'Missing country', 'Missing country'), ('customer.missingCbsId', 'Missing cbsId', 'Missing cbsId'), ('customer.missingCredentials', 'Invalid parameter @phone or @actorId.', 'Invalid parameter @phone or @actorId.'), ('customer.unsupportedActorType', 'Unsupported actor type', 'Unsupported actor type'), ('customer.missingNationality', 'Person nationality is missing', 'Person nationality is missing'), ('user', 'ut-user user error', 'ut-user user error'), ('identity.expiredOtp', 'OTP has expired', 'OTP has expired'), ('identity.invalidOtp', 'Invalid OTP', 'Invalid OTP'), ('identity.missingOtpDevice', 'Missing OTP device', 'Missing OTP device'), ('user.missingNewPassword', 'Parameter @newPassword is required', 'Parameter @newPassword is required'), ('user.hashExpired', 'User hash has expired', 'User hash has expired'), ('user.hashLocked', 'User hash is locked', 'User hash is locked'), ('user.hashNotSingle', 'Parameter @hash missing or not an object', 'Parameter @hash missing or not an object'), ('user.missingCredentials', 'Missing credentials', 'Missing credentials'), ('user.wrongPassword', 'Invalid username or password', 'Invalid username or password'), ('user.disabledUserInactivity', 'User is locked because of inactivity', 'User is locked because of inactivity'), ('user.disabledCredentials', 'User is locked', 'User is locked'), ('user.missingPolicy', 'Missing policy', 'Missing policy'), ('user.invalidLoginTime', 'Login for this user is restricted during this time', 'Login for this user is restricted during this time'), ('user.hashNotFound', 'Hash not found', 'Hash not found'), ('user.notFound', 'User not found', 'User not found'), ('user.expiredPassword', 'Password has expired', 'Password has expired'), ('user.securityViolation', 'This action is not allowed for this user', 'This action is not allowed for this user'), ('user.invalidCredentials', 'Invalid credentials', 'Invalid credentials'), ('user.noValidPhonesFound', 'No phones found', 'No phones found'), ('user.roleIdNotFound', 'Role with this @copyFrom does not exist', 'Role with this @copyFrom does not exist'), ('user.recursion', 'Security violation. Endless loop in role inheritance detected', 'Security violation. Endless loop in role inheritance detected'), ('user.invalidRoles', 'Security violation. Disabled or deleted roles to assign', 'Security violation. Disabled or deleted roles to assign'), ('user.cannotDeleteRoleHasUsers', 'Cannot delete role as it has users assigned it.', 'Cannot delete role as it has users assigned it.'), ('user.cannotDeleteRoleHasRoles', 'Cannot delete role as it has roles assigned to it.', 'Cannot delete role as it has roles assigned to it.'), ('user.disabledOrDeletedOrganization', 'Security violation. Disabled or deleted business unit', 'Security violation. Disabled or deleted business unit'), ('user.roleSelfAssigned', 'You cannot assign a role to yourself.', 'You cannot assign a role to yourself.'), ('user.roleNotAllowed', 'No permission for assigned roles', 'No permission for assigned roles'), ('user.cannotLockRoleHasUsers', 'Cannot lock role as it has users assigned to it.', 'Cannot lock role as it has users assigned to it.'), ('user.cannotLockRoleHasRoles', 'Cannot lock role as it has roles assigned to it.', 'Cannot lock role as it has roles assigned to it.'), ('user.invalidSession', 'Invalid session', 'Invalid session'), ('user.missingBu', 'Please assign at least one business unit', 'Please assign at least one business unit'), ('user.missingDefaultRole', 'Default role is required.', 'Default role is required.'), ('user.wrongDefaultBuId', 'Security violation. Default BU is not among the assigned BUs', 'Security violation. Default BU is not among the assigned BUs'), ('user.wrongDefaultRoleId', 'Security violation. Default role is not among the assigned roles', 'Security violation. Default role is not among the assigned roles'), ('user.invalidUsername', 'Username does not comply with access policy requirements', 'Username does not comply with access policy requirements'), ('user.cannotDeleteSA', 'User sa cannot be deleted', 'User sa cannot be deleted'), ('user.cannotDeleteUser', 'User cannot be deleted', 'User cannot be deleted'), ('user.actorIdRequired', 'Parameter actorId is required in @user', 'Parameter actorId is required in @user'), ('user.actorIsDeleted', 'User is deleted', 'User is deleted'), ('user.cannotEditSA', 'User sa cannot be edited', 'User sa cannot be edited'), ('user.cannotEditUser', 'User cannot be edited. They are pending approval', 'User cannot be edited. They are pending approval'), ('user.cannotLockSA', 'User sa cannot be locked', 'User sa cannot be locked'), ('user.cannotLockUser', 'Cannot lock user. They are pending approval', 'Cannot lock user. They are pending approval'), ('policy', 'User Policy error', 'User Policy error'), ('policy.disabledCredentials', 'User is locked', 'User is locked'), ('policy.param', 'User Policy params error', 'User Policy params error'), ('policy.param.bio.fingerprints', 'Switch to bio', 'Switch to bio'), ('policy.param.otp', 'Switch to otp', 'Switch to otp'), ('policy.param.password', 'Switch to password', 'Switch to password'), ('policy.param.username', 'Username required', 'Username required'), ('policy.param.newPassword', 'Password change required', 'Password change required'), ('policy.term', 'User Term error', 'User Term error'), ('policy.term.userHasBio', 'Missing bio', 'Missing bio'), ('policy.term.!userHasBio', 'User has bio, but no bio is reqired for this term', 'User has bio, but no bio is reqired for this term'), ('policy.term.!bioAttemptsAbove', 'Login retries exceeded', 'Login retries exceeded'), ('policy.term.checkBio', 'Wrong fingerprints, please try again', 'Wrong fingerprints, please try again'), ('policy.term.!passwordAttemptsAbove', 'Login retries exceeded', 'Login retries exceeded'), ('policy.term.checkPassword', 'Wrong password, please try again', 'Wrong password, please try again'), ('policy.term.checkOTP', 'Wrong OTP, please try again', 'Wrong OTP, please try again'), ('policy.term.noValidPhonesFound', 'No phones assigned', 'No phones assigned'), ('policy.term.wrongOtpIdentifier', 'No default phone found', 'No default phone found'), ('policy.term.otpExpired', 'You have entered an expired OTP', 'You have entered an expired OTP'), ('policy.term.!otpAttemptsAbove', 'Login retries exceeded', 'Login retries exceeded'),('policy.policyNotSingle', 'Not single policy is provided', 'Not single policy is provided'), ('policy.emptyInputNotAllowed', 'Field is required', 'Field is required'), ('policy.priorityNotUnique', 'The priority you entered is already used. Priority should be unique.', 'The priority you entered is already used. Priority should be unique.'), ('policy.nameNotUnique', 'The policy name you entered is already used. Policy name should be unique.', 'The policy name you entered is already used. Policy name should be unique.'), ('policy.inconsistentMinMax', 'You have entered inconsistent username or password limits', 'You have entered inconsistent username or password limits'), ('policy.inconsistentCredentials', 'Bio terms are used in the policy, but enrollment credentials are not set', 'Bio terms are used in the policy, but enrollment credentials are not set'), ('policy.inconsistentFactorsOrTerms', 'Inconsistent or missing factors, terms or conditions', 'Inconsistent or missing factors, terms or conditions'), ('policy.policyIdRequired', 'Missing policyId', 'Missing policyId'), ('policy.policyIdNotFound', 'Wrong policyId', 'Wrong policyId'), ('policy.policyIsDeleted', 'The policy you are trying to edit is deleted', 'The policy you are trying to edit is deleted'), ('policy.cannotDeleteHasActors', 'Access policy cannot be deleted, because is already assigned', 'Access policy cannot be deleted, because is already assigned'), ('user.missingUsername', 'Missing username. Username is required', 'Missing username. Username is required'), ('user.wrongGenericTypeUser', 'The user should not be generic', 'The user should not be generic'), ('user.externalUserNotAssignedToTheExternalSystem', 'The user is not assigned to the external system', 'The user is not assigned to the external system'), ('user.notOneExternalUser', 'No external user was found', 'No external user was found'), ('user.externalUserPendingApproval', 'Your external user credentials are pending approval. Please contact an Admin to approve your external user', 'Your external user credentials are pending approval. Please contact an Admin to approve your external user'), ('user.duplicatedExternalSystemCredential', 'The External System credentials you are trying to add are already used', 'The External System credentials you are trying to add are already used'), ('user.moreThanOneCredentialsToTheExternalSystem', 'You are trying to add more than one credential to one external system', 'You are trying to add more than one credential to one external system'), ('user.duplicatedUsername', 'Username already exists. Please choose a different username', 'Username already exists. Please choose a different username'), ('user.genericUserNotFound', 'Generic user not found', 'Generic user not found'), ('user.externalSystemNotAllowedForThisUser', 'You have no permissions to access the external system', 'You have no permissions to access the external system'), ('user.cannotDeleteHasActiveMember', 'Cannot complete the action for the generic user because it has at least one active member', 'Cannot complete the action for the generic user because it has at least one active member'), ('user.genericUserNotAllInformation', 'Missing required information for updating the generic user', 'Missing required information for updating the generic user'), ('user.invalidExternalUserIdPassed', 'Invalid external user ID is provided', 'Invalid external user ID is provided'), ('user.theLoggedUserCanNotAssignedToTheExternalSystem', 'The logged user cannot be assigned to the external system', 'The logged user cannot be assigned to the external system'), ('user.identity', 'User identity error', 'User identity error' ), ('user.identity.forgottenPassword', 'ut-user user.identity.forgottenPassword error', 'ut-user user.identity.forgottenPassword error' ), ('user.identity.forgottenPassword.notFound', 'Hash not found', 'Hash not found' ), ('user.identity.forgottenPassword.expiredPassword', 'Password has expired', 'Password has expired' ), ('user.identity.forgottenPassword.invalidCredentials', 'Invalid credentials', 'Invalid credentials' ), ('user.identity.forgottenPassword.param.newPassword', 'Invalid credentials', 'Invalid credentials' ), ('user.identity.forgottenPassword.param', 'ut-user user.identity.forgottenPassword.param error', 'ut-user user.identity.forgottenPassword.param error' ), ('user.identity.forgottenPasswordValidate', 'ut-user user.identity.forgottenPasswordValidate error', 'ut-user user.identity.forgottenPasswordValidate error' ), ('user.identity.forgottenPasswordValidate.notFound', 'Hash not found', 'Hash not found' ), ('user.identity.forgottenPasswordValidate.expiredPassword', 'Password has expired', 'Password has expired' ), ('user.identity.forgottenPasswordValidate.invalidCredentials', 'Invalid credentials', 'Invalid credentials' ), ('user.identity.registerPasswordValidate', 'ut.user user.identity.registerPasswordValidate error', 'ut.user user.identity.registerPasswordValidate error' ), ('user.identity.registerPasswordValidate.notFound', 'User not found', 'User not found' ), ('user.identity.registerPasswordValidate.expiredPassword', 'Password has expired', 'Password has expired' ), ('user.identity.registerPasswordValidate.invalidCredentials', 'Invalid credentials', 'Invalid credentials' ), ('user.identity.registerPasswordChange', 'ut.user user.identity.registerPasswordChange error', 'ut.user user.identity.registerPasswordChange error' ), ('user.identity.registerPasswordChange.notFound', 'User not found', 'User not found' ), ('user.identity.registerPasswordChange.expiredPassword', 'Password has expired', 'Password has expired' ), ('user.identity.registerPasswordChange.invalidCredentials', 'Invalid credentials', 'Invalid credentials' ),('document', 'ut-document document error', 'ut-document document error'),('user.permissionObjects.check', 'ut-user user.permissionObjects.check error', 'ut-user user.permissionObjects.check error'),('identity.wrongIP', 'Wrong IP address', 'Wrong IP address'),('policy.policy', 'Policy error', 'Policy error'),('user.invalidChannel', 'User cannot log in from this channel', 'User cannot log in from this channel'),('identity', 'Identity', 'Identity'),('identity.missingCredentials', 'Missing credentials', 'Missing credentials'),('identity.invalidCredentials', 'Invalid credentials', 'Invalid credentials'),('identity.hashParams', 'No hash params', 'No hash params'),('identity.actorId', 'No actorId param', 'No actorId param'),('identity.term', 'ut-identity identity.term error', 'ut-identity identity.term error'),('identity.term.invalidNewPassword', 'Invalid new password', 'Invalid new password'),('identity.term.matchingPrevPassword', 'Invalid new password. Your new password matches one of your previous passwords.', 'Invalid new password. Your new password matches one of your previous passwords.'),('identity.expiredPassword', 'Your password has expired! Please contact the system administrator.', 'Your password has expired! Please contact the system administrator.'),('identity.disabledUserInactivity', 'Your account has been locked because of inactivity! Please contact the system administrator.', 'Your account has been locked because of inactivity! Please contact the system administrator.'),('identity.disabledUser', 'Your account has been locked! Please contact the system administrator.', 'Your account has been locked! Please contact the system administrator.'),('identity.disabledCredentials', 'Your credentials have been disabled! Please contact the system administrator.', 'Your credentials have been disabled! Please contact the system administrator.'),('identity.sessionExpired', 'ut-identity identity.sessionExpired error', 'ut-identity identity.sessionExpired error'),('identity.invalidFingerprint', 'ut-identity identity.invalidFingerprint error', 'ut-identity identity.invalidFingerprint error'),('identity.credentialsLocked', 'ut-identity identity.credentialsLocked error', 'ut-identity identity.credentialsLocked error'),('identity.wrongPassword', 'ut-identity identity.wrongPassword error', 'ut-identity identity.wrongPassword error'),('identity.existingIdentifier', 'ut-identity identity.existingIdentifier error', 'ut-identity identity.existingIdentifier error'),('identity.restrictedRange', 'IP is in the restricted range', 'IP is in the restricted range'),('identity.crypt', 'ut-identity identity.crypt error', 'ut-identity identity.crypt error'),('identity.notFound', 'Identity not found.', 'Identity not found.'),('identity.multipleResults', 'ut-identity identity.multipleResults error', 'ut-identity identity.multipleResults error'),('identity.systemError', 'ut-identity identity.systemError error', 'ut-identity identity.systemError error'),('identity.throttleError', 'After several attempts, the registration has been locked, please start again in 60 min.', 'After several attempts, the registration has been locked, please start again in 60 min.'),('identity.throttleErrorForgotten', 'After several attempts, the password change has been locked, please start again in 60 min.', 'After several attempts, the password change has been locked, please start again in 60 min.'),('alert', 'ut-alert error', 'ut-alert error'),('alert.messageNotExists', 'Message does not exist', 'Message does not exist'),('alert.messageInvalidStatus', 'Invalid message status', 'Invalid message status'),('alert.missingCreatorId', 'Missing credentials', 'Missing credentials'),('alert.templateNotFound', 'Unable to find a template that matches the parameters', 'Unable to find a template that matches the parameters'),('alert.fieldValueInvalid', 'ut-alert invalid field error', 'ut-alert invalid field error'),('alert.fieldMissing', 'ut-alert missing field', 'ut-alert missing field')


EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'error', @meta = @meta

--secretQuestion

IF NOT EXISTS (SELECT * FROM [core].[itemType] WHERE [name] = 'secretQuestion')
BEGIN
    INSERT INTO [core].[itemType]([alias], [name],[description],[table],[keyColumn],[nameColumn])
    VALUES('secretQuestion', 'secretQuestion', 'secretQuestion', NULL, 'itemCode', 'itemName')
END

DELETE FROM @itemNameTranslationTT
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What is the first and last name of your first boyfriend or girlfriend?', 'What is the first and last name of your first boyfriend or girlfriend?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('Which phone number do you remember most from your childhood?', 'Which phone number do you remember most from your childhood?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What was your favorite place to visit as a child?', 'What was your favorite place to visit as a child?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('Who is your favorite actor, musician, or artist?', 'Who is your favorite actor, musician, or artist?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What is the name of your favorite pet?', 'What is the name of your favorite pet?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('In what city were you born?', 'In what city were you born?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What high school did you attend?', 'What high school did you attend?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What is the name of your first school?', 'What is the name of your first school?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What is your favorite movie?', 'What is your favorite movie?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What is your mother''s maiden name?', 'What is your mother''s maiden name?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What street did you grow up on?', 'What street did you grow up on?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What was the make of your first car?', 'What was the make of your first car?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('When is your anniversary?', 'When is your anniversary?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What is your favorite color?', 'What is your favorite color?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What is your father''s middle name?', 'What is your father''s middle name?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('What is the name of your first grade teacher?', 'What is the name of your first grade teacher?')
INSERT INTO @itemNameTranslationTT(itemName, itemNameTranslation) VALUES ('Which is your favorite web browser?', 'Which is your favorite web browser?')
 
EXEC core.[itemNameTranslation.upload]  @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId, @organizationId = NULL, @itemType = 'secretQuestion', @meta = @meta
