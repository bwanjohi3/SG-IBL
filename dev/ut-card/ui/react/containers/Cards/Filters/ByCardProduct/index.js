import {connect} from 'react-redux';
import {ByProduct} from '../../../../components/Filters/ByProduct';
import {set as onSelect} from './actions';
import {fetch} from '../../../../components/Filters/ByProduct/actions';

export default connect(
    ({cardManagementFilterByCardProduct, cardFilterByCardProduct, utCardStatusAction}) => {
        return {
            ownershipId: utCardStatusAction.get('ownershipIdOwn').toJS(),
            data: cardFilterByCardProduct.get('data'),
            value: cardManagementFilterByCardProduct.get('value'),
            menuAutoWidth: true
        };
    },
    {onSelect, fetch}
)(ByProduct);
