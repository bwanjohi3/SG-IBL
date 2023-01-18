import {connect} from 'react-redux';
import ClearFilter from './../../../../components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let show = state.cardApplicationsFilterByCardType.get('value') ||
            state.cardApplicationsFilterByStatus.get('value') ||
            state.cardApplicationsFilterByProduct.get('value') ||
            state.cardApplicationsFilterByIssuingBusinessUnit.get('value') ||
            (state.cardApplicationsFilterByCustomSearch.get('field') && state.cardApplicationsFilterByCustomSearch.get('value'));
        return {
            show: !!show
        };
    },
    {onClick}
)(ClearFilter);
