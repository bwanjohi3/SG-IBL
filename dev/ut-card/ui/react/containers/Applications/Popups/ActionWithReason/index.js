import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { changeInput, closeActionWithReason, clearState } from './actions';

import ActionStatusWithReasonDialog from '../../../../components/ActionStatusWithReasonDialog';
import {prepareApplicationToUpdate} from './../Details/helpers';
import {updateCloseRefetch} from './../actions';

class ActionWithReason extends Component {
    componentWillReceiveProps(nextProps) {
        if (this.props.isOpen && !nextProps.isOpen) {
            this.props.clearState();
        }
    }
    onSuccess(actionData) {
        let {application, inputReason} = this.props;

        application = application.toJS();
        application.reasonId = inputReason.get('reasonId');
        application.comments = inputReason.get('comment');

        let simpleActions = ['Reject', 'Decline', 'ApproveNamed', 'ApproveNoNamed', 'RemoveFromBatch']; // statusUpdates for this actions are identical
        if (simpleActions.includes(actionData.label)) {
            this.props.updateCloseRefetch(application, actionData.id);
        } else if (actionData.label === 'Update') {
            let dataToSave = prepareApplicationToUpdate(application, this.props.accounts, this.props.attachments);
            this.props.updateCloseRefetch(dataToSave.application, actionData.id, undefined, dataToSave.account, dataToSave.attachment, dataToSave.newAttachments, dataToSave.document);
        }
    }
    render() {
        let onClose = () => {
            this.props.closeActionWithReason();
        };
        let onSuccess = (actionData) => {
            onClose();
            this.onSuccess(actionData);
        };
        return (
            <ActionStatusWithReasonDialog
              action={this.props.action.toJS()}
              open={this.props.isOpen}
              onSuccess={onSuccess}
              onClose={onClose}
              onChange={this.props.changeInput}
              page={'application'} />
        );
    }
};

ActionWithReason.propTypes = {
    // Data
    isOpen: PropTypes.bool.isRequired,
    action: PropTypes.object,

    application: PropTypes.object.isRequired,
    inputReason: PropTypes.object.isRequired, // immutable map

    accounts: PropTypes.object,
    attachments: PropTypes.object,
    // Actions
    changeInput: PropTypes.func.isRequired,
    updateCloseRefetch: PropTypes.func.isRequired,
    closeActionWithReason: PropTypes.func.isRequired,
    clearState: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.cardApplicationActionWithReason.get('open'),
        action: state.cardApplicationActionWithReason.get('action'),

        application: state.cardApplicationDetails.get('data'),
        inputReason: state.cardApplicationActionWithReason.get('reason'),

        accounts: state.cardApplicationDetailsAccounts.getIn(['data', 'linked']),
        attachments: state.cardApplicationDetailsUploads.get('attachments')
    };
}

export default connect(
    mapStateToProps,
    {
        changeInput,
        closeActionWithReason,
        updateCloseRefetch,
        clearState
    }
)(ActionWithReason);
