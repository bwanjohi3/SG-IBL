import {connect} from 'react-redux';
import {ByStatus} from '../../../../components/Filters/ByStatus';
import {set as updateCardStatus} from './actions';

export default connect(
    (state, ownProps) => {
        return {
            data: state.utCardStatusAction.get(`filter-cardInUse`) || [],
            value: state.cardInUseFilterByStatus.get('value'),
            menuAutoWidth: true
        };
    },
    {updateCardStatus}
)(ByStatus);
