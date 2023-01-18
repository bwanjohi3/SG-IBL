import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';

import {toggle, update as updateReason} from './actions';

class CardReasonStatusUpdate extends Component {
    render() {
        // action is performed on reasons with same status, therefore we get the status of the first in the list;
        let isActive = this.props.reasons.getIn([0, 'isActive']);
        let action = {
            name: isActive ? 'Deactivate' : 'Activate',
            label: isActive ? 'activateReason' : 'deactivateReason'
        };
        let confirmationMessage = `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} reason${this.props.reasons.size > 1 ? 's' : ''}?`;

        let onSuccess = () => {
            this.props.updateReason({reasons: this.props.reasons, isActive: !isActive});
        };
        let onCancel = () => {
            this.props.toggle();
        };

        return (
            <ConfirmationDialog
              open={this.props.open}
              onSuccess={onSuccess}
              onCancel={onCancel}
              action={action}
              confirmationMessage={confirmationMessage}
            />
        );
    }
}

CardReasonStatusUpdate.propTypes = {
    // data
    reasons: PropTypes.object.isRequired, // immutable list
    open: PropTypes.bool.isRequired,
    // actions
    toggle: PropTypes.func.isRequired,
    updateReason: PropTypes.func.isRequired
};

export default connect(({cardReasonStatusUpdateDialog, cardReasonGrid, utCardStatusAction}) => ({
    reasons: cardReasonGrid.get('selected').size > 0 ? cardReasonGrid.get('selected') : cardReasonGrid.get('checked'),
    open: cardReasonStatusUpdateDialog.get('open')
}), {toggle, updateReason})(CardReasonStatusUpdate);
