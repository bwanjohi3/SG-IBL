import {connect} from 'react-redux';
import ByIssuingBusinessUnit from '../../../../components/Filters/ByIssuingBusinessUnit';
import {updateUnit as onSelect, fetch} from './actions';

export default connect(
    (state) => {
        return {
            data: state.cardApplicationsFilterByIssuingBusinessUnit.get('data'),
            value: state.cardApplicationsFilterByIssuingBusinessUnit.get('value'),
            menuAutoWidth: true
        };
    },
    {onSelect, fetch}
)(ByIssuingBusinessUnit);
