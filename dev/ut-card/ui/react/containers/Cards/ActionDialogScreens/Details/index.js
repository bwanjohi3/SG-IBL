import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import CardDocuments from './Documents';

import CurrentStatus from '../../../../components/CurrentStatus';
import ActionButtons from '../../ActionButtons';
import {AccountsGrid} from '../../../../components/AccountsGrid';
import Accordion from '../../../../components/Accordion';
import ActionDialog from '../../../../components/ActionDialog';

import Text from 'ut-front-react/components/Text';
import TextField from 'ut-front-react/components/Input/TextField';
import TextArea from 'ut-front-react/components/Input/TextArea';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import DateFormatter from 'ut-front-react/containers/DateFormatter';

import { toggleCardDetails, fetchCard } from './actions';

import style from './style.css';

class CardDetails extends Component {
    constructor(props) {
        super(props);
        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
        this.getHeaderContent = this.getHeaderContent.bind(this);
        this.getCardInformation = this.getCardInformation.bind(this);
        this.getLinkedAccountsContent = this.getLinkedAccountsContent.bind(this);
        this.getDocumentAttachmentsContent = this.getDocumentAttachmentsContent.bind(this);
    }
    componentWillMount() {
        let id = (this.props.selected.getIn([0, 'cardId']) || this.props.checked.getIn([0, 'cardId'])) | 0;
        if (id) {
            this.props.fetchCard(id);
        }
    }

    handleTransformCellValue(value, field, data) {
        if (field.name === 'key') {
            return <Text>{value}</Text>;
        }
        return value;
    };

    // Header and status bar for the current card;
    getHeaderContent() {
        let card = this.props.card.get('data');
        let allocationContent;

        if (card.get('statusLabel') === 'PendingAllocation') {
            let creationBranchName = card.get('creationBranchName');
            let targetBranchName = card.get('targetBranchName');

            allocationContent = (
                <div className={style.allocationContent}>
                    <TextField label='From Business Unit' value={creationBranchName} readOnly />
                    <TextField label='To Business Unit' value={targetBranchName} readOnly />
                </div>
            );
        }

        let reasonText = card.get('reasonText');
        let reasonComment = card.get('comments');

        let rejectContent = reasonText && (
            <div className={style.rejectContent}>
                <TextField label='Reason' value={reasonText} readOnly />
                {reasonComment && <TextArea label='Comment' value={reasonComment} readonly />}
            </div>
        );

        return (
            <div>
                <div className={style.statusWrap}>
                    <CurrentStatus statusId={card.get('statusId')} details page={'card'} />
                </div>
                {(allocationContent || rejectContent) &&
                <div className={style.additionalHeaderContent}>
                    {rejectContent}
                    {allocationContent}
                </div>}
            </div>
        );
    }
    // Card information grid
    getCardInformation() {
        let cardData = this.props.card.get('data');

        let gridFields = [
            {name: 'key', title: 'key', style: {fontWeight: 'bold', width: '40%'}},
            {name: 'value', title: 'Value', style: {width: '60%'}}
        ];

        let gridData;
        if (cardData.get('cardHolderName')) {
            gridData = [
                {id: 'customerName', key: 'Customer Name', value: cardData.get('customerName')},
                {id: 'personName', key: 'Person Name', value: cardData.get('personName')},
                {id: 'customerNumber', key: 'Customer Number', value: cardData.get('customerNumber')},
                {id: 'customerType', key: 'Customer Type', value: cardData.get('customerType')},
                {id: 'cardProduct', key: 'Card Product', value: cardData.get('productName')},
                {id: 'cardNumber', key: 'Card Number', value: cardData.get('cardNumber')},
                {id: 'cardholderName', key: 'Cardholder Name', value: cardData.get('cardHolderName')},
                {id: 'creationBranchName', key: 'Current Business Unit', value: cardData.get('creationBranchName')},
                {id: 'targetBranchName', key: 'Target Business Unit', value: cardData.get('targetBranchName')},
                {id: 'expirationDate', key: 'Expiry Date', value: <DateFormatter>{cardData.get('expirationDate')}</DateFormatter>},
                {id: 'updatedOn', key: 'Last Modified On', value: <DateFormatter>{cardData.get('updatedOn')}</DateFormatter>},
                {id: 'batchName', key: 'Batch Name', value: cardData.get('batchName')}
            ];
        } else {
            gridData = [
                {id: 'productName', key: 'Card Product', value: cardData.get('productName')},
                {id: 'cardNumber', key: 'Card Number', value: cardData.get('cardNumber')},
                {id: 'creationBranchName', key: 'Current Business Unit', value: cardData.get('creationBranchName')},
                {id: 'targetBranchName', key: 'Target Business Unit', value: cardData.get('targetBranchName')},
                {id: 'expirationDate', key: 'Expiry Date', value: <DateFormatter>{cardData.get('expirationDate')}</DateFormatter>},
                {id: 'batchName', key: 'Batch Name', value: cardData.get('batchName')}
            ];
        }

        return (
            <Accordion title={<Text> Card Information </Text>}>
                <SimpleGrid
                  hideHeader
                  mainClassName='dataGridTableDetailTable'
                  externalStyle={style}
                  fields={gridFields}
                  transformCellValue={this.handleTransformCellValue}
                  data={gridData.filter(f => { return this.props.config.get('fields').indexOf(f.id) > -1; })}
                />
            </Accordion>
        );
    }

    getDocumentAttachmentsContent() {
        let { card } = this.props;

        if (card.get('attachments').size > 0) {
            return (<CardDocuments withTopMargin />);
        }
        return null;
    }

    getLinkedAccountsContent() {
        let { card } = this.props;

        let linkedAccounts = card.get('accounts');
        if (!linkedAccounts.size) {
            return null;
        }
        return (
            <Accordion title={<Text> Linked Accounts </Text>}>
                <AccountsGrid
                  data={linkedAccounts.toJS()}
                  fields={[
                      {name: 'accountTypeName', style: {width: 'auto'}},
                      {name: 'accountNumber', style: {width: 'auto'}},
                      {name: 'currency', style: {width: '20%'}}]}
                  widgetNumberingColumn='accountTypeName'
                  widgetNumberingActionColumn='isPrimary'
                  handleWidgetField={() => {}}
                  withTopMargin
                />
            </Accordion>
        );
    }

    render() {
        let { card } = this.props;
        if (!card.get('data').size) {
            return null;
        }

        let title = 'Card Details';
        let header = this.getHeaderContent();
        let actions = ([<ActionButtons />]);
        let content = (
            <div>
                { this.getCardInformation() }
                { this.getDocumentAttachmentsContent() }
                { this.getLinkedAccountsContent() }
            </div>
        );

        return (
            <ActionDialog
              actions={actions}
              title={title}
              header={header}
              open={this.props.open}
              onClose={this.props.toggleCardDetails}
              externalMainContentWrapClass={style.contentWrap}>
                {content}
            </ActionDialog>
        );
    }
}

CardDetails.propTypes = {
    // data
    config: PropTypes.object.isRequired,
    card: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    checked: PropTypes.object.isRequired, // immutable list
    selected: PropTypes.object.isRequired, // immutable map
    // actions
    toggleCardDetails: PropTypes.func.isRequired,
    fetchCard: PropTypes.func.isRequired
};

export default connect(({ cardManagementGrid, cardDetailsPopup, cardRelocationPopup, cardConfig }) => ({
    config: cardConfig.getIn(['cards', 'details']),
    checked: cardManagementGrid.get('checked'),
    selected: cardManagementGrid.get('selected'),
    card: cardDetailsPopup.get('card'),
    open: cardDetailsPopup.get('open')
}),
{toggleCardDetails, fetchCard})(CardDetails);
