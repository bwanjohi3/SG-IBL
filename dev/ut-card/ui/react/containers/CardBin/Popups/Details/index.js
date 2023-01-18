import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import ActionDialog from './../../../../components/ActionDialog';
import ActionStatusConfirmationDialog from './../../../../components/ActionStatusConfirmationDialog';
import Text from 'ut-front-react/components/Text';
import Input from 'ut-front-react/components/Input';
import TextArea from 'ut-front-react/components/Input/TextArea';
import Dropdown from 'ut-front-react/components/Input/Dropdown';

import {
    closeDetailsDialog,
    changeStartBin,
    changeEndBin,
    changeDescription,
    changeOwnership,
    editBins,
    setErrors
} from './actions';

import style from './../../style.css';
import localStyle from './style.css';
import buttonStyles from '../../../../components/ActionStatusButton/style.css';

import {prepareBinToUpdate} from './helpers';
// import {getBinValidationRules, getDescriptionValidationRules, getCreateBinValidator} from './../../helpers';
import {
    validateEndBin,
    getBinValidationRules,
    getCreateBinCommonValidator,
    getCreateBinOwnValidator,
    getCreateBinExternalValidator,
    getDescriptionValidationRules
} from './../../helpers';
import {validateAll, prepareErrors} from './../../../../helpers';
const binValidations = getBinValidationRules();
const descriptionValidations = getDescriptionValidationRules();
const editConfirmationMessage = 'Are you sure you want to save changes?';
const getActionOnConfirm = (actionName) => {
    return {
        label: actionName.toLowerCase(),
        name: actionName
    };
};

export class BinDetails extends Component {
    constructor(props) {
        super(props);
        this.editBin = this.editBin.bind(this);
        this.closeConfirmation = this.closeConfirmation.bind(this);
        this.state = {
            isConfirmationOpen: false
        };
    }
    componentWillMount() {
        // this.props.fetchOwnershipTypes();
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.internalChangeId !== nextProps.internalChangeId) {
            return true;
        }
        return false;
    }
    hasMadeChanges() {
        return !this.props.binData.equals(this.props.initialBinData);
    }
    editBin() {
        let binValidator = getCreateBinCommonValidator().concat(this.props.ownershipTypeIdOwn.includes(this.props.binData.get('ownershipTypeId')) ? getCreateBinOwnValidator()
        : this.props.ownershipTypeIdExternal.includes(this.props.binData.get('ownershipTypeId')) ? getCreateBinExternalValidator()
        : []);
        let validation = validateAll(this.props.binData, binValidator);
        if (this.props.ownershipTypeIdExternal.includes(this.props.binData.get('ownershipTypeId'))) {
            let endBinValidator = validateEndBin(this.props.binData.get('startBin'), this.props.binData.get('endBin'));
            if (endBinValidator.isValid === false) {
                validation.isValid = false;
                validation.errors = validation.errors.concat(endBinValidator.errors);
            }
        }
        if (!validation.isValid) {
            let createErrors = prepareErrors(validation.errors);
            this.props.setErrors(createErrors);
        } else if (!this.state.isConfirmationOpen) {
            this.setState({
                isConfirmationOpen: true
            });
        } else {
            let ownershipTypeLabel = this.props.ownershipTypes.filter((value) => { return value.key === this.props.binData.get('ownershipTypeId'); }).pop().name;
            let binToSend = {bin: Object.assign(prepareBinToUpdate(this.props.binData), {ownershipTypeLabel})};
            this.props.editBins(binToSend);
            this.closeConfirmation();
        }
    }
    closeConfirmation() {
        this.setState({
            isConfirmationOpen: false
        });
    }
    getSaveBtnStyles(isDisabled) {
        let styles = [buttonStyles.statusActionButton, style.buttonsRightMargin];
        if (isDisabled) {
            styles.push(buttonStyles.statusActionButtonDisabled);
        } else {
            styles.push(buttonStyles.highlighted);
        }
        return classnames(styles);
    }
    getActionButtons() {
        let actionButtons = [];

        // for the moment we will not edit BINs

        // if (this.context.checkPermission('card.bin.edit')) {
        //     let isSaveDisabled = !this.hasMadeChanges();
        //     let saveBtn = <button className={this.getSaveBtnStyles(isSaveDisabled)} onClick={this.editBin} disabled={isSaveDisabled}>
        //         <Text>Save</Text>
        //     </button>;
        //     actionButtons.push(saveBtn);
        // }

        let closeBtn = <button className={buttonStyles.statusActionButton} onClick={this.props.closeDetailsDialog}>
            <Text>Close</Text>
        </button>;
        actionButtons.push(closeBtn);

        return actionButtons;
    }
    renderConfirmation() {
        let confirmationDialog = <ActionStatusConfirmationDialog
          open={this.state.isConfirmationOpen}
          page='bin'
          action={getActionOnConfirm('Save')}
          confirmationMessage={editConfirmationMessage}
          onSuccess={this.editBin}
          onCancel={this.closeConfirmation}
        />;

        return confirmationDialog;
    }
    renderOwn() {
        let binData = this.props.binData;
        let hasPermissionsToEdit = this.context.checkPermission('card.bin.edit');
        let isFieldReadonly = !hasPermissionsToEdit;
        // for the moment we will not edit BINs
        isFieldReadonly = true;
        let {changeStartBin} = this.props;
        return (<div className={style.rowPaddings}>
                <Input
                  value={binData.get('startBin')}
                  label={<Text>BIN</Text>}
                  boldLabel
                  placeholder={this.context.translate('Please enter BIN')}
                  keyProp='startBin'
                  readonly={isFieldReadonly}
                  validators={binValidations}
                  isValid={this.props.errors.get('startBin') === undefined}
                  errorMessage={this.props.errors.get('startBin')}
                  onChange={changeStartBin} />
            </div>);
    }
    renderExternal() {
        let binData = this.props.binData;
        let hasPermissionsToEdit = this.context.checkPermission('card.bin.edit');
        let isFieldReadonly = !hasPermissionsToEdit;
        // for the moment we will not edit BINs
        isFieldReadonly = true;
        let {changeStartBin, changeEndBin} = this.props;
        return (<div>
            <div className={style.rowPaddings}>
                <Input
                  value={binData.get('startBin')}
                  label={<Text>Start BIN</Text>}
                  boldLabel
                  placeholder={this.context.translate('Please enter start BIN')}
                  keyProp='startBin'
                  readonly={isFieldReadonly}
                  validators={binValidations}
                  isValid={this.props.errors.get('startBin') === undefined}
                  errorMessage={this.props.errors.get('startBin')}
                  onChange={changeStartBin} />
            </div>
            <div className={style.rowPaddings}>
                <Input
                  value={binData.get('endBin')}
                  label={<Text>End BIN</Text>}
                  boldLabel
                  placeholder={this.context.translate('Please enter end BIN')}
                  keyProp='endBin'
                  readonly={isFieldReadonly}
                  validators={binValidations}
                  isValid={this.props.errors.get('endBin') === undefined}
                  errorMessage={this.props.errors.get('endBin')}
                  onChange={changeEndBin} />
            </div>
        </div>);
    }
    renderDialogContent() {
        let binData = this.props.binData;
        let {changeOwnership, changeDescription} = this.props;
        let ownershipTypeId = binData.get('ownershipTypeId');
        let hasPermissionsToEdit = this.context.checkPermission('card.bin.edit');
        let isFieldReadonly = !hasPermissionsToEdit;
        // for the moment we will not edit BINs
        isFieldReadonly = true;
        return <div className={style.contentWrapper}>
                <div className={style.rowPaddings}>
                  <Dropdown
                    label={<span><Text>Ownership</Text> *</span>}
                    boldLabel
                    disabled={isFieldReadonly}
                    defaultSelected={ownershipTypeId}
                    placeholder='Select ownership'
                    onSelect={changeOwnership}
                    data={this.props.ownershipTypes}
                    isValid={this.props.errors.get('ownershipTypeId') === undefined}
                    errorMessage={this.props.errors.get('ownershipTypeId')}
                  />
                </div>
                <div className={classnames(style.rowPaddings, {[localStyle.descriptionWrapper]: isFieldReadonly})}>
                  <TextArea
                    label={<Text>Description</Text>}
                    keyProp='description'
                    readonly={isFieldReadonly}
                    placeholder='Description'
                    onChange={changeDescription}
                    value={binData.get('description')}
                    validators={descriptionValidations}
                    isValid={this.props.errors.get('description') === undefined}
                    errorMessage={this.props.errors.get('description')}
                  />
                </div>
                <div className={style.borderBottom} />
            {this.props.ownershipTypeIdOwn.includes(this.props.ownershipTypeId) ? this.renderOwn()
            : this.props.ownershipTypeIdExternal.includes(this.props.ownershipTypeId) ? this.renderExternal()
            : <div />}
        </div>;
    }
    render() {
        let actionButtons = this.getActionButtons();
        return (
            <ActionDialog
              open={this.props.isOpen}
              title={'BIN Details'}
              onClose={this.props.closeDetailsDialog}
              actions={actionButtons}
            >
                {this.renderDialogContent()}
                {this.renderConfirmation()}
            </ActionDialog>
        );
    }
}

BinDetails.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    binData: PropTypes.object.isRequired,
    initialBinData: PropTypes.object.isRequired,
    ownershipTypes: PropTypes.array.isRequired,
    ownershipTypeIdOwn: PropTypes.array,
    ownershipTypeIdExternal: PropTypes.array,
    errors: PropTypes.object.isRequired,
    internalChangeId: PropTypes.number.isRequired,

    closeDetailsDialog: PropTypes.func.isRequired,
    changeDescription: PropTypes.func.isRequired,
    changeOwnership: PropTypes.func.isRequired,
    changeStartBin: PropTypes.func.isRequired,
    changeEndBin: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    editBins: PropTypes.func.isRequired
};

BinDetails.contextTypes = {
    translate: PropTypes.func.isRequired,
    checkPermission: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.cardBinDetails.get('open'),
        binData: state.cardBinDetails.get('data'),
        initialBinData: state.cardBinDetails.get('remoteData'),
        ownershipTypes: state.cardBinCreate.get('ownershipTypes').toJS(),
        ownershipTypeIdOwn: state.utCardStatusAction.get('ownershipIdOwn').toJS(),
        ownershipTypeIdExternal: state.utCardStatusAction.get('ownershipIdExternal').toJS(),
        errors: state.cardBinDetails.get('errors'),
        internalChangeId: state.cardBinDetails.get('internalChangeId')
    };
}

export default connect(
    mapStateToProps,
    {closeDetailsDialog, changeStartBin, changeEndBin, changeOwnership, changeDescription, setErrors, editBins}
)(BinDetails);
