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
        let maxAllowedLinkedAccounts = state.cardNameApplicationCreate.getIn(['product', 'productId']) ? state.cardNameApplicationCreate.getIn(['product', 'cardProducts']).find((currentProduct) => {
            let found = currentProduct.get('key') === state.cardNameApplicationCreate.getIn(['product', 'productId']);
            return found;
        }).get('accountLinkLimit') : 0;
        return {
            data: state.cardNameApplicationAccounts.get('data').toJS(),
            linkedAs: state.cardNameApplicationAccounts.get('linkedAs').toJS(),
            fetched: state.cardNameApplicationAccounts.get('fetched'),
            withTopMargin: true,
            availableAccountsFields: visibleAvailableAccountsFields,
            linkedAccountsFields: visibleLinkedAccountsFields,
            widgetNumberingColumn,
            changeId: state.cardNameApplicationAccounts.get('changeId'),
            cardId: 0,
            canLinkMoreAccounts: maxAllowedLinkedAccounts > state.cardNameApplicationAccounts.getIn(['data', 'linked']).size,
            hasAccountsError: state.cardNameApplicationAccounts.getIn(['errors', 'hasAccountsError']),
            hasLinkedAccountsError: state.cardNameApplicationAccounts.getIn(['errors', 'hasLinkedAccountsError']),
            hasPrimaryAccountError: state.cardNameApplicationAccounts.getIn(['errors', 'hasPrimaryAccountError'])
        };
    },
    {link, unLink, setDefault}
)(AccountsGridSummary);

export default AccountsGrid;
