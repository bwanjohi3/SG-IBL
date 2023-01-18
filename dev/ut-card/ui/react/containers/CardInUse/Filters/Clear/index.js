import {connect} from 'react-redux';
import {ClearFilter} from '../../../../components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let customSearchValue = state.cardInUseFilterByCustomSearch.get('value') && state.cardInUseFilterByCustomSearch.get('changeId');

        let hasFilterValue = customSearchValue ||
            state.cardInUseFilterByStatus.get('value') > 0 ||
            state.cardInUseFilterByType.get('value') > 0 ||
            state.cardInUseFilterByIssuingBusinessUnit.get('value') > 0 ||
            state.cardInUseFilterByCardProduct.get('value') > 0 ||
            state.cardInUseFilterByCustomSearch.get('value');

        return {
            show: !!hasFilterValue
        };
    },
    {onClick}
)(ClearFilter);
