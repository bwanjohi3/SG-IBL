import {connect} from 'react-redux';
import {ByStatus} from '../../../../components/Filters/ByStatus';
import {updateCardStatus} from './actions';

export default connect(
    (state) => {
        return {
            data: state.utCardStatusAction.get('filter-application'),
            value: state.cardApplicationsFilterByStatus.get('value'),
            menuAutoWidth: true
        };
    },
    {updateCardStatus}
)(ByStatus);
