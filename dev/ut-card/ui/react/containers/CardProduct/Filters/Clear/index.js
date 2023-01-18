import {connect} from 'react-redux';
import ClearFilter from '../../../../components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let show =
            (state.cardProductStatusFilter.get('isActive') !== '' && state.cardProductStatusFilter.get('isActive') !== '__placeholder__') ||
            state.cardProductNameFilter.get('productName');
        return {
            show: !!show
        };
    },
    {onClick}
)(ClearFilter);
