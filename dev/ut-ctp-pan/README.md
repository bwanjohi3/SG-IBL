# Card transactions pre-processing module for cardholder data encryption

## Scope

1. Implement card management functions that depend on card number
   * Card number generation
   * Export of files used for card production
1. Handle mapping between card and card ID in import / export scenarios related to transaction reconciliation

## Public API

The module exposes the following methods:

### ```pan.number.generate({panLength, count, checkSum, start, prefix, cipher})``` - generate, encrypt and store a sequence of card numbers

* ```panLength``` - length of the card number
* ```start``` - start value of the sequence
* ```count``` - count to generate
* ```checkSum``` - check sum algorithm to use; pass 'luhn' or true to use Luhn algorithm
* ```prefix``` - card number prefix
* ```cipher``` - encryption algorithm

### ```pan.number.encrypt({card})``` - encrypt a card number

* ```card``` - card number to encrypt

### ```pan.generateAndPrintPin.list({pans, pinLength, pinMailerFormat})``` - generate PINs and print them on print mailers

* ```pans``` - array of {pan, cipher, pvk, decimalisation} objects, holding encrypted card data
* ```pinLength``` - length of the generated PINs
* ```pinMailerFormat``` - PIN mailer format to pass to the HSM

### ```pan.generateCvv.list(pans)``` - generate CVV for list of cards

* ```pans``` - array of {cardId, pan, cipher, cvk, expirationDate, serviceCode, cvv1, cvv2, icvv, cavv} objects, holding encrypted card data and flags (cvv1, cvv2, icvv, cavv) indicating withc CVV to generate

### ```pan.production.map({file})``` - decrypt fields in a card production file and save result in temp file

* ```file``` - file name of the card production file

### ```pan.key.encrypt({key, cipher})``` - encrypt a key

* ```key``` - key to encrypt
* ```cipher``` - cipher to use

### ```pan.generateThreeComponentZmk({component1, component2, component3})``` - form a Zone Master Key(ZMK) from clear components

* ```component1```, ```component2```, ```component3``` - clear components to use

### ```pan.genKey({mode, keyType, keyScheme, keyZmkTmkFlag, keyZmkTmk, keyScheme1, cipher})``` - generate key at the HSM

* ```mode``` - see HSM docs
* ```keyType``` - see HSM docs
* ```keyScheme``` - see HSM docs
* ```keyZmkTmkFlag``` - see HSM docs
* ```keyZmkTmk``` - see HSM docs
* ```keyScheme1``` - see HSM docs
* ```cipher``` - cipher to use when encrypting the resulting key

### ```pan.genKcv({kcvType, key, cipher})``` - generate key check value

* ```kcvType``` - see HSM docs
* ```key``` - see HSM docs (encrypted)
* ```cipher``` - cipher used for encrypting key field

### ```pan.generateArqc({modeFlag, schemeId, mkac, ivac, panSeqNo, branchHeightParams, atc, transactionData, arqc, arc, csu, pad})``` - generate response cryptoram

* ```modeFlag``` - see HSM docs
* ```schemeId``` - see HSM docs
* ```mkac``` - see HSM docs
* ```ivac``` - see HSM docs
* ```panSeqNo``` - see HSM docs
* ```branchHeightParams``` - see HSM docs
* ```atc``` - see HSM docs
* ```transactionData``` - see HSM docs
* ```arqc``` - see HSM docs
* ```arc``` - see HSM docs
* ```csu``` - see HSM docs
* ```pad``` - see HSM docs

### ```pan.translateBdkZmkLmk({zmk, bdk})``` -

* ```zmk``` -
* ```bdk``` -

### ```pan.translateBdkLmkZmk({zmk, bdk})``` -

* ```zmk``` -
* ```bdk``` -

### ```pan.importKey({keyType, zmk, keyA32, keyScheme})``` - import a key

* ```keyType``` - see HSM docs
* ```zmk``` - see HSM docs
* ```keyA32``` - see HSM docs
* ```keyScheme``` - see HSM docs

## Private API

### ```pan.offset.get({track2, pinKey, pinBlock, pinBlockNew, keyType})``` - lookup card, calculate PIN offset and encrypt sensitive fields

* ```track2``` -
* ```pinKey``` -
* ```pinBlock``` -
* ```pinBlockNew``` -
* ```keyType``` -
