import {connect} from 'react-redux';
import {ByStatus} from '../../../../components/Filters/ByStatus';
import {set as updateCardStatus} from './actions';

export default connect(
    (state) => {
        return {
            data: state.utCardStatusAction.get('filter-batch') || [],
            value: state.batchesFilterByStatus.get('value')
        };
    },
    {updateCardStatus}
)(ByStatus);
