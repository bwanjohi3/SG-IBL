import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { Container, Row, Col } from 'reactstrap';

import {editProduct, changeEditItemField, removeCardProduct, openConfirmation, closeConfirmation, fetchAccountTypes} from './actions';
import {refetch} from '../../Grid/actions';

import style from '../style.css';
import buttonStyles from '../../../../components/ActionStatusButton/style.css';

import Text from 'ut-front-react/components/Text';
import Dialog from '../../../../components/ActionDialog';
import ActionStatusConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';
import Input from 'ut-front-react/components/Input';
import TextArea from 'ut-front-react/components/Input/TextArea';
import DatePicker from 'ut-front-react/components/DatePicker/Simple';
import Checkbox from 'ut-front-react/components/Input/Checkbox';
import MultiSelectDropdown from 'ut-front-react/components/Input/MultiSelectDropdown';
import {prepareProductToEdit} from './helpers';
import classnames from 'classnames';

const createConfirmationMessage = <Text>Are you sure you want to save the changes?</Text>;
const actionOnConfirm = {
    label: 'save',
    name: 'Save'
};

class EditDetail extends Component {
    constructor(props) {
        super(props);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleCheckboxClick = this.handleCheckboxClick.bind(this);
        this.handleMultiSelectDropdownChange = this.handleMultiSelectDropdownChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
    };
    componentWillReceiveProps(nextProps) {
        if (!this.props.fetchedData && nextProps.fetchedData) {
            this.props.fetchAccountTypes();
        }
    }
    handleEdit() {
        const {refetch, editProduct, editItem, isAccountTypeValid, isCustomerTypeValid, removeCardProduct, isConfirmationOpen, openConfirmation} = this.props;
        if (isAccountTypeValid && isCustomerTypeValid && !editItem.get('shouldDisplayErrorText')) {
            if (isConfirmationOpen) {
                let preparedObjToSend = prepareProductToEdit(editItem.toJS());
                editProduct(preparedObjToSend)
                .then((data) => {
                    if (!data.error) {
                        refetch();
                        removeCardProduct();
                    }
                    return {};
                })
                .catch((err) => { throw err; });
            } else {
                openConfirmation();
            }
        }
    }

    handleClose() {
        this.props.removeCardProduct();
    }
    handleDateChange(fieldName, date) {
        this.props.changeEditItemField('shouldDisplayErrorText', false);
        this.props.changeEditItemField(fieldName, date.value);
        this.props.editItem && !this.props.editItem.get('canMakeEdit') && this.props.changeEditItemField('canMakeEdit', true);
    }
    handleStartDateChange(date) {
        this.handleDateChange('startDate', date);
    }
    handleEndDateChange(date) {
        this.handleDateChange('endDate', date);
    }

    handleCheckboxClick() {
        const {changeEditItemField, editItem} = this.props;
        if (!editItem.get('withoutEndDate')) {
            changeEditItemField('shouldDisplayErrorText', false);
        } else {
            changeEditItemField('shouldDisplayErrorText', true);
        }
        this.props.editItem && !this.props.editItem.get('canMakeEdit') && this.props.changeEditItemField('canMakeEdit', true);
        changeEditItemField('withoutEndDate', !editItem.get('withoutEndDate'));
        changeEditItemField('endDate', null);
    }

    handleMultiSelectDropdownChange(field) {
        return (selected) => {
            this.props.changeEditItemField(field, selected.value);
            this.props.editItem && !this.props.editItem.get('canMakeEdit') && this.props.changeEditItemField('canMakeEdit', true);
        };
    }
    getSaveBtnStyles(isDisabled) {
        let styles = [buttonStyles.statusActionButton, style.popupButtons];
        if (isDisabled) {
            styles.push(buttonStyles.statusActionButtonDisabled);
        } else {
            styles.push(buttonStyles.highlighted);
        }
        return classnames(styles);
    }
    getActionButtons() {
        let actionButtons = [];
        if (this.context.checkPermission('card.product.edit')) {
            let isSaveDisabled = this.props.editItem && !this.props.editItem.get('canMakeEdit');
            let saveBtn = <button className={this.getSaveBtnStyles(isSaveDisabled)} onClick={this.handleEdit} disabled={isSaveDisabled}>
                <Text>Save</Text>
            </button>;
            actionButtons.push(saveBtn);
        }

        let closeBtn = <button className={classnames(buttonStyles.statusActionButton, style.popupButtons)} onClick={this.handleClose}>
            <Text>Close</Text>
        </button>;
        actionButtons.push(closeBtn);

        return actionButtons;
    }
    render() {
        let {editItem, changeEditItemField, accountTypes, customerTypes, isAccountTypeValid, isCustomerTypeValid} = this.props;
        let startDate = editItem && editItem.get('startDate') ? new Date(editItem.get('startDate')) : null;
        let endDate = editItem && editItem.get('endDate') ? new Date(editItem.get('endDate')) : null;
        let minEndDate = startDate ? new Date(startDate.getTime() + (24 * 60 * 60 * 1000)) : new Date();
        let maxStartDate = endDate ? new Date(endDate.getTime() - (24 * 60 * 60 * 1000)) : new Date();

        let actionButtons = this.getActionButtons();
        let canEditFields = this.context.checkPermission('card.product.edit');
        return (
            <div>
                <Dialog
                  autoScrollBodyContent
                  title='Edit Card Product'
                  open={!!(editItem)}
                  actions={actionButtons}
                  onClose={this.handleClose}
                >
                    <Container>
                        <div className={style.contentWrapper}>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Applicable For</Text></Col>
                                <Col xs='9'>
                                    <Input value={(editItem) ? editItem.get('embossedTypeName') : ''} name='embossedTypeName' readonly />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Product Name</Text></Col>
                                <Col xs='9'>
                                    <Input value={(editItem) ? editItem.get('name') : ''} readonly />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Account Type</Text>*</Col>
                                <Col xs='9'>
                                    <MultiSelectDropdown
                                      placeholder='Select Account Type'
                                      defaultSelected={(editItem && editItem.get('productAccountType')) ? editItem.get('productAccountType').toJS() : []}
                                      onSelect={this.handleMultiSelectDropdownChange('productAccountType')}
                                      data={accountTypes.toJS().map((account) => ({key: account.accountTypeId, name: account.accountTypeName}))}
                                      isValid={isAccountTypeValid}
                                      errorMessage='Account Type is required for all Card Products'
                                      disabled={!canEditFields}
                                    />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Customer Type</Text></Col>
                                <Col xs='9'>
                                    <MultiSelectDropdown
                                      placeholder='Select Customer Type'
                                      defaultSelected={(editItem && editItem.get('productCustomerType')) ? editItem.get('productCustomerType').toJS() : ''}
                                      onSelect={(selected) => { changeEditItemField('productCustomerType', selected.value); }}
                                      data={customerTypes.toJS().map((customer) => ({key: customer.customerTypeId, name: customer.name}))}
                                      isValid={isCustomerTypeValid}
                                      errorMessage='Customer Type is required for all Card Products'
                                      disabled
                                    />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Product Description</Text></Col>
                                <Col xs='9' className={style.textareaWrapper}>
                                    <TextArea value={(editItem) ? editItem.get('description') : ''} readonly />
                                </Col>
                            </Row>

                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Product Start Date</Text>*</Col>
                                <Col xs='9'>
                                    <DatePicker
                                      defaultValue={editItem ? new Date(editItem.get('startDate')) : {}}
                                      disabled={!canEditFields}
                                      maxDate={maxStartDate}
                                      onChange={this.handleStartDateChange}
                                    />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Product End Date</Text>*</Col>
                                <Col xs='9'>
                                    <DatePicker
                                      defaultValue={endDate}
                                      onChange={this.handleEndDateChange}
                                      minDate={minEndDate}
                                      disabled={(editItem && editItem.get('withoutEndDate')) || !canEditFields}
                                      isValid={editItem ? !editItem.get('shouldDisplayErrorText') : true}
                                      errorMessage='Select "End Date" or check the box below'
                                    />
                                     <div className={style.checkbox}>
                                        <Checkbox
                                          label='Without End Date'
                                          checked={editItem ? editItem.get('withoutEndDate') : false}
                                          onClick={this.handleCheckboxClick}
                                          isDisabled={!canEditFields}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Business Unit</Text></Col>
                                 <Col xs='9'>
                                    <Input value={(editItem) ? editItem.get('branchName') : ''} readonly />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Apply periodic card fee</Text></Col>
                                 <Col xs='9'>
                                    <Input value={(editItem) ? editItem.get('periodicCardFeeName') : ''} readonly />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>Account Link Limit</Text></Col>
                                <Col xs='9'>
                                    <Input
                                      readonly
                                      value={(editItem) ? editItem.get('accountLinkLimit') : ''}
                                      name='name'
                                    />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>PIN Retries Limit</Text></Col>
                                <Col xs='9'>
                                    <Input
                                      readonly
                                      value={(editItem) ? editItem.get('pinRetriesLimit') : ''}
                                      name='name'
                                    />
                                </Col>
                            </Row>
                            <Row className={style.rowTopMargin}>
                                <Col xs='3'><Text>PIN Retries Daily Limit</Text></Col>
                                <Col xs='9'>
                                    <Input
                                      readonly
                                      value={(editItem) ? editItem.get('pinRetriesDailyLimit') : ''}
                                      name='name'
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Container>
                </Dialog>
                <ActionStatusConfirmationDialog
                  open={this.props.isConfirmationOpen}
                  page='product'
                  action={actionOnConfirm}
                  confirmationMessage={createConfirmationMessage}
                  onSuccess={this.handleEdit}
                  onCancel={this.props.closeConfirmation}
                />
            </div>
        );
    }
};

EditDetail.propTypes = {
    editProduct: PropTypes.func,
    // checkedRows: PropTypes.object,
    fetchedData: PropTypes.bool.isRequired,
    editItem: PropTypes.object,
    changeEditItemField: PropTypes.func,
    refetch: PropTypes.func,
    customerTypes: PropTypes.object,
    accountTypes: PropTypes.object,
    isAccountTypeValid: PropTypes.bool,
    isCustomerTypeValid: PropTypes.bool,

    isConfirmationOpen: PropTypes.bool,
    removeCardProduct: PropTypes.func,
    openConfirmation: PropTypes.func,
    closeConfirmation: PropTypes.func,
    fetchAccountTypes: PropTypes.func
};

EditDetail.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state, ownProps) => {
        return {
            fetchedData: state.editCardProduct.get('fetchedData'),
            editItem: state.editCardProduct.get('editItem'),
            // checkedRows: state.cardProductGrid.get('checkedRows'),
            accountTypes: state.editCardProduct.get('accountTypes'),
            customerTypes: state.createCardProduct.get('customerTypes'),
            isAccountTypeValid: (state.editCardProduct.get('editItem') && state.editCardProduct.getIn(['editItem', 'productAccountType'])) ? state.editCardProduct.getIn(['editItem', 'productAccountType']).size > 0 : true,
            isCustomerTypeValid: (state.editCardProduct.get('editItem') && state.editCardProduct.getIn(['editItem', 'productCustomerType'])) ? state.editCardProduct.getIn(['editItem', 'productCustomerType']).size > 0 : true,

            isConfirmationOpen: state.editCardProduct.get('isConfirmationOpen')
        };
    },
    {editProduct, refetch, changeEditItemField, removeCardProduct, openConfirmation, closeConfirmation, fetchAccountTypes}
)(EditDetail);
