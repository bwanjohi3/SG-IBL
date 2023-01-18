import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import immutable from 'immutable';

import validations from './validations';

import {
    fetchPeriodicCardFee,
    // fetchBusinessUnits,
    toggleCreateCardProductPopup,
    createProduct,
    fetchAccountTypes,
    fetchCustomerTypes
} from './actions';

import {refetch} from '../../Grid/actions';

import style from '../style.css';
import buttonStyles from '../../../../components/ActionStatusButton/style.css';

import Dialog from '../../../../components/ActionDialog';
import Input from 'ut-front-react/components/Input';
import TextArea from 'ut-front-react/components/Input/TextArea';
import DatePicker from 'ut-front-react/components/DatePicker/Simple';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import MultiSelectDropdown from 'ut-front-react/components/Input/MultiSelectDropdown';
import Checkbox from 'ut-front-react/components/Input/Checkbox';
import Text from 'ut-front-react/components/Text';

const getInitialState = () => ({
    data: {
        embossedTypeId: '',
        name: '',
        description: '',
        startDate: null,
        endDate: null,
        isActive: true,
        periodicCardFeeId: undefined,
        branchId: '',
        accountLinkLimit: null,
        pinRetriesLimit: null,
        pinRetriesDailyLimit: null,
        productAccountType: [],
        productCustomerType: []
    },
    joiValidationErrors: {},
    endDateValidationError: {
        withoutEndDate: false,
        isValid: true,
        validationMessage: 'Select "End Date" or check the box below'
    },
    shouldValidateAlways: false
});

class CreateDetail extends Component {
    constructor(props) {
        super(props);
        this.handleCreate = this.handleCreate.bind(this);
        this.resetState = this.resetState.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleWithoutEndDateCheckboxClick = this.handleWithoutEndDateCheckboxClick.bind(this);
        this.validateEndDate = this.validateEndDate.bind(this);
        this.state = getInitialState();
    };

    componentWillReceiveProps(nextProps) {
        let shouldShowApplicableFor = nextProps.usedCardTypes === 'both';
        let shouldSetApplicableForInState = !shouldShowApplicableFor && nextProps.embossedTypes.size > 0 && !this.state.data.embossedTypeId;
        if (!this.props.opened && nextProps.opened) {
            this.fetchDropdownsData();
        }
        if (shouldSetApplicableForInState) {
            let foundId = nextProps.embossedTypes.find((classification) => {
                return classification.get('label') === nextProps.usedCardTypes;
            }).get('key');
            let state = this.state;
            state.data.embossedTypeId = foundId;
            this.setState(state);
        }
    }
    fetchDropdownsData() {
        const { fetchPeriodicCardFee, fetchCustomerTypes, fetchAccountTypes } = this.props;

        fetchPeriodicCardFee();
        fetchCustomerTypes();
        fetchAccountTypes();
    }
    resetState() {
        this.setState(getInitialState());
    }

    validateEndDate(nextState) {
        if (this.state.data.endDate === null && this.state.endDateValidationError.withoutEndDate === false) {
            nextState.endDateValidationError.isValid = false;
        } else {
            nextState.endDateValidationError.isValid = true;
        }
    }

    handleInputChange(field) {
        return (event) => {
            let nextState = this.state;
            let trimmedValue = ('' + event.value).trim();
            nextState.data[field] = trimmedValue.length < 1 ? trimmedValue : event.value;
            let formValidation = validations.run(nextState.data, this.props.periodicCardFeeOptional);
            if (!formValidation.isValid && nextState.shouldValidateAlways) {
                nextState.joiValidationErrors = formValidation.errors;
            } else {
                nextState.joiValidationErrors = {};
            }
            this.setState(nextState);
        };
    }

    handleDateChange(field) {
        return (date) => {
            let nextState = Object.assign({}, this.state);
            nextState.data[field] = new Date(date.value);
            let formValidation = validations.run(nextState.data, this.props.periodicCardFeeOptional);
            if (!formValidation.isValid && nextState.shouldValidateAlways) {
                nextState.joiValidationErrors = formValidation.errors;
            } else {
                nextState.joiValidationErrors = {};
            }
            if (field === 'endDate') {
                this.validateEndDate(nextState);
            }
            this.setState(nextState);
        };
    }

    handleMultiSelectDropdownChange(field) {
        return (selected) => {
            let nextState = Object.assign({}, this.state);
            nextState.data[field] = selected.value;
            let formValidation = validations.run(nextState.data, this.props.periodicCardFeeOptional);
            if (!formValidation.isValid && nextState.shouldValidateAlways) {
                nextState.joiValidationErrors = formValidation.errors;
            } else {
                nextState.joiValidationErrors = {};
            }
            this.setState(nextState);
        };
    }

    handleWithoutEndDateCheckboxClick() {
        let nextState = Object.assign(this.state);
        if (!nextState.endDateValidationError.withoutEndDate) {
            nextState.data.endDate = null;
        }
        nextState.endDateValidationError.withoutEndDate = !nextState.endDateValidationError.withoutEndDate;
        this.validateEndDate(nextState);
        this.setState(nextState);
    }

    handleCreate() {
        let formValidation = validations.run(this.state.data, this.props.periodicCardFeeOptional);
        if (formValidation.isValid && this.state.endDateValidationError.isValid) {
            const {createProduct, toggleCreateCardProductPopup, refetch} = this.props;
            let sendState = Object.assign({}, this.state.data);
            createProduct(sendState).then(
                (data) => {
                    if (!data.error) {
                        this.resetState();
                        toggleCreateCardProductPopup();
                        refetch();
                    }
                    return {};
                }
            ).catch((err) => { throw err; });
        } else {
            let nextState = Object.assign(this.state);
            nextState.joiValidationErrors = formValidation.errors;
            nextState.shouldValidateAlways = true;
            this.validateEndDate(nextState);
            this.setState(nextState);
        }
    }

    handleClose() {
        this.props.toggleCreateCardProductPopup();
        this.resetState();
    }

    render() {
        let actions = [
            <button className={classnames(buttonStyles.statusActionButton, buttonStyles.highlighted, style.popupButtons)} onClick={this.handleCreate}>
                <Text>Create</Text>
            </button>,
            <button className={classnames(buttonStyles.statusActionButton, style.popupButtons)} onClick={this.handleClose}>
                <Text>Close</Text>
            </button>
        ];

        let startDate = this.state.data.startDate ? new Date(this.state.data.startDate) : null;
        let endDate = this.state.data.endDate ? new Date(this.state.data.endDate) : null;
        let minEndDate = this.state.data.startDate ? new Date(startDate.getTime() + (24 * 60 * 60 * 1000)) : new Date();
        let maxStartDate = this.state.data.endDate ? new Date(this.state.data.endDate.getTime() - (24 * 60 * 60 * 1000)) : new Date('2070 12 30');
        let showApplicableFor = this.props.usedCardTypes === 'both';
        // console.dir(this.state.joiValidationErrors);
        return (
                <Dialog
                  autoScrollBodyContent
                  title='Create Card Product'
                  open={this.props.opened}
                  actions={actions}
                  onClose={this.handleClose}
                >
                    <Container>
                        <div className={style.contentWrapper}>
                                {showApplicableFor && <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Applicable For</Text>*</Col>
                                    <Col xs='9'>
                                        <Dropdown
                                          placeholder='Select Applicable For'
                                          defaultSelected={this.state.data.embossedTypeId}
                                          onSelect={this.handleInputChange('embossedTypeId')}
                                          data={this.props.embossedTypes.toJS()}
                                          isValid={this.state.joiValidationErrors.embossedTypeId === undefined}
                                          errorMessage={this.state.joiValidationErrors.embossedTypeId}
                                        />
                                    </Col>
                                </Row>}
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Product Name</Text>*</Col>
                                    <Col xs='9'>
                                        <Input
                                          value={this.state.data.name}
                                          name='name'
                                          onChange={this.handleInputChange('name')}
                                          isValid={this.state.joiValidationErrors.name === undefined}
                                          errorMessage={this.state.joiValidationErrors.name}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Account Type</Text>*</Col>
                                    <Col xs='9'>
                                        <MultiSelectDropdown
                                          placeholder='Select Account Type'
                                          defaultSelected={this.state.data.productAccountType}
                                          onSelect={this.handleMultiSelectDropdownChange('productAccountType')}
                                          data={this.props.accountTypes.toJS().map((account) => ({key: account.accountTypeId, name: account.accountTypeName}))}
                                          isValid={this.state.joiValidationErrors.productAccountType === undefined}
                                          errorMessage={this.state.joiValidationErrors.productAccountType}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Customer Type</Text>*</Col>
                                    <Col xs='9'>
                                        <MultiSelectDropdown
                                          placeholder='Select Customer Type'
                                          defaultSelected={this.state.data.productCustomerType}
                                          onSelect={this.handleMultiSelectDropdownChange('productCustomerType')}
                                          data={this.props.customerTypes.toJS().map((customer) => ({key: customer.customerTypeId, name: customer.name}))}
                                          isValid={this.state.joiValidationErrors.productCustomerType === undefined}
                                          errorMessage={this.state.joiValidationErrors.productCustomerType}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Product Description</Text>*</Col>
                                    <Col xs='9'>
                                        <TextArea
                                          value={this.state.data.description}
                                          onChange={this.handleInputChange('description')}
                                          isValid={this.state.joiValidationErrors.description === undefined}
                                          errorMessage={this.state.joiValidationErrors.description}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Product Start Date</Text>*</Col>
                                    <Col xs='9'>
                                        <DatePicker
                                          defaultValue={startDate}
                                          onChange={this.handleDateChange('startDate')}
                                          isValid={this.state.joiValidationErrors.startDate === undefined}
                                          errorMessage={this.state.joiValidationErrors.startDate}
                                          maxDate={maxStartDate}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Product End Date</Text>*</Col>
                                    <Col xs='9'>
                                        <DatePicker
                                          defaultValue={endDate}
                                          minDate={minEndDate}
                                          onChange={this.handleDateChange('endDate')}
                                          disabled={this.state.endDateValidationError.withoutEndDate}
                                          iconStyles={this.state.endDateValidationError.withoutEndDate ? {backgroundColor: '#d7d6d6'} : {}}
                                          isValid={this.state.endDateValidationError.isValid}
                                          errorMessage={this.state.endDateValidationError.validationMessage}
                                        />
                                        <div className={style.checkbox}>
                                            <Checkbox
                                              label='Without End Date'
                                              checked={this.state.endDateValidationError.withoutEndDate}
                                              onClick={this.handleWithoutEndDateCheckboxClick}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Business Unit</Text>*</Col>
                                    <Col xs='9'>
                                        <Dropdown
                                          placeholder='Select Business Unit'
                                          defaultSelected={this.state.data.branchId}
                                          onSelect={this.handleInputChange('branchId')}
                                          data={this.props.organizations.size > 0 ? this.props.organizations.toJS().map((organization) => ({key: organization.id, name: organization.title})) : []}
                                          isValid={this.state.joiValidationErrors.branchId === undefined}
                                          errorMessage={this.state.joiValidationErrors.branchId}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Apply periodic card fee</Text>{!this.props.periodicCardFeeOptional && '*'}</Col>
                                    <Col xs='9'>
                                        <Dropdown
                                          defaultSelected={this.state.data.periodicCardFeeId}
                                          placeholder='Select periodic card fee'
                                          onSelect={this.handleInputChange('periodicCardFeeId')}
                                          data={this.props.periodicCardFee.toJS().map((fee) => ({name: fee.name, key: fee.periodicCardFeeId}))}
                                          isValid={this.state.joiValidationErrors.periodicCardFeeId === undefined}
                                          errorMessage={this.state.joiValidationErrors.periodicCardFeeId}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>Account Link Limit</Text>*</Col>
                                    <Col xs='9'>
                                        <Input
                                          value={this.state.data.accountLinkLimit}
                                          name='name'
                                          onChange={this.handleInputChange('accountLinkLimit')}
                                          isValid={this.state.joiValidationErrors.accountLinkLimit === undefined}
                                          errorMessage={this.state.joiValidationErrors.accountLinkLimit}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>PIN Retries Limit</Text>*</Col>
                                    <Col xs='9'>
                                        <Input
                                          value={this.state.data.pinRetriesLimit}
                                          onChange={this.handleInputChange('pinRetriesLimit')}
                                          isValid={this.state.joiValidationErrors.pinRetriesLimit === undefined}
                                          errorMessage={this.state.joiValidationErrors.pinRetriesLimit}
                                        />
                                    </Col>
                                </Row>
                                <Row className={style.rowTopMargin}>
                                    <Col xs='3'><Text>PIN Retries Daily Limit</Text>*</Col>
                                    <Col xs='9'>
                                        <Input
                                          value={this.state.data.pinRetriesDailyLimit}
                                          onChange={this.handleInputChange('pinRetriesDailyLimit')}
                                          isValid={this.state.joiValidationErrors.pinRetriesDailyLimit === undefined}
                                          errorMessage={this.state.joiValidationErrors.pinRetriesDailyLimit}
                                        />
                                    </Col>
                                </Row>
                        </div>
                    </Container>
                </Dialog>
        );
    }
};

CreateDetail.propTypes = {
    opened: PropTypes.bool.isRequired,
    periodicCardFeeOptional: PropTypes.bool,
    usedCardTypes: PropTypes.string.isRequired,

    fetchPeriodicCardFee: PropTypes.func.isRequired,
    // fetchBusinessUnits: PropTypes.func.isRequired,
    fetchCustomerTypes: PropTypes.func,
    fetchAccountTypes: PropTypes.func,
    createProduct: PropTypes.func,
    refetch: PropTypes.func,
    toggleCreateCardProductPopup: PropTypes.func.isRequired,

    embossedTypes: PropTypes.object.isRequired,
    organizations: PropTypes.object.isRequired,
    accountTypes: PropTypes.object.isRequired,
    customerTypes: PropTypes.object.isRequired,
    periodicCardFee: PropTypes.object.isRequired
};

export default connect(
    (state, ownProps) => {
        return {
            opened: state.createCardProduct.get('isOpen'),

            embossedTypes: state.utCardStatusAction.get('embossedTypes'),
            periodicCardFeeOptional: state.cardConfig.getIn(['cardProducts', 'periodicCardFeeOptional']),
            usedCardTypes: state.cardConfig.get('usedCardTypes'),
            organizations: state.businessUnits.hasIn(['units', 'businessUnit']) ? state.businessUnits.getIn(['units', 'businessUnit']) : immutable.List([]),
            accountTypes: state.createCardProduct.get('accountTypes'),
            customerTypes: state.createCardProduct.get('customerTypes'),
            periodicCardFee: state.createCardProduct.get('periodicCardFee')
        };
    },
    {
        fetchPeriodicCardFee,
        // fetchBusinessUnits,
        refetch,
        toggleCreateCardProductPopup,
        createProduct,
        fetchCustomerTypes,
        fetchAccountTypes
    }
)(CreateDetail);
