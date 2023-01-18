import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { changeInput, confirmAction, clear } from './actions';
import { close as closeDetails } from '../../Details/actions';
import { parseRequestParams } from './helpers';

import ActionStatusWithReasonDialog from '../../../../components/ActionStatusWithReasonDialog';

class CardActionWithReason extends Component {
    render() {
        let onSuccess = () => {
            let actionId = this.props.currentAction.get('id') | 0;
            this.props.confirmAction({cardActionId: actionId, card: parseRequestParams(this.props.cards, this.props.inputReason)});
            if (this.props.detailsOpen) {
                this.props.closeDetails();
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
              page={'cardInUse'} />
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
    closeDetails: PropTypes.func.isRequired,
    confirmAction: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired
};

export default connect(({cardInUseDetails, cardInUseGrid, cardInUseActionWithReason, cardsInUseActionButtons}) => ({
    open: cardInUseActionWithReason.get('open'),
    detailsOpen: cardInUseDetails.get('id') > 0,
    inputReason: cardInUseActionWithReason.get('reason'),
    cards: cardInUseDetails.get('id') > 0 ? cardInUseDetails.get('cardInfo') : cardInUseGrid.get('checkedRows'),
    currentAction: cardsInUseActionButtons.get('currentAction')
}), { changeInput, closeDetails, confirmAction, clear })(CardActionWithReason);
