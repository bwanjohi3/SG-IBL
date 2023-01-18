import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import ActionStatusConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';

import { toggleActionConfirmPrompt, confirmAction } from './actions';
import { close as closeDetails } from '../../Details/actions';

import { parseCardsRequestParams } from '../helpers';

import popupCommonStyles from '../style.css';

class ConfirmAction extends Component {
    render() {
        let onAccept = () => {
            let actionId = this.props.currentAction.get('id') | 0;
            let actionLabel = this.props.currentAction.get('label');
            this.props.confirmAction({cardActionId: actionId, cardActionLabel: actionLabel, card: parseCardsRequestParams(this.props.cards)});
            if (this.props.detailsPopupOpen) {
                this.props.closeDetails();
            }
        };

        let onCancel = () => {
            this.props.toggleActionConfirmPrompt();
        };

        return (
            <ActionStatusConfirmationDialog
              externalMainContentWrapClass={popupCommonStyles.contentWrap}
              open={this.props.open}
              page={'CardInUse'}
              action={this.props.currentAction.toJS()}
              onSuccess={onAccept}
              onCancel={onCancel} />
        );
    }
}

ConfirmAction.propTypes = {
    // data
    currentAction: PropTypes.object.isRequired,
    cards: PropTypes.object.isRequired, // immutable list
    open: PropTypes.bool.isRequired,
    detailsPopupOpen: PropTypes.bool.isRequired,
    // actions
    toggleActionConfirmPrompt: PropTypes.func.isRequired,
    closeDetails: PropTypes.func.isRequired,
    confirmAction: PropTypes.func.isRequired
};

export default connect(({ cardInUseConfirmActionPopup, cardInUseDetails, cardInUseGrid, cardsInUseActionButtons }) => ({
    currentAction: cardsInUseActionButtons.get('currentAction'),
    cards: cardInUseDetails.get('id') > 0 ? cardInUseDetails.get('cardInfo') : cardInUseGrid.get('checkedRows'),
    open: cardInUseConfirmActionPopup.get('open'),
    detailsPopupOpen: cardInUseDetails.get('id') > 0
}),
{toggleActionConfirmPrompt, closeDetails, confirmAction})(ConfirmAction);
