import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

// react components
import StandardDialog from 'ut-front-react/components/Popup';
import Input from 'ut-front-react/components/Input';
import Text from 'ut-front-react/components/Text';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import CurrencyDropddown from '../../../components/CurrencyDropdown';
import { Col } from 'reactstrap';
// actions
import {
    saveAtm,
    close as handleDetailsClose,
    // input fields actions - left
    setFieldValue,
    fetchBranches,
    setErrors
} from './actions';
// helpers
import {
    compare,
    validateDenomination,
    validateAll,
    prepareErrors,
    getCreateValidator
} from './helpers';

// styles
import classnames from 'classnames';
import style from './style.css';

class AtmDetails extends Component {
    constructor(props) {
        super(props);
        this.requiredFields = {luno:true};
        this.saveAtm = this.saveAtm.bind(this);
        this.setFieldValue = this.setFieldValue.bind(this);
        this.getDialogComponents = this.getDialogComponents.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        this.requiredFields = false;
        this.hiddenFields = false;
        if (this.props.requiredFields) {
            this.requiredFields = this.props.requiredFields.reduce((a, c) => {
                a[c] = true;
                return a;
            }, {});
        }
        this.requiredFields.luno=true;
        this.requiredFields.tmk=true;
        this.requiredFields.tmkkvv=true;
        this.requiredFields.name=true;
        this.requiredFields.terminalId=true;
        this.requiredFields.terminalName=true;
        this.requiredFields.identificationCode=true;
        this.requiredFields.merchantType=true;
        this.requiredFields.cassette1Denomination=true;
        this.requiredFields.cassette2Denomination=true;
        this.requiredFields.cassette3Denomination=true;
        this.requiredFields.cassette4Denomination=true;
        this.requiredFields.cassette1Currency=true;
        this.requiredFields.cassette2Currency=true;
        this.requiredFields.cassette3Currency=true;
        this.requiredFields.cassette4Currency=true;
        this.requiredFields.address=true;
        if (this.props.hiddenFields) {
            this.hiddenFields = this.props.hiddenFields.reduce((a, c) => {
                a[c] = true;
                return a;
            }, {});
        }
        if (!this.props.opened && nextProps.opened) {
            this.props.fetchBranches();
        }
    }
    saveAtm() {
        let validation = validateAll(this.props.editableValues, getCreateValidator(this.hiddenFields || {}, this.requiredFields || {}));
        let denominationValidation = validateDenomination(this.props.initialValues.mergeDeep(this.props.editableValues));

        if (!validation.isValid || !denominationValidation.isValid) {
            let errorArray = validation.errors.concat(denominationValidation.errors);
            let createErrors = prepareErrors(errorArray);
            this.props.setErrors({form: createErrors});
            return;
        };
        let params = compare(this.props.initialValues, this.props.editableValues);
        if (Object.keys(params).length) {
            this.props.saveAtm(params, this.props.initialValues.get('atmId'));
        } else {
            this.props.handleDetailsClose();
        }
    }

    setFieldValue(key) {
        return (info) => {
            return this.props.setFieldValue(key, info.value);
        };
    }
    // FE processing

    getDialogComponents() {
        var editableValues = this.props.editableValues.toJS();
        var requiredFields = this.requiredFields || {};
        let luno =
            (this.hiddenFields && !this.hiddenFields.luno && <div key='luno' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.luno}
                  onChange={this.setFieldValue('luno')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>LUNO</Text>{requiredFields && requiredFields && requiredFields.luno ? '*' : ''}</span>}
                  placeholder='LUNO'
                  isEdited={false}
                  isValid={this.props.errors.get('luno') === undefined}
                  errorMessage={this.props.errors.get('luno')}
                />
            </div>);
        let tmkkvv =
            (this.hiddenFields && !this.hiddenFields.tmkkvv && <div key='tmkkvv' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.tmkkvv}
                  keyProp=''
                  boldLabel
                  onChange={this.setFieldValue('tmkkvv')}
                  label={<span><Text>TMKKVV</Text>{requiredFields && requiredFields.tmkkvv ? '*' : ''}</span>}
                  placeholder='TMKKVV'
                  isEdited={false}
                  isValid={this.props.errors.get('tmkkvv') === undefined}
                  errorMessage={this.props.errors.get('tmkkvv')}
                />
            </div>);
        let merchantType =
            (this.hiddenFields && !this.hiddenFields.merchantType && <div key='merchantType' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.merchantType}
                  keyProp=''
                  boldLabel
                  onChange={this.setFieldValue('merchantType')}
                  label={<span><Text>Merchant type</Text>{requiredFields && requiredFields.merchantType ? '*' : ''}</span>}
                  placeholder='Merchant type'
                  isEdited={false}
                  isValid={this.props.errors.get('merchantType') === undefined}
                  errorMessage={this.props.errors.get('merchantType')}
                />
            </div>);
        let terminalId =
            (this.hiddenFields && !this.hiddenFields.terminalId && <div key='terminalId' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.terminalId}
                  keyProp=''
                  boldLabel
                  onChange={this.setFieldValue('terminalId')}
                  label={<span><Text>Terminal ID</Text>{requiredFields && requiredFields.terminalId ? '*' : ''}</span>}
                  placeholder='Terminal ID'
                  isEdited={false}
                  isValid={this.props.errors.get('terminalId') === undefined}
                  errorMessage={this.props.errors.get('terminalId')}
                />
            </div>);
        let terminalName =
            (this.hiddenFields && !this.hiddenFields.terminalName && <div key='terminalName' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.terminalName}
                  keyProp=''
                  boldLabel
                  onChange={this.setFieldValue('terminalName')}
                  label={<span><Text>Name and location</Text>{requiredFields && requiredFields.terminalName ? '*' : ''}</span>}
                  placeholder='Name and location'
                  isEdited={false}
                  isValid={this.props.errors.get('terminalName') === undefined}
                  errorMessage={this.props.errors.get('terminalName')}
                />
            </div>);
        let tmk =
        (this.hiddenFields && !this.hiddenFields.tmk && <div key='tmk' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.tmk}
                  keyProp=''
                  boldLabel
                  onChange={this.setFieldValue('tmk')}
                  label={<span><Text>TMK</Text>{requiredFields && requiredFields.tmk ? '*' : ''}</span>}
                  placeholder='TMK'
                  isEdited={false}
                  isValid={this.props.errors.get('tmk') === undefined}
                  errorMessage={this.props.errors.get('tmk')}
                />
            </div>);

        let name =
            (this.hiddenFields && !this.hiddenFields.name && <div key='name' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.name}
                  keyProp=''
                  boldLabel
                  onChange={this.setFieldValue('name')}
                  label={<span><Text>Name</Text>{requiredFields && requiredFields.name ? '*' : ''}</span>}
                  placeholder='Name'
                  isEdited={false}
                  isValid={this.props.errors.get('name') === undefined}
                  errorMessage={this.props.errors.get('name')}
                />
            </div>);
        let identificationCode =
            (this.hiddenFields && !this.hiddenFields.identificationCode && <div key='identificationCode' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.identificationCode}
                  keyProp=''
                  boldLabel
                  onChange={this.setFieldValue('identificationCode')}
                  label={<span><Text>Identification code</Text>{requiredFields && requiredFields.identificationCode ? '*' : ''}</span>}
                  placeholder='Identification code'
                  isEdited={false}
                  isValid={this.props.errors.get('identificationCode') === undefined}
                  errorMessage={this.props.errors.get('identificationCode')}
                />
            </div>);
        let customization =
            (this.hiddenFields && !this.hiddenFields.customization && <div key='customization' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.customization}
                  boldLabel
                  keyProp=''
                  onChange={this.setFieldValue('customization')}
                  label={<span><Text>Menu Profile</Text>{requiredFields && requiredFields.customization ? '*' : ''}</span>}
                  placeholder='Menu Profile'
                  isEdited={false}
                  isValid={this.props.errors.get('customization') === undefined}
                  errorMessage={this.props.errors.get('customization')}
                />
            </div>);
        let tillAccount =
            (this.hiddenFields && !this.hiddenFields.tillAccount && <div key='tillAccount' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.tillAccount}
                  boldLabel
                  keyProp=''
                  onChange={this.setFieldValue('tillAccount')}
                  label={<span><Text>Till Account</Text>{requiredFields && requiredFields.tillAccount ? '*' : ''}</span>}
                  placeholder='Till Account'
                  isEdited={false}
                  isValid={this.props.errors.get('tillAccount') === undefined}
                  errorMessage={this.props.errors.get('tillAccount')}
                />
            </div>);
        let branch =
            (this.hiddenFields && !this.hiddenFields.branch && <div key='branch' className={classnames(style.rowPaddings, style.borderBottom)}>
                <div className={style.branch}>
                <Dropdown
                  label={<span><Text>Branch</Text>{requiredFields && requiredFields.branch ? '*' : ''}</span>}
                  placeholder='Branch'
                  boldLabel
                  data={this.props.branches}
                  defaultSelected={editableValues.branchId}
                  onSelect={this.setFieldValue('branchId')}
                  isValid={this.props.errors.get('branchId') === undefined}
                  errorMessage={this.props.errors.get('branchId')}
                />
                </div>
            </div>);
        let feeAccount =
            (this.hiddenFields && !this.hiddenFields.feeAccount && <div key='feeAccount' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.feeAccount}
                  boldLabel
                  keyProp=''
                  onChange={this.setFieldValue('feeAccount')}
                  label={<span><Text>Fee Account</Text>{requiredFields && requiredFields.feeAccount ? '*' : ''}</span>}
                  placeholder='Fee Account'
                  isEdited={false}
                  isValid={this.props.errors.get('feeAccount') === undefined}
                  errorMessage={this.props.errors.get('feeAccount')}
                />
            </div>);
        let commissionAccount =
            (this.hiddenFields && !this.hiddenFields.commissionAccount && <div key='commissionAccount' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.commissionAccount}
                  boldLabel
                  keyProp=''
                  onChange={this.setFieldValue('commissionAccount')}
                  label={<span><Text>Commission Account</Text>{requiredFields && requiredFields.commissionAccount ? '*' : ''}</span>}
                  placeholder='Commission Account'
                  isEdited={false}
                  isValid={this.props.errors.get('commissionAccount') === undefined}
                  errorMessage={this.props.errors.get('commissionAccount')}
                />
            </div>);
        let cassette1 =
            (this.hiddenFields && !this.hiddenFields.denomination1 && <div key='cassette1' className={style.rowPaddings}>
                <div className={style.cassetteCurrency}>
                    <CurrencyDropddown
                      label={<span><Text>Cassette Type 1</Text>{requiredFields && requiredFields.cassette1Currency ? '*' : ''}</span>}
                      boldLabel
                      placeholder={<Text>Currency</Text>}
                      keyProp='name'
                      onSelect={this.setFieldValue('cassette1Currency')}
                      canSelectPlaceholder={false}
                      defaultSelected={editableValues.cassette1Currency}
                    />
                </div>
                <div className={style.cassetteDenomination}>
                    <Input
                      value={editableValues.cassette1Denomination}
                      keyProp=''
                      onChange={this.setFieldValue('cassette1Denomination')}
                      placeholder='Denomination'
                      isEdited={false}
                    />
                </div>
            </div>);
        let cassette2 =
            (this.hiddenFields && !this.hiddenFields.denomination2 && <div key='cassette2' className={style.rowPaddings}>
                <div className={style.cassetteCurrency}>
                    <CurrencyDropddown
                      label={<span><Text>Cassette Type 2</Text>{requiredFields && requiredFields.cassette2Currency ? '*' : ''}</span>}
                      boldLabel
                      placeholder={<Text>Currency</Text>}
                      keyProp='name'
                      onSelect={this.setFieldValue('cassette2Currency')}
                      canSelectPlaceholder={false}
                      defaultSelected={editableValues.cassette2Currency}
                    />
                </div>
                <div className={style.cassetteDenomination}>
                    <Input
                      value={editableValues.cassette2Denomination}
                      keyProp=''
                      onChange={this.setFieldValue('cassette2Denomination')}
                      placeholder='Denomination'
                      isEdited={false}
                    />
                </div>
            </div>);
        let cassette3 =
            (this.hiddenFields && !this.hiddenFields.denomination3 && <div key='cassette3' className={style.rowPaddings}>
                <div className={style.cassetteCurrency}>
                    <CurrencyDropddown
                      label={<span><Text>Cassette Type 3</Text>{requiredFields && requiredFields.cassette3Currency ? '*' : ''}</span>}
                      boldLabel
                      placeholder={<Text>Currency</Text>}
                      keyProp='name'
                      onSelect={this.setFieldValue('cassette3Currency')}
                      canSelectPlaceholder={false}
                      defaultSelected={editableValues.cassette3Currency}
                    />
                </div>
                <div className={style.cassetteDenomination}>
                    <Input
                      value={editableValues.cassette3Denomination}
                      keyProp=''
                      onChange={this.setFieldValue('cassette3Denomination')}
                      placeholder='Denomination'
                      isEdited={false}
                    />
                </div>
            </div>);
        let cassette4 =
            (this.hiddenFields && !this.hiddenFields.denomination4 && <div key='cassette4' className={style.rowPaddings}>
                <div className={style.cassetteCurrency}>
                    <CurrencyDropddown
                      label={<span><Text>Cassette Type 4</Text>{requiredFields && requiredFields.cassette4Currency ? '*' : ''}</span>}
                      boldLabel
                      placeholder={<Text>Currency</Text>}
                      keyProp='name'
                      onSelect={this.setFieldValue('cassette4Currency')}
                      canSelectPlaceholder={false}
                      defaultSelected={editableValues.cassette4Currency}
                    />
                </div>
                <div className={style.cassetteDenomination}>
                    <Input
                      value={editableValues.cassette4Denomination}
                      keyProp=''
                      onChange={this.setFieldValue('cassette4Denomination')}
                      placeholder='Denomination'
                      isEdited={false}
                    />
                </div>
            </div>);
        let address =
            (this.hiddenFields && !this.hiddenFields.address && <div key='address' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.address}
                  boldLabel
                  keyProp=''
                  onChange={this.setFieldValue('address')}
                  label={<span><Text>Address</Text>{requiredFields && requiredFields.address ? '*' : ''}</span>}
                  placeholder='Address'
                  isEdited={false}
                  isValid={this.props.errors.get('address') === undefined}
                  errorMessage={this.props.errors.get('address')}
                />
            </div>);
        let city =
            (this.hiddenFields && !this.hiddenFields.city && <div key='city' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.city}
                  boldLabel
                  keyProp=''
                  onChange={this.setFieldValue('city')}
                  label={<span><Text>City</Text>{requiredFields && requiredFields.city ? '*' : ''}</span>}
                  placeholder='City'
                  isEdited={false}
                  isValid={this.props.errors.get('city') === undefined}
                  errorMessage={this.props.errors.get('city')}
                />
            </div>);
        let state =
            (this.hiddenFields && !this.hiddenFields.state && <div key='state' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.state}
                  boldLabel
                  keyProp=''
                  onChange={this.setFieldValue('state')}
                  label={<span><Text>State</Text>{requiredFields && requiredFields.state ? '*' : ''}</span>}
                  placeholder='State'
                  isEdited={false}
                  isValid={this.props.errors.get('state') === undefined}
                  errorMessage={this.props.errors.get('state')}
                />
            </div>);
        let country =
            (this.hiddenFields && !this.hiddenFields.country && <div key='country' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.country}
                  boldLabel
                  keyProp=''
                  onChange={this.setFieldValue('country')}
                  label={<span><Text>Country</Text>{requiredFields && requiredFields.country ? '*' : ''}</span>}
                  placeholder='Country'
                  isEdited={false}
                  isValid={this.props.errors.get('country') === undefined}
                  errorMessage={this.props.errors.get('country')}
                />
            </div>);
        return [luno, tmkkvv, merchantType, terminalId, terminalName, tmk, name, identificationCode, customization, branch, address, city, state, country, cassette1, cassette2, cassette3, cassette4]
            // filter all empty fields
            .filter((c) => c);
    }
    render() {
        let actions = [
            { label: 'Save', onClick: this.saveAtm, styleType: 'primaryDialog' },
            { label: 'Close', onClick: this.props.handleDetailsClose, styleType: 'secondaryDialog' }
        ];

        var formFields = this.getDialogComponents();
        var halfLength = Math.ceil(formFields.length / 2);
        var left = formFields.slice(0, halfLength);
        var right = formFields.slice(halfLength, halfLength * 2);

        return (
                <StandardDialog
                  className={style.detailsDialog}
                  isOpen={this.props.opened}
                  header={{text: this.props.dialogTitle}}
                  footer={{actionButtons: actions}}
                  closePopup={this.props.handleDetailsClose}>
                <div>
                    <Col xs='6'>
                        {left}
                    </Col>
                    <Col xs='6'>
                        {right}
                    </Col>
                </div>
                </StandardDialog>
        );
    }
};

AtmDetails.propTypes = {
    // dialog properties
    opened: PropTypes.bool.isRequired,

    // methods
    saveAtm: PropTypes.func,
    handleDetailsClose: PropTypes.func,
    fetchBranches: PropTypes.func,
    // input fields actions - left
    setFieldValue: PropTypes.func,
    branches: PropTypes.array,
    setErrors: PropTypes.func,

    dialogTitle: PropTypes.string,
    hiddenFields: PropTypes.array,
    requiredFields: PropTypes.array,
    initialValues: PropTypes.object,
    editableValues: PropTypes.object,
    errors: PropTypes.object
};

export default connect(
    (state) => {
        var requiredFields = state.atmConfig.getIn(['atm', 'terminals', 'addEditForm', 'requiredFields']);
        var hiddenFields = state.atmConfig.getIn(['atm', 'terminals', 'addEditForm', 'hiddenFields']);
        return {
            requiredFields: (requiredFields && requiredFields.toJS()) || [],
            hiddenFields: (hiddenFields && hiddenFields.toJS()) || [],
            opened: state.atmDetails.get('opened'),
            dialogTitle: state.atmDetails.get('dialogTitle'),
            initialValues: state.atmDetails.get('initialValues'),
            editableValues: state.atmDetails.get('editableValues'),
            branches: state.atmDetails.get('branches').toJS(),
            errors: state.atmDetails.get('errors')
        };
    },
    {
        saveAtm,
        handleDetailsClose,
        // input fields actions - left
        fetchBranches,
        setFieldValue,
        setErrors
    }
)(AtmDetails);
