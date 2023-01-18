import React, {Component, PropTypes} from 'react';
import immutable from 'immutable';
import {connect} from 'react-redux';
import Text from 'ut-front-react/components/Text';
import ActionStatusButtonsGroup from '../../../../../components/ActionStatusButtonsGroup';
import cancelStyle from '../../../../../components/ActionStatusButton/style.css';
import {prepareApplicationToUpdate, getUpdateValidator} from './../helpers';
import {closeDetailsDialog, setErrors} from './../actions';
import {openCreateBatchDialog} from './../../CreateBatch/actions';
import {openActionWithReason} from './../../ActionWithReason/actions';
import {openActionConfirmDialog} from './../../ConfirmAction/actions';
import {openAddToExistingBatchDialog} from './../../AddToExistingBatch/actions';
import {updateCloseRefetch} from './../../actions';
import {validateAccounts, validateUploads} from './../../../../helpers';
import {validateAll, prepareErrors} from './../../../../../helpers';

export class ButtonsManager extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    hasMadeChanges() {
        return !this.props.data.equals(this.props.remoteData) ||
            !this.props.accounts.equals(this.props.remoteAccounts) ||
            !this.props.attachments.equals(this.props.remoteAttachments);
    }
    getExcludedActions() {
        let result = [];
        if (!this.props.data.get('canBeRemovedFromBatch')) {
            result.push('RemoveFromBatch');
        }

        return result;
    }
    getDisabledButtons() {
        let result = ['Update'];
        let hasMadeChanges = this.hasMadeChanges();
        if (hasMadeChanges) {
            result = ['ApproveNamed', 'ApproveNoNamed', 'RemoveFromBatch', 'CreateBatch', 'AddToBatch', 'Decline', 'Reject'];
        }
        return result;
    }
    setErrors(createErrors, accountErrors = immutable.Map(), uploadErrors) {
        let errorParams = {
            account: accountErrors,
            form: createErrors,
            upload: uploadErrors
        };
        this.props.setErrors(errorParams);
    }
    validate() {
        let isNameApplication = this.props.data.get('nameType') === 'named';
        let accountsErrors = validateAccounts(this.props.unlinkedAccounts, this.props.accounts);
        let uploadErrors = validateUploads(this.props.attachments);
        let validation = isNameApplication ? validateAll(this.props.store, getUpdateValidator(isNameApplication)) : {isValid: true};
        if (accountsErrors.size > 0 || !validation.isValid || uploadErrors.size > 0) {
            let createErrors = isNameApplication ? prepareErrors(validation.errors) : {};
            this.setErrors(createErrors, accountsErrors, uploadErrors);
            return false;
        }
        return true;
    }
    handleClick(actionData) {
        let shouldOpenRejectWithReason = actionData.reasonRequired;
        let shouldOpenConfirmation = actionData.confirmationRequired;

        if (actionData.label === 'CreateBatch') {
            let applicationsList = immutable.List([this.props.data]);
            this.props.openCreateBatchDialog(applicationsList, true);
        } else if (actionData.label === 'AddToBatch') {
            let applicationsList = immutable.List([this.props.data]);
            this.props.openAddToExistingBatchDialog(applicationsList, true);
        } else if (actionData.label === 'Update' && shouldOpenRejectWithReason) {
            let isValid = this.validate();
            if (isValid) {
                this.props.openActionWithReason(actionData);
            }
        } else if (actionData.label === 'Update' && shouldOpenConfirmation) {
            let isValid = this.validate();
            if (isValid) {
                this.props.openActionConfirmDialog(actionData);
            }
        } else if (shouldOpenRejectWithReason) {
            this.props.openActionWithReason(actionData);
        } else if (shouldOpenConfirmation) {
            this.props.openActionConfirmDialog(actionData);
        } else if (actionData.label === 'Update') {
            let isValid = this.validate();
            if (isValid) {
                let dataToSave = prepareApplicationToUpdate(this.props.data.toJS(), this.props.accounts, this.props.attachments);
                this.props.updateCloseRefetch(dataToSave.application, actionData.id, undefined, dataToSave.account, dataToSave.attachment, dataToSave.newAttachments, dataToSave.document);
            }
        } else if (actionData.label === 'ApproveNamed') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        } else if (actionData.label === 'ApproveNoNamed') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        } else if (actionData.label === 'Decline') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        } else if (actionData.label === 'RemoveFromBatch') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        }
    }
    getHighlightedButtons(statusLabel) {
        let highlighted = [];
        if (statusLabel === 'New') {
            highlighted = highlighted.concat(['ApproveNamed', 'ApproveNoNamed']);
        } else if (statusLabel === 'Approved') {
            highlighted = highlighted.concat(['CreateBatch']);
        } else if (statusLabel === 'Completed') {
            highlighted = highlighted.concat(['RemoveFromBatch']);
        } else if (statusLabel === 'Rejected') {
            highlighted = highlighted.concat(['Update']);
        }

        if (this.hasMadeChanges()) {
            highlighted = ['Update'];
        }

        return highlighted;
    }
    render() {
        let data = (this.props.data || immutable.Map()).toJS();
        let excludedActions = this.getExcludedActions();
        let actionTypeFor = data.nameType || 'named';
        let highlighted = this.getHighlightedButtons(this.props.data.get('statusLabel'));
        let disabled = this.getDisabledButtons();
        return (
            <div>
                <ActionStatusButtonsGroup page='application' actionTypeFor={actionTypeFor} disabled={disabled} highlighted={highlighted} excludeActions={excludedActions} statusIds={[data.statusId]} handleClick={this.handleClick} />
                <button onTouchTap={this.props.closeDetailsDialog} className={cancelStyle.statusActionButton}><Text>Close</Text></button>
            </div>
        );
    }
}

ButtonsManager.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
    remoteData: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired,
    unlinkedAccounts: PropTypes.object.isRequired,
    remoteAccounts: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    attachments: PropTypes.object,
    remoteAttachments: PropTypes.object,
    closeDetailsDialog: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    openCreateBatchDialog: PropTypes.func.isRequired,
    openAddToExistingBatchDialog: PropTypes.func.isRequired,
    updateCloseRefetch: PropTypes.func.isRequired,
    openActionWithReason: PropTypes.func.isRequired,
    openActionConfirmDialog: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.cardApplicationDetails.get('open'),
        data: state.cardApplicationDetails.get('data'),
        remoteData: state.cardApplicationDetails.get('remoteData'),
        accounts: state.cardApplicationDetailsAccounts.getIn(['data', 'linked']),
        unlinkedAccounts: state.cardApplicationDetailsAccounts.getIn(['data', 'unlinked']),
        remoteAccounts: state.cardApplicationDetailsAccounts.getIn(['remoteData', 'linked']),
        store: state.cardApplicationDetails,
        attachments: state.cardApplicationDetailsUploads.get('attachments'),
        remoteAttachments: state.cardApplicationDetailsUploads.get('remoteAttachments')
    };
}

export default connect(
    mapStateToProps,
    {closeDetailsDialog, setErrors, openCreateBatchDialog, openAddToExistingBatchDialog, updateCloseRefetch, openActionWithReason, openActionConfirmDialog}
)(ButtonsManager);
