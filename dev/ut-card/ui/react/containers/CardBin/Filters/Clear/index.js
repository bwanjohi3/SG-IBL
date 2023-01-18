import {connect} from 'react-redux';
import ClearFilter from './../../../../components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let show = state.cardBinsFilterByStatus.get('value') !== '';
        return {
            show: show
        };
    },
    {onClick}
)(ClearFilter);
