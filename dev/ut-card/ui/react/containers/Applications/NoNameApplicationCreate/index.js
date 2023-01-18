import React, {Component, PropTypes} from 'react';
import immutable from 'immutable';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import classnames from 'classnames';
import Popover from 'material-ui/Popover';
import Text from 'ut-front-react/components/Text';
import SearchBox from 'ut-front-react/components/SearchBox';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import TextArea from 'ut-front-react/components/Input/TextArea';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import AccountsGrid from './AccountsGrid';
import Upload from './Uploads';

import {
    handleNoNameCreateDialogToggle,
    createApplication,
    changeProductId,
    searchCardNumber,
    searchCustomer,
    searchCustomerTSS,
    closeCustomersPopup,
    chooseCustomerFromList,
    searchPerson,
    searchPersonTSS,
    closePersonsPopup,
    choosePersonFromList,
    changeMakerComment,
    setErrors,
    fetchCardProducts,
    fetchDocumentTypes,
    cardIssueTypes,
    changeIssueType
} from './actions';
import {searchAccounts,searchAccountsTSS,clear as clearAccounts} from './AccountsGrid/actions';
import {clearUploads} from './Uploads/actions';
import {prepareNoNameApplicationToCreate, getCreateValidator, cardNumberValidator, productIdValidator, customerNameValidator, personNameValidator} from './helpers';
import {validateAccounts, validateUploads} from './../../helpers';
import {validateAll, validate, prepareErrors} from './../../../helpers';
import {refechGridData} from './../Grid/actions';

import style from './../style.css';
import cancelStyle from './../../../components/ActionStatusButton/style.css';

import {getDialogTitle, titleStyle} from './../../../components/ActionDialog/helpers';
import dialogStyles from './../../../components/ActionDialog/style.css';

const customersFields = [{
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

const personsFields = [{
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

export class NoNameApplicationCreate extends Component {
    constructor(props) {
        super(props);
        this.handleCreate = this.handleCreate.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.handleCardnumberSearch = this.handleCardnumberSearch.bind(this);
        this.handleCustomerSearch = this.handleCustomerSearch.bind(this);
        this.handleCustomerRowClick = this.handleCustomerRowClick.bind(this);
        this.handlePersonSearch = this.handlePersonSearch.bind(this);
        this.handlePersonRowClick = this.handlePersonRowClick.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.props.fetchCardProducts(this.props.embossedTypeId);
            this.props.fetchDocumentTypes();
            this.props.cardIssueTypes();
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
    handleCardnumberSearch(number) {
        let cardNumberValidation = validate(number, cardNumberValidator);
        if (!cardNumberValidation.isValid) {
            let cardNumberError = prepareErrors(cardNumberValidation.errors);
            this.setErrors(cardNumberError);
            return;
        }
        this.props.searchCardNumber(number);
    }
    handleCustomerSearch(searchData) {
        let validation = validate(this.props.application.productId, productIdValidator);
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

        //this.props.searchCustomer(searchData.trim(), this.props.application.productId);
        this.props.searchCustomerTSS(searchData.trim(), this.props.application.productId);
    }
    handleCustomerRowClick(rowData) {
        this.props.chooseCustomerFromList(rowData);
        //this.props.searchPerson(rowData.customerNumber);
        this.props.searchPersonTSS(rowData.customerNumber);
    }
    handlePersonSearch(personName) {
        let customerNameValidation = validate(this.props.application.customerName, customerNameValidator);
        let personValidation = validate(personName, personNameValidator);
        if (!customerNameValidation.isValid) {
            let customerNameError = prepareErrors(customerNameValidation.errors);
            this.setErrors(customerNameError);
            return;
        } else if (!personValidation.isValid) {
            let personNameError = prepareErrors(personValidation.errors);
            this.setErrors(personNameError);
            return;
        }
        //this.props.searchPerson(this.props.application.customerNumber, personName.trim());
        this.props.searchPersonTSS(this.props.application.customerNumber, personName.trim());
    }
    handlePersonRowClick(rowData) {
        this.props.choosePersonFromList(rowData);
        //this.props.searchAccounts(this.props.application.customerNumber, rowData.personNumber, this.props.application.productId);
        this.props.searchAccountsTSS(this.props.application.customerNumber, rowData.personNumber, this.props.application.productId);
    }
    handleCreate() {
        let accountsErrors = validateAccounts(this.props.availableAccounts, this.props.linkedAccounts);
        let uploadErrors = validateUploads(this.props.attachments);
        let validation = validateAll(this.props.createStore, getCreateValidator());
        if (accountsErrors.size > 0 || !validation.isValid || uploadErrors.size > 0) {
            let createErrors = prepareErrors(validation.errors);
            this.setErrors(createErrors, accountsErrors, uploadErrors);
            return;
        }
        let paramsToSend = prepareNoNameApplicationToCreate(this.props.application, this.props.linkedAccounts, this.props.cardId, this.props.attachments);
        this.props.createApplication(paramsToSend);
    }
    closeDialog() {
        this.props.clearUploads();
        this.props.clearAccounts();
        this.props.handleNoNameCreateDialogToggle();
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
        let {cardNumber, typeId, productId, customerName, personName, makerComments,issueTypeId} = this.props.application;
        return <div className={style.contentWrapper}>
                <div className={classnames(style.rowPaddings, style.borderBottom)}>
                    <SearchBox
                      defaultValue={cardNumber}
                      label={<span><Text>Card Number</Text> *</span>}
                      boldLabel
                      placeholder={this.translate('Search for card number')}
                      onSearch={this.handleCardnumberSearch}
                      isValid={this.props.errors.get('cardId') === undefined}
                      errorMessage={this.props.errors.get('cardId')}
                    />
                </div>
                <div className={classnames(style.rowPaddings, style.borderBottom)}>
                    <Dropdown
                      defaultSelected={typeId}
                      label={<span><Text>Card Type</Text> *</span>}
                      boldLabel
                      placeholder={<Text>Card Type</Text>}
                      disabled
                      keyProp='typeId'
                      isValid={this.props.errors.get('typeId') === undefined}
                      errorMessage={this.props.errors.get('typeId')}
                      data={this.props.cardTypes.toJS()}
                    />
                </div>
                <div className={classnames(style.rowPaddings, style.borderBottom)}>
                    <Dropdown
                      defaultSelected={issueTypeId}
                      label={<span><Text>Issue Type</Text> *</span>}
                      boldLabel
                      placeholder={<Text>Issue Type</Text>}
                      keyProp='issueTypeId'
                      isValid={this.props.errors.get('issueTypeId') === undefined}
                      errorMessage={this.props.errors.get('issueTypeId')}
                      data={this.props.issueTypes.toJS()}
                      onSelect={this.props.changeIssueType}
                    />
                </div>
                <div className={classnames(style.rowPaddings, style.borderBottom)}>
                    <Dropdown
                      defaultSelected={productId}
                      label={<span><Text>Card Product</Text> *</span>}
                      boldLabel
                      placeholder={<Text>Card Product</Text>}
                      keyProp='productId'
                      isValid={this.props.errors.get('productId') === undefined}
                      errorMessage={this.props.errors.get('productId')}
                      data={this.props.cardProducts.toJS()}
                      onSelect={this.props.changeProductId}
                    />
                </div>
                <div className={classnames(style.rowPaddings, style.borderBottom)} ref={(input) => { this.customersTargetEl = input; }}>
                    <SearchBox
                      defaultValue={customerName}
                      label={<span><Text>Customer Name</Text> *</span>}
                      boldLabel
                      placeholder={this.translate('Search by Customer Number')}
                      isValid={this.props.errors.get('customerName') === undefined}
                      errorMessage={this.props.errors.get('customerName')}
                      onSearch={this.handleCustomerSearch}
                      />
                </div>
                <Popover
                  open={this.props.customersOpen}
                  anchorEl={this.customersTargetEl}
                  anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'middle', vertical: 'top'}}
                  onRequestClose={this.props.closeCustomersPopup}
                >
                    {this.renderGridList(this.props.customers, customersFields, this.handleCustomerRowClick)}
                </Popover>
                <div className={classnames(style.rowPaddings, style.borderBottom)} ref={(input) => { this.personsTargetEl = input; }}>
                    <SearchBox
                      defaultValue={personName}
                      label={<span><Text>Person Name</Text> *</span>}
                      boldLabel
                      placeholder={this.translate('Search by Customer Number')}
                      isValid={!(this.props.errors.get('personName') || this.props.errors.get('personNumber'))}
                      errorMessage={this.props.errors.get('personName') || this.props.errors.get('personNumber')}
                      onSearch={this.handlePersonSearch}
                    />
                </div>
                <Popover
                  open={this.props.personsOpen}
                  anchorEl={this.personsTargetEl}
                  anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'middle', vertical: 'top'}}
                  onRequestClose={this.props.closePersonsPopup}
                >
                    {this.renderGridList(this.props.persons, personsFields, this.handlePersonRowClick)}
                </Popover>
                <div className={classnames(style.rowPaddings, style.borderBottom)}>
                    <TextArea label={<Text>Maker Comment</Text>} rows='3' value={makerComments} onChange={this.props.changeMakerComment} />
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
              title={getDialogTitle('Create No Name Application', this.closeDialog)}
              titleStyle={titleStyle}
              actions={actions}
              style={{zIndex: 1400}}
            >
                {this.renderDialogContent()}
            </Dialog>
        );
    }
}

NoNameApplicationCreate.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    embossedTypeId: PropTypes.number,
    errors: PropTypes.object.isRequired,
    createStore: PropTypes.object.isRequired,
    created: PropTypes.bool.isRequired,
    cardProducts: PropTypes.object.isRequired,
    cardTypes: PropTypes.object.isRequired,
    issueTypes: PropTypes.object.isRequired,
    customersOpen: PropTypes.bool.isRequired,
    customers: PropTypes.object.isRequired,
    personsOpen: PropTypes.bool.isRequired,
    persons: PropTypes.object.isRequired,

    application: PropTypes.shape({
        customerName: PropTypes.string,
        customerNumber: PropTypes.string,
        cardNumber: PropTypes.string,
        holderName: PropTypes.string,
        typeId: PropTypes.node,
        issueTypeId: PropTypes.node,
        productId: PropTypes.node,
        personName: PropTypes.string,
        makerComments: PropTypes.string
    }).isRequired,
    linkedAccounts: PropTypes.object.isRequired,
    availableAccounts: PropTypes.object.isRequired,
    cardId: PropTypes.string,
    attachments: PropTypes.object.isRequired,
    // functions
    createApplication: PropTypes.func.isRequired,
    changeProductId: PropTypes.func.isRequired,
    changeIssueType: PropTypes.func.isRequired,
    handleNoNameCreateDialogToggle: PropTypes.func.isRequired,
    searchCustomer: PropTypes.func.isRequired,
    searchCustomerTSS: PropTypes.func.isRequired,
    closeCustomersPopup: PropTypes.func.isRequired,
    chooseCustomerFromList: PropTypes.func.isRequired,
    choosePersonFromList: PropTypes.func.isRequired,
    changeMakerComment: PropTypes.func.isRequired,
    searchPerson: PropTypes.func.isRequired,
    searchPersonTSS: PropTypes.func.isRequired,
    closePersonsPopup: PropTypes.func.isRequired,
    searchCardNumber: PropTypes.func.isRequired,
    searchAccounts: PropTypes.func.isRequired,
    searchAccountsTSS: PropTypes.func.isRequired,
    clearAccounts: PropTypes.func.isRequired,
    cardIssueTypes: PropTypes.func.isRequired,
    clearUploads: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    fetchCardProducts: PropTypes.func.isRequired,
    fetchDocumentTypes: PropTypes.func.isRequired,
    refechGridData: PropTypes.func.isRequired
};

NoNameApplicationCreate.contextTypes = {
    translate: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    let create = state.cardNoNameApplicationCreate;
    return {
        isOpen: create.get('open'),
        embossedTypeId: state.utCardStatusAction.get('embossedTypeIdNoNamed'),
        errors: create.get('errors'),
        createStore: create,
        created: create.get('created'),
        cardProducts: create.get('cardProducts'),
        cardTypes: create.get('cardTypes'),
        issueTypes: create.get('issueTypes'),
        customersOpen: create.get('customersOpen'),
        customers: create.get('customers'),
        personsOpen: create.get('personsOpen'),
        persons: create.get('persons'),
        application: {
            customerName: create.get('customerName'),
            customerNumber: create.get('customerNumber'),
            cardNumber: create.get('cardNumber'),
            holderName: create.get('mobileNumber'),
            typeId: create.get('typeId'),
            issueTypeId: create.get('issueTypeId'),
            productId: create.get('productId'),
            personName: create.get('personName'),
            personNumber: create.get('personNumber'),
            personId: create.get('personId'),
            makerComments: create.get('makerComments')
        },
        linkedAccounts: state.cardNoNameApplicationAccounts.getIn(['data', 'linked']),
        availableAccounts: state.cardNoNameApplicationAccounts.getIn(['data', 'unlinked']),
        cardId: create.get('cardId'),
        attachments: state.cardNoNameApplicationUploads.get('attachments')
    };
}

export default connect(
    mapStateToProps,
    {
        handleNoNameCreateDialogToggle,
        createApplication,
        changeProductId,
        changeIssueType,
        searchCardNumber,
        searchCustomer,
        searchCustomerTSS,
        closeCustomersPopup,
        chooseCustomerFromList,
        searchPerson,
        searchPersonTSS,
        closePersonsPopup,
        choosePersonFromList,
        changeMakerComment,
        searchAccounts,
        searchAccountsTSS,
        clearAccounts,
        clearUploads,
        setErrors,
        fetchCardProducts,
        fetchDocumentTypes,
        refechGridData,
        cardIssueTypes
    }
)(NoNameApplicationCreate);
