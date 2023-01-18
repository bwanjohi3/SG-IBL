import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Input from 'ut-front-react/components/Input';
import TextArea from 'ut-front-react/components/Input/TextArea';
import Text from 'ut-front-react/components/Text';
import {df} from 'ut-front-react/helpers';
import {getCardholderValidationRules} from './../../helpers';
import {fetchBusinessUnits, changeDropdown, changeCardholderName, changeMakerComment, fetchDocumentTypes} from './actions';
import style from './../../style.css';
import localStyle from './style.css';
import dropdownStyles from './dropdownStyles.css';

const cardholderValidationRules = getCardholderValidationRules();

export class EditableContent extends Component {
    constructor(props) {
        super(props);

        this.isFieldAllowed = this.isFieldAllowed.bind(this);
    }
    componentWillMount() {
        let isName = this.props.data.get('nameType') === 'named';
        if (isName) {
            this.props.fetchBusinessUnits();
        }
        this.props.fetchDocumentTypes();
    }
    translate(stringToTranslate) {
        return this.context.translate(stringToTranslate);
    }

    isFieldAllowed(field) {
        return this.props.config.get('fields').indexOf(field) > -1;
    }

    render() {
        let isName = this.props.data.get('nameType') === 'named';
        let dropDownStyling = isName ? dropdownStyles : {};

        return (
            <div>
                {this.isFieldAllowed('cardnumber') && <div className={classnames(style.rowPaddings, style.borderBottom, localStyle.readonly)}>
                    <Input value={this.props.data.get('cardnumber')} label={<Text>Card Number</Text>} boldLabel readonly />
                </div>}
                {this.isFieldAllowed('productName') && <div className={classnames(style.rowPaddings, style.borderBottom)}>
                    <Dropdown
                      defaultSelected={this.props.data.get('productId')}
                      label={<Text>Card Product</Text>}
                      boldLabel
                      placeholder={<Text>Card Product</Text>}
                      keyProp='productId'
                      onSelect={this.props.changeDropdown}
                      data={this.props.products.toJS()}
                      disabled
                      isValid={this.props.errors.get('productId') === undefined}
                      errorMessage={this.props.errors.get('productId')}
                    />
                </div>}
                {this.isFieldAllowed('customerName') && <div className={classnames(style.rowPaddings, style.borderBottom, localStyle.readonly)}>
                    <Input value={this.props.data.get('customerName')} label={<Text>Customer Name</Text>} boldLabel placeholder={this.translate('Please enter customer name')} readonly />
                </div>}
                {this.isFieldAllowed('customerType') && <div className={classnames(style.rowPaddings, style.borderBottom, localStyle.readonly)}>
                    <Input value={this.props.data.get('customerType')} label={<Text>Customer Type</Text>} boldLabel readonly />
                </div>}
                {this.isFieldAllowed('personName') && <div className={classnames(style.rowPaddings, style.borderBottom, localStyle.readonly)}>
                    <Input value={this.props.data.get('personName')} label={<Text>Person Name</Text>} boldLabel readonly />
                </div>}
                {this.isFieldAllowed('holderName') && isName && <div className={classnames(style.rowPaddings, style.borderBottom, style.cardHolderWrapper, localStyle.editable)}>
                    <Input
                      keyProp='holderName'
                      value={this.props.data.get('holderName')}
                      label={<Text>Cardholder Name</Text>}
                      boldLabel
                      placeholder={this.translate('Please enter cardholder name')}
                      onChange={this.props.changeCardholderName}
                      validators={cardholderValidationRules}
                      isValid={this.props.errors.get('holderName') === undefined}
                      errorMessage={this.props.errors.get('holderName')}
                    />
                </div>}
                {this.isFieldAllowed('customerNumber') && <div className={classnames(style.rowPaddings, style.borderBottom, localStyle.readonly)}>
                    <Input value={this.props.data.get('customerNumber')} label={<Text>Customer Number</Text>} boldLabel placeholder={this.translate('Please enter customer number')} readonly />
                </div>}
                {this.isFieldAllowed('applicationId') && <div className={classnames(style.rowPaddings, style.borderBottom, localStyle.readonly)}>
                    <Input value={this.props.data.get('applicationId')} label={<Text>Application Number</Text>} boldLabel placeholder={this.translate('Please enter application number')} readonly />
                </div>}
                {this.isFieldAllowed('issuingBranchName') && isName && <div className={classnames(style.rowPaddings, style.borderBottom)}>
                    <Dropdown
                      defaultSelected={this.props.data.get('issuingBranchId')}
                      label={<span><Text>Card Issuing BU</Text> *</span>}
                      boldLabel
                      placeholder={<Text>Card Issuing BU</Text>}
                      keyProp='issuingBranchId'
                      onSelect={this.props.changeDropdown}
                      data={this.props.units.toJS()}
                      mergeStyles={dropDownStyling}
                      isValid={this.props.errors.get('issuingBranchId') === undefined}
                      errorMessage={this.props.errors.get('issuingBranchId')}
                    />
                </div>}
                {this.isFieldAllowed('targetBranchName') && isName && <div className={classnames(style.rowPaddings, style.borderBottom)}>
                    <Dropdown
                      defaultSelected={this.props.data.get('targetBranchId')}
                      label={<span><Text>Target Business Unit</Text> *</span>}
                      boldLabel
                      placeholder={this.translate('Business Unit')}
                      keyProp='targetBranchId'
                      onSelect={this.props.changeDropdown}
                      data={this.props.units.toJS()}
                      mergeStyles={dropDownStyling}
                      isValid={this.props.errors.get('targetBranchId') === undefined}
                      errorMessage={this.props.errors.get('targetBranchId')}
                    />
                </div>}
                {this.isFieldAllowed('batchName') && isName && <div className={classnames(style.rowPaddings, style.borderBottom, localStyle.readonly)}>
                    <Input value={this.props.data.get('batchName')} label={<Text>Batch Name</Text>} boldLabel readonly />
                </div>}
                {this.isFieldAllowed('createdOn') && <div className={classnames(style.rowPaddings, localStyle.readonly)}>
                    <Input value={df(this.props)(this.props.data.get('createdOn'))} label={<Text>Created On</Text>} boldLabel readonly />
                </div>}
                {this.isFieldAllowed('makerComments') && <div className={style.rowPaddings}>
                    <TextArea label={<Text>Maker Comment</Text>} rows='3' value={this.props.data.get('makerComments')} onChange={this.props.changeMakerComment} />
                </div>}
            </div>
        );
    }
}

EditableContent.propTypes = {
    config: PropTypes.object.isRequired,
    editable: PropTypes.bool.isRequired,
    errors: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    products: PropTypes.object.isRequired,
    units: PropTypes.object.isRequired,
    fetchBusinessUnits: PropTypes.func.isRequired,
    changeDropdown: PropTypes.func.isRequired,
    changeCardholderName: PropTypes.func.isRequired,
    changeMakerComment: PropTypes.func.isRequired,
    fetchDocumentTypes: PropTypes.func.isRequired
};

EditableContent.contextTypes = {
    translate: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        config: state.cardConfig.getIn(['application', 'details']),
        editable: ownProps.editable,
        errors: state.cardApplicationDetails.get('errors'),
        data: state.cardApplicationDetails.get('data'),
        products: state.cardApplicationDetails.get('products'),
        units: state.cardApplicationDetails.get('units'),
        login: state.login
    };
}

export default connect(
    mapStateToProps,
    {
        fetchBusinessUnits,
        changeDropdown,
        changeCardholderName,
        changeMakerComment,
        fetchDocumentTypes
    }
)(EditableContent);
