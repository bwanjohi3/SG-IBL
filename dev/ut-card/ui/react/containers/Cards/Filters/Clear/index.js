import {connect} from 'react-redux';
import ClearFilter from './../../../../components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let show = state.cardManagementFilterByStatus.get('value') > 0 ||
            state.cardManagementFilterByCardProduct.get('value') > 0 ||
            state.cardManagementFilterByIssuingBusinessUnit.get('value') > 0 ||
            state.cardManagementFilterByTargetBusinessUnit.get('value') > 0 ||
            (state.cardManagementFilterByCustomSearch.get('field') && state.cardManagementFilterByCustomSearch.get('value'));
        return {
            show: !!show
        };
    },
    {onClick}
)(ClearFilter);
