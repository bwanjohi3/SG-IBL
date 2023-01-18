import { filterElementTypes } from 'ut-front-react/components/GridToolBox/types';
import reportStyle from '../../assets/static/css/reportStyle.css';
import style from './style.css';

module.exports = (gridStyle) => ({
    title: 'Cash Position',
    export: {
        method: 'db/atm.cashPosition',
        resultsetName: 'cashPosition'
    },
    grid: {
        superHeaders: [
            {title: 'ATM', children: ['terminalId', 'terminalName']},
            {title: 'Cassete 1', children: ['cassette1Denomination', 'cassette1Currency', 'notes1', 'rejected1', 'cassette1TotalAmount']},
            {title: 'Cassete 2', children: ['cassette2Denomination', 'cassette2Currency', 'notes2', 'rejected2', 'cassette2TotalAmount']},
            {title: 'Cassete 3', children: ['cassette3Denomination', 'cassette3Currency', 'notes3', 'rejected3', 'cassette3TotalAmount']},
            {title: 'Cassete 4', children: ['cassette4Denomination', 'cassette4Currency', 'notes4', 'rejected4', 'cassette4TotalAmount']},
            {title: 'Total', children: ['totalAvailable', 'totalRejected', 'total']}
        ],
        fields: [
            {name: 'terminalId', title: 'Id'},
            {name: 'terminalName', title: 'Name'},
            {name: 'cassette1Denomination', title: 'Denomination'},
            {name: 'cassette1Currency', title: 'Currency'},
            {name: 'notes1', title: 'Available'},
            {name: 'rejected1', title: 'Rejected'},
            {name: 'cassette1TotalAmount', title: 'Amount'},
            {name: 'cassette2Denomination', title: 'Denomination'},
            {name: 'cassette2Currency', title: 'Currency'},
            {name: 'notes2', title: 'Available'},
            {name: 'rejected2', title: 'Rejected'},
            {name: 'cassette2TotalAmount', title: 'Amount'},
            {name: 'cassette3Denomination', title: 'Denomination'},
            {name: 'cassette3Currency', title: 'Currency'},
            {name: 'notes3', title: 'Available'},
            {name: 'rejected3', title: 'Rejected'},
            {name: 'cassette3TotalAmount', title: 'Amount'},
            {name: 'cassette4Denomination', title: 'Denomination'},
            {name: 'cassette4Currency', title: 'Currency'},
            {name: 'notes4', title: 'Available'},
            {name: 'rejected4', title: 'Rejected'},
            {name: 'cassette4TotalAmount', title: 'Amount'},
            {name: 'totalAvailable', title: 'Available'},
            {name: 'totalRejected', title: 'Rejected'},
            {name: 'total', title: 'Total'}
        ],
        method: 'db/atm.cashPosition',
        resultsetName: 'cashPosition',
        externalStyle: {...style, ...reportStyle, ...gridStyle},
        allowColumnConfig: true
    },
    toolbox: {
        showAdvanced: false,
        maxVisibleInputs: 3,
        filterAutoFetch: false
    },
    filters: [
        { name: 'terminalId', label: 'Terminal Id', placeholder: 'Terminal Id', type: filterElementTypes.searchBox },
        { name: 'terminalName', label: 'Terminal Name', placeholder: 'Terminal Name', type: filterElementTypes.searchBox },
        {
            name: 'transferCurrency',
            label: 'Currency',
            placeholder: 'Currency',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true,
            dataFetch: {
                method: 'core.itemCode.fetch',
                resultsetName: 'items',
                params: {alias: ['currency']},
                map: {display: 'display', value: 'value'}
            }
        },
        {
            type: filterElementTypes.searchBtn,
            validateFilter: false
        }
    ],
    pagination: {
        visiblePages: 10,
        pageSize: 25
    }
});
