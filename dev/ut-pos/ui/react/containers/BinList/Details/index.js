import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import immutable from 'immutable';

// react components
import StandardDialog from 'ut-front-react/components/Popup';
import Input from 'ut-front-react/components/Input';
import Text from 'ut-front-react/components/Text';
import MultiSelectBubble from 'ut-front-react/components/MultiSelectBubble';
import DatePicker from 'ut-front-react/components/DatePicker/Simple';
import DateTimePicker from 'ut-front-react/components/DateTimePicker/Simple';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Upload from '../../../components/Upload';
import { Col } from 'reactstrap';
// actions
import {
    saveBinList,
    close as handleDetailsClose,
    // input fields actions - left
    setFieldValue,
    changeFile,
    setErrors,
    fetchCardBinList,
    fetchOperations,
    fetchCardProduct
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

class BinListDetails extends Component {
    constructor(props) {
        super(props);
        this.requiredFields = {luno:true};
        this.saveBinList = this.saveBinList.bind(this);
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
        this.requiredFields.transaction=true;
        this.requiredFields.binId=true;


        if (this.props.hiddenFields) {
            this.hiddenFields = this.props.hiddenFields.reduce((a, c) => {
                a[c] = true;
                return a;
            }, {});
        }

        if (!this.props.opened && nextProps.opened) {
            this.props.fetchCardBinList();
            this.props.fetchOperations();
            this.props.fetchCardProduct();
        }

    }
    saveBinList() {
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
            params.transaction = JSON.stringify(params.transaction);
            this.props.saveBinList(params, this.props.initialValues.get('binListId'));
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

    onSelectDropdown({key, value}) {
        this.props.setFieldValue(key, value);
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

                /*<Input
              value={editableValues.transaction}
              onChange={this.setFieldValue('transaction')}
              keyProp=''
              boldLabel
              label={<span><Text>Transaction</Text>{requiredFields && requiredFields && requiredFields.transaction ? '*' : ''}</span>}
              placeholder='Transaction'
              isEdited={false}
              isValid={this.props.errors.get('transaction') === undefined}
              errorMessage={this.props.errors.get('transaction')}
            />*/

    getDialogComponents() {
        var editableValues = this.props.editableValues.toJS();
        var requiredFields = this.requiredFields || {};


        let transaction =
        (this.hiddenFields && !this.hiddenFields.transaction && <div key='transaction'>

              <MultiSelectBubble
                keyProp='transaction'
                name='transaction'
                label='Transaction'
                options={this.props.trnOperation || []}
                value={editableValues.transaction || []}
                onChange={(val) => { this.onSelectDropdown({key: 'transaction', value: val });}}
            />
        </div>);

        let binId =
        (this.hiddenFields && !this.hiddenFields.binId && <div key='binId' className={classnames(style.rowPaddings, style.borderBottom)}>
            <div className={style.binId}>
            <Dropdown
            label={<span><Text>Bin</Text>{requiredFields && requiredFields.binId ? '*' : ''}</span>}
            placeholder='Bin'
            boldLabel
            data={this.props.cardBinList || []}
            defaultSelected={ editableValues.binId}
            onSelect={this.setFieldValue('binId')}
            isValid={this.props.errors.get('binId') === undefined}
            errorMessage={this.props.errors.get('binId')}
            />
        </div></div>);

        let productId =
        (this.hiddenFields && !this.hiddenFields.productId && <div key='productId' className={classnames(style.rowPaddings, style.borderBottom)}>
            <div className={style.productId}>
            <Dropdown
            label={<span><Text>Card Product</Text>{requiredFields && requiredFields.productId ? '*' : ''}</span>}
            placeholder='Card Product'
            boldLabel
            data={this.props.cardProduct|| []}
            defaultSelected={editableValues.productId && editableValues.productId.toString()}
            onSelect={this.setFieldValue('productId')}
            isValid={this.props.errors.get('productId') === undefined}
            errorMessage={this.props.errors.get('productId')}
            />
        </div></div>);
       
        return [transaction, binId, productId]
            .filter((c) => c);
    }
    render() {
        let actions = [
            { label: 'Save', onClick: this.saveBinList, styleType: 'primaryDialog' },
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

BinListDetails.propTypes = {
    // dialog properties
    opened: PropTypes.bool.isRequired,
    fetchCardBinList: PropTypes.func,
    fetchOperations: PropTypes.func,
    fetchCardProduct: PropTypes.func,
    // methods
    saveBinList: PropTypes.func,
    handleDetailsClose: PropTypes.func,
    // input fields actions - left
    setFieldValue: PropTypes.func,
    changeFile: PropTypes.func,
    branches: PropTypes.array,
    setErrors: PropTypes.func,

    trnOperation: PropTypes.array,
    cardBinList: PropTypes.array,
    cardProduct: PropTypes.array,

    dialogTitle: PropTypes.string,
    hiddenFields: PropTypes.array,
    requiredFields: PropTypes.array,
    initialValues: PropTypes.object,
    editableValues: PropTypes.object,
    errors: PropTypes.object
};

export default connect(
    (state) => {
        var requiredFields = state.posConfig.getIn(['pos', 'binList', 'addEditForm', 'requiredFields']);
        var hiddenFields = state.posConfig.getIn(['pos', 'binList', 'addEditForm', 'hiddenFields']);
        return {
            requiredFields: (requiredFields && requiredFields.toJS()) || [],
            hiddenFields: (hiddenFields && hiddenFields.toJS()) || [],
                          
            opened: state.binListDetails.get('opened'),
            dialogTitle: state.binListDetails.get('dialogTitle'),
            initialValues: state.binListDetails.get('initialValues'),
            editableValues: state.binListDetails.get('editableValues'),
            errors: state.binListDetails.get('errors'),
            trnOperation: state.binListDetails.get('trnOperation').toJS(),
            cardBinList: state.binListDetails.get('cardBinList').toJS(),
            cardProduct: state.binListDetails.get('cardProduct').toJS()
        };
    },
    {
        saveBinList,
        handleDetailsClose,
        // input fields actions - left
        fetchCardBinList,
        fetchOperations,
        fetchCardProduct,
        setFieldValue,
        changeFile,
        setErrors
    }
)(BinListDetails);
