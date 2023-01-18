export const cardConfig = {
    usedCardTypes: 'both', // card types that the company uses. Valid values: 'noNamed', 'named', 'both'
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
        }
    },
    batches: {
        autoGenerateBatchName: false,
        statusFlow: ['New', 'Approved', 'Production', 'Completed'],
        cardsAutoAllocation: null,
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
            fields: ['cardNumber', 'productName', 'currentBranchName', 'targetBranchName', 'issuingBranchName', 'acceptanceDate', 'expirationDate', 'generatedPinMails', 'batchName', 'statusName'],
            orderByFields: ['productName', 'currentBranchName', 'targetBranchName', 'issuingBranchName', 'acceptanceDate', 'expirationDate', 'generatedPinMails', 'batchName', 'statusName']
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
        grid: {
            fields: ['name', 'description', 'startDate', 'endDate', 'embossedTypeName', 'periodicCardFeeName', 'accountLinkLimit', 'pinRetriesLimit', 'isActive'],
            orderByFields: ['name', 'description', 'startDate', 'endDate', 'embossedTypeName', 'periodicCardFeeName', 'accountLinkLimit', 'pinRetriesLimit', 'isActive']
        },
        filters: {
            filterByStatus: true,
            filterByName: true
        }
    },
    cardTypes: {
        grid: {
            fields: ['name', 'description', 'cardBrandName', 'ownershipTypeName', 'issuerId', 'termMonth', 'generateControlDigit', 'isActive'],
            orderByFields: ['name', 'description', 'cardBrandName', 'ownershipTypeName', 'issuerId', 'termMonth', 'generateControlDigit', 'isActive']
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
            fields: ['binId', 'description', 'startBin', 'endBin', 'ownershipTypeName', 'isActive'],
            orderByFields: ['binId', 'description', 'startBin', 'endBin', 'ownershipTypeName', 'isActive']
        },
        filters: {
            filterByStatus: true
        }
    }
};
