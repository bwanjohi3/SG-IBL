var { filterElementTypes } = require('ut-front-react/components/GridToolBox/types');

module.exports = (gridStyle) => ({
    title: 'SMS Alerts',
    export: {
        method: 'card.report.queueOutFetch',
        resultsetName: 'messages',
        maxSize: 20000
    },
    grid: {
        fields: [
            {name: 'id', title: 'ID'},
            {name: 'recipient', title: 'Recipient'},
            {name: 'content', title: 'Content'},
            {name: 'createdon', title: 'Date Created'},
            {name: 'status', title: 'Status'},
            {name: 'messageInId', title: 'MNO Message ID'}
        ],
        allowColumnConfig: true,
        method: 'card.report.queueOutFetch',
        resultsetName: 'messages',
        externalStyle: gridStyle
    },
    toolbox: {
        showAdvanced: true,
        maxVisibleInputs: 3,
        filterAutoFetch: false
    },
    filters: [
        {labelFrom: 'Created From', labelTo: 'Created To', nameMap: {from: 'createdFromDate', to: 'createdToDate'}, type: filterElementTypes.datePickerBetween},
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
