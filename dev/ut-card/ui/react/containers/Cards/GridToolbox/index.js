import {connect} from 'react-redux';
import GridToolbox from 'ut-front-react/components/SimpleGridToolbox';
import {toggle} from './actions';

export const ToolboxFilters = connect(
    ({cardManagementGridToolbox, cardManagementGrid}) => {
        let hasCheckedItems = cardManagementGrid.get('checked').size > 0;

        return {
            opened: hasCheckedItems ? cardManagementGridToolbox.getIn(['filters', 'opened']) : true,
            title: hasCheckedItems ? 'Show Buttons' : 'Filter By',
            isTitleLink: hasCheckedItems
        };
    },
    {toggle}
)(GridToolbox);

export const ToolboxButtons = connect(
    ({cardManagementGridToolbox, cardManagementGrid}) => {
        let hasCheckedItems = cardManagementGrid.get('checked').size > 0;

        return {
            opened: hasCheckedItems ? cardManagementGridToolbox.getIn(['buttons', 'opened']) : false,
            title: 'Show Filters',
            isTitleLink: hasCheckedItems
        };
    },
    {toggle}
)(GridToolbox);
