import {connect} from 'react-redux';
import {AccountsGridSummary} from '../../../../../components/AccountsGrid/Summary';
import {link, unLink, setDefault} from './actions';
import {availableAccountsFields, linkedAccountsFields} from './../../../helpers';
import {getVisibleAccounts} from './../../../../helpers';

const widgetNumberingColumn = 'accountTypeName';

const AccountsGrid = connect(
    (state, ownProps) => {
        let visibleAvailableAccountsFields = getVisibleAccounts(availableAccountsFields, state.cardConfig.getIn(['application', 'accounts', 'available']));
        let visibleLinkedAccountsFields = getVisibleAccounts(linkedAccountsFields, state.cardConfig.getIn(['application', 'accounts', 'linked']));
        let selectedProductId = state.cardApplicationDetails.getIn(['productId']);
        let cardProductList = state.cardApplicationDetails.getIn(['cardProducts'])
        let selectedProduct = cardProductList && cardProductList.toJS().filter(p => p.key ===  selectedProductId).pop();
        let maxAllowedLinkedAccounts = (selectedProduct && selectedProduct.accountLinkLimit) || 0;
        //let maxAllowedLinkedAccounts = state.cardApplicationDetails.getIn(['products', '0', 'accountLinkLimit']) || 0;
        return {
            data: state.cardApplicationDetailsAccounts.get('data').toJS(),
            linkedAs: state.cardApplicationDetailsAccounts.get('linkedAs').toJS(),
            readOnly: ownProps.readOnly,
            withTopMargin: true,
            availableAccountsFields: visibleAvailableAccountsFields,
            linkedAccountsFields: visibleLinkedAccountsFields,
            widgetNumberingColumn,
            changeId: state.cardApplicationDetailsAccounts.get('changeId'),
            cardId: 0,
            canLinkMoreAccounts: maxAllowedLinkedAccounts > state.cardApplicationDetailsAccounts.getIn(['data', 'linked']).size,
            hasAccountsError: state.cardApplicationDetailsAccounts.getIn(['errors', 'hasAccountsError']),
            hasLinkedAccountsError: state.cardApplicationDetailsAccounts.getIn(['errors', 'hasLinkedAccountsError']),
            hasPrimaryAccountError: state.cardApplicationDetailsAccounts.getIn(['errors', 'hasPrimaryAccountError'])
        };
    },
    {link, unLink, setDefault}
)(AccountsGridSummary);

export default AccountsGrid;
