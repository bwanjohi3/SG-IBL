import {connect} from 'react-redux';
import {AccountsGridSummary} from '../../../../components/AccountsGrid/Summary';
import {link, unLink, setDefault} from './actions';
import {availableAccountsFields, linkedAccountsFields} from './../../helpers';
import {getVisibleAccounts} from './../../../helpers';

const widgetNumberingColumn = 'accountTypeName';

const AccountsGrid = connect(
    (state, ownProps) => {
        let visibleAvailableAccountsFields = getVisibleAccounts(availableAccountsFields, state.cardConfig.getIn(['application', 'accounts', 'available']));
        let visibleLinkedAccountsFields = getVisibleAccounts(linkedAccountsFields, state.cardConfig.getIn(['application', 'accounts', 'linked']));
        let selectedProductId = state.cardNoNameApplicationCreate.getIn(['productId']);
        let cardProductList = state.cardNoNameApplicationCreate.getIn(['cardProducts']);
        let selectedProduct = cardProductList && cardProductList.toJS().filter(p => p.key ===  selectedProductId).pop();
        let maxAllowedLinkedAccounts = (selectedProduct && selectedProduct.accountLinkLimit) || 0;
        return {
            data: state.cardNoNameApplicationAccounts.get('data').toJS(),
            linkedAs: state.cardNoNameApplicationAccounts.get('linkedAs').toJS(),
            fetched: state.cardNoNameApplicationAccounts.get('fetched'),
            withTopMargin: true,
            availableAccountsFields: visibleAvailableAccountsFields,
            linkedAccountsFields: visibleLinkedAccountsFields,
            widgetNumberingColumn,
            changeId: state.cardNoNameApplicationAccounts.get('changeId'),
            cardId: 0,
            canLinkMoreAccounts: maxAllowedLinkedAccounts > state.cardNoNameApplicationAccounts.getIn(['data', 'linked']).size,
            hasAccountsError: state.cardNoNameApplicationAccounts.getIn(['errors', 'hasAccountsError']),
            hasLinkedAccountsError: state.cardNoNameApplicationAccounts.getIn(['errors', 'hasLinkedAccountsError']),
            hasPrimaryAccountError: state.cardNoNameApplicationAccounts.getIn(['errors', 'hasPrimaryAccountError'])
        };
    },
    {link, unLink, setDefault}
)(AccountsGridSummary);

export default AccountsGrid;
