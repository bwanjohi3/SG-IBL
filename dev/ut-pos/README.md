# POS module

## Scope
This module should support various POS through ISO8583 protocol

### Integrations
Implement the logic for handling POS operations, while integrating with the following modules
* Card transactions pre-processing module (ut-ctp)
* Transfer module (ut-transfer)

### Message types
The module should support the following message types:
* respond to key exchange messages for loading TPK in the terminal (message X800, field 70=164)
* respond to echo messages
* respond to ISO 8583 financial request messages
* respond to transaction reversal messages

### Processing codes
The module should handle the following processing codes:
* **00**XXYY - Sale
* **01**XXYY - Cash withdraw
* **21**XXYY - Cash deposit
* **31**XXYY - Balance inquiry
* **38**XXYY - Mini statement
* **40**XXYY - Funds transfer
* **41**XXYY - Top up
* **50**XXYY - Bill payment
* **92**XXYY - Cardless transfer
* **93**XXYY - Cardless withdrawal
* **954000** - Destination account listing for funds transfer to own account
* **954001** - Destination account listing for funds transfer to account in same bank
* **954002** - Destination account listing for funds transfer to account in other bank
* **954100** - Top up provider list
* **954101** - Top up phone list
* **955000** - Bill/loan payment provider list
* **955001** - Bill/loan payment invoice/loan list
* **96**XXYY - PIN change
* **99**XXYY - Source account listing

### Account types
The module should handle the following account types (XX/YY positions in the processing code):
* **10** - Savings
* **20** - Current / cheque
* **38** - Loan

### Special card numbers
The module should treat the following card number prefixes as special:
* **9999990000** - cardless transaction
* **9999999999** - card for access to auditing / reporting functionality

### Fields
The standard ISO8583 fields meaning or the following special meaning of fields should be handled:
* **0** - primary bitmap
* **2** - card number
* **3** - XXYYZZ, where
* **4** - amount in cents
* **7** - date and time
* **11** - system trace audit number
* **12** - time
* **13** - date
* **32** - acquirer code = 637079
* **35** - track2 from card
* **41** - POS ID (user defined)
* **42** - POS Serial number
* **43** - POS name and location (user defined optional value)
* **47** - Text to be printed, lines delimited with CRLF (in financial response messages X210)
  **48** - New device TPK in key exchange response (message type X810) or during account listing response (message type X210, opcode = 99XXYY)
* **49** - ISO currency code
* **52** - pin block, using ISO 9564-1 - format 0
* **60** - pin block of the new PIN, using ISO 9564-1 - format 0 (only needed for PIN change)
* **63** - Selected accounts from POS in format: sourceAccount,destinationAccount/provider:phone/provider:invoice
* **62** - Text to be displayed, lines delimited with CRLF (in financial response messages X210)
* **102** - source account
  - if sent as 1 or 2 digits, we will pick the account from the list of accounts linked to the card. The list is filtered based on type of account that was sent in field 3. The value sent in field 102/103 determines the account index in this list.
  - if more than 2 digits are sent, we are going to interpret the field as the actual account number
* **103** - destination account
  - if sent as 1 or 2 digits, we will pick the account from the list of accounts linked to the card. The list is filtered based on type of account that was sent in field 3. The value sent in field 102/103 determines the account index in this list.
  - if more than 2 digits are sent, we are going to interpret the field as the actual account number

### Error codes
