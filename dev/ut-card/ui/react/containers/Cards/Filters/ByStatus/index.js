import {connect} from 'react-redux';
import {ByStatus} from '../../../../components/Filters/ByStatus';
import {set as updateCardStatus} from './actions';

export default connect(
    ({cardManagementFilterByStatus, utCardStatusAction}) => {
        return {
            data: utCardStatusAction.get('filter-card') || [],
            value: cardManagementFilterByStatus.get('value'),
            menuAutoWidth: true
        };
    },
    {updateCardStatus}
)(ByStatus);
