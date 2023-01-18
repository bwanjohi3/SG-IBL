
# Module ut-card

This module implements card management functions.

## Terms

## Functional requirements

## Module settings

Configuring the front-end of this module should be set in implementation in ui/solution(administration)/config/card.js.

Sample content of card.js is:

```javascript
export const cardConfig = {
    usedCardTypes: 'noNamed',
    application: {
        grid: {
            fields: ['applicationId', 'embossedTypeName', 'personName', 'customerName', 'productName', 'typeName', 'batchName', 'currentBranchName', 'issuingBranchName', 'targetBranchName', 'createdOn', 'statusName'],
            orderByFields: ['applicationId', 'embossedTypeName', 'personName', 'customerName', 'productName', 'typeName', 'batchName', 'currentBranchName', 'issuingBranchName', 'targetBranchName', 'createdOn', 'statusName']
        },
        filters: {
            filterByCardType: true,
            filterByProduct: true,
            filterByIssuingBU: true,
            filterByStatus: true,
            filterByCurrentBU: true,
            filterByCustomSearch: {
                fields: ['customerName', 'customerNumber', 'personName', 'batchName', 'applicationId', 'cardNumber'],
                defaultField: 'customerName'
            }
        },
        details: {
            fields: ['productName', 'customerName', 'customerType', 'personName', 'holderName', 'customerNumber', 'issuingBranchName', 'applicationId', 'targetBranchName', 'batchName', 'createdOn', 'makerComments']
        },
        accounts: {
            available: {
                fields: ['accountTypeName', 'currency', 'accountNumber', 'methodOfOperationId'],
                customStyles: {
                    currency: {width: '15%'}
                }
            },
            linked: {
                fields: ['accountTypeName', 'currency', 'accountNumber', 'methodOfOperationId'],
                customStyles: {
                    currency: {width: '15%'}
                }
            }
        },
        createName: {
            hidePerson: true
        }
    },
    batches: {
        autoGenerateBatchName: false,
        statusFlow: ['New', 'Approved', 'Production', 'Completed'],
        grid: {
            fields: ['batchName', 'targetBranchName', 'issuingBranchName', 'productName', 'numberOfCards', 'generatedPinMails', 'downloads', 'batchDateSent', 'batchDateCreated', 'batchStatus'],
            orderByFields: ['batchName', 'targetBranchName', 'issuingBranchName', 'productName', 'numberOfCards', 'generatedPinMails', 'downloads', 'batchDateSent', 'batchDateCreated', 'batchStatus']
        },
        filters: {
            filterByTargetBU: true,
            filterByIssuingBU: true,
            filterByProduct: true,
            filterByStatus: true,
            filterByBatchName: true
        },
        details: {
            fields: ['batchType', 'batchName', 'numberOfCards', 'typeName', 'targetBranchName', 'issuingBranchName']
        }
    },
    cardsInUse: {
        grid: {
            fields: ['cardNumber', 'personName', 'customerName', 'productName', 'currentBranchName', 'issuingBranchName', 'generatedPinMails', 'activationDate', 'expirationDate', 'statusName'],
            orderByFields: ['personName', 'customerName', 'productName', 'currentBranchName', 'issuingBranchName', 'generatedPinMails', 'activationDate', 'expirationDate', 'statusName']
        },
        filters: {
            filterByProduct: true,
            filterByIssuingBU: true,
            filterByStatus: true,
            filterByCustomSearch: {
                fields: ['customerName', 'customerNumber', 'cardNumber', 'personName'],
                defaultField: 'customerName'
            }
        },
        details: {
            fields: ['customerName', 'personName', 'customerNumber', 'customerType', 'cardholderName', 'activationDate', 'expirationDate', 'creationBranchName', 'batchName']
        },
        accounts: {
            available: {
                fields: ['accountTypeName', 'currency', 'accountNumber', 'methodOfOperationId'],
                customStyles: {
                    currency: {width: '15%'}
                }
            },
            linked: {
                fields: ['accountTypeName', 'currency', 'accountNumber', 'methodOfOperationId'],
                customStyles: {
                    currency: {width: '15%'}
                }
            }
        }
    },
    cards: {
        grid: {
            fields: ['cardNumber', 'productName', 'currentBranchName', 'targetBranchName', 'issuingBranchName', 'expirationDate', 'generatedPinMails', 'batchName', 'statusName'],
            orderByFields: ['productName', 'currentBranchName', 'targetBranchName', 'issuingBranchName', 'expirationDate', 'generatedPinMails', 'batchName', 'statusName']
        },
        details: {
            fields: ['customerName', 'personName', 'customerNumber', 'customerType', 'cardProduct', 'cardholderName', 'creationBranchName', 'targetBranchName', 'expirationDate', 'updatedOn', 'batchName']
        },
        filters: {
            filterByProduct: true,
            filterByTargetBU: true,
            filterByIssuingBU: true,
            filterByStatus: true,
            filterByCustomSearch: {
                fields: ['customerName', 'customerNumber', 'cardNumber', 'personName', 'batchName'],
                defaultField: 'customerName'
            }
        }
    },
    cardProducts: {
        periodicCardFeeOptional: true,
        grid: {
            fields: ['name', 'description', 'startDate', 'endDate', 'cardTypeName', 'embossedTypeName', 'bin', 'cardNumberConstruction', 'isActive'],
            orderByFields: ['name', 'description', 'startDate', 'endDate', 'cardTypeName', 'embossedTypeName', 'bin', 'cardNumberConstruction', 'isActive']
        },
        filters: {
            filterByStatus: true,
            filterByName: true
        }
    },
    cardReasons: {
        grid: {
            fields: ['module', 'actionName', 'reasonName', 'isActive'],
            orderByFields: ['module', 'actionName', 'reasonName', 'isActive']
        },
        filters: {
            filterByModule: true,
            filterByAction: true,
            filterByStatus: true,
            filterByReasonName: true
        }
    },
    cardBins: {
        grid: {
            fields: ['binId', 'bin', 'description', 'isActive'],
            orderByFields: ['binId', 'bin', 'description', 'isActive']
        },
        filters: {
            filterByStatus: true
        }
    }
};
```

#### Common configuration
Configuration that is common for all pages
- 'usedCardTypes' - what kind of cards the company uses
    Valid values are:
    - 'both'
    - 'noNamed'
    - 'named'

#### Shared Configurations
Configurations structure that is the same in some pages:
- 'grid'
    - 'fields' - Used for hiding and showing columns in grid
    - 'orderByFields' - Used for allowing on which columns order can be applied
- 'filters' - Used for hiding and showing filters. For example values see the sample
- 'details' - Used for hiding and showing fields in details popup

#### applications configuration
- 'accounts' - Configures account section in popup.
    - 'available' - object responsible for 'available' accounts subsection configuration
        - 'fields' - Hides and shows columns in 'available' subsection
        - 'customStyles' - Configures inline styles for the columns
    - 'linked' - object responsible for 'linked' accounts subsection configuration
        - 'fields' - Hides and shows columns in 'linked' subsection
        - 'customStyles' - Configures inline styles for the columns
- createName - Configuration for create name application popup.
    - 'hidePerson' hides or shows person field
    
#### batches configuration
- 'autoGenerateBatchName'
    Hides and shows batch name field when creating no name batch. If value is true batch name will be generated and shown after batch creation
- 'statusFlow'
- 'cardsAutoAllocation' - Auto-allocation branch on batch completion
    Valid values are:
    - null (which sets it to the branchId of the batch; the dropdown is hidden)
    - 'branchId'
    - 'targetBranchId'
    - 'issuingBranchId'
    (all three show cards auto-allocation dropdown when completing batch, the option sets which branch of the batch will be selected by default)

#### cardsInUse configuration
- 'accounts' - Same configuration structure as in application

#### cards configuration

#### cardProducts configuration
- 'periodicCardFeeOptional' - If set to true makes periodic card fee field optional instead of required. By default is required.
#### cardReasons configuration

#### cardBins configuration
 
