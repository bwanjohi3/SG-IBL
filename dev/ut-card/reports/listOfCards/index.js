var { filterElementTypes } = require('ut-front-react/components/GridToolBox/types');

module.exports = (gridStyle) => ({
    title: 'List of Cards',
    export: {
        method: 'card.report.listOfCards',
        resultsetName: 'newCardsPerPeriod',
        maxSize: 20000
    },
    grid: {
        fields: [
            {name: 'bu', title: 'Business Unit'},
            {name: 'cardNumber', title: 'Card Number'},
            {name: 'clientNumber', title: 'Client Number'},
            {name: 'clientName', title: 'Client Name'},
            {name: 'primaryAccountNumber', title: 'Primary Account Number'},
            {name: 'product', title: 'Product'},
            {name: 'status', title: 'Status'},
            {name: 'createdBy', title: 'Created By'},
            {name: 'createdOn', title: 'Created On'},
            {name: 'activatedBy', title: 'Activated By'},
            {name: 'activatedOn', title: 'Activated On'},
            {name: 'expirationDate', title: 'Expiration Date'},
            {name: 'updatedBy', title: 'Updated By'},
            {name: 'updatedOn', title: 'Updated On'},
            // {name: 'lastTransferDate', title: 'Last Transaction Date'}, // TODO
            {name: 'reason', title: 'Reason'},
            {name: 'description', title: 'Description'}
        ],
        allowColumnConfig: true,
        method: 'card.report.listOfCards',
        resultsetName: 'newCardsPerPeriod',
        externalStyle: gridStyle
    },
    toolbox: {
        showAdvanced: true,
        maxVisibleInputs: 3,
        filterAutoFetch: false
    },
    filters: [
        {
            name: 'statusId',
            label: 'Status',
            placeholder: 'Status',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true,
            dataFetch: {
                method: 'card.status.list',
                resultsetName: ['Card', 'CardInUse'],
                params: {},
                map: {display: 'statusName', value: 'statusId'}
            }
        },
        {
            name: 'branchId',
            label: 'Business Unit',
            placeholder: 'Business Unit',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true,
            dataFetch: {
                method: 'customer.organization.list',
                resultsetName: 'allBranches',
                params: {},
                map: {display: 'organizationName', value: 'actorId'}
            }
        },
        {
            name: 'productId',
            label: 'Product',
            placeholder: 'Product',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true,
            dataFetch: {
                method: 'card.product.list',
                resultsetName: 'product',
                params: {},
                map: {display: 'name', value: 'productId'}
            }
        },
        {labelFrom: 'Created From', labelTo: 'Created To', nameMap: {from: 'createdFromDate', to: 'createdToDate'}, type: filterElementTypes.datePickerBetween},
        {labelFrom: 'Activated From', labelTo: 'Activated To', nameMap: {from: 'activatedFromDate', to: 'activatedToDate'}, type: filterElementTypes.datePickerBetween},
        {labelFrom: 'Expired From', labelTo: 'Expired To', nameMap: {from: 'expirationFromDate', to: 'expirationToDate'}, type: filterElementTypes.datePickerBetween},
        {labelFrom: 'Destructed From', labelTo: 'Destructed To', nameMap: {from: 'destructionFromDate', to: 'destructionToDate'}, type: filterElementTypes.datePickerBetween},
        {type: filterElementTypes.clear, validateFilter: false},
        {type: filterElementTypes.searchBtn, validateFilter: false}
    ],
    order: {
        single: true,
        by: []
    },
    pagination: {
        visiblePages: 10,
        pageSize: 25
    }
});
