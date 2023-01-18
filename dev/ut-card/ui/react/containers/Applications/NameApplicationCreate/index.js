import React, {Component, PropTypes} from 'react';
import immutable from 'immutable';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import classnames from 'classnames';
import Popover from 'material-ui/Popover';
import Text from 'ut-front-react/components/Text';
import SearchBox from 'ut-front-react/components/SearchBox';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Input from 'ut-front-react/components/Input';
import TextArea from 'ut-front-react/components/Input/TextArea';
import Upload from './Uploads';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import AccountsGrid from './AccountsGrid';
import CardProductDropDown from '../../../components/CardProductDropDown';

import {handleNameDialogToggle,
    fetchBusinessUnits,
    fetchDocumentTypes,
    fetchCardTypes,
    fetchCardProducts,
    createApplication,
    searchCardNumber,
    searchCustomer,
    searchCustomerTSS,
    closeCustomersPopup,
    chooseCustomerFromList,
    searchPerson,
    searchPersonTSS,
    closePersonsPopup,
    choosePersonFromList,
    changeBusinessUnit,
    changeIssuingBusinessUnit,
    changeFile,
    changeCardProduct,
    changeCardType,
    changeCardholderName,
    changeMakerComment,
    setErrors
} from './actions';
import {searchAccounts,searchAccountsTSS, clear as clearAccounts} from './AccountsGrid/actions';
import {clearUploads} from './Uploads/actions';
import { prepareNameApplicationToCreate, getCreateValidator, productIdValidator, customerNameValidator, personNameValidator } from './helpers';
import {getCardholderValidationRules} from './../helpers';
import {validateAccounts, validateUploads} from './../../helpers';
import {validateAll, validate, prepareErrors} from './../../../helpers';
import {refechGridData} from './../Grid/actions';

import {getDialogTitle, titleStyle} from './../../../components/ActionDialog/helpers';

import style from './../style.css';
import cancelStyle from './../../../components/ActionStatusButton/style.css';
import dialogStyles from './../../../components/ActionDialog/style.css';

const customerGridListFields = [{
    title: <Text>Customer Name</Text>,
    name: 'customerName'
}, {
    title: <Text>Customer Number</Text>,
    name: 'customerNumber'
}, {
    title: <Text>Customer Type</Text>,
    name: 'customerType'
}, {
    title: <Text>Telephone</Text>,
    name: 'telMobile'
}];

const personGridListFields = [{
    title: <Text>Person Name</Text>,
    name: 'personName'
}, {
    title: <Text>Person Number</Text>,
    name: 'personNumber'
}, {
    title: <Text>Telephone</Text>,
    name: 'personTelMobile'
}];

const maxVisibleCustomers = 10;

export class NameApplicationCreate extends Component {
    constructor(props) {
        super(props);
        this.handleCustomerSearch = this.handleCustomerSearch.bind(this);
        this.handleCustomerRowClick = this.handleCustomerRowClick.bind(this);

        this.handlePersonSearch = this.handlePersonSearch.bind(this);
        this.handlePersonRowClick = this.handlePersonRowClick.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.props.fetchCardTypes(nextProps.ownershipIdOwn.pop());
            this.props.fetchCardProducts(nextProps.embossedTypeId, nextProps.ownershipIdOwn);
            this.props.fetchBusinessUnits();
            this.props.fetchDocumentTypes();
        } else if (this.props.isOpen && !nextProps.isOpen && !this.props.created && nextProps.created) {
            this.props.clearUploads();
            this.props.clearAccounts();
            this.props.refechGridData();
        }
    }
    translate(stringToTranslate) {
        return this.context.translate(stringToTranslate);
    }
    setErrors(createErrors, accountErrors = immutable.Map(), uploadErrors) {
        let errorParams = {
            account: accountErrors,
            form: createErrors,
            upload: uploadErrors
        };
        this.props.setErrors(errorParams);
    }
    handleCreate() {
        let accountsErrors = validateAccounts(this.props.availableAccounts, this.props.linkedAccounts);
        let uploadErrors = validateUploads(this.props.attachments);
        let createValidationRules = getCreateValidator();
        if (this.props.hidePersonField) {
            createValidationRules = createValidationRules.filter((rule) => {
                return !(rule.id === 'personName' || rule.id === 'personNumber');
            });
        }
        let validation = validateAll(this.props.createStore, createValidationRules);
        if (accountsErrors.size > 0 || !validation.isValid || uploadErrors.size > 0) {
            let createErrors = prepareErrors(validation.errors);
            this.setErrors(createErrors, accountsErrors, uploadErrors);
            return;
        }
        let paramsToSend = prepareNameApplicationToCreate(this.props.createStore, this.props.linkedAccounts, this.props.attachments);
        this.props.createApplication(paramsToSend);
    }
    handleCustomerSearch(searchData) {
        let validation = validate(this.props.productId, productIdValidator);
        let customerValidation = validate(searchData, customerNameValidator);
        if (!validation.isValid) {
            let productIdError = prepareErrors(validation.errors);
            this.setErrors(productIdError);
            return;
        } else if (!customerValidation.isValid) {
            let customerNameError = prepareErrors(customerValidation.errors);
            this.setErrors(customerNameError);
            return;
        }

        //this.props.searchCustomer(searchData.trim(), this.props.productId);
        this.props.searchCustomerTSS(searchData.trim(), this.props.productId);
    }
    handleCustomerRowClick(rowData) {
        this.props.chooseCustomerFromList(rowData);
        if (this.props.hidePersonField) {
            //this.props.searchAccounts(rowData.customerNumber, rowData.customerNumber, this.props.productId);
            this.props.searchAccountsTSS(rowData.customerNumber, rowData.customerNumber, this.props.productId);
            return;
        }
        //this.props.searchPerson(rowData.customerNumber);
        this.props.searchPersonTSS(rowData.customerNumber);
    }
    handlePersonSearch(personName) {
        let validation = validate(this.props.customerName, customerNameValidator);
        let personValidation = validate(personName, personNameValidator);
        if (!validation.isValid) {
            let customerNameError = prepareErrors(validation.errors);
            this.setErrors(customerNameError);
            return;
        } else if (!personValidation.isValid) {
            let personNameError = prepareErrors(personValidation.errors);
            this.setErrors(personNameError);
            return;
        }
        //this.props.searchPerson(this.props.customerNumber, personName.trim());
        this.props.searchPersonTSS(this.props.customerNumber, personName.trim());
    }
    handlePersonRowClick(rowData) {
        this.props.choosePersonFromList(rowData);
        //this.props.searchAccounts(this.props.customerNumber, rowData.personNumber, this.props.productId);
        this.props.searchAccountsTSS(this.props.customerNumber, rowData.personNumber, this.props.productId);
    }
    closeDialog() {
        this.props.clearUploads();
        this.props.clearAccounts();
        this.props.handleNameDialogToggle();
    }
    renderGridList(data, fields, handleRowClick) {
        if (data.size > maxVisibleCustomers) {
            return <div className={style.messageTooManyResults}>
                <Text>The results are more than 10 - please enter more detailed information!</Text>
            </div>;
        } else if (data.size === 0) {
            return <div className={style.messageTooManyResults}>
                <Text>No results found!</Text>
            </div>;
        }
        return <div>
            <SimpleGrid fields={fields} data={data.toJS()} handleRowClick={handleRowClick} />
        </div>;
    }
    renderDialogContent() {
        let cardholderValidations = getCardholderValidationRules();
        return <div className={style.contentWrapper}>
            <div className={classnames(style.rowPaddings, style.borderBottom)}>
                <Dropdown
                  defaultSelected={this.props.typeId}
                  label={<span><Text>Card Type</Text> *</span>}
                  boldLabel
                  placeholder={<Text>Card Type</Text>}
                  keyProp='typeId'
                  onSelect={this.props.changeCardType}
                  data={this.props.cardTypes.toJS()}
                  isValid={this.props.errors.get('cardType') === undefined}
                  errorMessage={this.props.errors.get('cardType')}
                />
            </div>
            <div className={classnames(style.rowPaddings, style.borderBottom)}>
                <CardProductDropDown
                  defaultSelected={this.props.productId}
                  label={<span><Text>Card Product</Text> *</span>}
                  boldLabel
                  appType='name'
                  placeholder={<Text>Card Product</Text>}
                  keyProp='productId'
                  onSelect={this.props.changeCardProduct}
                  data={this.props.cardProducts.toJS()}
                  isValid={this.props.errors.get('productId') === undefined}
                  errorMessage={this.props.errors.get('productId')}
                />
            </div>
            <div className={classnames(style.rowPaddings, style.borderBottom)} ref={(input) => { this.customersTargetEl = input; }}>
                <SearchBox
                  defaultValue={this.props.customerName}
                  label={<span><Text>Customer Name</Text> *</span>}
                  boldLabel
                  placeholder={this.translate('Search by customer number')}
                  onSearch={this.handleCustomerSearch}
                  isValid={this.props.errors.get('customerName') === undefined}
                  errorMessage={this.props.errors.get('customerName')} />
            </div>
            <Popover
              open={this.props.customersOpen}
              anchorEl={this.customersTargetEl}
              anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'middle', vertical: 'top'}}
              onRequestClose={this.props.closeCustomersPopup}
            >
                {this.renderGridList(this.props.customers, customerGridListFields, this.handleCustomerRowClick)}
            </Popover>
            {!this.props.hidePersonField && <div className={classnames(style.rowPaddings, style.borderBottom)} ref={(input) => { this.personsTargetEl = input; }}>
                <SearchBox
                  defaultValue={this.props.personName}
                  label={<span><Text>Person Name</Text> *</span>}
                  boldLabel
                  placeholder={this.translate('Search for person name')}
                  onSearch={this.handlePersonSearch}
                  isValid={!(this.props.errors.get('personName') || this.props.errors.get('personNumber'))}
                  errorMessage={this.props.errors.get('personName') || this.props.errors.get('personNumber')}
                />
            </div>}
            <Popover
              open={this.props.personsOpen}
              anchorEl={this.personsTargetEl}
              anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'middle', vertical: 'top'}}
              onRequestClose={this.props.closePersonsPopup}
            >
                {this.renderGridList(this.props.persons, personGridListFields, this.handlePersonRowClick)}
            </Popover>
            <div className={classnames(style.rowPaddings, style.cardHolderWrapper, style.borderBottom)}>
                <Input value={this.props.cardholderValue} label={<Text>Cardholder Name</Text>} placeholder={this.translate('Please enter cardholder name')}
                  onChange={this.props.changeCardholderName}
                  keyProp='cardholderName'
                  boldLabel
                  validators={cardholderValidations}
                  isValid={this.props.errors.get('cardholderName') === undefined}
                  errorMessage={this.props.errors.get('cardholderName')}
                />
            </div>
            <div className={classnames(style.rowPaddings, style.borderBottom)}>
                <Dropdown
                  defaultSelected={this.props.issuingBranchId}
                  label={<span><Text>Card Issuing BU</Text> *</span>}
                  boldLabel
                  placeholder={<Text>Issuing Business Unit</Text>}
                  keyProp='issuingBranchId'
                  isValid={this.props.errors.get('issuingBranchId') === undefined}
                  errorMessage={this.props.errors.get('issuingBranchId')}
                  onSelect={this.props.changeIssuingBusinessUnit}
                  data={this.props.businessUnits.toJS()}
                  className={style.rowPaddings}
                />
            </div>
            <div className={classnames(style.rowPaddings, style.borderBottom)}>
                <Dropdown
                  defaultSelected={this.props.targetBranchId}
                  label={<span><Text>Target Business Unit</Text> *</span>}
                  boldLabel
                  placeholder={<Text>Business Unit</Text>}
                  keyProp='targetBranchId'
                  isValid={this.props.errors.get('targetBranchId') === undefined}
                  errorMessage={this.props.errors.get('targetBranchId')}
                  onSelect={this.props.changeBusinessUnit}
                  data={this.props.businessUnits.toJS()}
                  className={style.rowPaddings}
                />
            </div>
            <div className={classnames(style.rowPaddings, style.borderBottom)}>
                <TextArea label={<Text>Maker Comment</Text>} rows='3' value={this.props.makerComments} onChange={this.props.changeMakerComment} />
            </div>
            <Upload withTopMargin />
            <AccountsGrid withTopMargin />
        </div>;
    }
    render() {
        const actions = [
            <button onTouchTap={this.handleCreate} className={classnames(cancelStyle.statusActionButton, cancelStyle.highlighted, style.buttonsRightMargin)}><Text>Create</Text></button>,
            <button onTouchTap={this.closeDialog} className={cancelStyle.statusActionButton}><Text>Cancel</Text></button>
        ];
        return (
            <Dialog
              open={this.props.isOpen}
              autoScrollBodyContent
              actionsContainerClassName={dialogStyles.actionButtons}
              title={getDialogTitle('Create Name Application', this.closeDialog)}
              titleStyle={titleStyle}
              actions={actions}
              style={{zIndex: 1400}}
            >
                {this.renderDialogContent()}
            </Dialog>
        );
    }
}

NameApplicationCreate.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    hidePersonField: PropTypes.bool.isRequired,
    embossedTypeId: PropTypes.number,
    ownershipIdOwn: PropTypes.array,
    created: PropTypes.bool.isRequired,
    errors: PropTypes.object.isRequired,
    handleNameDialogToggle: PropTypes.func.isRequired,
    createStore: PropTypes.object.isRequired,
    customersOpen: PropTypes.bool.isRequired,
    customerName: PropTypes.string.isRequired,
    customerNumber: PropTypes.string.isRequired,
    customers: PropTypes.object.isRequired,

    personsOpen: PropTypes.bool.isRequired,
    personName: PropTypes.string.isRequired,
    persons: PropTypes.object.isRequired,

    businessUnits: PropTypes.object.isRequired,
    targetBranchId: PropTypes.string.isRequired,
    issuingBranchId: PropTypes.string.isRequired,
    cardProducts: PropTypes.object.isRequired,
    productId: PropTypes.node,
    cardTypes: PropTypes.object.isRequired,
    typeId: PropTypes.node,
    cardholderValue: PropTypes.string.isRequired,
    makerComments: PropTypes.string.isRequired,
    linkedAccounts: PropTypes.object.isRequired,
    attachments: PropTypes.object.isRequired,
    availableAccounts: PropTypes.object.isRequired,
    // functions
    fetchBusinessUnits: PropTypes.func.isRequired,
    fetchDocumentTypes: PropTypes.func.isRequired,
    fetchCardProducts: PropTypes.func.isRequired,
    fetchCardTypes: PropTypes.func.isRequired,
    createApplication: PropTypes.func.isRequired,
    searchCustomer: PropTypes.func.isRequired,
    searchCustomerTSS: PropTypes.func.isRequired,
    closeCustomersPopup: PropTypes.func.isRequired,
    chooseCustomerFromList: PropTypes.func.isRequired,

    searchPerson: PropTypes.func.isRequired,
    searchPersonTSS: PropTypes.func.isRequired,
    closePersonsPopup: PropTypes.func.isRequired,
    choosePersonFromList: PropTypes.func.isRequired,

    changeBusinessUnit: PropTypes.func.isRequired,
    changeIssuingBusinessUnit: PropTypes.func.isRequired,
    changeFile: PropTypes.func.isRequired,
    changeCardProduct: PropTypes.func.isRequired,
    changeCardType: PropTypes.func.isRequired,
    changeCardholderName: PropTypes.func.isRequired,
    changeMakerComment: PropTypes.func.isRequired,
    searchCardNumber: PropTypes.func.isRequired,
    searchAccounts: PropTypes.func.isRequired,
    searchAccountsTSS: PropTypes.func.isRequired,
    clearAccounts: PropTypes.func.isRequired,
    clearUploads: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    refechGridData: PropTypes.func.isRequired
};

NameApplicationCreate.contextTypes = {
    translate: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    let cardApplicationCreateStore = state.cardNameApplicationCreate;
    return {
        isOpen: cardApplicationCreateStore.get('open'),
        hidePersonField: state.cardConfig.getIn(['application', 'createName', 'hidePerson']),
        embossedTypeId: state.utCardStatusAction.get('embossedTypeIdNamed'),
        ownershipIdOwn: state.utCardStatusAction.get('ownershipIdOwn').toJS(),
        created: cardApplicationCreateStore.get('created'),
        errors: cardApplicationCreateStore.get('errors'),
        createStore: cardApplicationCreateStore,
        customersOpen: cardApplicationCreateStore.getIn(['customer', 'customersOpen']),
        customerName: cardApplicationCreateStore.getIn(['customer', 'customerName']),
        customerNumber: cardApplicationCreateStore.getIn(['customer', 'customerNumber']),
        customers: cardApplicationCreateStore.getIn(['customer', 'customers']),

        personsOpen: cardApplicationCreateStore.getIn(['person', 'personsOpen']),
        personName: cardApplicationCreateStore.getIn(['person', 'personName']),
        persons: cardApplicationCreateStore.getIn(['person', 'persons']),

        cardholderValue: cardApplicationCreateStore.getIn(['cardholder', 'cardholderName']),
        makerComments: cardApplicationCreateStore.get('makerComments'),
        cardProducts: cardApplicationCreateStore.getIn(['product', 'cardProducts']),
        cardTypes: cardApplicationCreateStore.getIn(['type', 'cardTypes']),
        productId: cardApplicationCreateStore.getIn(['product', 'productId']),
        typeId: cardApplicationCreateStore.getIn(['type', 'typeId']),
        businessUnits: cardApplicationCreateStore.getIn(['units', 'businessUnits']),
        targetBranchId: cardApplicationCreateStore.getIn(['units', 'targetBranchId']),
        issuingBranchId: cardApplicationCreateStore.getIn(['units', 'issuingBranchId']),
        linkedAccounts: state.cardNameApplicationAccounts.getIn(['data', 'linked']),
        attachments: state.cardNameApplicationUploads.get('attachments'),
        availableAccounts: state.cardNameApplicationAccounts.getIn(['data', 'unlinked'])
    };
}

export default connect(
    mapStateToProps,
    {
        handleNameDialogToggle,
        fetchBusinessUnits,
        fetchDocumentTypes,
        fetchCardProducts,
        fetchCardTypes,
        createApplication,
        searchCardNumber,
        searchCustomer,
        searchCustomerTSS,
        closeCustomersPopup,
        chooseCustomerFromList,
        searchPerson,
        searchPersonTSS,
        closePersonsPopup,
        choosePersonFromList,
        changeBusinessUnit,
        changeIssuingBusinessUnit,
        changeFile,
        changeCardProduct,
        changeCardType,
        changeCardholderName,
        changeMakerComment,
        searchAccounts,
        searchAccountsTSS,
        clearAccounts,
        clearUploads,
        setErrors,
        refechGridData
    }
)(NameApplicationCreate);
