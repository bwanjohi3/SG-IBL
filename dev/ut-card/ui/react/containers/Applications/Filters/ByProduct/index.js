import {connect} from 'react-redux';
import {ByProduct} from '../../../../components/Filters/ByProduct';
import {updateProduct as onSelect} from './actions';
import {fetch} from '../../../../components/Filters/ByProduct/actions';

export default connect(
    (state) => {
        return {
            ownershipId: state.utCardStatusAction.get('ownershipIdOwn').toJS(),
            data: state.cardFilterByCardProduct.get('data'),
            value: state.cardApplicationsFilterByProduct.get('value'),
            menuAutoWidth: true
        };
    },
    {onSelect, fetch}
)(ByProduct);
