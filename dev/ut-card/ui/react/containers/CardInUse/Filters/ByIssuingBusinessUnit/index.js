import {connect} from 'react-redux';
import {ByBusinessUnit} from '../../../../components/Filters/ByBusinessUnitSelect';
import {fetch} from '../../../../components/Filters/ByBusinessUnitSelect/actions';
import {set as onSelect} from './actions';

export default connect(
    ({cardInUseFilterByIssuingBusinessUnit, cardsFilterByBusinessUnitSelect}) => {
        return {
            placeholder: 'Issuing Business Unit',
            data: cardsFilterByBusinessUnitSelect.get('units'),
            value: cardInUseFilterByIssuingBusinessUnit.get('value'),
            menuAutoWidth: true
        };
    },
    {fetch, onSelect}
)(ByBusinessUnit);
