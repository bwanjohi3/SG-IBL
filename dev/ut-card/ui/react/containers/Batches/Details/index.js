import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
// react components
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import Input from 'ut-front-react/components/Input';
import Text from 'ut-front-react/components/Text';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import TextArea from 'ut-front-react/components/Input/TextArea';
// card components
import CurrentStatus from '../../../components/CurrentStatus';
import ActionStatusButtonsGroup from '../../../components/ActionStatusButtonsGroup';
import ActionStatusLink from '../../../components/ActionStatusLink';
import Accordion from '../../../components/Accordion';
// additional popups
import RejectDetails from '../Reject';
import BatchStatusUpdate from './BatchStatusUpdate';
import BatchDownloadInfo from '../BatchDownloadInfo';
// actions
import {toggleRejectBatchPopup} from '../Reject/actions';
import {toggleStatusUpdatePrompt} from './BatchStatusUpdate/actions';
import {
    fetchCardTypes,
    setTargetBusinessUnit,
    setIssuingBusinessUnit,
    setTypeId,
    setBatchName,
    setNumberOfCards,
    setExcludeButtons,
    download as batchDownload,
    areAllCardsGeneratedUpdate,
    close as handleDetailsClose,
    setErrors,
    setCardsAutoAllocationBusinessUnit
} from './actions';
import {checkDownload, resetState, setDownloadLink} from '../BatchDownloadInfo/actions';
// helpers
import {validateAll, prepareErrors} from '../../../helpers';
import {getCreateValidator, getCreateValidatorName} from './helpers';
import {getBatchValidationRules, getNumberOfCardsValidationRules} from './../helpers';
// styles
import style from './style.css';
import classnames from 'classnames';
import dropdownStyles from './dropdownStyles.css';
import cardAllocationDataStyles from './cardAllocationDataStyles.css';
import cancelStyle from '../../../components/ActionStatusButton/style.css';
import dialogStyles from '../../../components/ActionDialog/style.css';
import {getDialogTitle, titleStyle, actionsStyle} from '../../../components/ActionDialog/helpers';

let cardsAutoAllocationBusinessUnit = null;
// TODO: filter the components by user rights
class BatchDetails extends Component {
    constructor(props) {
        super(props);
        this.setTargetBusinessUnit = this.setTargetBusinessUnit.bind(this);
        this.setIssuingBusinessUnit = this.setIssuingBusinessUnit.bind(this);
        this.setTypeId = this.setTypeId.bind(this);
        this.getDialogComponents = this.getDialogComponents.bind(this);
        this.handleReject = this.handleReject.bind(this);
        this.getHeader = this.getHeader.bind(this);
        this.getGridData = this.getGridData.bind(this);
        this.getCardAllocationData = this.getCardAllocationData.bind(this);
        this.getHighlightedButtons = this.getHighlightedButtons.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handleDetailsClose = this.handleDetailsClose.bind(this);
        this.isFieldAllowed = this.isFieldAllowed.bind(this);
        this.setCardsAutoAllocationBusinessUnit = this.setCardsAutoAllocationBusinessUnit.bind(this);
        this.batchDownload = this.batchDownload.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        // hide main action button if there is any change in editableValues
        // TODO: add initialValues Map() and revert visibility if (current.equals(initial) === true)
        let thisPropsJS = this.props.editableValues.toJS();
        if ((nextProps.batchName !== undefined && thisPropsJS.batchName && nextProps.batchName !== thisPropsJS.batchName) ||
            (nextProps.numberOfCards !== undefined && thisPropsJS.numberOfCards && nextProps.numberOfCards !== thisPropsJS.numberOfCards) ||
            (nextProps.targetBusinessUnit !== undefined && thisPropsJS.targetBusinessUnit && nextProps.targetBusinessUnit !== thisPropsJS.targetBusinessUnit) ||
            (nextProps.issuingBusinessUnit !== undefined && thisPropsJS.issuingBusinessUnit && nextProps.issuingBusinessUnit !== thisPropsJS.issuingBusinessUnit) ||
            (nextProps.typeId !== undefined && thisPropsJS.typeId && nextProps.typeId !== thisPropsJS.typeId)) {
            this.props.setExcludeButtons(true);
        }
        if (!this.props.opened && nextProps.opened) {
            if (nextProps.batchData.nameType === 'noNamed' && this.getIsEditable(nextProps.batchData)) {
                this.props.fetchCardTypes(nextProps.embossedTypeIdNoNamed, nextProps.ownershipIdOwn);
            }
        }
        if (nextProps.areAllCardsGeneratedUpdateInfo.get('do') && nextProps.areAllCardsGeneratedUpdateInfo.get('batchId')) {
            this.props.areAllCardsGeneratedUpdate({
                value: nextProps.areAllCardsGeneratedUpdateInfo.get('value')
            });
            this.props.resetState();
        }
        if (nextProps.areAllCardsGenerated) {
            this.props.setDownloadLink(nextProps.batchData.batchId);
        }
    }
    translate(stringToTranslate) {
        return this.context.translate(stringToTranslate);
    }
    setCardsAutoAllocationBusinessUnit(params) {
        cardsAutoAllocationBusinessUnit = params.value;
    }
    setTargetBusinessUnit(params) {
        this.props.setTargetBusinessUnit(params.value);
    }
    setIssuingBusinessUnit(params) {
        this.props.setIssuingBusinessUnit(params.value);
    }
    setTypeId(params) {
        this.props.setTypeId(params.value);
    }
    setErrors(createErrors) {
        let errorParams = {
            form: createErrors
        };
        this.props.setErrors(errorParams);
    }
    // dialog actions
    batchDownload() {
        if (!this.props.areAllCardsGenerated) {
            this.props.checkDownload(this.props.batchData.batchId, undefined);
        } else {
            this.props.batchDownload();
        }
    }
    handleReject(params) {
        this.props.toggleRejectBatchPopup(params);
    }
    handleDetailsClose() {
        cardsAutoAllocationBusinessUnit = null;
        this.props.resetState();
        this.props.handleDetailsClose();
    }
    handleAction(action) {
        let validation = validateAll(this.props.editableValues, this.props.namedBatch === true ? getCreateValidatorName() : getCreateValidator());
        if (!validation.isValid) {
            let createErrors = prepareErrors(validation.errors);
            this.setErrors(createErrors);
            return;
        };
        if (action.reasonRequired) {
            this.handleReject(action);
        } else if (action.confirmationRequired) {
            if (cardsAutoAllocationBusinessUnit) {
                this.props.setCardsAutoAllocationBusinessUnit({value: cardsAutoAllocationBusinessUnit});
            }
            cardsAutoAllocationBusinessUnit = null;
            this.props.toggleStatusUpdatePrompt(action);
        }
    };
    // FE preprocessing
    handleTransformCellGridValue(value, field, data, isHeader) {
        if (data.key === value) {
            return <Text>{value}</Text>;
        }
        return value;
    }
    // FE processing
    getHighlightedButtons(statusLabel) {
        let nextStatusLabel = this.props.statusFlow[this.props.statusFlow.indexOf(statusLabel) + 1];
        return this.props.actionList
            .filter(
                function(value) {
                    return value.fromStatusLabel === statusLabel && value.toStatusLabel === nextStatusLabel;
                })
            .map(
                function(value) {
                    return value.actionLabel;
                });
    }
    getHeader(details) {
        let reasonText = details.reason;
        let reasonComment = details.comments;
        let showHeaderDetails = details.statusName === 'Declined' || details.statusName === 'Rejected';
        let rejectContent = reasonText && (
            <div className={style.rejectContent}>
                <div className={classnames(style.rowPaddings, style.reasonWrapper)}>
                     <Input label={<Text>Reject/Decline reason</Text>} value={reasonText} boldLabel readonly />
                </div>
                {reasonComment && <div className={classnames(style.rowPaddings, style.reasonCommentWrapper)}>
                    <TextArea label={<Text>Comment</Text>} value={reasonComment} readonly />
                </div>}
            </div>
        );
        return (
            <div className={style.containerSideAlignings}>
                <CurrentStatus statusId={details.statusId || 0} page='batch' details />
                {showHeaderDetails && rejectContent}
            </div>);
    }
    isFieldAllowed(field) {
        return this.props.config.get('fields').indexOf(field) > -1;
    }
    getDialogComponents() {
        let dialogComponents = [];
        let data = this.props.batchData;
        let readOnly;
        let disableEditableFields = !this.context.checkPermission('card.batch.statusUpdateEdit');
        let readOnlyStyle = {};
        let readOnlyStyleByName = {};
        let dropdownStyling = {};
        let dropdownStylingByName = {};
        let batchValidations = getBatchValidationRules();
        let cardsValidations = getNumberOfCardsValidationRules();
        if (disableEditableFields) {
            readOnly = true;
            readOnlyStyle = style.readonly;
        } else {
            switch ((data.statusName || '').toLowerCase()) {
                case 'new':
                case 'rejected':
                    dropdownStyling = dropdownStyles;
                    readOnly = false;
                    break;
                default:
                    readOnlyStyle = style.readonly;
                    readOnly = true;
                    break;
            }
        }

        if (this.props.autoGenerateBatchName || readOnly) {
            readOnlyStyleByName = style.readonly;
        } else {
            readOnlyStyleByName = dropdownStyles;
            dropdownStylingByName = dropdownStyles;
        }
        // Type
        let batchType = this.isFieldAllowed('batchType') &&
            (<div key='batchType' className={classnames(style.rowPaddings, style.borderBottom, style.readonly)}>
                <Input
                  value={data.embossedTypeName}
                  keyProp=''
                  boldLabel
                  onChange={undefined}
                  label={<Text>Type</Text>}
                  placeholder=''
                  isEdited={false}
                  isValid
                  readonly
                />
            </div>);
        // batch name
        let batchName = this.isFieldAllowed('batchName') &&
            (<div key='batchName' className={classnames(style.rowPaddings, style.borderBottom, readOnlyStyleByName)}>
                <Input
                  value={this.props.batchName}
                  keyProp='batchName'
                  boldLabel
                  onChange={this.props.setBatchName}
                  label={<Text>Batch Name</Text>}
                  validators={batchValidations}
                  placeholder={this.translate('Please enter batch name')}
                  isEdited={false}
                  readonly={readOnly === false ? this.props.autoGenerateBatchName : readOnly}
                  isValid={this.props.errors.get('batchName') === undefined}
                  errorMessage={this.props.errors.get('batchName')}
                />
            </div>);
       // no name batch expiration date
        // let expiryDate =
        //     (<div key='Expiry Date' className={classnames(style.rowPaddings, style.borderBottom, readOnlyStyle)}>
        //         <Input
        //           value={data.expirationDate}
        //           keyProp=''
        //           boldLabel
        //           onChange={undefined}
        //           label={<Text>Expiry Date</Text>}
        //           placeholder=''
        //           isEdited={false}
        //           isValid
        //           readonly
        //         />
        //     </div>);
        // no name batch card count
        let numberOfCards = this.isFieldAllowed('numberOfCards') &&
        (<div key='numberOfCards' className={classnames(style.rowPaddings, style.borderBottom, readOnlyStyle)}>
            <Input
              value={this.props.numberOfCards}
              keyProp='numberOfCards'
              onChange={this.props.setNumberOfCards}
              label={<Text>Number of Cards</Text>}
              boldLabel
              validators={cardsValidations}
              placeholder={this.translate('Please enter number of cards')}
              isEdited={false}
              readonly={readOnly}
              isValid={this.props.errors.get('numberOfCards') === undefined}
              errorMessage={this.props.errors.get('numberOfCards')}
            />
        </div>);
        // no name batch card type
        let typeId = this.isFieldAllowed('typeName') &&
        (<div key='typeId' className={classnames(style.rowPaddings, style.borderBottom)}>
            <Dropdown
              label={<span><Text>Card Type</Text> *</span>}
              boldLabel
              placeholder={<Text>Card Type</Text>}
              keyProp='name'
              onSelect={this.setTypeId}
              data={this.props.cardTypes}
              canSelectPlaceholder={false}
              disabled={readOnly}
              mergeStyles={dropdownStyling}
              defaultSelected={this.props.typeId}
              isValid={this.props.errors.get('typeId') === undefined}
              errorMessage={this.props.errors.get('typeId')}
            />
        </div>);
        // target business unit
        let targetBusinessUnit = this.isFieldAllowed('targetBranchName') &&
         (<div key='targetBusinessUnit' className={classnames(style.rowPaddings, style.borderBottom)}>
            <Dropdown
              label={<span><Text>Target Business Unit</Text> *</span>}
              boldLabel
              placeholder={<Text>Target Business Unit</Text>}
              keyProp='name'
              onSelect={this.setTargetBusinessUnit}
              data={this.props.businessUnits}
              disabled={readOnly}
              mergeStyles={dropdownStyling}
              defaultSelected={this.props.targetBusinessUnit}
              canSelectPlaceholder={false}
              isValid={this.props.errors.get('targetBusinessUnit') === undefined}
              errorMessage={this.props.errors.get('targetBusinessUnit')}
            />
        </div>);
        // issuing business unit
        let issuingBusinessUnit = this.isFieldAllowed('issuingBranchName') &&
         (<div key='issuingBusinessUnit' className={classnames(style.rowPaddings, style.borderBottom)}>
            <Dropdown
              label={<span><Text>Issuing Business Unit</Text> *</span>}
              boldLabel
              placeholder={<Text>Issuing Business Unit</Text>}
              keyProp='name'
              onSelect={this.setIssuingBusinessUnit}
              data={this.props.businessUnits}
              canSelectPlaceholder={false}
              disabled={readOnly === false ? this.props.autoGenerateBatchName : readOnly}
              mergeStyles={dropdownStylingByName}
              defaultSelected={this.props.issuingBusinessUnit}
              isValid={this.props.errors.get('issuingBusinessUnit') === undefined}
              errorMessage={this.props.errors.get('issuingBusinessUnit')}
            />
        </div>);
        if (this.props.namedBatch === true) {
            dialogComponents = [batchType, batchName, targetBusinessUnit];
        } else {
            switch ((data.statusName || '').toLowerCase()) {
                case 'new':
                case 'approved':
                case 'rejected':
                case 'declined':
                case 'production':
                case 'completed':
                    dialogComponents = [batchType, batchName, numberOfCards, targetBusinessUnit, issuingBusinessUnit, typeId];
                    break;
                default:
                    break;
            };
        }
        return dialogComponents;
    }
    getCardAllocationData() {
        let data = this.props.batchData;
        if (this.isFieldAllowed('cardsAutoAllocationBusinessUnit') &&
        this.props.cardsAutoAllocation !== null &&
        (data.statusName || '').toLowerCase() === 'production') {
            cardsAutoAllocationBusinessUnit = parseInt(data[this.props.cardsAutoAllocation]);
            return (<div key='cardsAutoAllocationBusinessUnit' className={classnames(cardAllocationDataStyles.allocateCardsWrapper)}>
                        <Dropdown
                          label={<span><Text>Cards business unit</Text> *</span>}
                          boldLabel
                          placeholder={<Text>Cards business unit</Text>}
                          keyProp='name'
                          onSelect={this.setCardsAutoAllocationBusinessUnit}
                          data={this.props.businessUnits}
                          canSelectPlaceholder={false}
                          disabled={false}
                          mergeStyles={cardAllocationDataStyles}
                          defaultSelected={cardsAutoAllocationBusinessUnit}
                          isValid={this.props.errors.get('cardsAutoAllocationBusinessUnit') === undefined}
                          errorMessage={this.props.errors.get('cardsAutoAllocationBusinessUnit')}
                        />
                    </div>);
        };
        return (<div />);
    }
    getGridData() {
        let data = this.props.batchData;
        let gridData = [];
        if (this.props.namedBatch) {
            gridData = [
                {id: 'batchType', key: 'Type', value: data.embossedTypeName},
                {id: 'batchName', key: 'Batch Name', value: this.props.batchName},
                {id: 'targetBranchName', key: 'Target Business Unit', value: data.targetBranchName}
            ];
        } else {
            gridData = [
                {id: 'batchType', key: 'Type', value: data.embossedTypeName},
                {id: 'batchName', key: 'Batch Name', value: this.props.batchName},
             //   {key: 'Expiry Date', value: data.expirationDate},
                {id: 'numberOfCards', key: 'Number of Cards', value: this.props.numberOfCards},
                {id: 'typeName', key: 'Card Type', value: data.typeName},
                {id: 'targetBranchName', key: 'Target Business Unit', value: data.targetBranchName},
                {id: 'issuingBranchName', key: 'Issuing Business Unit', value: data.issuingBranchName}
            ];
        }
        return gridData.filter(f => { return this.isFieldAllowed(f.id); });
    }
    getDisabledButtons() {
        let showExcludeButtons = this.props.excludeButtons;
        let showIfStatusNew = showExcludeButtons && this.props.batchData.statusName === 'New';
        let showIfStatusRejected = showExcludeButtons && this.props.batchData.statusName === 'Rejected';
        if (showIfStatusNew || showIfStatusRejected) {
            return ['Approve', 'Reject', 'Decline', 'SentToProduction'];
        } else if (this.props.batchData.statusName === 'Rejected') {
            return ['Approve', 'Reject', 'SentToProduction'];
        }
        return ['Update'];
    }
    getHideButtons() {
        let result = [];
        if (!this.context.checkPermission('card.batch.statusUpdateApprove')) {
            result.push('Approve');
        }
        if (!this.context.checkPermission('card.batch.statusUpdateCompleted')) {
            result.push('Complete');
        }
        if (!this.context.checkPermission('card.batch.statusUpdateDecline')) {
            result.push('Decline');
        }
        if (!this.context.checkPermission('card.batch.statusUpdateEdit')) {
            result.push('Update');
        }
        if (!this.context.checkPermission('card.batch.statusUpdateReject')) {
            result.push('Reject');
        }
        if (!this.context.checkPermission('card.batch.statusUpdateSendToProduction') ||
            !this.context.checkPermission('pan.number.generate') ||
            !this.context.checkPermission('card.batch.check') ||
            !this.context.checkPermission('card.generated.add')) {
            result.push('SentToProduction');
        }
        if (!this.context.checkPermission('card.batch.generatePinMail')) {
            result.push('GeneratePIN');
        }
        if (!this.context.checkPermission('card.batch.downloadCustom') ||
            !this.context.checkPermission('card.batch.embosserFileGet') ||
            !this.context.checkPermission('card.batch.statusUpdate')) {
            result.push('Download');
        }
        return result;
    }
    getIsEditable(batchDetails) {
        return batchDetails.statusName === 'New' || batchDetails.statusName === 'Rejected';
    }
    render() {
        let details = this.props.batchData;
        let showEdit = this.getIsEditable(details);
        let hideButtons = this.getHideButtons();
        let disabledButtons = this.getDisabledButtons();
        let highlighted = (!this.props.excludeButtons || details.statusName === 'Rejected') ? this.getHighlightedButtons(details.statusName) : ['Update'];
        let nestComponents = {
            'Download': (key, currentStatuses, item, lastItem) => {
                // lastItem should never be true, because there is always Close button to the right
                // padRight={!lastItem}
                return (
                    <ActionStatusLink
                      padRight
                      currentStatuses={currentStatuses}
                      action={item}
                      page='batch'
                      key={key}
                      href={this.props.actionStatusLinkHref}
                      handleClick={this.batchDownload}
                      isDisabled={false}>
                      {item.label}
                    </ActionStatusLink>
                );
            }
        };
        let actions = [(<div>
                            <ActionStatusButtonsGroup
                              page='batch'
                              statusIds={[details.statusId]}
                              highlighted={highlighted}
                              excludeActions={hideButtons}
                              disabled={disabledButtons}
                              handleClick={this.handleAction}
                              nestComponents={nestComponents}
                            />
                            <button onTouchTap={this.handleDetailsClose} className={cancelStyle.statusActionButton}><Text>Close</Text></button>
                      </div>)];
        let gridData = this.getGridData();
        return (
                <Dialog
                  title={getDialogTitle('Batch Details', this.handleDetailsClose)}
                  titleStyle={titleStyle}
                  bodyStyle={{padding: '0px', maxHeight: '550px'}}
                  autoDetectWindowHeight={false}
                  actionsContainerStyle={actionsStyle}
                  open={this.props.opened}
                  actions={actions}
                  externalMainContentWrapClass={style.contentWrap}
                >
                 {this.getHeader(details)}
                 <div className={style.contentWrap}>
                    <div className={dialogStyles.mainContent}>
                        <Accordion title={<Text>Batch Information</Text>}>
                            <div className={style.contentWrapper}>
                                {!showEdit && <SimpleGrid
                                  hideHeader
                                  mainClassName='dataGridTableDetailTable'
                                  externalStyle={style}
                                  fields={[{name: 'key', title: 'key', style: {fontWeight: 'bold', width: '40%'}}, {name: 'value', title: 'Value', style: {width: '60%'}}]}
                                  transformCellValue={this.handleTransformCellGridValue}
                                  data={gridData}
                                />}
                                {showEdit && this.getDialogComponents()}
                            </div>
                            {this.getCardAllocationData()}
                        </Accordion>
                    </div>
                </div>
                <BatchStatusUpdate />
                <RejectDetails />
                <BatchDownloadInfo
                  open={this.props.confirmationDialogOpened}
                  download={this.props.downloadFlag}
                  confirmationMessage={this.props.confirmationMessage}
                  batchId={this.props.batchData.batchId}
                />
                </Dialog>
        );
    }
};

BatchDetails.propTypes = {
    config: PropTypes.object.isRequired,
    ownershipIdOwn: PropTypes.array,
    embossedTypeIdNoNamed: PropTypes.number,
    cardsAutoAllocation: PropTypes.string,
    fetchCardTypes: PropTypes.func.isRequired,
    autoGenerateBatchName: PropTypes.bool,
    statusFlow: PropTypes.array,
    actionList: PropTypes.array,
    // dialog properties
    opened: PropTypes.bool.isRequired,
    namedBatch: PropTypes.bool,
    // editable fields data
    businessUnits: PropTypes.array,
    cardTypes: PropTypes.array,
    // editable fields methods
    setTargetBusinessUnit: PropTypes.func,
    setIssuingBusinessUnit: PropTypes.func,
    setTypeId: PropTypes.func,
    setBatchName: PropTypes.func,
    setNumberOfCards: PropTypes.func,
    // editable fields values
    targetBusinessUnit: PropTypes.number,
    issuingBusinessUnit: PropTypes.number,
    typeId: PropTypes.number,
    batchName: PropTypes.string,
    numberOfCards: PropTypes.string,

    // methods
    toggleStatusUpdatePrompt: PropTypes.func,
    handleDetailsClose: PropTypes.func,
    toggleRejectBatchPopup: PropTypes.func,
    setExcludeButtons: PropTypes.func,
    batchDownload: PropTypes.func,
    setCardsAutoAllocationBusinessUnit: PropTypes.func,
    checkDownload: PropTypes.func,
    areAllCardsGeneratedUpdate: PropTypes.func,
    resetState: PropTypes.func,
    setDownloadLink: PropTypes.func,
    // closeDialog: PropTypes.func,

    excludeButtons: PropTypes.bool,
    areAllCardsGenerated: PropTypes.bool,
    batchData: PropTypes.object,
    actionStatusLinkHref: PropTypes.string,
    confirmationDialogOpened: PropTypes.bool,
    areAllCardsGeneratedUpdateInfo: PropTypes.object,
    downloadFlag: PropTypes.bool,
    confirmationMessage: PropTypes.string,
    // errors
    editableValues: PropTypes.object,
    setErrors: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired
};
BatchDetails.contextTypes = {
    translate: PropTypes.func,
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        var batchesStatusFlow = state.cardConfig.getIn(['batches', 'statusFlow']);

        return {
            config: state.cardConfig.getIn(['batches', 'details']),
            ownershipIdOwn: state.utCardStatusAction.get('ownershipIdOwn').toJS(),
            embossedTypeIdNoNamed: state.utCardStatusAction.get('embossedTypeIdNoNamed'),
            autoGenerateBatchName: state.cardConfig.getIn(['batches', 'autoGenerateBatchName']),
            statusFlow: (batchesStatusFlow && batchesStatusFlow.toJS()) || [],
            cardsAutoAllocation: state.cardConfig.getIn(['batches', 'cardsAutoAllocation']),
            actionList: state.utCardStatusAction.get('state-batch').toJS(),
            // main props
            opened: state.batchDetails.get('opened'),
            namedBatch: state.batchDetails.get('embossedTypeId') === state.utCardStatusAction.get('embossedTypeIdNamed') ? true
                        : ((state.batchDetails.get('embossedTypeId') === state.utCardStatusAction.get('embossedTypeIdNoNamed')) ? false
                        : null),
            // editable fields data
            businessUnits: state.batchesGrid.get('dropdownData').get('businessUnits').toJS(),
            cardTypes: state.batchDetails.get('types').toJS(),
            // editable values
            editableValues: state.batchDetails.get('editableValues'),

            targetBusinessUnit: state.batchDetails.get('editableValues').get('targetBusinessUnit'),
            issuingBusinessUnit: state.batchDetails.get('editableValues').get('issuingBusinessUnit'),
            typeId: state.batchDetails.get('editableValues').get('typeId'),
            batchName: state.batchDetails.get('editableValues').get('batchName'),
            numberOfCards: state.batchDetails.get('editableValues').get('numberOfCards'),

            batchData: state.batchDetails.get('batchData').toJS().shift() || {},
            // some others
            excludeButtons: state.batchDetails.get('excludeButtons'),
            areAllCardsGenerated: state.batchDetails.get('areAllCardsGenerated'),
            actionStatusLinkHref: state.batchDownloadInfo.get('actionStatusLinkHref'),
            confirmationDialogOpened: state.batchDownloadInfo.get('confirmationDialogOpened'),
            downloadFlag: state.batchDownloadInfo.get('downloadFile'),
            confirmationMessage: state.batchDownloadInfo.get('confirmationMessage'),
            areAllCardsGeneratedUpdateInfo: state.batchDownloadInfo.get('areAllCardsGeneratedUpdateInfo'),
            // FE validation errors
            errors: state.batchDetails.get('errors')
        };
    },
    {
        fetchCardTypes,
        setTargetBusinessUnit,
        setIssuingBusinessUnit,
        setTypeId,
        setBatchName,
        setNumberOfCards,

        setExcludeButtons,
        batchDownload,
        areAllCardsGeneratedUpdate,
        setCardsAutoAllocationBusinessUnit,

        handleDetailsClose,
        setErrors,
        toggleRejectBatchPopup,
        toggleStatusUpdatePrompt,
        checkDownload,
        resetState,
        setDownloadLink
    }
)(BatchDetails);
