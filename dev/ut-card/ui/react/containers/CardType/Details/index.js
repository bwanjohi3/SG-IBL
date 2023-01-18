import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import classnames from 'classnames';
// import immutable from 'immutable';

import validations from './validations';

import {
    fetchCardTypeById,
    toggleCreateCardTypePopup,
    fetchCardBrands,
    fetchCardNumberConstruction,
    fetchBinTypes,
    fetchCdol1Profiles,
    fetchPartnerTypes,
    fetchOwnershipTypes,
    fetchCipher,
    fetchEmvTags,
    createType,
    resetState,
    setErrors,
    updateSingleValue,
    updateGenerateControlDigit,
    updateMultiValue
} from './actions';

import {refetch} from '../Grid/actions';

import style from './style.css';
import buttonStyles from '../../../components/ActionStatusButton/style.css';

import Dialog from '../../../components/ActionDialog';
import Input from 'ut-front-react/components/Input';
import TextArea from 'ut-front-react/components/Input/TextArea';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import MultiSelectDropdown from 'ut-front-react/components/Input/MultiSelectDropdown';
import Checkbox from 'ut-front-react/components/Input/Checkbox';
import Text from 'ut-front-react/components/Text';

const validationData = () => {
    return {
        cvvsValidationError: {
            isValid: true,
            validationMessage: 'At least 1 option is required'
        },
        shouldValidateAlways: false
    };
};

const cryptogramMethods = [
    {key: '0', name: 'Visa VIS (CVN 10)', cryptogramMethodName: 'KQ', schemeId: 0},
    {key: '1', name: 'MasterCard M/Chip (CVN 10 or 11)', cryptogramMethodName: 'KQ', schemeId: 1},
    {key: '2', name: 'American Express AEIPS (CVN 01 or 02)', cryptogramMethodName: 'KQ', schemeId: 2},

    {key: '3', name: 'Visa VIS (CVN 14)', cryptogramMethodName: 'KW', schemeId: 0},
    {key: '4', name: 'Visa VIS (CVN 18) fixed length PAN', cryptogramMethodName: 'KW', schemeId: 2},
    {key: '5', name: 'Visa VIS (CVN 18) variable length PAN', cryptogramMethodName: 'KW', schemeId: 3},
    {key: '6', name: 'MasterCard M/Chip (CVN 12 or 13) (EMV 2000)', cryptogramMethodName: 'KW', schemeId: 0},
    {key: '7', name: 'MasterCard M/Chip (CVN 14 or 15) (EMV CSK)', cryptogramMethodName: 'KW', schemeId: 2},
    {key: '8', name: 'Discover D-PAS (05 or 06)', cryptogramMethodName: 'KW', schemeId: 2},
    {key: '9', name: 'NSICCS', cryptogramMethodName: 'KW', schemeId: 2}
];

let isCardTypeReq = false;

class CreateCardType extends Component {
    constructor(props) {
        super(props);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.validateCvvs = this.validateCvvs.bind(this);
        this.validationData = validationData();
    };

    componentWillReceiveProps(nextProps) {
        if (!this.props.opened && nextProps.opened) {
            this.fetchDropdownsData(nextProps.cardTypeData.get('typeId'));
            isCardTypeReq = false;
        } else if (nextProps.cardTypeData.get('typeId') && nextProps.dropdownsFetched === nextProps.dropdownsTotal && !isCardTypeReq) {
            this.props.fetchCardTypeById({typeId: nextProps.cardTypeData.get('typeId')});
            isCardTypeReq = true;
        }
    }

    fetchDropdownsData(typeId) {
        const { fetchCardBrands, fetchCardNumberConstruction, fetchBinTypes, fetchCdol1Profiles, fetchPartnerTypes, fetchOwnershipTypes, fetchCipher, fetchEmvTags } = this.props;
        let skipUsedBinTypes = typeId === undefined;
        fetchOwnershipTypes();
        fetchBinTypes({skipUsedBinTypes});
        fetchCdol1Profiles();
        fetchCardBrands();
        fetchCardNumberConstruction();
        fetchCipher();
        fetchPartnerTypes();
        fetchEmvTags();
    }

    validateCvvs() {
        if (this.props.cvvSelectionRequired && this.props.cardTypeData.get('cvvs').size < 1) {
            this.validationData.cvvsValidationError.isValid = false;
        } else {
            this.validationData.cvvsValidationError.isValid = true;
        }
    }
    handleDropdownChange(field) {
        return (params) => {
            let schema = this.props.ownershipTypeIdOwn.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'own'
                : this.props.ownershipTypeIdExternal.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'external'
                : 'common';
            let data = this.props.cardTypeData.toJS();
            data[field] = params.value;
            let formValidation = validations.run(data, schema);
            let joiValidationErrors = {};
            if (!formValidation.isValid && this.validationData.shouldValidateAlways) {
                joiValidationErrors = formValidation.errors;
            }
            this.props.updateSingleValue({
                field: field,
                value: params.value
            });
            this.props.setErrors(joiValidationErrors);
        };
    }
    handleInputChange(field) {
        return (params) => {
            let schema = this.props.ownershipTypeIdOwn.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'own'
                : this.props.ownershipTypeIdExternal.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'external'
                : 'common';
            let data = this.props.cardTypeData.toJS();
            let trimmedValue = ('' + params.value).trim();
            params.value = trimmedValue.length < 1 ? trimmedValue : params.value;
            data[field] = params.value;
            let formValidation = validations.run(data, schema);
            let joiValidationErrors = {};
            if (!formValidation.isValid && this.validationData.shouldValidateAlways) {
                joiValidationErrors = formValidation.errors;
            }
            this.props.updateSingleValue({
                field: field,
                value: params.value
            });
            this.props.setErrors(joiValidationErrors);
        };
    }

    handleMultiSelectDropdownChange(field) {
        return (selected) => {
            let schema = this.props.ownershipTypeIdOwn.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'own'
                : this.props.ownershipTypeIdExternal.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'external'
                : 'common';
            let data = this.props.cardTypeData.toJS();
            let formValidation = validations.run(data, schema);
            let joiValidationErrors = {};
            if (!formValidation.isValid && this.validationData.shouldValidateAlways) {
                joiValidationErrors = formValidation.errors;
            } else {
                joiValidationErrors = {};
            }
            if (field === 'cvvs') {
                this.validateCvvs();
            }
            this.props.updateMultiValue({
                field: field,
                value: selected.value
            });
            this.props.setErrors(joiValidationErrors);
        };
    }

    handleBinDropdownChange(field) {
        return (selected) => {
            let schema = this.props.ownershipTypeIdOwn.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'own'
                : this.props.ownershipTypeIdExternal.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'external'
                : 'common';
            let data = this.props.cardTypeData.toJS();
            let value = schema === 'own' ? [{key: selected.value}]
                : schema === 'external' ? selected.value
                : [];
            data[field] = value;
            let formValidation = validations.run(data, schema);
            let joiValidationErrors = {};
            if (!formValidation.isValid && this.validationData.shouldValidateAlways) {
                joiValidationErrors = formValidation.errors;
            } else {
                joiValidationErrors = {};
            }
            this.props.updateMultiValue({
                field: field,
                value: value
            });
            this.props.setErrors(joiValidationErrors);
        };
    }

    handleCryptogramMethodChange(field) {
        return (selected) => {
            let selectedMethod = cryptogramMethods.filter((value) => {
                return value.key === selected.value;
            }).pop();
            let schema = this.props.ownershipTypeIdOwn.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'own'
                : this.props.ownershipTypeIdExternal.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'external'
                : 'common';
            let data = this.props.cardTypeData.toJS();
            data['cryptogramMethodIndex'] = selectedMethod.key;
            data['cryptogramMethodName'] = selectedMethod.cryptogramMethodName;
            data['schemeId'] = selectedMethod.schemeId;
            let formValidation = validations.run(data, schema);
            let joiValidationErrors = {};
            if (!formValidation.isValid && this.validationData.shouldValidateAlways) {
                joiValidationErrors = formValidation.errors;
            }
            this.props.updateSingleValue({
                field: field,
                cryptogramMethodIndex: data['cryptogramMethodIndex'],
                cryptogramMethodName: data['cryptogramMethodName'],
                schemeId: data['schemeId']
            });
            this.props.setErrors(joiValidationErrors);
        };
    }
    handleCreate() {
        let cardTypeDataRaw = this.props.cardTypeData;
        let cvvs = cardTypeDataRaw.get('cvvs').map((value) => { return value.get('key'); });
        let schema = this.props.ownershipTypeIdOwn.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'own'
            : this.props.ownershipTypeIdExternal.includes(this.props.cardTypeData.get('ownershipTypeId')) ? 'external'
            : 'common';
        let cardTypeData = [{
            ownershipTypeName: schema,
            ownershipTypeId: cardTypeDataRaw.get('ownershipTypeId'),
            name: cardTypeDataRaw.get('name'),
            description: cardTypeDataRaw.get('description'),
            cardBrandId: cardTypeDataRaw.get('cardBrandId'),
            cardNumberConstructionId: cardTypeDataRaw.get('cardNumberConstructionId'),
            termMonth: parseInt(cardTypeDataRaw.get('termMonth')),
            cvk: cardTypeDataRaw.get('cvk'),
            pvk: cardTypeDataRaw.get('pvk'),
            cryptogramMethodIndex: parseInt(cardTypeDataRaw.get('cryptogramMethodIndex')),
            cryptogramMethodName: cardTypeDataRaw.get('cryptogramMethodName'),
            schemeId: cardTypeDataRaw.get('schemeId'),
            mkac: cardTypeDataRaw.get('mkac'),
            ivac: cardTypeDataRaw.get('ivac'),
            cdol1ProfileId: cardTypeDataRaw.get('cdol1ProfileId'),
            applicationInterchangeProfile: cardTypeDataRaw.get('applicationInterchangeProfile'),
            decimalisation: cardTypeDataRaw.get('decimalisation'),
            cipher: cardTypeDataRaw.get('cipher'),
            cvv1: cvvs.includes('cvv1'),
            cvv2: cvvs.includes('cvv2'),
            icvv: cvvs.includes('icvv'),
            serviceCode1: parseInt(cardTypeDataRaw.get('serviceCode1')),
            serviceCode2: parseInt(cardTypeDataRaw.get('serviceCode2')),
            serviceCode3: parseInt(cardTypeDataRaw.get('serviceCode3')),
            issuerId: cardTypeDataRaw.get('issuerId'),
            generateControlDigit: cardTypeDataRaw.get('generateControlDigit'),
            // flow,
            emvRequestTags: schema === 'own' ? null : cardTypeDataRaw.get('emvRequestTags').map((v) => (v.get('key'))).join(','),
            emvResponseTags: schema === 'own' ? null : cardTypeDataRaw.get('emvResponseTags').map((v) => (v.get('key'))).join(','),
            isActive: true
        }];
        let binData = cardTypeDataRaw.get('binId').toJS();
        let formValidation = validations.run(Object.assign({}, cardTypeData[0], { ownershipTypeId: cardTypeDataRaw.get('ownershipTypeId') }, {binId: binData}), schema);
        if (schema === 'own') {
            this.validateCvvs();
        }
        if (formValidation.isValid && (schema !== 'own' || this.validationData.cvvsValidationError.isValid)) {
            const {createType, refetch} = this.props;
            binData = binData.map((v) => (v.key));
            createType({cardTypeData, binData}).then(
                (data) => {
                    if (!data.error) {
                        this.props.resetState();
                        refetch();
                    }
                    return {};
                }
            ).catch((err) => { throw err; });
        } else {
            this.props.setErrors(formValidation.errors);
            this.validationData.shouldValidateAlways = true;
        }
    }

    handleClose() {
        this.props.toggleCreateCardTypePopup();
        this.props.resetState();
    }

    renderCommon() {
        let readonly = this.props.cardTypeData.get('typeId') !== undefined;
        return (<div>
                <Row className={style.rowTopMargin}>
                    <Col xs='3'><Text>Ownership</Text> *</Col>
                    <Col xs='9'>
                        <Dropdown
                          defaultSelected={this.props.cardTypeData.get('ownershipTypeId')}
                          placeholder='Select Ownership'
                          onSelect={this.handleDropdownChange('ownershipTypeId')}
                          data={this.props.ownershipTypes.toJS()}
                          isValid={this.props.errors.get('ownershipTypeId') === undefined}
                          errorMessage={this.props.errors.get('ownershipTypeId')}
                          disabled={readonly}
                        />
                    </Col>
                </Row>
                <Row className={style.rowTopMargin}>
                    <Col xs='3'><Text>Card Type Name</Text> *</Col>
                    <Col xs='9'>
                        <Input
                          value={this.props.cardTypeData.get('name')}
                          name='name'
                          onChange={this.handleInputChange('name')}
                          isValid={this.props.errors.get('name') === undefined}
                          errorMessage={this.props.errors.get('name')}
                          readonly={readonly}
                        />
                    </Col>
                </Row>
                <Row className={style.rowTopMargin}>
                    <Col xs='3'><Text>Card Type Description</Text></Col>
                    <Col xs='9'>
                        <TextArea
                          value={this.props.cardTypeData.get('description')}
                          onChange={this.handleInputChange('description')}
                          isValid={this.props.errors.get('description') === undefined}
                          errorMessage={this.props.errors.get('description')}
                          readonly={readonly}
                        />
                    </Col>
                </Row>
        </div>);
    }

    renderOwn() {
        let readonly = this.props.cardTypeData.get('typeId') !== undefined;
        return (<div>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>BIN</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      placeholder='Select BIN'
                      defaultSelected={this.props.cardTypeData.getIn(['binId', '0', 'key'])}
                      onSelect={this.handleBinDropdownChange('binId')}
                      data={this.props.binTypesFiltered.toJS()}
                      isValid={this.props.errors.get('binId') === undefined}
                      errorMessage={this.props.errors.get('binId')}
                      disabled={readonly}
                    />
                    {/* <span className={style.numberRequired}>Please note: BINs marked as "(ALREADY USED)" are already assigned to another card type.</span> */}
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Card Brand</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      placeholder='Select Card Brand'
                      defaultSelected={this.props.cardTypeData.get('cardBrandId')}
                      onSelect={this.handleDropdownChange('cardBrandId')}
                      data={this.props.cardBrands.toJS().map((brand) => ({key: brand.cardBrandId, name: brand.name}))}
                      isValid={this.props.errors.get('cardBrandId') === undefined}
                      errorMessage={this.props.errors.get('cardBrandId')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Card Number Construction</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      placeholder='Select Card Number Construction'
                      defaultSelected={this.props.cardTypeData.get('cardNumberConstructionId')}
                      onSelect={this.handleDropdownChange('cardNumberConstructionId')}
                      data={this.props.cardNumberConstructionTypes.toJS().map((type) => ({key: type.cardNumberConstructionId, name: type.description}))}
                      isValid={this.props.errors.get('cardNumberConstructionId') === undefined}
                      errorMessage={this.props.errors.get('cardNumberConstructionId')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            {/* <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Business Unit</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      placeholder='Select Business Unit'
                      defaultSelected={this.props.cardTypeData.get('branchId')}
                      onSelect={this.handleDropdownChange('branchId')}
                      data={this.props.organizations.size > 0 ? this.props.organizations.toJS().map((organization) => ({key: organization.id, name: organization.title})) : []}
                      isValid={this.props.errors.get('branchId') === undefined}
                      errorMessage={this.props.errors.get('branchId')}
                    />
                </Col>
            </Row> */}
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Term (in Month)</Text> *</Col>
                <Col xs='9'>
                    <Input
                      value={this.props.cardTypeData.get('termMonth')}
                      onChange={this.handleInputChange('termMonth')}
                      isValid={this.props.errors.get('termMonth') === undefined}
                      errorMessage={this.props.errors.get('termMonth')}
                      readonly={readonly}
                    />
                    <span className={style.numberRequired} hidden={this.props.errors.get('termMonth') !== undefined}>Only numbers are allowed in this field</span>
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>CVK</Text></Col>
                <Col xs='9'>
                    <Input
                      value={this.props.cardTypeData.get('cvk')}
                      name='name'
                      onChange={this.handleInputChange('cvk')}
                      isValid={this.props.errors.get('cvk') === undefined}
                      errorMessage={this.props.errors.get('cvk')}
                      readonly={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>PVK</Text></Col>
                <Col xs='9'>
                    <Input
                      value={this.props.cardTypeData.get('pvk')}
                      name='name'
                      onChange={this.handleInputChange('pvk')}
                      isValid={this.props.errors.get('pvk') === undefined}
                      errorMessage={this.props.errors.get('pvk')}
                      readonly={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Cryptogram Method</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      placeholder='Select Cryptogram Method'
                      defaultSelected={this.props.cardTypeData.get('cryptogramMethodIndex')}
                      onSelect={this.handleCryptogramMethodChange('cryptogramMethod')}
                      data={cryptogramMethods}
                      isValid={this.props.errors.get('cryptogramMethodIndex') === undefined}
                      errorMessage={this.props.errors.get('cryptogramMethodIndex')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>MK-AC</Text></Col>
                <Col xs='9'>
                    <Input
                      value={this.props.cardTypeData.get('mkac')}
                      name='name'
                      onChange={this.handleInputChange('mkac')}
                      isValid={this.props.errors.get('mkac') === undefined}
                      errorMessage={this.props.errors.get('mkac')}
                      readonly={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>IV-AC</Text> *</Col>
                <Col xs='9'>
                    <Input
                      value={this.props.cardTypeData.get('ivac')}
                      name='name'
                      onChange={this.handleInputChange('ivac')}
                      isValid={this.props.errors.get('ivac') === undefined}
                      errorMessage={this.props.errors.get('ivac')}
                      readonly={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>CDOL1 Profile</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      placeholder='Select CDOL1 Profile'
                      defaultSelected={this.props.cardTypeData.get('cdol1ProfileId')}
                      onSelect={this.handleDropdownChange('cdol1ProfileId')}
                      data={this.props.cdol1Profiles.toJS()}
                      isValid={this.props.errors.get('cdol1ProfileId') === undefined}
                      errorMessage={this.props.errors.get('cdol1ProfileId')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Application Interchange Profile</Text> *</Col>
                <Col xs='9'>
                    <Input
                      value={this.props.cardTypeData.get('applicationInterchangeProfile')}
                      name='name'
                      onChange={this.handleInputChange('applicationInterchangeProfile')}
                      isValid={this.props.errors.get('applicationInterchangeProfile') === undefined}
                      errorMessage={this.props.errors.get('applicationInterchangeProfile')}
                      readonly={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Decimalisation</Text> *</Col>
                <Col xs='9'>
                    <Input
                      value={this.props.cardTypeData.get('decimalisation')}
                      name='name'
                      onChange={this.handleInputChange('decimalisation')}
                      isValid={this.props.errors.get('decimalisation') === undefined}
                      errorMessage={this.props.errors.get('decimalisation')}
                      readonly={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Cipher</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      defaultSelected={this.props.cardTypeData.get('cipher')}
                      placeholder='Select Cipher'
                      onSelect={this.handleDropdownChange('cipher')}
                      data={this.props.cipherList.toJS().map((cipher) => ({name: cipher, key: cipher}))}
                      isValid={this.props.errors.get('cipher') === undefined}
                      errorMessage={this.props.errors.get('cipher')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>CVVs</Text>{this.props.cvvSelectionRequired && '*'}</Col>
                <Col xs='9'>
                    <MultiSelectDropdown
                      placeholder='Select CVVs'
                      defaultSelected={this.props.cardTypeData.get('cvvs').toJS()}
                      onSelect={this.handleMultiSelectDropdownChange('cvvs')}
                      data={[
                        {key: 'cvv1', name: 'CVV1'},
                        {key: 'cvv2', name: 'CVV2'},
                        {key: 'icvv', name: 'iCVV'}
                      ]}
                      isValid={this.validationData.cvvsValidationError.isValid}
                      errorMessage={this.validationData.cvvsValidationError.validationMessage}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Service Code First Digit</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      defaultSelected={this.props.cardTypeData.get('serviceCode1')}
                      placeholder={<Text>Service Code First Digit</Text>}
                      onSelect={this.handleDropdownChange('serviceCode1')}
                      data={[
                        {key: '1', name: '1: ' + this.context.translate('International interchange OK')},
                        {key: '2', name: '2: ' + this.context.translate('International interchange, use IC (chip) where feasible')},
                        {key: '5', name: '5: ' + this.context.translate('National interchange only except under bilateral agreement')},
                        {key: '6', name: '6: ' + this.context.translate('National interchange only except under bilateral agreement, use IC (chip) where feasible')},
                        {key: '7', name: '7: ' + this.context.translate('No interchange except under bilateral agreement (closed loop)')},
                        {key: '9', name: '9: ' + this.context.translate('Test')}
                      ]}
                      isValid={this.props.errors.get('serviceCode1') === undefined}
                      errorMessage={this.props.errors.get('serviceCode1')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Service Code Second Digit</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      defaultSelected={this.props.cardTypeData.get('serviceCode2')}
                      placeholder={<Text>Service Code Second Digit</Text>}
                      onSelect={this.handleDropdownChange('serviceCode2')}
                      data={[
                        {key: '0', name: '0: ' + this.context.translate('Normal')},
                        {key: '2', name: '2: ' + this.context.translate('Contact issuer via online means')},
                        {key: '4', name: '4: ' + this.context.translate('Contact issuer via online means except under bilateral agreement')}
                      ]}
                      isValid={this.props.errors.get('serviceCode2') === undefined}
                      errorMessage={this.props.errors.get('serviceCode2')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Service Code Third Digit</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      defaultSelected={this.props.cardTypeData.get('serviceCode3')}
                      placeholder={<Text>Service Code Third Digit</Text>}
                      onSelect={this.handleDropdownChange('serviceCode3')}
                      data={[
                        {key: '0', name: '0: ' + this.context.translate('No restrictions, PIN required')},
                        {key: '1', name: '1: ' + this.context.translate('No restrictions')},
                        {key: '2', name: '2: ' + this.context.translate('Goods and services only (no cash)')},
                        {key: '3', name: '3: ' + this.context.translate('ATM only, PIN required')},
                        {key: '4', name: '4: ' + this.context.translate('Cash only')},
                        {key: '5', name: '5: ' + this.context.translate('Goods and services only (no cash), PIN required')},
                        {key: '6', name: '6: ' + this.context.translate('No restrictions, use PIN where feasible')},
                        {key: '7', name: '7: ' + this.context.translate('Goods and services only (no cash), use PIN where feasible')}
                      ]}
                      isValid={this.props.errors.get('serviceCode3') === undefined}
                      errorMessage={this.props.errors.get('serviceCode3')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Issuer Type</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      defaultSelected={this.props.cardTypeData.get('issuerId')}
                      placeholder='Select issuer type'
                      onSelect={this.handleDropdownChange('issuerId')}
                      data={this.props.partnerTypes.toJS()}
                      isValid={this.props.errors.get('issuerId') === undefined}
                      errorMessage={this.props.errors.get('issuerId')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Use Luhn Validation</Text></Col>
                <Col xs='9'>
                    <div className={style.checkbox}>
                        <Checkbox
                          checked={this.props.cardTypeData.get('generateControlDigit')}
                          onClick={this.props.updateGenerateControlDigit}
                          isDisabled={readonly}
                        />
                    </div>
                </Col>
            </Row>
        </div>);
    }

    renderExternal() {
        let readonly = this.props.cardTypeData.get('typeId') !== undefined;
        return (<div>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>BINs</Text> *</Col>
                <Col xs='9'>
                    <MultiSelectDropdown
                      placeholder='Select BINs'
                      defaultSelected={this.props.cardTypeData.get('binId').toJS()}
                      onSelect={this.handleBinDropdownChange('binId')}
                      data={this.props.binTypesFiltered.toJS()}
                      isValid={this.props.errors.get('binId') === undefined}
                      errorMessage={this.props.errors.get('binId')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Issuer Type</Text> *</Col>
                <Col xs='9'>
                    <Dropdown
                      defaultSelected={this.props.cardTypeData.get('issuerId')}
                      placeholder='Select issuer type'
                      onSelect={this.handleDropdownChange('issuerId')}
                      data={this.props.partnerTypes.toJS()}
                      isValid={this.props.errors.get('issuerId') === undefined}
                      errorMessage={this.props.errors.get('issuerId')}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Request EMV Tags</Text> *</Col>
                <Col xs='9'>
                    <MultiSelectDropdown
                      placeholder='Select Request Tags'
                      defaultSelected={this.props.cardTypeData.get('emvRequestTags').toJS()}
                      onSelect={this.handleMultiSelectDropdownChange('emvRequestTags')}
                      data={this.props.emvTags.toJS()}
                      disabled={readonly}
                    />
                </Col>
            </Row>
            <Row className={style.rowTopMargin}>
                <Col xs='3'><Text>Response EMV Tags</Text> *</Col>
                <Col xs='9'>
                    <MultiSelectDropdown
                      placeholder='Select Response Tags'
                      defaultSelected={this.props.cardTypeData.get('emvResponseTags').toJS()}
                      onSelect={this.handleMultiSelectDropdownChange('emvResponseTags')}
                      data={this.props.emvTags.toJS()}
                      disabled={readonly}
                    />
                </Col>
            </Row>
        </div>);
    }

    render() {
        let actions = [];
        let readonly = this.props.cardTypeData.get('typeId') !== undefined;
        if (!readonly) {
            actions.push(<button className={classnames(buttonStyles.statusActionButton, buttonStyles.highlighted, style.popupButtons)} onClick={this.handleCreate}>
                <Text>Create</Text>
            </button>);
        }
        actions.push(<button className={classnames(buttonStyles.statusActionButton, style.popupButtons)} onClick={this.handleClose}>
                <Text>Close</Text>
        </button>);

        return (
                <Dialog
                  autoScrollBodyContent
                  title={readonly ? 'View Card Type' : 'Create Card Type'}
                  open={this.props.opened}
                  actions={actions}
                  onClose={this.handleClose}
                  externalMainContentWrapClass={style.contentWrap}
                >
                    <Container>
                        <div className={style.contentWrapper}>
                            {this.renderCommon()}
                            {this.props.ownershipTypeIdOwn.includes(this.props.cardTypeData.get('ownershipTypeId')) ? this.renderOwn()
                            : this.props.ownershipTypeIdExternal.includes(this.props.cardTypeData.get('ownershipTypeId')) ? this.renderExternal()
                            : <div />}
                        </div>
                    </Container>
                </Dialog>
        );
    }
};

CreateCardType.contextTypes = {
    translate: PropTypes.func
};

CreateCardType.propTypes = {
    opened: PropTypes.bool.isRequired,
    cvvSelectionRequired: PropTypes.bool,
    // usedCardTypes: PropTypes.string.isRequired,

    fetchCardBrands: PropTypes.func.isRequired,
    fetchCardNumberConstruction: PropTypes.func.isRequired,
    fetchBinTypes: PropTypes.func.isRequired,
    fetchCdol1Profiles: PropTypes.func.isRequired,
    fetchPartnerTypes: PropTypes.func.isRequired,
    fetchOwnershipTypes: PropTypes.func.isRequired,
    fetchCipher: PropTypes.func.isRequired,
    fetchEmvTags: PropTypes.func.isRequired,
    createType: PropTypes.func,
    resetState: PropTypes.func,
    refetch: PropTypes.func,
    fetchCardTypeById: PropTypes.func.isRequired,
    toggleCreateCardTypePopup: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    updateSingleValue: PropTypes.func.isRequired,
    updateGenerateControlDigit: PropTypes.func.isRequired,
    updateMultiValue: PropTypes.func.isRequired,

    cardBrands: PropTypes.object.isRequired,
    binTypesFiltered: PropTypes.object.isRequired,
    cardNumberConstructionTypes: PropTypes.object.isRequired,
    // embossedTypes: PropTypes.object.isRequired,
    partnerTypes: PropTypes.object.isRequired,
    ownershipTypes: PropTypes.object.isRequired,
    // organizations: PropTypes.object.isRequired,
    cardTypeData: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    cdol1Profiles: PropTypes.object.isRequired,
    cipherList: PropTypes.object.isRequired,
    emvTags: PropTypes.object.isRequired,

    ownershipTypeIdOwn: PropTypes.array,
    dropdownsFetched: PropTypes.number,
    dropdownsTotal: PropTypes.number,
    ownershipTypeIdExternal: PropTypes.array
};

export default connect(
    (state, ownProps) => {
        return {
            opened: state.createCardType.get('isOpen'),
            cvvSelectionRequired: state.cardConfig.getIn(['cardTypes', 'cvvSelectionRequired']),
            dropdownsFetched: state.createCardType.get('dropdownsFetched'),
            dropdownsTotal: state.createCardType.get('dropdownsTotal'),
            // usedCardTypes: state.cardConfig.get('usedCardTypes'),
            // embossedTypes: state.utCardStatusAction.get('embossedTypes'),
            partnerTypes: state.createCardType.get('partnerTypes'),
            ownershipTypes: state.createCardType.get('ownershipTypes'),
            // organizations: state.businessUnits.hasIn(['units', 'businessUnit']) ? state.businessUnits.getIn(['units', 'businessUnit']) : immutable.List([]),
            cardBrands: state.createCardType.get('cardBrands'),
            binTypesFiltered: state.createCardType.get('binTypesFiltered'),
            cardNumberConstructionTypes: state.createCardType.get('cardNumberConstructionTypes'),

            cardTypeData: state.createCardType.get('cardTypeData'),
            errors: state.createCardType.get('errors'),

            cdol1Profiles: state.createCardType.get('cdol1Profiles'),
            cipherList: state.createCardType.get('cipherList'),
            emvTags: state.createCardType.get('emvTags'),

            ownershipTypeIdOwn: state.utCardStatusAction.get('ownershipIdOwn').toJS(),
            ownershipTypeIdExternal: state.utCardStatusAction.get('ownershipIdExternal').toJS()
        };
    },
    {
        fetchCardTypeById,
        toggleCreateCardTypePopup,
        fetchCardBrands,
        fetchCardNumberConstruction,
        fetchBinTypes,
        fetchCdol1Profiles,
        fetchPartnerTypes,
        fetchOwnershipTypes,
        fetchCipher,
        fetchEmvTags,
        refetch,
        createType,
        resetState,
        setErrors,
        updateSingleValue,
        updateGenerateControlDigit,
        updateMultiValue
    }
)(CreateCardType);
