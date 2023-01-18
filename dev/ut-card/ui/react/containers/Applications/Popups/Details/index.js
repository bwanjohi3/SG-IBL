import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import Dialog from 'material-ui/Dialog';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import DateFormatter from 'ut-front-react/containers/DateFormatter';
import Text from 'ut-front-react/components/Text';
import Input from 'ut-front-react/components/Input';
import TextArea from 'ut-front-react/components/Input/TextArea';
import DetailsButtons from './Buttons';
import EditableContent from './EditableContent';
import CurrentStatus from './../../../../components/CurrentStatus';
import Accordion from './../../../../components/Accordion';
import Upload from './Uploads';
import AccountsGrid from './AccountsGrid';
import {closeDetailsDialog} from './actions';

import {getDialogTitle, titleStyle, actionsStyle} from './../../../../components/ActionDialog/helpers';
import dialogStyles from './../../../../components/ActionDialog/style.css';

import style from './style.css';
import commonStyles from './../../style.css';

const fields = [{
    name: 'key',
    title: 'key',
    style: {
        fontWeight: 'bold', width: '40%'
    }
}, {
    name: 'value',
    title: 'Value',
    style: {
        width: '60%'
    }
}];

const actions = [
    <DetailsButtons />
];

export class ApplicationDetails extends Component {
    handleTransformCellValue(value, field, data, isHeader) {
        if (data.key === value) {
            return <Text>{value}</Text>;
        }
        return value;
    }
    getGridData() {
        let isName = this.props.nameType === 'named';
        let cardInfoData = this.props.cardInfoData;
        let gridData = [ // by default data is for name application
            {id: 'productName', key: 'Card Product', value: cardInfoData.productName},
            {id: 'customerName', key: 'Customer Name', value: cardInfoData.customerName},
            {id: 'cardNumber', key: 'Card Number', value: cardInfoData.cardnumber},
            {id: 'customerType', key: 'Customer Type', value: cardInfoData.customerType},
            {id: 'personName', key: 'Person Name', value: cardInfoData.personName},
            {id: 'holderName', key: 'Cardholder Name', value: cardInfoData.holderName},
            {id: 'customerNumber', key: 'Customer Number', value: cardInfoData.customerNumber},
            {id: 'issuingBranchName', key: 'Card Issuing BU', value: cardInfoData.issuingBranchName},
            {id: 'applicationId', key: 'Application Number', value: cardInfoData.applicationId},
            {id: 'targetBranchName', key: 'Target Business Unit', value: cardInfoData.targetBranchName},
            {id: 'batchName', key: 'Batch Name', value: cardInfoData.batchName},
            {id: 'createdOn', key: 'Created On', value: <DateFormatter>{cardInfoData.createdOn}</DateFormatter>},
            {id: 'makerComments', key: 'Maker Comment', value: cardInfoData.makerComments}
        ];
        if (!isName) {
            gridData = [
                {id: 'productName', key: 'Card Product', value: cardInfoData.productName},
                {id: 'customerName', key: 'Customer Name', value: cardInfoData.customerName},
                {id: 'cardnumber', key: 'Card Number', value: cardInfoData.cardnumber},
                {id: 'customerType', key: 'Customer Type', value: cardInfoData.customerType},
                {id: 'personName', key: 'Person Name', value: cardInfoData.personName},
                {id: 'customerNumber', key: 'Customer Number', value: cardInfoData.customerNumber},
                {id: 'applicationId', key: 'Application Number', value: cardInfoData.applicationId},
                {id: 'createdOn', key: 'Created On', value: <DateFormatter>{cardInfoData.createdOn}</DateFormatter>},
                {id: 'makerComments', key: 'Maker Comment', value: cardInfoData.makerComments}
            ];
        }

        return gridData.filter(f => { return this.props.config.get('fields').indexOf(f.id) > -1; });
    }
    getDialogTitleLabel() {
        let dialogTitleLabel = '';
        if (this.props.nameType === 'named') {
            dialogTitleLabel = 'Name Card Application Details';
        } else if (this.props.nameType === 'noNamed') {
            dialogTitleLabel = 'No Name Card Application Details';
        }
        return dialogTitleLabel;
    }
    render() {
        let {cardReasons, statusLabel, status} = this.props;
        let showAccounts = statusLabel !== 'Completed';
        let dialogTitleLabel = this.getDialogTitleLabel();
        // TODO: add permissions
        let editable = this.props.applicationsState.find((appState) => {
            return appState.get('fromStatusId') === this.props.statusId && appState.get('actionLabel') === 'Update';
        });
        let hasReasons = !!cardReasons.reasonText;
        let header = <div className={classnames(style.headerWrap, style.containerSideAlignings)}>
            <div className={classnames(commonStyles.rowPaddings, {[commonStyles.borderBottom]: hasReasons})}>
                <CurrentStatus statusId={this.props.statusId} page='application' status={status} details />
            </div>
            {hasReasons && <div className={style.rejectContent}>
                <div className={classnames(commonStyles.rowPaddings, style.reasonWrapper, {[commonStyles.borderBottom]: cardReasons.comments})}>
                    <Input label={<Text>Reason</Text>} value={cardReasons.reasonText} boldLabel readonly />
                </div>

                {cardReasons.comments && <div className={classnames(commonStyles.rowPaddings, style.reasonCommentWrapper)}>
                    <TextArea label={<Text>Comment</Text>} rows='3' value={cardReasons.comments} readonly />
                </div>}
            </div>}
        </div>;
        let gridData = this.getGridData();
        return (
            <Dialog
              open={this.props.isOpen}
              title={getDialogTitle(dialogTitleLabel, this.props.closeDetailsDialog)}
              titleStyle={titleStyle}
              bodyStyle={{padding: '0px', minHeight: '80px'}}
              actionsContainerStyle={actionsStyle}
              actions={actions}
            >
                {header}
                <div className={classnames(style.contentWrapper, {[style.contentWrapperSmall]: cardReasons.comments})}>
                    <div className={dialogStyles.mainContent}>
                        <Accordion title='Card Information'>
                             {!editable && <SimpleGrid
                               hideHeader
                               mainClassName='dataGridTableDetailTable'
                               externalStyle={style}
                               fields={fields}
                               transformCellValue={this.handleTransformCellValue}
                               data={gridData}
                            />}
                            {editable && <EditableContent editable={!!editable} />}
                        </Accordion>
                        <Upload withTopMargin readOnly={!editable} />
                        {showAccounts && <AccountsGrid withTopMargin readOnly={!editable} />}
                    </div>
                </div>
            </Dialog>
        );
    }
}

ApplicationDetails.propTypes = {
    config: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    statusId: PropTypes.node.isRequired,
    statusLabel: PropTypes.string,
    status: PropTypes.object,
    cardReasons: PropTypes.object.isRequired,
    nameType: PropTypes.string.isRequired,
    cardInfoData: PropTypes.object.isRequired,
    applicationsState: PropTypes.object.isRequired,
    closeDetailsDialog: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    let status = state.utCardStatusAction.get('filter-application').length ? undefined : {name: state.cardApplicationDetails.getIn(['data', 'statusName']), label: state.cardApplicationDetails.getIn(['data', 'statusLabel'])};

    return {
        config: state.cardConfig.getIn(['application', 'details']),
        isOpen: state.cardApplicationDetails.get('open'),
        statusId: state.cardApplicationDetails.getIn(['data', 'statusId']) || '',
        statusLabel: state.cardApplicationDetails.getIn(['data', 'statusLabel']) || '',
        status: status,
        cardReasons: {
            reasonText: state.cardApplicationDetails.getIn(['data', 'reasonText']) || '',
            comments: state.cardApplicationDetails.getIn(['data', 'comments'])
        },
        nameType: state.cardApplicationDetails.getIn(['data', 'nameType']) || '',
        cardInfoData: {
            customerName: state.cardApplicationDetails.getIn(['data', 'customerName']),
            cardnumber: state.cardApplicationDetails.getIn(['data', 'cardnumber']),
            personName: state.cardApplicationDetails.getIn(['data', 'personName']),
            holderName: state.cardApplicationDetails.getIn(['data', 'holderName']),
            targetBranchName: state.cardApplicationDetails.getIn(['data', 'targetBranchName']),
            batchName: state.cardApplicationDetails.getIn(['data', 'batchName']),
            customerNumber: state.cardApplicationDetails.getIn(['data', 'customerNumber']),
            issuingBranchName: state.cardApplicationDetails.getIn(['data', 'issuingBranchName']),
            customerType: state.cardApplicationDetails.getIn(['data', 'customerType']),
            productName: state.cardApplicationDetails.getIn(['data', 'productName']),
            applicationId: state.cardApplicationDetails.getIn(['data', 'applicationId']),

            createdOn: state.cardApplicationDetails.getIn(['data', 'createdOn']),
            makerComments: state.cardApplicationDetails.getIn(['data', 'makerComments'])
        },
        applicationsState: state.utCardStatusAction.get('state-application')
    };
}

export default connect(
    mapStateToProps,
    {closeDetailsDialog}
)(ApplicationDetails);
