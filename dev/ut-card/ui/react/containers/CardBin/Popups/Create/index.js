import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import ActionDialog from './../../../../components/ActionDialog';
import Text from 'ut-front-react/components/Text';
import TextArea from 'ut-front-react/components/Input/TextArea';
import Input from 'ut-front-react/components/Input';
import Dropdown from 'ut-front-react/components/Input/Dropdown';

import {validateAll, prepareErrors} from './../../../../helpers';
import {
    validateEndBin,
    getBinValidationRules,
    getCreateBinCommonValidator,
    getCreateBinOwnValidator,
    getCreateBinExternalValidator,
    getDescriptionValidationRules
} from './../../helpers';
import {
    fetchOwnershipTypes,
    handleOwnershipTypeIdChange,
    changeDescription,
    changeStartBin,
    changeEndBin,
    setErrors,
    createBin,
    closeCreateBinDialog
} from './actions';

import style from './../../style.css';
import cancelStyle from '../../../../components/ActionStatusButton/style.css';

const binValidations = getBinValidationRules();
const descriptionValidations = getDescriptionValidationRules();

export class BinCreate extends Component {
    constructor(props) {
        super(props);
        this.closeCreateBinDialog = this.closeCreateBinDialog.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleOwnershipTypeIdChange = this.handleOwnershipTypeIdChange.bind(this);
    }
    componentWillMount() {
        this.props.fetchOwnershipTypes();
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.ownershipTypeId === 0 ||
            this.props.ownershipTypeId !== nextProps.ownershipTypeId ||
            this.props.errors.size !== nextProps.errors.size || nextProps.errors.size > 0) {
            return true;
        }
        return false;
    }
    handleOwnershipTypeIdChange(params) {
        this.props.handleOwnershipTypeIdChange(params.value);
    }

    handleCreate(actionData) {
        let binValidator = getCreateBinCommonValidator().concat(this.props.ownershipTypeIdOwn.includes(this.props.ownershipTypeId) ? getCreateBinOwnValidator()
        : this.props.ownershipTypeIdExternal.includes(this.props.ownershipTypeId) ? getCreateBinExternalValidator()
        : []);
        let validation = validateAll(this.props.createBinStore, binValidator);
        if (this.props.ownershipTypeIdExternal.includes(this.props.ownershipTypeId)) {
            let endBinValidator = validateEndBin(this.props.startBin, this.props.endBin);
            if (endBinValidator.isValid === false) {
                validation.isValid = false;
                validation.errors = validation.errors.concat(endBinValidator.errors);
            }
        }
        if (!validation.isValid) {
            let createErrors = prepareErrors(validation.errors);
            this.props.setErrors(createErrors);
            return;
        }
        let ownershipTypeLabel = this.props.ownershipTypes.filter((value) => { return value.key === this.props.ownershipTypeId; }).pop().name;
        let params = {
            bin: {
                ownershipTypeId: this.props.ownershipTypeId,
                startBin: this.props.startBin,
                endBin: ownershipTypeLabel.startsWith('external') ? this.props.endBin : this.props.startBin,
                description: this.props.description
            }
        };
        this.props.createBin(params);
    }
    closeCreateBinDialog(e) {
        this.props.closeCreateBinDialog();
    }
    renderOwn() {
        return (<div className={style.rowPaddings}>
                <Input
                  value={this.props.startBin}
                  label={<Text>BIN</Text>}
                  boldLabel
                  placeholder={this.context.translate('Please Enter BIN')}
                  keyProp='startBin'
                  validators={binValidations}
                  isValid={this.props.errors.get('startBin') === undefined}
                  errorMessage={this.props.errors.get('startBin')}
                  onChange={this.props.changeStartBin} />
            </div>);
    }
    renderExternal() {
        return (<div>
            <div className={style.rowPaddings}>
                <Input
                  value={this.props.startBin}
                  label={<Text>Start BIN</Text>}
                  boldLabel
                  placeholder={this.context.translate('Please Enter Start BIN')}
                  keyProp='startBin'
                  validators={binValidations}
                  isValid={this.props.errors.get('startBin') === undefined}
                  errorMessage={this.props.errors.get('startBin')}
                  onChange={this.props.changeStartBin} />
            </div>
            <div className={style.rowPaddings}>
                <Input
                  value={this.props.endBin}
                  label={<Text>End BIN</Text>}
                  boldLabel
                  placeholder={this.context.translate('Please Enter End BIN')}
                  keyProp='endBin'
                  validators={binValidations}
                  isValid={this.props.errors.get('endBin') === undefined}
                  errorMessage={this.props.errors.get('endBin')}
                  onChange={this.props.changeEndBin} />
            </div>
        </div>);
    }
    renderDialogContent() {
        return (<div className={style.contentWrapper}>
            <div className={style.rowPaddings}>
                <Dropdown
                  label={<span><Text>Ownership</Text> *</span>}
                  boldLabel
                  defaultSelected={this.props.ownershipTypeId}
                  placeholder='Select Ownership'
                  onSelect={this.handleOwnershipTypeIdChange}
                  data={this.props.ownershipTypes}
                  isValid={this.props.errors.get('ownershipTypeId') === undefined}
                  errorMessage={this.props.errors.get('ownershipTypeId')}
                />
            </div>
            <div className={style.rowPaddings}>
                <TextArea
                  label={<Text>Description</Text>}
                  keyProp='description'
                  placeholder='Description'
                  onChange={this.props.changeDescription}
                  value={this.props.description}
                  validators={descriptionValidations}
                  isValid={this.props.errors.get('description') === undefined}
                  errorMessage={this.props.errors.get('description')}
                />
            </div>
            <div className={style.borderBottom} />
            {this.props.ownershipTypeIdOwn.includes(this.props.ownershipTypeId) ? this.renderOwn()
            : this.props.ownershipTypeIdExternal.includes(this.props.ownershipTypeId) ? this.renderExternal()
            : <div />}
        </div>);
    }
    render() {
        const actions = [
            <button onTouchTap={this.handleCreate} className={classnames(cancelStyle.statusActionButton, cancelStyle.highlighted, style.buttonsRightMargin)}><Text>Create</Text></button>,
            <button onTouchTap={this.closeCreateBinDialog} className={cancelStyle.statusActionButton}><Text>Close</Text></button>
        ];
        return (
            <ActionDialog
              open={this.props.isOpen}
              autoScrollBodyContent
              title={'Create BIN'}
              actions={actions}
              onClose={this.closeCreateBinDialog}
            >
                {this.renderDialogContent()}
            </ActionDialog>
        );
    }
}

BinCreate.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    createBinStore: PropTypes.object.isRequired,
    ownershipTypeId: PropTypes.number.isRequired,
    ownershipTypeIdOwn: PropTypes.array,
    ownershipTypeIdExternal: PropTypes.array,
    startBin: PropTypes.number,
    endBin: PropTypes.number,
    description: PropTypes.string.isRequired,
    errors: PropTypes.object.isRequired,

    ownershipTypes: PropTypes.array.isRequired,
    fetchOwnershipTypes: PropTypes.func.isRequired,
    handleOwnershipTypeIdChange: PropTypes.func.isRequired,
    changeStartBin: PropTypes.func.isRequired,
    changeEndBin: PropTypes.func.isRequired,
    closeCreateBinDialog: PropTypes.func.isRequired,
    changeDescription: PropTypes.func.isRequired,
    createBin: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired
};

BinCreate.contextTypes = {
    translate: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.cardBinCreate.get('open'),
        createBinStore: state.cardBinCreate,
        ownershipTypes: state.cardBinCreate.get('ownershipTypes').toJS(),
        ownershipTypeIdOwn: state.utCardStatusAction.get('ownershipIdOwn').toJS(),
        ownershipTypeIdExternal: state.utCardStatusAction.get('ownershipIdExternal').toJS(),
        ownershipTypeId: state.cardBinCreate.get('ownershipTypeId'),
        description: state.cardBinCreate.get('description'),
        startBin: state.cardBinCreate.get('startBin'),
        endBin: state.cardBinCreate.get('endBin'),
        errors: state.cardBinCreate.get('errors')
    };
}

export default connect(
    mapStateToProps,
    {fetchOwnershipTypes, handleOwnershipTypeIdChange, closeCreateBinDialog, changeDescription, changeStartBin, changeEndBin, createBin, setErrors}
)(BinCreate);
