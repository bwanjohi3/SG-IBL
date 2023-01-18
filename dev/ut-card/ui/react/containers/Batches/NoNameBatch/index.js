import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import Text from 'ut-front-react/components/Text';
import Input from 'ut-front-react/components/Input';
import Dropdown from 'ut-front-react/components/Input/Dropdown';

import {
    close,
    closeBatchNamePopup,
    createNoNameBatch,
    fetchCardTypes,
    fetchBusinessUnits,
    changeBatchName,
    changeNumberOfCards,
    setBusinessUnit,
    setIssuingUnit,
    setCardType,
    setErrors
} from './actions';
import {validateAll, prepareErrors} from '../../../helpers';
import {getCreateValidator, getCreateValidatorNoBatchName} from './helpers';
import {getBatchValidationRules, getNumberOfCardsValidationRules} from './../helpers';
import {getDialogTitle, titleStyle} from '../../../components/ActionDialog/helpers';

import classnames from 'classnames';
import style from './style.css';
import cancelStyle from '../../../components/ActionStatusButton/style.css';
import dialogStyles from '../../../components/ActionDialog/style.css';

export class NoNameBatch extends Component {
    constructor(props) {
        super(props);
        this.createNoName = this.createNoName.bind(this);
        this.setTargetBusinessUnit = this.setTargetBusinessUnit.bind(this);
        this.setIssuingBusinessUnit = this.setIssuingBusinessUnit.bind(this);
        this.setCardType = this.setCardType.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.opened && nextProps.opened) {
            this.props.fetchBusinessUnits();
            this.props.fetchCardTypes(nextProps.embossedTypeId, nextProps.ownershipIdOwn);
        }
    }
    translate(stringToTranslate) {
        return this.context.translate(stringToTranslate);
    }
    setTargetBusinessUnit(params) {
        this.props.setBusinessUnit(params.value);
    }
    setIssuingBusinessUnit(params) {
        this.props.setIssuingUnit(params.value);
    }
    setCardType(params) {
        this.props.setCardType(params.value);
    }
    setErrors(createErrors) {
        let errorParams = {
            form: createErrors
        };
        this.props.setErrors(errorParams);
    }
    createNoName() {
        let batch = {
            batchName: !this.props.autoGenerateBatchName ? this.props.batchName : null,
            numberOfCards: this.props.numberOfCards,
            targetBranchId: this.props.targetBusinessUnit,
            issuingBranchId: this.props.issuingBusinessUnit,
            typeId: this.props.cardType
        };
        let validation;
        if (!this.props.autoGenerateBatchName) {
            validation = validateAll(this.props.createStore, getCreateValidator());
        } else {
            validation = validateAll(this.props.createStore, getCreateValidatorNoBatchName());
        }
        if (!validation.isValid) {
            let createErrors = prepareErrors(validation.errors);
            this.setErrors(createErrors);
            return;
        }
        this.props.createNoNameBatch(batch);
    }
    render() {
        const actions = [
            <button onTouchTap={this.createNoName} className={classnames(cancelStyle.statusActionButton, cancelStyle.highlighted, style.buttonsRightMargin)}><Text>Create</Text></button>,
            <button onTouchTap={this.props.close} className={cancelStyle.statusActionButton}><Text>Cancel</Text></button>
        ];
        let batchValidations = getBatchValidationRules();
        let cardsValidations = getNumberOfCardsValidationRules();
        return (
                <Dialog
                  title={getDialogTitle('Create No Name Cards Batch', this.props.close)}
                  titleStyle={titleStyle}
                  open={this.props.opened}
                  autoScrollBodyContent
                  actionsContainerClassName={dialogStyles.actionButtons}
                  contentStyle={{zIndex: this.props.dialogZIndex}}
                  overlayStyle={{zIndex: this.props.dialogZIndex / 2}}
                  style={{zIndex: this.props.dialogZIndex / 2}}
                  actions={actions}
                >
                <div className={style.contentWrapper}>
                    {!this.props.autoGenerateBatchName && <div className={classnames(style.rowPaddings, style.borderBottom)}>
                        <Input
                          value={this.props.batchName}
                          keyProp='batchName'
                          validators={batchValidations}
                          onChange={this.props.changeBatchName}
                          label={<Text>Batch Name</Text>}
                          boldLabel
                          placeholder={this.translate('Please enter batch name')}
                          isEdited={false}
                          isValid={this.props.errors.get('batchName') === undefined}
                          errorMessage={this.props.errors.get('batchName')}
                        />
                    </div>}
                    <div className={classnames(style.rowPaddings, style.borderBottom)}>
                        <Input
                          value={this.props.numberOfCards}
                          keyProp='numberOfCards'
                          validators={cardsValidations}
                          onChange={this.props.changeNumberOfCards}
                          label={<Text>Number of Cards</Text>}
                          boldLabel
                          placeholder={this.translate('Please enter number of cards')}
                          isEdited={false}
                          isValid={this.props.errors.get('numberOfCards') === undefined}
                          errorMessage={this.props.errors.get('numberOfCards')}
                        />
                    </div>
                    <div key='targetBusinessUnit' className={classnames(style.rowPaddings, style.borderBottom)}>
                        <Dropdown
                          label={<span><Text>Target Business Unit</Text> *</span>}
                          boldLabel
                          placeholder={<Text>Target Business Unit</Text>}
                          keyProp='name'
                          onSelect={this.setTargetBusinessUnit}
                          data={this.props.businessUnits}
                          disabled={false}
                          defaultSelected={this.props.targetBusinessUnit}
                          canSelectPlaceholder={false}
                          isValid={this.props.errors.get('targetBusinessUnit') === undefined}
                          errorMessage={this.props.errors.get('targetBusinessUnit')}
                        />
                    </div>
                    <div key='issuingBusinessUnit' className={classnames(style.rowPaddings, style.borderBottom)}>
                        <Dropdown
                          label={<span><Text>Issuing Business Unit</Text> *</span>}
                          boldLabel
                          placeholder={<Text>Issuing Business Unit</Text>}
                          keyProp='name'
                          onSelect={this.setIssuingBusinessUnit}
                          data={this.props.businessUnits}
                          canSelectPlaceholder={false}
                          disabled={false}
                          defaultSelected={this.props.issuingBusinessUnit}
                          isValid={this.props.errors.get('issuingBusinessUnit') === undefined}
                          errorMessage={this.props.errors.get('issuingBusinessUnit')}
                        />
                    </div>
                    <div key='cardType' className={classnames(style.rowPaddings, style.borderBottom)}>
                        <Dropdown
                          label={<span><Text>Card Type</Text> *</span>}
                          boldLabel
                          placeholder={<Text>Card Type</Text>}
                          keyProp='name'
                          onSelect={this.setCardType}
                          data={this.props.cardTypes}
                          canSelectPlaceholder={false}
                          disabled={false}
                          defaultSelected={this.props.cardType}
                          isValid={this.props.errors.get('cardType') === undefined}
                          errorMessage={this.props.errors.get('cardType')}
                        />
                    </div>
                </div>
                </Dialog>
        );
    }
};

NoNameBatch.propTypes = {
    autoGenerateBatchName: PropTypes.bool,
    opened: PropTypes.bool.isRequired,
    createNoNameBatch: PropTypes.func.isRequired,
    fetchCardTypes: PropTypes.func.isRequired,
    fetchBusinessUnits: PropTypes.func.isRequired,
    close: PropTypes.func,
    changeBatchName: PropTypes.func.isRequired,
    changeNumberOfCards: PropTypes.func.isRequired,
    setBusinessUnit: PropTypes.func.isRequired,
    setIssuingUnit: PropTypes.func.isRequired,
    setCardType: PropTypes.func.isRequired,
    embossedTypeId: PropTypes.number,
    ownershipId: PropTypes.array,
    batchName: PropTypes.string,
    numberOfCards: PropTypes.number.isRequired,
    targetBusinessUnit: PropTypes.number,
    issuingBusinessUnit: PropTypes.number.isRequired,
    cardType: PropTypes.number.isRequired,
    dialogZIndex: PropTypes.number,
    businessUnits: PropTypes.array.isRequired,
    cardTypes: PropTypes.array.isRequired,
    setErrors: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    createStore: PropTypes.object.isRequired
};
NoNameBatch.contextTypes = {
    translate: PropTypes.func
};

export default connect(
    (state) => {
        return {
            autoGenerateBatchName: state.cardConfig.getIn(['batches', 'autoGenerateBatchName']),
            opened: state.noNameBatch.get('opened'),
            embossedTypeId: state.utCardStatusAction.get('embossedTypeIdNoNamed'),
            ownershipId: state.utCardStatusAction.get('ownershipIdOwn').toJS(),
            batchName: state.noNameBatch.get('batchName'),
            numberOfCards: Number(state.noNameBatch.get('numberOfCards')),
            businessUnits: state.noNameBatch.get('businessUnits').toJS(),
            cardTypes: state.noNameBatch.get('types').toJS(),
            targetBusinessUnit: state.noNameBatch.get('targetBusinessUnit'),
            issuingBusinessUnit: state.noNameBatch.get('issuingBusinessUnit'),
            cardType: state.noNameBatch.get('cardType'),
            dialogZIndex: state.noNameBatch.get('dialogZIndex'),
            createStore: state.noNameBatch,
            errors: state.noNameBatch.get('errors')
        };
    },
    {createNoNameBatch, fetchCardTypes, fetchBusinessUnits, changeBatchName, changeNumberOfCards, setBusinessUnit, setIssuingUnit, setCardType, close, setErrors, closeBatchNamePopup}
)(NoNameBatch);
