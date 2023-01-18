import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import immutable from 'immutable';

// react components
import StandardDialog from 'ut-front-react/components/Popup';
import Input from 'ut-front-react/components/Input';
import Text from 'ut-front-react/components/Text';
import DatePicker from 'ut-front-react/components/DatePicker/Simple';
import DateTimePicker from 'ut-front-react/components/DateTimePicker/Simple';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import UploadFile from '../../../components/UploadFile';

//import Upload from '../../../components/Upload';
import { Col } from 'reactstrap';
// actions
import {
    saveApplication,
    close as handleDetailsClose,
    // input fields actions - left
    setFieldValue,
    changeFile,
    setErrors
} from './actions';
// helpers
import {
    compare,
    validateDenomination,
    validateAll,
    prepareErrors,
    getCreateValidator,
    isNumeric
} from './helpers';

// styles
import classnames from 'classnames';
import style from './style.css';

class PinMailerFileDetails extends Component {
    constructor(props) {
        super(props);
        this.requiredFields = {luno:true};
        this.saveApplication = this.saveApplication.bind(this);
        this.setFieldValue = this.setFieldValue.bind(this);
        this.changeFile = this.changeFile.bind(this);
        this.getDialogComponents = this.getDialogComponents.bind(this);
        this.validateFile = this.validateFile.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.changeFile = this.changeFile.bind(this);

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
        this.requiredFields.name=true;
        this.requiredFields.pinMailerFile=true;
        this.requiredFields.pinLinkFile=true;

        if (this.props.hiddenFields) {
            this.hiddenFields = this.props.hiddenFields.reduce((a, c) => {
                a[c] = true;
                return a;
            }, {});
        }

    }
    saveApplication() {
        // debugger;
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
            this.props.saveApplication(params, this.props.initialValues.get('appId'));
        } else {
            this.props.handleDetailsClose();
        }
    }

    setFieldValue(key, formatValue) {      
        return (info) => {
            formatValue && (info = formatValue(info));
            return this.props.setFieldValue(key, info.value);
        };
    }

    validateFile() {
        return (file) => {
            return file.name.length > 12 && !isNaN(parseFloat(file.name.slice(0,-6).slice(-6)));       
        };
    }


    onFileChange() {
        return (file) => {
            this.props.changeFile(file, 0);
        };
    }


    changeFile(fieldName) {
       return (attachment) => {this.props.changeFile(attachment, fieldName)};
    }
    // FE processing

    getDialogComponents() {
        var editableValues = this.props.editableValues.toJS();
        var requiredFields = this.requiredFields || {};
            

        let name =
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
        

        let pinMailerFile =
        (this.hiddenFields && !this.hiddenFields.pinMailerFile && <div key='pinMailerFile' className={classnames(style.rowPaddings, style.borderBottom)}>
            <UploadFile
                label={<span><Text>Pin Mailer File</Text>{requiredFields && requiredFields && requiredFields.pinMailerFile ? '*' : ''}</span>}
                key={1} 
                arrayIndex= {1} 
                attachment={editableValues.pinMailerFile} 
                changeFile={this.changeFile('pinMailerFile')}
                validateFile={this.validateFile()}
                isValid={this.props.errors.get('pinMailerFile') === undefined}
                errorMessage={this.props.errors.get('pinMailerFile')}
            />
        </div>);

        let pinLinkFile =
        (this.hiddenFields && !this.hiddenFields.pinLinkFile && <div key='pinLinkFile' className={classnames(style.rowPaddings, style.borderBottom)}>
            <UploadFile
                label={<span><Text>Pin Link File</Text>{requiredFields && requiredFields && requiredFields.pinLinkFile ? '*' : ''}</span>}
                key={1} 
                arrayIndex= {1} 
                attachment={editableValues.pinLinkFile} 
                changeFile={this.changeFile('pinLinkFile')}
                validateFile={this.validateFile()}
                isValid={this.props.errors.get('pinLinkFile') === undefined}
                errorMessage={this.props.errors.get('pinLinkFile')}
            />
        </div>);
       
        return [name, pinMailerFile, pinLinkFile]
            // filter all empty fields
            .filter((c) => c);
    }
    render() {
        let actions = [
            { label: 'Save', onClick: this.saveApplication, styleType: 'primaryDialog' },
            { label: 'Close', onClick: this.props.handleDetailsClose, styleType: 'secondaryDialog' }
        ];

        var formFields = this.getDialogComponents();
        return (
                <StandardDialog
                  className={style.detailsDialog}
                  isOpen={this.props.opened}
                  header={{text: this.props.dialogTitle}}
                  footer={{actionButtons: actions}}
                  closePopup={this.props.handleDetailsClose}>
                <div>
                    <Col xs='12'>
                        {formFields}
                    </Col>
                </div>
                </StandardDialog>
        );
    }
};

PinMailerFileDetails.propTypes = {
    // dialog properties
    opened: PropTypes.bool.isRequired,

    // methods
    saveApplication: PropTypes.func,
    handleDetailsClose: PropTypes.func,
    // input fields actions - left
    setFieldValue: PropTypes.func,
    changeFile: PropTypes.func,
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
        var requiredFields = state.posConfig.getIn(['pos', 'apllications', 'addEditForm', 'requiredFields']);
        var hiddenFields = state.posConfig.getIn(['pos', 'apllications', 'addEditForm', 'hiddenFields']);
        return {
            requiredFields: (requiredFields && requiredFields.toJS()) || [],
            hiddenFields: (hiddenFields && hiddenFields.toJS()) || [],
                          
            opened: state.pinMailerFileDetails.get('opened'),
            dialogTitle: state.pinMailerFileDetails.get('dialogTitle'),
            initialValues: state.pinMailerFileDetails.get('initialValues'),
            editableValues: state.pinMailerFileDetails.get('editableValues'),
            errors: state.pinMailerFileDetails.get('errors')
        };
    },
    {
        saveApplication,
        handleDetailsClose,
        // input fields actions - left
        setFieldValue,
        changeFile,
        setErrors
    }
)(PinMailerFileDetails);
