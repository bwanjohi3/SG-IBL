import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';

import {toggle, deleteReason} from './actions';

const action = {
    name: 'Delete',
    label: 'deleteReason'
};
class CardReasonDelete extends Component {
    render() {
        let confirmationMessage = `Are you sure you want to delete reason${this.props.reasons.size > 1 ? 's' : ''}?`;

        let onSuccess = () => {
            this.props.deleteReason(this.props.reasons);
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

CardReasonDelete.propTypes = {
    // data
    reasons: PropTypes.object.isRequired, // immutable list
    open: PropTypes.bool.isRequired,
    // actions
    toggle: PropTypes.func.isRequired,
    deleteReason: PropTypes.func.isRequired
};

export default connect(({cardReasonDeleteDialog, cardReasonGrid, utCardStatusAction}) => ({
    reasons: cardReasonGrid.get('selected').size > 0 ? cardReasonGrid.get('selected') : cardReasonGrid.get('checked'),
    open: cardReasonDeleteDialog.get('open')
}), {toggle, deleteReason})(CardReasonDelete);
