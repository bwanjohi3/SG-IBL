import {connect} from 'react-redux';
import ClearFilter from './../../../../components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let show = state.cardReasonFilterByModule.get('value') ||
            state.cardReasonFilterByAction.get('value') > 0 ||
            state.cardReasonFilterByStatus.get('value') >= 0 ||
            state.cardReasonFilterByReasonName.get('value');

        return {
            show: !!show
        };
    },
    {onClick}
)(ClearFilter);
