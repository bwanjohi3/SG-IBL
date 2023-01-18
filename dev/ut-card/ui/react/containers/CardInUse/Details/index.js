import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import {link, unLink, setDefault} from './AccountList/actions';
import ActionButtons from '../ActionButtons';
import CardInUseDocument from './Documents';

import ActionDialog from '../../../components/ActionDialog';
import Accordion from '../../../components/Accordion';
import CurrentStatus from '../../../components/CurrentStatus';
import {AccountsGridSummary} from '../../../components/AccountsGrid/Summary';

import Text from 'ut-front-react/components/Text';
import TextField from 'ut-front-react/components/Input/TextField';
import TextArea from 'ut-front-react/components/Input/TextArea';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import DateFormatter from 'ut-front-react/containers/DateFormatter';

import {close} from './actions';
import {getVisibleAccounts} from './../../helpers';

import style from './style.css';
const availableAccountsFields = [
    {name: 'accountTypeName', style: {width: 'auto'}},
    {name: 'accountNumber', style: {width: 'auto'}},
    {name: 'currency', style: {width: '15%'}},
    {name: 'methodOfOperationId', style: {width: 'auto'}}
];
const linkedAccountsFields = [
    {name: 'accountTypeName', style: {width: 'auto'}},
    {name: 'accountNumber', style: {width: 'auto'}},
    {name: 'currency', style: {width: '15%'}},
    {name: 'methodOfOperationId', style: {width: 'auto'}}
];
const AccountsGrid = connect(
    (state, ownProps) => {
        let visibleAvailableAccountsFields = getVisibleAccounts(availableAccountsFields, state.cardConfig.getIn(['cardsInUse', 'accounts', 'available']));
        let visibleLinkedAccountsFields = getVisibleAccounts(linkedAccountsFields, state.cardConfig.getIn(['cardsInUse', 'accounts', 'linked']));
        let maxAllowedLinkedAccounts = state.cardInUseDetails.getIn(['cardInfo', '0', 'accountLinkLimit']) || 0;
        return {
            data: ((state.cardInUseAccount && state.cardInUseAccount.get('data')) || Map()).toJS(),
            linkedAs: state.cardInUseAccount.get('linkedAs').toJS(),
            changeId: state.cardInUseAccount.get('changeId'),
            cardId: state.cardInUseDetails.get('id'),
            availableAccountsFields: visibleAvailableAccountsFields,
            linkedAccountsFields: visibleLinkedAccountsFields,
            canLinkMoreAccounts: maxAllowedLinkedAccounts > state.cardInUseAccount.getIn(['data', 'linked']).size,
            hasAccountsError: state.cardInUseUpdatePopup.getIn(['errors', 'hasAccountsError']),
            hasLinkedAccountsError: state.cardInUseUpdatePopup.getIn(['errors', 'hasLinkedAccountsError']),
            hasPrimaryAccountError: state.cardInUseUpdatePopup.getIn(['errors', 'hasPrimaryAccountError']),
            withTopMargin: ownProps.withTopMargin
        };
    },
    {link, unLink, setDefault}
)(AccountsGridSummary);

class cardInUseDetail extends Component {
    constructor(props) {
        super(props);
        this.getStyle = this.getStyle.bind(this);
        this.state = {
            disabled: ['Update']
        };

        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
    }
    getStyle(name) {
        return this.props.externalStyle[name] || this.context.implementationStyle[name] || style[name];
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.editChangeId !== this.props.editChangeId) {
            this.setState({
                disabled: ['Deactivate', 'ResetPINRetries', 'Hot', 'GeneratePIN']
            });
        }
    }

    handleTransformCellValue(value, field, data) {
        if (field.name === 'key') {
            return <Text>{value}</Text>;
        }
        return value;
    };

    render() {
        let details = (this.props.state.getIn(['cardInfo', 0]) || Map()).toJS();

        let contentReadOnly = !this.context.checkPermission('card.cardInUse.statusUpdateEdit') || this.props.statusMap.toJS().findIndex((status) => {
            return status.fromStatusId === details.statusId && status.actionLabel === 'Update';
        }) === -1;

        let reasonText = details.reasonText;
        let reasonComment = details.comments;

        let rejectContent = reasonText && (
            <div className={style.rejectContent}>
                <TextField label='Reason' value={reasonText} readOnly />
                {reasonComment && <TextArea label='Comment' value={reasonComment} readonly />}
            </div>
        );

        let title = 'Details';
        let header = (
            <div>
                <div className={style.statusWrap}>
                    <CurrentStatus statusId={details.statusId} page='cardInUse' details />
                </div>
                {rejectContent &&
                <div className={style.additionalHeaderContent}>
                    {rejectContent}
                </div>}
            </div>
        );
        let actions = ([<ActionButtons disabled={this.state.disabled} />]);

        let gridFields = [
            {name: 'key', title: 'key', style: {fontWeight: 'bold', width: '40%'}},
            {name: 'value', title: 'Value', style: {width: '60%'}}
        ];
        let gridData = [
            {id: 'customerName', key: 'Customer Name', value: details.customerName},
            {id: 'personName', key: 'Person Name', value: details.personName},
            {id: 'customerNumber', key: 'Customer Number', value: details.customerNumber},
            {id: 'customerType', key: 'Customer Type', value: details.customerType},
            {id: 'cardholderName', key: 'Cardholder Name', value: details.cardHolderName},
            {id: 'cardNumber', key: 'Card Number', value: details.cardNumber},
            {id: 'activationDate', key: 'Activation Date', value: <DateFormatter>{details.activationDate}</DateFormatter>},
            {id: 'expirationDate', key: 'Expiry Date', value: <DateFormatter>{details.expirationDate}</DateFormatter>},
            {id: 'creationBranchName', key: 'Current Business Unit', value: details.creationBranchName},
            {id: 'batchName', key: 'Batch Name', value: details.batchName}
        ];

        return (
            <ActionDialog
              title={title}
              header={header}
              open={this.props.opened}
              actions={actions}
              externalMainContentWrapClass={style.contentWrap}
              onClose={this.props.close} >
                <Accordion title={<Text>Card Information</Text>}>
                    <SimpleGrid
                      hideHeader
                      mainClassName='dataGridTableDetailTable'
                      externalStyle={style}
                      fields={gridFields}
                      transformCellValue={this.handleTransformCellValue}
                      data={gridData.filter(f => { return this.props.config.get('fields').indexOf(f.id) > -1; })} />
                </Accordion>

                <CardInUseDocument readOnly={contentReadOnly} withTopMargin />

                <AccountsGrid readOnly={contentReadOnly}
                  availableAccountsFields={[{name: 'accountTypeName', title: 'Available Accounts', style: {width: '45%'}}, {name: 'availableBalance', style: {width: '45%'}}]}
                  linkedAccountsFields={[{name: 'accountTypeName', title: 'Linked Accounts', style: {width: '45%'}}, {name: 'availableBalance', style: {width: '45%'}}]}
                  widgetNumberingColumn='accountTypeName'
                  withTopMargin />
            </ActionDialog>
        );
    }
};

cardInUseDetail.propTypes = {
    config: PropTypes.object.isRequired,
    externalStyle: PropTypes.object,
    opened: PropTypes.bool.isRequired,
    state: PropTypes.object.isRequired,
    close: PropTypes.func.isRequired,
    statusMap: PropTypes.object.isRequired, // immutable
    editChangeId: PropTypes.number.isRequired
};

cardInUseDetail.defaultProps = {
    externalStyle: {}
};

cardInUseDetail.contextTypes = {
    implementationStyle: PropTypes.object,
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    (state, ownProps) => {
        return {
            config: state.cardConfig.getIn(['cardsInUse', 'details']),
            state: state.cardInUseDetails,
            opened: state.cardInUseDetails.get('id') > 0,
            statusMap: state.utCardStatusAction.get('state-cardInUse'),

            editChangeId: state.cardInUseDocument.get('changeId') +
                        state.cardInUseAccount.get('changeId')
        };
    },
    {close}
)(cardInUseDetail);
