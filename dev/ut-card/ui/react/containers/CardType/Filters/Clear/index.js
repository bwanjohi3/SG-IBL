import {connect} from 'react-redux';
import ClearFilter from '../../../../components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let show =
            (state.cardTypeStatusFilter.get('isActive') !== '' && state.cardTypeStatusFilter.get('isActive') !== '__placeholder__') ||
            state.cardTypeNameFilter.get('typeName');
        return {
            show: !!show
        };
    },
    {onClick}
)(ClearFilter);
