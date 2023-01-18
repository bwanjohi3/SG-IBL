import {connect} from 'react-redux';
import {ByStatus} from '../../../../components/Filters/ByStatus';
import {updateStatus as updateCardStatus} from './actions';

export default connect(
    (state) => {
        return {
            data: state.cardBinsFilterByStatus.get('data').toJS(),
            value: state.cardBinsFilterByStatus.get('value')
        };
    },
    {updateCardStatus}
)(ByStatus);
