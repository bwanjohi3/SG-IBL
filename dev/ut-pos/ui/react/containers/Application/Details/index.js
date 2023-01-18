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
import Upload from '../../../components/Upload';
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

class ApplicationDetails extends Component {
    constructor(props) {
        super(props);
        this.requiredFields = {luno:true};
        this.saveApplication = this.saveApplication.bind(this);
        this.setFieldValue = this.setFieldValue.bind(this);
        this.changeFile = this.changeFile.bind(this);
        this.getDialogComponents = this.getDialogComponents.bind(this);
        this.validateFile = this.validateFile.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.formatVersion = this.formatVersion.bind(this);
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
        this.requiredFields.name=true;
        this.requiredFields.merchantId=true;

        if (this.props.hiddenFields) {
            this.hiddenFields = this.props.hiddenFields.reduce((a, c) => {
                a[c] = true;
                return a;
            }, {});
        }

    }
    saveApplication() {
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

    formatVersion = (info) => {
        let isNum = info.value.split('.').join('').slice(0,6);
        let formated = '';
        for(let i = 0; i < isNum.length; i++)
        {
            if (!isNumeric(isNum[i])) {
                continue;
            }

            if (i && i % 2 === 0){
                formated += '.';
            }
            formated += isNum[i];
        }
        info.value = formated;
        return info;
    }

    onFileChange() {
        return (file) => {
            let version = file.filename.slice(0,-6).slice(-6);
            delete file.content;
            return Promise.resolve(this.props.changeFile(file, 0))
            .then(() => this.props.setFieldValue('version', this.formatVersion({value: version}).value));
        };
    }


    changeFile(attachment, index) {
       return () => {this.props.changeFile(attachment, index)};
    }
    // FE processing

    getDialogComponents() {
        var editableValues = this.props.editableValues.toJS();
        var requiredFields = this.requiredFields || {};
            
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
        
       

        let version =
        (this.hiddenFields && !this.hiddenFields.version && <div key='version' className={classnames(style.rowPaddings, style.borderBottom)}>
            <Input
              value={editableValues.version}
              onChange={this.setFieldValue('version', this.formatVersion)}
              keyProp=''
              boldLabel
              readonly
              label={<span><Text>Version</Text>{requiredFields && requiredFields && requiredFields.version ? '*' : ''}</span>}
              placeholder='00.00.00'
              isEdited={false}
              isValid={this.props.errors.get('version') === undefined}
              errorMessage={this.props.errors.get('version')}
            />
        </div>);

        let publishDate = 
        (this.hiddenFields && !this.hiddenFields.datePublished && <div key='datePublished' className={classnames(style.rowPaddings, style.borderBottom)}>
            <DateTimePicker
                label={<span><Text>Publish on</Text>{requiredFields && requiredFields && requiredFields.version ? '*' : ''}</span>}
                defaultValue={editableValues.datePublished}
                onChange={this.setFieldValue('datePublished')}
                isValid={this.props.errors.get('datePublished') === undefined}
                errorMessage={this.props.errors.get('datePublished')}
            />
        </div>);

  
      
        let firmware =
        (this.hiddenFields && !this.hiddenFields.firmwarePath && <div key='firmwarePath' className={classnames(style.rowPaddings, style.borderBottom)}>
            <Upload 
                label={<span><Text>App Path</Text>{requiredFields && requiredFields && requiredFields.firmwarePath ? '*' : ''}</span>}
                key={1} 
                arrayIndex= {1} 
                attachment={editableValues.attachment} 
                changeFile={this.onFileChange()}
                validateFile={this.validateFile()}
            />
        </div>);
        

       
       
        return [name, version, description, publishDate, firmware]
            // filter all empty fields
            .filter((c) => c);
    }
    render() {
        let actions = [
            { label: 'Save', onClick: this.saveApplication, styleType: 'primaryDialog' },
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

ApplicationDetails.propTypes = {
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
                          
            opened: state.applicationDetails.get('opened'),
            dialogTitle: state.applicationDetails.get('dialogTitle'),
            initialValues: state.applicationDetails.get('initialValues'),
            editableValues: state.applicationDetails.get('editableValues'),
            errors: state.applicationDetails.get('errors')
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
)(ApplicationDetails);
