import {connect} from 'react-redux';
import {ByBusinessUnit} from '../../../../components/Filters/ByBusinessUnitSelect';
import {set as onSelect} from './actions';

export default connect(
    ({cardManagementFiltersWrapper, cardManagementFilterByIssuingBusinessUnit}) => {
        return {
            placeholder: 'Issuing Business Unit',
            data: cardManagementFiltersWrapper.get('units'),
            value: cardManagementFilterByIssuingBusinessUnit.get('value'),
            menuAutoWidth: true
        };
    },
    {onSelect}
)(ByBusinessUnit);
