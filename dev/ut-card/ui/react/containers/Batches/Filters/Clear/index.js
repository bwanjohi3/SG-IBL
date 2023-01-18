import {connect} from 'react-redux';
import ClearFilters from './../../../../components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let show = state.batchesFilterByStatus.get('value') ||
                   state.batchesFilterByBatchName.get('value') ||
                   state.batchesFilterByTargetUnit.get('value') ||
                   state.batchesFilterByIssuingUnit.get('value') ||
                   state.batchesFilterByProduct.get('value');
        return {
            show: !!show
        };
    },
    {onClick}
)(ClearFilters);
