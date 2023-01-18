import {connect} from 'react-redux';
import {ByBusinessUnit} from '../../../../components/Filters/ByBusinessUnitSelect';
import {set as onSelect} from './actions';

export default connect(
    ({cardManagementFiltersWrapper, cardManagementFilterByTargetBusinessUnit}) => {
        return {
            placeholder: 'Target Business Unit',
            data: cardManagementFiltersWrapper.get('units'),
            value: cardManagementFilterByTargetBusinessUnit.get('value'),
            menuAutoWidth: true
        };
    },
    {onSelect}
)(ByBusinessUnit);
