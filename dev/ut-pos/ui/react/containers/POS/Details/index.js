import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

// react components
import StandardDialog from 'ut-front-react/components/Popup';
import Input from 'ut-front-react/components/Input';
import Text from 'ut-front-react/components/Text';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
//import CurrencyDropddown from '../../../components/CurrencyDropdown';
//import TitledContentBox from '../../../components/TitledContentBox';
import { Col } from 'reactstrap';
// actions
import {
    savePos,
    close as handleDetailsClose,
    // input fields actions - left
    setFieldValue,
    fetchBranches,
    fetchKeys,
    fetchFirmware,
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

class PosDetails extends Component {
    constructor(props) {
        super(props);
        this.requiredFields = {luno:true};
        this.savePos = this.savePos.bind(this);
        this.terminalSerialReset = this.terminalSerialReset.bind(this);
        this.setFieldValue = this.setFieldValue.bind(this);
        this.getDialogComponents = this.getDialogComponents.bind(this);
        this.getDialogReceiptComponents = this.getDialogReceiptComponents.bind(this);
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
        this.requiredFields.terminalNumber=true;
        this.requiredFields.terminalSerial=true;
        this.requiredFields.name=true;
        this.requiredFields.businesUnitId=true;
        this.requiredFields.adminPassword=true;

        if (this.props.hiddenFields) {
            this.hiddenFields = this.props.hiddenFields.reduce((a, c) => {
                a[c] = true;
                return a;
            }, {});
        }
        if (!this.props.opened && nextProps.opened) {
            this.props.fetchBranches();
            this.props.fetchKeys();
            this.props.fetchFirmware();
        }
    }
    savePos() {
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
            if (params.city || params.address) {
                let sp =  ' ';
                let city = this.props.initialValues.get('city');
                let address = this.props.initialValues.get('address');
                params.location = ((params.address || address) + sp.repeat(23)).slice(0, 23) + ((params.city || city) + sp.repeat(12)).slice(0, 12); 
            }
            this.props.savePos(params, this.props.initialValues.get('terminalId'));
        } else {
            this.props.handleDetailsClose();
        }
    }

    terminalSerialReset() {
        let terminalSerial = this.props.editableValues.get('terminalSerial');
            if (terminalSerial) {
                var dt = new Date();
                let yyyy = dt.getFullYear();
                let mm = ('0' + dt.getMonth()).slice(-2);
                let dd = ('0' + dt.getDay()).slice(-2);
                let hh = ('0' + dt.getHours()).slice(-2);
                let mi = ('0' + dt.getMinutes()).slice(-2);
                this.props.savePos({'terminalSerial': `${yyyy}${mm}${dd}${hh}${mi}_${terminalSerial}`}, this.props.initialValues.get('terminalId'));
            }
    }

    setFieldValue(key) {
        return (info) => {
            return this.props.setFieldValue(key, info.value);
        };
    }
    // FE processing
    getDialogReceiptComponents() {
        var editableValues = this.props.editableValues.toJS();
        var requiredFields = this.requiredFields || {};
        let header1 =
            (this.hiddenFields && !this.hiddenFields.header1 && <div key='header1' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.header1}
                  onChange={this.setFieldValue('header1')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Header Line 1</Text>{requiredFields && requiredFields && requiredFields.header1 ? '*' : ''}</span>}
                  placeholder='Header Line 1'
                  isEdited={false}
                  isValid={this.props.errors.get('header1') === undefined}
                  errorMessage={this.props.errors.get('header1')}
                />
            </div>);

        let header2 =
            (this.hiddenFields && !this.hiddenFields.header2 && <div key='header2' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.header2}
                  onChange={this.setFieldValue('header2')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Header Line 2</Text>{requiredFields && requiredFields && requiredFields.header2 ? '*' : ''}</span>}
                  placeholder='Header Line 2'
                  isEdited={false}
                  isValid={this.props.errors.get('header2') === undefined}
                  errorMessage={this.props.errors.get('header2')}
                />
            </div>);
            
        let header3 =
            (this.hiddenFields && !this.hiddenFields.header3 && <div key='header3' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.header3}
                  onChange={this.setFieldValue('header3')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Header Line 3</Text>{requiredFields && requiredFields && requiredFields.header3 ? '*' : ''}</span>}
                  placeholder='Header Line 3'
                  isEdited={false}
                  isValid={this.props.errors.get('header3') === undefined}
                  errorMessage={this.props.errors.get('header3')}
                />
            </div>);

        let header4 =
            (this.hiddenFields && !this.hiddenFields.header4 && <div key='header4' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.header4}
                  onChange={this.setFieldValue('header4')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Header Line 4</Text>{requiredFields && requiredFields && requiredFields.header4 ? '*' : ''}</span>}
                  placeholder='Header Line 4'
                  isEdited={false}
                  isValid={this.props.errors.get('header4') === undefined}
                  errorMessage={this.props.errors.get('header4')}
                />
            </div>);

        let footer1 =
            (this.hiddenFields && !this.hiddenFields.footer1 && <div key='footer1' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.footer1}
                  onChange={this.setFieldValue('footer1')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Footer Line 1</Text>{requiredFields && requiredFields && requiredFields.footer1 ? '*' : ''}</span>}
                  placeholder='Footer Line 1'
                  isEdited={false}
                  isValid={this.props.errors.get('footer1') === undefined}
                  errorMessage={this.props.errors.get('footer1')}
                />
            </div>);

        let footer2 =
            (this.hiddenFields && !this.hiddenFields.footer2 && <div key='footer2' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.footer2}
                  onChange={this.setFieldValue('footer2')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Footer Line 2</Text>{requiredFields && requiredFields && requiredFields.footer1 ? '*' : ''}</span>}
                  placeholder='Footer Line 2'
                  isEdited={false}
                  isValid={this.props.errors.get('footer2') === undefined}
                  errorMessage={this.props.errors.get('footer2')}
                />
            </div>);

        let footer3 =
            (this.hiddenFields && !this.hiddenFields.footer3 && <div key='footer3' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.footer3}
                  onChange={this.setFieldValue('footer3')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Footer Line 3</Text>{requiredFields && requiredFields && requiredFields.footer1 ? '*' : ''}</span>}
                  placeholder='Footer Line 3'
                  isEdited={false}
                  isValid={this.props.errors.get('footer3') === undefined}
                  errorMessage={this.props.errors.get('footer3')}
                />
            </div>);



        return [header1, header2, header3, header4, footer1, footer2, footer3]
            // filter all empty fields
            .filter((c) => c);
    }

    getDialogComponents() {
        var editableValues = this.props.editableValues.toJS();
        var requiredFields = this.requiredFields || {};
        let terminalNumber =
            (this.hiddenFields && !this.hiddenFields.terminalNumber && <div key='terminalNumber' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.terminalNumber}
                  onChange={this.setFieldValue('terminalNumber')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Terminal Number</Text>{requiredFields && requiredFields && requiredFields.terminalNumber ? '*' : ''}</span>}
                  placeholder='Terminal Number'
                  isEdited={false}
                  isValid={this.props.errors.get('terminalNumber') === undefined}
                  errorMessage={this.props.errors.get('terminalNumber')}
                />
            </div>);

        let terminalSerial =
            (this.hiddenFields && !this.hiddenFields.terminalSerial && <div key='terminalSerial' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.terminalSerial}
                  onChange={this.setFieldValue('terminalSerial')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Terminal Serial</Text>{requiredFields && requiredFields && requiredFields.terminalSerial ? '*' : ''}</span>}
                  placeholder='Terminal Serial'
                  isEdited={false}
                  isValid={this.props.errors.get('terminalSerial') === undefined}
                  errorMessage={this.props.errors.get('terminalSerial')}
                />
            </div>);

        let terminalName =
            (this.hiddenFields && !this.hiddenFields.name && <div key='name' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.name}
                  onChange={this.setFieldValue('name')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Name</Text>{requiredFields && requiredFields && requiredFields.name ? '*' : ''}</span>}
                  placeholder='Name'
                  isEdited={false}
                  isValid={this.props.errors.get('name') === undefined}
                  errorMessage={this.props.errors.get('name')}
                />
            </div>);

        let address =
            (this.hiddenFields && !this.hiddenFields.address && <div key='address' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.address}
                  onChange={this.setFieldValue(['address', 'header2'])}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Address</Text>{requiredFields && requiredFields && requiredFields.address ? '*' : ''}</span>}
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
                  onChange={this.setFieldValue(['city','header3'])}
                  keyProp=''
                  boldLabel
                  label={<span><Text>City</Text>{requiredFields && requiredFields && requiredFields.address ? '*' : ''}</span>}
                  placeholder='City'
                  isEdited={false}
                  isValid={this.props.errors.get('city') === undefined}
                  errorMessage={this.props.errors.get('city')}
                />
            </div>);

        let merchantName =
            (this.hiddenFields && !this.hiddenFields.merchantName && <div key='merchantName' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.merchantName}
                  onChange={this.setFieldValue(['merchantName', 'header1'])}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Merchant Name</Text>{requiredFields && requiredFields && requiredFields.location ? '*' : ''}</span>}
                  placeholder='Merchant Name'
                  isEdited={false}
                  isValid={this.props.errors.get('merchantName') === undefined}
                  errorMessage={this.props.errors.get('merchantName')}
                />
            </div>);

        let adminPassword =
            (this.hiddenFields && !this.hiddenFields.adminPassword && <div key='adminPassword' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.adminPassword}
                  onChange={this.setFieldValue('adminPassword')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Admin password</Text>{requiredFields && requiredFields && requiredFields.adminPassword ? '*' : ''}</span>}
                  placeholder='Administrator password'
                  isEdited={false}
                  isValid={this.props.errors.get('adminPassword') === undefined}
                  errorMessage={this.props.errors.get('adminPassword')}
                />
            </div>);

        let description =
        (this.hiddenFields && !this.hiddenFields.description && <div key='description' className={classnames(style.rowPaddings, style.borderBottom)}>
            <Input
              value={editableValues.description}
              onChange={this.setFieldValue('description')}
              keyProp=''
              boldLabel
              label={<span><Text>Description</Text>{requiredFields && requiredFields && requiredFields.description ? '*' : ''}</span>}
              placeholder='Description'
              isEdited={false}
              isValid={this.props.errors.get('description') === undefined}
              errorMessage={this.props.errors.get('description')}
            />
        </div>);

        let businessUnitId =
        (this.hiddenFields && !this.hiddenFields.businessUnitId && <div key='businessUnitId' className={classnames(style.rowPaddings, style.borderBottom)}>
            <div className={style.branch}>
            <Dropdown
              label={<span><Text>Business Unit</Text>{requiredFields && requiredFields.businessUnitId ? '*' : ''}</span>}
              placeholder='Business Unit'
              boldLabel
              data={this.props.branches}
              defaultSelected={editableValues.businessUnitId && editableValues.businessUnitId.toString()}
              onSelect={this.setFieldValue('businessUnitId')}
              isValid={this.props.errors.get('businessUnitId') === undefined}
              errorMessage={this.props.errors.get('businessUnitId')}
            />
            </div>
        </div>);
        let keyChain =
        (this.hiddenFields && !this.hiddenFields.branch && <div key='keyChainId' className={classnames(style.rowPaddings, style.borderBottom)}>
            <div className={style.branch}>
            <Dropdown
              label={<span><Text>Key Chain</Text>{requiredFields && requiredFields.keyChainId ? '*' : ''}</span>}
              placeholder='Key Chain'
              boldLabel
              data={this.props.keyChainList}
              defaultSelected={ editableValues.keyChainId}
              onSelect={this.setFieldValue('keyChainId')}
              isValid={this.props.errors.get('keyChainId') === undefined}
              errorMessage={this.props.errors.get('keyChainId')}
            />
            </div>
        </div>);

        let fwInput =
        (this.hiddenFields && !this.hiddenFields.branch && <div key='newVersionId' className={classnames(style.rowPaddings, style.borderBottom)}>
            <div className={style.branch}>
            <Dropdown
              label={<span><Text>New Firmware</Text>{requiredFields && requiredFields.newVersionId ? '*' : ''}</span>}
              placeholder='New Firmware'
              boldLabel
              data={this.props.fwList}
              defaultSelected={ editableValues.newVersionId}
              onSelect={this.setFieldValue('newVersionId')}
              isValid={this.props.errors.get('newVersionId') === undefined}
              errorMessage={this.props.errors.get('newVersionId')}
            />
            </div>
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

            let currVersion =
            (this.hiddenFields && !this.hiddenFields.currVersion && <div key='currVersion' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={editableValues.currVersion}
                  onChange={this.setFieldValue('currVersion')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>Current Version</Text>{requiredFields && requiredFields && requiredFields.currVersion ? '*' : ''}</span>}
                  placeholder='Current Version'
                  readonly={true}
                  isEdited={false}
                  isValid={this.props.errors.get('currVersion') === undefined}
                  errorMessage={this.props.errors.get('currVersion')}
                />
            </div>);
   
            let valueNewVers = this.props.fwList && this.props.fwList.find((it)=>it.key === this.props.editableValues.get('newVersionId'));
            let newVersion =
            (this.hiddenFields && !this.hiddenFields.newVersion && <div key='newVersion' className={classnames(style.rowPaddings, style.borderBottom)}>
                <Input
                  value={valueNewVers && valueNewVers.version}
                  onChange={this.setFieldValue('newVersion')}
                  keyProp=''
                  boldLabel
                  label={<span><Text>New Version</Text>{requiredFields && requiredFields && requiredFields.newVersion ? '*' : ''}</span>}
                  placeholder='New Version'
                  readonly={true}
                  isEdited={false}
                  isValid={this.props.errors.get('newVersion') === undefined}
                  errorMessage={this.props.errors.get('newVersion')}
                />
            </div>);

        return [terminalNumber, terminalSerial, terminalName, merchantName, address, city, description, adminPassword, businessUnitId, keyChain, fwInput,  newVersion, currVersion]
            // filter all empty fields
            .filter((c) => c);
    }
    render() {
        let actions = [
            { label: 'Save', onClick: this.savePos, styleType: 'primaryDialog' },
            { label: 'Terminal Serial Reset', onClick: this.terminalSerialReset, styleType: 'primaryDialog', },
            { label: 'Close', onClick: this.props.handleDetailsClose, styleType: 'secondaryDialog' }
        ].filter(btn => !(btn.label === 'Terminal Serial Reset' &&  this.props.initialValues.size === 0));

        var formFields = this.getDialogComponents();
        var halfLength = Math.ceil(formFields.length / 2);
        var left = formFields.slice(0, halfLength);
        var right = formFields.slice(halfLength, halfLength * 2);
        var formReceiptFields = this.getDialogReceiptComponents();
        var halfLength2 = Math.ceil(formReceiptFields.length / 2);
        var rLeft = formReceiptFields.slice(0, halfLength2);
        var rRight = formReceiptFields.slice(halfLength2, halfLength2 * 2);

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
                    
                    <Col xs='12'>
                    <br/>
                    <h3>Receipt Parameters</h3>
                    <hr/>
                    </Col>
                    <Col xs='6'>
                    {rLeft}
                    </Col>
                    <Col xs='6'>
                    {rRight}
                    </Col>
                    
                </div>
                </StandardDialog>
        );
    }
};

PosDetails.propTypes = {
    // dialog properties
    opened: PropTypes.bool.isRequired,

    // methods
    savePos: PropTypes.func,
    handleDetailsClose: PropTypes.func,
    fetchBranches: PropTypes.func,
    fetchKeys: PropTypes.func,
    fetchFirmware: PropTypes.func,
    // input fields actions - left
    setFieldValue: PropTypes.func,
    branches: PropTypes.array,
    keyChainList: PropTypes.array,
    fwList: PropTypes.array,
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
        var requiredFields = state.posConfig.getIn(['pos', 'terminals', 'addEditForm', 'requiredFields']);
        var hiddenFields = state.posConfig.getIn(['pos', 'terminals', 'addEditForm', 'hiddenFields']);
        return {
            requiredFields: (requiredFields && requiredFields.toJS()) || [],
            hiddenFields: (hiddenFields && hiddenFields.toJS()) || [],
            opened: state.posDetails.get('opened'),
            dialogTitle: state.posDetails.get('dialogTitle'),
            initialValues: state.posDetails.get('initialValues'),
            editableValues: state.posDetails.get('editableValues'),
            branches: state.posDetails.get('branches').toJS(),
            keyChainList: state.posDetails.get('keyChainList').toJS(),
            fwList: state.posDetails.get('fwList').toJS(),
            errors: state.posDetails.get('errors')
        };
    },
    {
        savePos,
        handleDetailsClose,
        // input fields actions - left
        fetchBranches,
        fetchKeys,
        fetchFirmware,
        setFieldValue,
        setErrors
    }
)(PosDetails);
