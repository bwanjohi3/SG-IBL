import {connect} from 'react-redux';
import {ByProduct} from '../../../../components/Filters/ByProduct';
import {set as onSelect} from './actions';
import {fetch} from '../../../../components/Filters/ByProduct/actions';

export default connect(
    ({cardInUseFilterByCardProduct, cardFilterByCardProduct, utCardStatusAction}) => {
        return {
            data: cardFilterByCardProduct.get('data'),
            ownershipId: utCardStatusAction.get('ownershipIdOwn').toJS(),
            value: cardInUseFilterByCardProduct.get('value'),
            menuAutoWidth: true
        };
    },
    {onSelect, fetch}
)(ByProduct);
