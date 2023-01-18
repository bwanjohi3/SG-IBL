import {connect} from 'react-redux';
import GridToolbox from 'ut-front-react/components/SimpleGridToolbox';
import {toggle} from './actions';

export const ToolboxFilters = connect(
    (state) => {
        let hasCheckedItems = state.batchesGrid.get('checkedBatchItems').size > 0;

        return {
            opened: hasCheckedItems ? state.batchesToolboxToolbox.get('filtersOpened') : true,
            title: hasCheckedItems ? 'Show Buttons' : 'Filter By',
            isTitleLink: hasCheckedItems
        };
    },
    {toggle}
)(GridToolbox);

export const ToolboxButtons = connect(
    (state) => {
        let hasCheckedItems = state.batchesGrid.get('checkedBatchItems').size > 0;

        return {
            opened: hasCheckedItems ? !state.batchesToolboxToolbox.get('filtersOpened') : false,
            title: 'Show Filters',
            isTitleLink: hasCheckedItems
        };
    },
    {toggle}
)(GridToolbox);
