import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import ActionStatusConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';
import { closeActionConfirmDialog } from './actions';

import {prepareApplicationToUpdate} from './../Details/helpers';
import {updateCloseRefetch} from './../actions';

class ConfirmAction extends Component {
    constructor(props) {
        super(props);
        this.onConfirm = this.onConfirm.bind(this);
    }
    onConfirm(actionData) {
        this.props.closeActionConfirmDialog();
        if (actionData.label === 'Update') {
            let dataToSave = prepareApplicationToUpdate(this.props.data.toJS(), this.props.accounts, this.props.attachments);
            this.props.updateCloseRefetch(dataToSave.application, actionData.id, undefined, dataToSave.account, dataToSave.attachment, dataToSave.newAttachments, dataToSave.document);
        } else if (actionData.label === 'ApproveNamed') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        } else if (actionData.label === 'ApproveNoNamed') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        } else if (actionData.label === 'Reject') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        } else if (actionData.label === 'Decline') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        } else if (actionData.label === 'RemoveFromBatch') {
            this.props.updateCloseRefetch(this.props.data.toJS(), actionData.id);
        } else if (actionData.label === 'AddToBatch') {
            let applications = this.props.checkedAddToBatch.map((application) => {
                return application.set('batchId', this.props.batchIdAddToBatch);
            });
            this.props.updateCloseRefetch(applications.toJS(), actionData.id);
        } else if (actionData.label === 'CreateBatch') {
            let applications = this.props.checkedCreateBatch.toList().toJS();
            let batch = {
                targetBranchId: this.props.targetBranchIdCreateBatch,
                batchName: this.props.batchNameCreateBatch
            };
            this.props.updateCloseRefetch(applications, actionData.id, batch);
        }
    }
    render() {
        let { isOpen, action, closeActionConfirmDialog } = this.props;

        let onConfirm = (actionData) => {
            this.onConfirm(actionData);
        };

        return (
            <ActionStatusConfirmationDialog
              page='Application'
            //   externalMainContentWrapClass={popupCommonStyles.contentWrap}
              open={isOpen}
              action={action.toJS()}
              onSuccess={onConfirm}
              onCancel={closeActionConfirmDialog} />
        );
    }
}

ConfirmAction.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    action: PropTypes.object.isRequired,

    data: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired,
    unlinkedAccounts: PropTypes.object.isRequired,
    checkedAddToBatch: PropTypes.object.isRequired,
    batchIdAddToBatch: PropTypes.any,
    store: PropTypes.object.isRequired,
    attachments: PropTypes.object,

    checkedCreateBatch: PropTypes.object.isRequired,
    batchNameCreateBatch: PropTypes.string.isRequired,
    targetBranchIdCreateBatch: PropTypes.string.isRequired,

    closeActionConfirmDialog: PropTypes.func.isRequired,
    updateCloseRefetch: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.cardApplicationConfirmActionPopup.get('open'),
        action: state.cardApplicationConfirmActionPopup.get('action'),

        data: state.cardApplicationDetails.get('data'),
        accounts: state.cardApplicationDetailsAccounts.getIn(['data', 'linked']),
        unlinkedAccounts: state.cardApplicationDetailsAccounts.getIn(['data', 'unlinked']),
        remoteAccounts: state.cardApplicationDetailsAccounts.getIn(['remoteData', 'linked']),
        checkedAddToBatch: state.cardApplicationAddToExistingBatch.get('checked'),
        batchIdAddToBatch: state.cardApplicationAddToExistingBatch.get('batchId'),

        batchNameCreateBatch: state.cardApplicationCreateBatch.get('batchName'),
        targetBranchIdCreateBatch: state.cardApplicationCreateBatch.get('targetBranchId'),
        checkedCreateBatch: state.cardApplicationCreateBatch.get('checked'),

        store: state.cardApplicationDetails,
        attachments: state.cardApplicationDetailsUploads.get('attachments')
    };
}

export default connect(
    mapStateToProps,
    {
        closeActionConfirmDialog, updateCloseRefetch
    }
)(ConfirmAction);
