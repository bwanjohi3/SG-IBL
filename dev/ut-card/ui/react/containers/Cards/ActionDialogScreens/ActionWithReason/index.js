import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { changeInput, confirmAction, clear } from './actions';
import { toggleCardDetails } from '../Details/actions';
import { parseRequestParams } from './helpers';

import ActionStatusWithReasonDialog from '../../../../components/ActionStatusWithReasonDialog';

class CardActionWithReason extends Component {
    render() {
        let onSuccess = () => {
            let actionId = this.props.currentAction.get('id') | 0;
            this.props.confirmAction({cardActionId: actionId, card: parseRequestParams(this.props.cards, this.props.inputReason)});
            if (this.props.detailsOpen) {
                this.props.toggleCardDetails();
            }
        };
        let onClose = () => {
            this.props.clear();
        };
        return (
            <ActionStatusWithReasonDialog
              action={this.props.currentAction.toJS()}
              open={this.props.open}
              onSuccess={onSuccess}
              onClose={onClose}
              onChange={this.props.changeInput}
              page={'card'} />
        );
    }
};

CardActionWithReason.propTypes = {
    // Data
    open: PropTypes.bool.isRequired,
    detailsOpen: PropTypes.bool.isRequired,
    inputReason: PropTypes.object.isRequired, // immutable map
    cards: PropTypes.object.isRequired, // immutable list
    currentAction: PropTypes.object.isRequired, // immutable map
    // Actions
    changeInput: PropTypes.func.isRequired,
    toggleCardDetails: PropTypes.func.isRequired,
    confirmAction: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired
};

export default connect(({cardDetailsPopup, cardManagementGrid, cardActionWithReason, cardManagementActionButtons}) => ({
    open: cardActionWithReason.get('open'),
    detailsOpen: cardDetailsPopup.get('open'),
    inputReason: cardActionWithReason.get('reason'),
    cards: cardManagementGrid.get('selected').size > 0 ? cardManagementGrid.get('selected') : cardManagementGrid.get('checked'),
    currentAction: cardManagementActionButtons.get('currentAction')
}), { changeInput, toggleCardDetails, confirmAction, clear })(CardActionWithReason);
