import {connect} from 'react-redux';
import GridToolbox from 'ut-front-react/components/SimpleGridToolbox';
import {toggle} from './actions';

export const ToolboxFilters = connect(
    (state) => {
        let hasCheckedItems = state.cardTypeGrid.get('checkedRows').size > 0;

        return {
            opened: hasCheckedItems ? state.cardTypeToolbox.getIn(['filters', 'opened']) : true,
            title: hasCheckedItems ? 'Show Buttons' : 'Filter By',
            isTitleLink: hasCheckedItems
        };
    },
    {toggle}
)(GridToolbox);

export const ToolboxButtons = connect(
    (state) => {
        let hasCheckedItems = state.cardTypeGrid.get('checkedRows').size > 0;

        return {
            opened: hasCheckedItems ? state.cardTypeToolbox.getIn(['buttons', 'opened']) : false,
            title: 'Show Filters',
            isTitleLink: hasCheckedItems
        };
    },
    {toggle}
)(GridToolbox);
