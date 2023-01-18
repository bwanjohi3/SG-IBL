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
        }
    },
    cards: {
        grid: {
            fields: ['cardNumber', 'productName', 'currentBranchName', 'targetBranchName', 'issuingBranchName', 'acceptanceDate', 'expirationDate', 'generatedPinMails', 'batchName', 'statusName'],
            orderByFields: ['productName', 'currentBranchName', 'targetBranchName', 'issuingBranchName', 'acceptanceDate', 'expirationDate', 'generatedPinMails', 'batchName', 'statusName']
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
            fields: ['binId', 'description', 'startBin', 'endBin', 'ownershipTypeId', 'isActive'],
            orderByFields: ['binId', 'description', 'startBin', 'endBin', 'ownershipTypeId', 'isActive']
        },
        filters: {
            filterByStatus: true
        }
    }
};
